/**
 * Shared tool utilities: path resolution, output truncation.
 */

import * as path from "node:path";
import * as fs from "node:fs";

/** Resolve a path relative to cwd, handling absolute paths */
export function resolvePath(inputPath: string, cwd: string): string {
	if (path.isAbsolute(inputPath)) {
		return path.normalize(inputPath);
	}
	return path.resolve(cwd, inputPath);
}

/** Add line numbers to content (1-indexed) */
export function addLineNumbers(content: string, startLine: number = 1): string {
	const lines = content.split("\n");
	const maxLineNum = startLine + lines.length - 1;
	const padWidth = String(maxLineNum).length;
	return lines
		.map((line, i) => {
			const lineNum = String(startLine + i).padStart(padWidth, " ");
			return `${lineNum}\t${line}`;
		})
		.join("\n");
}

/** Truncate output to max lines and bytes */
export function truncateOutput(
	text: string,
	maxLines: number = 2000,
	maxBytes: number = 200_000,
): { text: string; truncated: boolean; originalLines: number; originalBytes: number } {
	const originalBytes = Buffer.byteLength(text, "utf-8");
	const lines = text.split("\n");
	const originalLines = lines.length;

	let truncated = false;

	// Truncate by lines
	if (lines.length > maxLines) {
		const kept = lines.slice(0, maxLines);
		const omitted = lines.length - maxLines;
		kept.push(`\n... (${omitted} more lines omitted)`);
		text = kept.join("\n");
		truncated = true;
	}

	// Truncate by bytes
	if (Buffer.byteLength(text, "utf-8") > maxBytes) {
		const buf = Buffer.from(text, "utf-8");
		text = buf.subarray(0, maxBytes).toString("utf-8");
		text += "\n... (output truncated due to size)";
		truncated = true;
	}

	return { text, truncated, originalLines, originalBytes };
}

/** Check if a file exists and is readable */
export async function isReadable(filePath: string): Promise<boolean> {
	try {
		await fs.promises.access(filePath, fs.constants.R_OK);
		return true;
	} catch {
		return false;
	}
}

/** Get short path for display (replace home dir with ~) */
export function shortenPath(filePath: string): string {
	const home = process.env.HOME ?? process.env.USERPROFILE ?? "";
	if (home && filePath.startsWith(home)) {
		return "~" + filePath.slice(home.length);
	}
	return filePath;
}
