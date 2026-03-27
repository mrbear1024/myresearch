/**
 * User input handling with readline support.
 */

import { createInterface, type Interface } from "node:readline";
import { theme } from "../theme.js";

export interface UserInputOptions {
	prompt?: string;
	onSubmit: (input: string) => void;
	onAbort: () => void;
	onExit: () => void;
}

/** Render the user prompt label */
export function renderUserPrompt(): string {
	return `\n${theme.userLabel("You")} ${theme.muted("›")} `;
}

/**
 * Create a readline interface for user input.
 * Supports multi-line via \\n escape sequences.
 */
export function createInputReader(options: UserInputOptions): Interface {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: renderUserPrompt(),
		terminal: true,
	});

	rl.on("line", (line) => {
		const trimmed = line.trim();
		if (!trimmed) return;

		// Replace \\n with actual newlines for multi-line support
		const processed = trimmed.replace(/\\n/g, "\n");
		options.onSubmit(processed);
	});

	rl.on("close", () => {
		options.onExit();
	});

	rl.on("SIGINT", () => {
		options.onAbort();
	});

	return rl;
}
