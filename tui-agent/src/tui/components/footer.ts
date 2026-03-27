/**
 * Footer status bar component.
 */

import { theme } from "../theme.js";

export interface FooterState {
	modelName: string;
	isStreaming: boolean;
	isThinking: boolean;
	toolName?: string;
	tokenCount?: { input: number; output: number };
}

/** Render the footer status bar */
export function renderFooter(state: FooterState): string {
	const parts: string[] = [];

	// Model name
	parts.push(theme.muted(`[${state.modelName}]`));

	// Status indicator
	if (state.toolName) {
		parts.push(theme.toolRunning(`⚡ ${state.toolName}`));
	} else if (state.isStreaming) {
		parts.push(theme.streaming("● streaming"));
	} else if (state.isThinking) {
		parts.push(theme.thinking("● thinking"));
	}

	// Token count
	if (state.tokenCount) {
		const { input, output } = state.tokenCount;
		parts.push(theme.dim(`tokens: ${input}↑ ${output}↓`));
	}

	return theme.muted("─".repeat(50)) + "\n" + parts.join("  ");
}
