/**
 * Agent session: wires together the Agent, model, tools, and system prompt.
 */

import { Agent, type AgentEvent, type AgentMessage } from "@mariozechner/pi-agent-core";
import { getModel, type Model, type Api } from "@mariozechner/pi-ai";
import { createAllTools } from "./tools/index.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { getApiKey, parseModelString, getDefaultModelString } from "./config.js";

export interface AgentSessionOptions {
	cwd: string;
	modelString?: string;
}

export interface AgentSessionEvent {
	type: string;
	data: AgentEvent;
}

export class AgentSession {
	readonly agent: Agent;
	readonly cwd: string;
	readonly modelName: string;
	private _model: Model<any>;

	constructor(options: AgentSessionOptions) {
		this.cwd = options.cwd;

		// Resolve model
		const modelStr = options.modelString ?? getDefaultModelString();
		const { provider, modelId } = parseModelString(modelStr);
		this._model = getModel(provider as any, modelId as any);

		if (!this._model) {
			throw new Error(
				`Model not found: ${modelStr}. ` +
					`Make sure the format is "provider:model-id" (e.g., "anthropic:claude-sonnet-4-20250514").`,
			);
		}

		this.modelName = `${provider}:${modelId}`;

		// Create tools
		const tools = createAllTools(this.cwd);

		// Build system prompt
		const systemPrompt = buildSystemPrompt(this.cwd);

		// Create agent
		this.agent = new Agent({
			initialState: {
				systemPrompt,
				model: this._model,
				tools,
				thinkingLevel: "medium",
			},
		});

		// Set API key resolver
		this.agent.setBeforeToolCall(async (_context, _signal) => {
			// Allow all tools by default (no permission blocking)
			return undefined;
		});
	}

	/** Get the API key for the current model's provider */
	getApiKeyForProvider(): string | undefined {
		const { provider } = parseModelString(this.modelName);
		return getApiKey(provider);
	}

	/** Send a user message and start the agent loop */
	async prompt(message: string): Promise<void> {
		const apiKey = this.getApiKeyForProvider();
		if (apiKey) {
			// Set API key via options - the agent will forward it to streamSimple
		}

		await this.agent.prompt(message);
		await this.agent.waitForIdle();
	}

	/** Subscribe to agent events */
	subscribe(callback: (event: AgentEvent) => void): () => void {
		return this.agent.subscribe(callback);
	}

	/** Get conversation messages */
	get messages(): AgentMessage[] {
		return this.agent.state.messages;
	}

	/** Check if agent is currently streaming */
	get isStreaming(): boolean {
		return this.agent.state.isStreaming;
	}

	/** Abort the current operation */
	abort(): void {
		this.agent.abort();
	}
}
