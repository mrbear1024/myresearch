/**
 * Tool execution display component.
 */

import { theme } from "../theme.js";

/** Format tool call arguments for display */
function formatToolArgs(name: string, args: Record<string, any>): string {
	switch (name) {
		case "read":
			return args.path ?? "";
		case "write":
			return args.path ?? "";
		case "edit":
			return args.path ?? "";
		case "bash":
			return truncateStr(args.command ?? "", 80);
		case "grep":
			return `${args.pattern}${args.path ? ` in ${args.path}` : ""}`;
		case "find":
			return `${args.pattern}${args.path ? ` in ${args.path}` : ""}`;
		case "ls":
			return args.path ?? ".";
		default:
			return JSON.stringify(args).slice(0, 80);
	}
}

function truncateStr(str: string, maxLen: number): string {
	if (str.length <= maxLen) return str;
	return str.slice(0, maxLen - 3) + "...";
}

/** Render tool execution start */
export function renderToolStart(name: string, args: Record<string, any>): string {
	const argsDisplay = formatToolArgs(name, args);
	return `\n  ${theme.toolLabel("⚡")} ${theme.bold(name)} ${theme.accent(argsDisplay)}`;
}

/** Render tool execution result */
export function renderToolResult(
	name: string,
	content: string,
	isError: boolean,
	expanded: boolean = false,
): string {
	const lines = content.split("\n");
	const maxPreviewLines = expanded ? lines.length : 8;
	const displayLines = lines.slice(0, maxPreviewLines);
	const remaining = lines.length - maxPreviewLines;

	let result = "";
	if (isError) {
		result = theme.error(`  ✗ ${displayLines.join("\n    ")}`);
	} else {
		result = theme.muted(`  ${displayLines.map((l) => `  ${l}`).join("\n")}`);
	}

	if (remaining > 0) {
		result += `\n${theme.dim(`    ... (${remaining} more lines)`)}`;
	}

	return result;
}
