/**
 * Find tool: Search for files by glob pattern.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { readdir } from "node:fs/promises";
import * as path from "node:path";
import { minimatch } from "minimatch";
import { resolvePath, truncateOutput } from "./utils.js";

const findSchema = Type.Object({
	pattern: Type.String({ description: "Glob pattern to match files (e.g., '**/*.ts', 'src/**/*.json')" }),
	path: Type.Optional(
		Type.String({ description: "Directory to search in (default: current directory)" }),
	),
});

type FindSchema = typeof findSchema;

async function walkDir(
	dir: string,
	baseDir: string,
	results: string[],
	signal?: AbortSignal,
	maxResults: number = 1000,
): Promise<void> {
	if (signal?.aborted || results.length >= maxResults) return;

	try {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (signal?.aborted || results.length >= maxResults) break;

			const fullPath = path.join(dir, entry.name);
			const relativePath = path.relative(baseDir, fullPath);

			// Skip hidden dirs and node_modules
			if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

			if (entry.isDirectory()) {
				await walkDir(fullPath, baseDir, results, signal, maxResults);
			} else {
				results.push(relativePath);
			}
		}
	} catch {
		// Skip unreadable directories
	}
}

export function createFindTool(cwd: string): AgentTool<FindSchema> {
	return {
		name: "find",
		label: "Find Files",
		description:
			"Find files matching a glob pattern. Returns relative file paths. " +
			"Skips hidden directories and node_modules.",
		parameters: findSchema,
		execute: async (_toolCallId, args, signal) => {
			try {
				const searchDir = args.path ? resolvePath(args.path, cwd) : cwd;
				const allFiles: string[] = [];

				await walkDir(searchDir, searchDir, allFiles, signal);

				const matched = allFiles.filter((f) => minimatch(f, args.pattern));

				if (matched.length === 0) {
					return {
						content: [{ type: "text" as const, text: "No files found matching the pattern." }],
						details: {},
					};
				}

				const { text } = truncateOutput(matched.join("\n"));
				return {
					content: [
						{
							type: "text" as const,
							text: `Found ${matched.length} file(s):\n\n${text}`,
						},
					],
					details: {},
				};
			} catch (err: any) {
				return {
					content: [{ type: "text" as const, text: `Error searching files: ${err.message}` }],
					details: { error: true },
				};
			}
		},
	};
}
