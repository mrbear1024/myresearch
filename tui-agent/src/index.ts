#!/usr/bin/env node

/**
 * TUI Agent - AI coding assistant for your terminal.
 *
 * CLI entry point: parses arguments, loads env, launches TUI or print mode.
 */

import "dotenv/config";
import { TuiApp } from "./tui/app.js";
import { AgentSession } from "./agent-session.js";
import { getDefaultModelString, VERSION } from "./config.js";
import { theme } from "./tui/theme.js";
import { renderFooter } from "./tui/components/footer.js";
import { renderAssistantHeader } from "./tui/components/assistant-message.js";
import { renderToolStart, renderToolResult } from "./tui/components/tool-execution.js";
import type { AgentEvent } from "@mariozechner/pi-agent-core";
import type { AssistantMessage } from "@mariozechner/pi-ai";

interface CliArgs {
	prompt?: string;
	model?: string;
	cwd?: string;
	help?: boolean;
	version?: boolean;
}

function parseCliArgs(argv: string[]): CliArgs {
	const args: CliArgs = {};
	let i = 2; // Skip node and script path

	while (i < argv.length) {
		const arg = argv[i];

		switch (arg) {
			case "--help":
			case "-h":
				args.help = true;
				break;
			case "--version":
			case "-v":
				args.version = true;
				break;
			case "--model":
			case "-m":
				args.model = argv[++i];
				break;
			case "--cwd":
			case "-d":
				args.cwd = argv[++i];
				break;
			case "--prompt":
			case "-p":
				args.prompt = argv[++i];
				break;
			default:
				// Treat unrecognized args as prompt if no --prompt was specified
				if (!args.prompt && !arg.startsWith("-")) {
					args.prompt = arg;
				}
				break;
		}
		i++;
	}

	return args;
}

function printHelp(): void {
	console.log(`
${theme.bold("TUI Agent")} ${theme.muted(`v${VERSION}`)} - AI coding assistant for your terminal

${theme.bold("Usage:")}
  tui-agent [options] [prompt]

${theme.bold("Options:")}
  -m, --model <model>    Model to use (default: ${getDefaultModelString()})
  -d, --cwd <dir>        Working directory (default: current directory)
  -p, --prompt <text>    Run a single prompt and exit (non-interactive mode)
  -h, --help             Show this help message
  -v, --version          Show version

${theme.bold("Examples:")}
  tui-agent                              # Start interactive TUI
  tui-agent "list all TypeScript files"  # Run single prompt
  tui-agent -m openai:gpt-4o            # Use a different model

${theme.bold("Environment Variables:")}
  ANTHROPIC_API_KEY     API key for Anthropic Claude models
  OPENAI_API_KEY        API key for OpenAI models
  TUI_AGENT_MODEL       Default model (e.g., anthropic:claude-sonnet-4-20250514)
`);
}

/** Run a single prompt in non-interactive (print) mode */
async function runPrintMode(prompt: string, options: { cwd: string; model?: string }): Promise<void> {
	const session = new AgentSession({
		cwd: options.cwd,
		modelString: options.model,
	});

	let currentText = "";

	session.subscribe((event: AgentEvent) => {
		switch (event.type) {
			case "message_start":
				currentText = "";
				break;

			case "message_update": {
				const msg = event.message;
				if (msg.role === "assistant") {
					const assistantMsg = msg as AssistantMessage;
					for (const block of assistantMsg.content) {
						if (block.type === "text") {
							const newText = block.text;
							if (newText.length > currentText.length) {
								process.stdout.write(newText.slice(currentText.length));
								currentText = newText;
							}
						}
					}
				}
				break;
			}

			case "message_end":
				currentText = "";
				process.stdout.write("\n");
				break;

			case "tool_execution_start": {
				process.stderr.write(
					renderToolStart(event.toolName, event.args ?? {}) + "\n",
				);
				break;
			}

			case "tool_execution_end": {
				const result = event.result;
				if (result) {
					const textContent = result.content
						?.filter((c: any) => c.type === "text")
						.map((c: any) => c.text)
						.join("\n") ?? "";
					process.stderr.write(
						renderToolResult(
							event.toolName,
							textContent,
							event.isError ?? false,
						) + "\n",
					);
				}
				break;
			}
		}
	});

	try {
		await session.prompt(prompt);
	} catch (err: any) {
		console.error(theme.error(`Error: ${err.message}`));
		process.exit(1);
	}
}

// Main entry point
async function main(): Promise<void> {
	const args = parseCliArgs(process.argv);

	if (args.version) {
		console.log(`tui-agent v${VERSION}`);
		process.exit(0);
	}

	if (args.help) {
		printHelp();
		process.exit(0);
	}

	const cwd = args.cwd ?? process.cwd();

	if (args.prompt) {
		// Non-interactive print mode
		await runPrintMode(args.prompt, { cwd, model: args.model });
	} else {
		// Interactive TUI mode
		const app = new TuiApp({
			cwd,
			modelString: args.model,
		});
		await app.start();
	}
}

main().catch((err) => {
	console.error(theme.error(`Fatal error: ${err.message}`));
	process.exit(1);
});
