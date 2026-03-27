/**
 * Assistant message rendering with streaming support.
 */

import { theme } from "../theme.js";

/** Render the assistant message header */
export function renderAssistantHeader(): string {
	return `\n${theme.assistantLabel("Assistant")}`;
}

/** Render a streaming text delta (just the raw text, appended to current output) */
export function renderTextDelta(delta: string): string {
	return delta;
}

/** Render a complete assistant text block */
export function renderAssistantText(text: string): string {
	return text;
}

/** Render thinking indicator */
export function renderThinking(): string {
	return theme.thinking("  ● Thinking...");
}

/** Render thinking content */
export function renderThinkingContent(thinking: string): string {
	// Show abbreviated thinking in dim text
	const lines = thinking.split("\n");
	const preview = lines.slice(0, 3).join("\n");
	const suffix = lines.length > 3 ? `\n${theme.dim(`  ... (${lines.length - 3} more lines)`)}` : "";
	return theme.dim(preview) + suffix;
}
