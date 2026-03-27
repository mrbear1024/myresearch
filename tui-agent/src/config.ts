/**
 * Application configuration: env vars, paths, defaults.
 */

import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";

export const APP_NAME = "tui-agent";
export const VERSION = "0.1.0";

/** Directory for app data (~/.tui-agent/) */
export function getAppDir(): string {
	const dir = path.join(os.homedir(), `.${APP_NAME}`);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	return dir;
}

/** Get API key for a provider from environment */
export function getApiKey(provider: string): string | undefined {
	const keyMap: Record<string, string> = {
		anthropic: "ANTHROPIC_API_KEY",
		openai: "OPENAI_API_KEY",
		google: "GOOGLE_API_KEY",
		mistral: "MISTRAL_API_KEY",
	};
	const envVar = keyMap[provider] ?? `${provider.toUpperCase().replace(/-/g, "_")}_API_KEY`;
	return process.env[envVar];
}

/** Parse model string like "anthropic:claude-sonnet-4-20250514" */
export function parseModelString(modelStr: string): { provider: string; modelId: string } {
	const colonIndex = modelStr.indexOf(":");
	if (colonIndex === -1) {
		return { provider: "anthropic", modelId: modelStr };
	}
	return {
		provider: modelStr.slice(0, colonIndex),
		modelId: modelStr.slice(colonIndex + 1),
	};
}

/** Get default model string from env or fallback */
export function getDefaultModelString(): string {
	return process.env.TUI_AGENT_MODEL ?? "anthropic:claude-sonnet-4-20250514";
}
