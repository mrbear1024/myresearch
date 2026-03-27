/**
 * Main TUI application: handles the interactive loop.
 * Wires together Agent events with terminal rendering.
 */

import type { AgentEvent } from "@mariozechner/pi-agent-core";
import type { AssistantMessage } from "@mariozechner/pi-ai";
import { AgentSession } from "../agent-session.js";
import { getApiKey, parseModelString } from "../config.js";
import { renderWelcome } from "./components/welcome.js";
import {
	renderAssistantHeader,
	renderTextDelta,
	renderThinking,
	renderThinkingContent,
} from "./components/assistant-message.js";
import {
	renderToolStart,
	renderToolResult,
} from "./components/tool-execution.js";
import { renderFooter, type FooterState } from "./components/footer.js";
import { renderUserPrompt, createInputReader } from "./components/user-input.js";
import { theme } from "./theme.js";

export interface TuiAppOptions {
	cwd: string;
	modelString?: string;
}

export class TuiApp {
	private session: AgentSession;
	private footerState: FooterState;
	private isRunning: boolean = false;
	private currentTextContent: string = "";
	private rl: ReturnType<typeof createInputReader> | null = null;

	constructor(options: TuiAppOptions) {
		this.session = new AgentSession({
			cwd: options.cwd,
			modelString: options.modelString,
		});

		this.footerState = {
			modelName: this.session.modelName,
			isStreaming: false,
			isThinking: false,
		};

		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		this.session.subscribe((event: AgentEvent) => {
			this.handleEvent(event);
		});
	}

	private handleEvent(event: AgentEvent): void {
		switch (event.type) {
			case "agent_start":
				this.footerState.isStreaming = true;
				break;

			case "message_start":
				this.currentTextContent = "";
				process.stdout.write(renderAssistantHeader() + "\n");
				break;

			case "message_update": {
				const msg = event.message;
				if (msg.role === "assistant") {
					const assistantMsg = msg as AssistantMessage;
					// Find latest text content
					for (const block of assistantMsg.content) {
						if (block.type === "text") {
							const newText = block.text;
							if (newText.length > this.currentTextContent.length) {
								const delta = newText.slice(this.currentTextContent.length);
								process.stdout.write(delta);
								this.currentTextContent = newText;
							}
						} else if (block.type === "thinking") {
							// Show thinking indicator once
							if (!this.footerState.isThinking) {
								this.footerState.isThinking = true;
								process.stdout.write(renderThinking() + "\n");
							}
						}
					}
				}
				break;
			}

			case "message_end":
				this.currentTextContent = "";
				this.footerState.isThinking = false;
				process.stdout.write("\n");
				break;

			case "tool_execution_start": {
				this.footerState.toolName = event.toolName;
				process.stdout.write(
					renderToolStart(event.toolName, event.args ?? {}) + "\n",
				);
				break;
			}

			case "tool_execution_end": {
				this.footerState.toolName = undefined;
				const result = event.result;
				if (result) {
					const textContent = result.content
						?.filter((c: any) => c.type === "text")
						.map((c: any) => c.text)
						.join("\n") ?? "";
					process.stdout.write(
						renderToolResult(
							event.toolName,
							textContent,
							event.isError ?? false,
						) + "\n",
					);
				}
				break;
			}

			case "turn_end": {
				// Update token count if available
				const lastMsg = this.session.messages
					.filter((m) => m.role === "assistant")
					.at(-1) as AssistantMessage | undefined;
				if (lastMsg?.usage) {
					this.footerState.tokenCount = {
						input: lastMsg.usage.input,
						output: lastMsg.usage.output,
					};
				}
				break;
			}

			case "agent_end":
				this.footerState.isStreaming = false;
				this.footerState.isThinking = false;
				this.footerState.toolName = undefined;

				// Show footer
				process.stdout.write("\n" + renderFooter(this.footerState) + "\n");

				// Re-prompt user
				if (this.isRunning) {
					this.promptUser();
				}
				break;
		}
	}

	private promptUser(): void {
		process.stdout.write(renderUserPrompt());
	}

	async start(): Promise<void> {
		this.isRunning = true;

		// Show welcome screen
		console.log(renderWelcome(this.session.modelName, this.session.cwd));

		// Validate API key
		const apiKey = this.session.getApiKeyForProvider();
		if (!apiKey) {
			const { provider } = parseModelString(this.session.modelName);
			console.error(
				theme.error(
					`\nNo API key found for provider "${provider}". ` +
						`Set the ${provider.toUpperCase().replace(/-/g, "_")}_API_KEY environment variable.\n`,
				),
			);
			process.exit(1);
		}

		// Start input loop
		this.rl = createInputReader({
			onSubmit: async (input) => {
				await this.handleUserInput(input);
			},
			onAbort: () => {
				if (this.session.isStreaming) {
					this.session.abort();
					process.stdout.write(theme.warning("\n(Aborted)\n"));
					this.promptUser();
				} else {
					this.stop();
				}
			},
			onExit: () => {
				this.stop();
			},
		});

		this.promptUser();
	}

	private async handleUserInput(input: string): Promise<void> {
		const trimmed = input.trim();

		// Handle slash commands
		if (trimmed === "/exit" || trimmed === "/quit") {
			this.stop();
			return;
		}
		if (trimmed === "/clear") {
			this.session.agent.clearMessages();
			console.clear();
			console.log(renderWelcome(this.session.modelName, this.session.cwd));
			this.promptUser();
			return;
		}
		if (trimmed === "/help") {
			console.log(`
${theme.bold("Commands:")}
  ${theme.accent("/clear")}  - Clear conversation history
  ${theme.accent("/exit")}   - Exit the agent
  ${theme.accent("/help")}   - Show this help message
`);
			this.promptUser();
			return;
		}

		if (!trimmed) {
			this.promptUser();
			return;
		}

		try {
			// The API key needs to be passed through the agent's configuration
			// We set it as an environment variable which pi-ai reads automatically
			await this.session.prompt(trimmed);
		} catch (err: any) {
			console.error(theme.error(`\nError: ${err.message}\n`));
			this.promptUser();
		}
	}

	stop(): void {
		this.isRunning = false;
		if (this.session.isStreaming) {
			this.session.abort();
		}
		this.rl?.close();
		console.log(theme.muted("\nGoodbye!\n"));
		process.exit(0);
	}
}
