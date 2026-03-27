/**
 * Ls tool: Directory listing with file info.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { readdir, stat } from "node:fs/promises";
import * as path from "node:path";
import { resolvePath } from "./utils.js";

const lsSchema = Type.Object({
	path: Type.Optional(
		Type.String({ description: "Directory path to list (default: current directory)" }),
	),
});

type LsSchema = typeof lsSchema;

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes}B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}G`;
}

export function createLsTool(cwd: string): AgentTool<LsSchema> {
	return {
		name: "ls",
		label: "List Directory",
		description:
			"List the contents of a directory. Shows file names, types (file/dir), and sizes.",
		parameters: lsSchema,
		execute: async (_toolCallId, args, _signal) => {
			try {
				const dirPath = args.path ? resolvePath(args.path, cwd) : cwd;
				const entries = await readdir(dirPath, { withFileTypes: true });

				if (entries.length === 0) {
					return {
						content: [{ type: "text" as const, text: "(empty directory)" }],
						details: {},
					};
				}

				// Sort: directories first, then files
				const sorted = entries.sort((a, b) => {
					if (a.isDirectory() && !b.isDirectory()) return -1;
					if (!a.isDirectory() && b.isDirectory()) return 1;
					return a.name.localeCompare(b.name);
				});

				const lines: string[] = [];
				for (const entry of sorted) {
					const fullPath = path.join(dirPath, entry.name);
					if (entry.isDirectory()) {
						lines.push(`  ${entry.name}/`);
					} else {
						try {
							const stats = await stat(fullPath);
							lines.push(`  ${entry.name}  (${formatSize(stats.size)})`);
						} catch {
							lines.push(`  ${entry.name}`);
						}
					}
				}

				return {
					content: [
						{
							type: "text" as const,
							text: lines.join("\n"),
						},
					],
					details: {},
				};
			} catch (err: any) {
				return {
					content: [
						{ type: "text" as const, text: `Error listing directory: ${err.message}` },
					],
					details: { error: true },
				};
			}
		},
	};
}
