/**
 * Write tool: Create or overwrite files.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { resolvePath } from "./utils.js";

const writeSchema = Type.Object({
	path: Type.String({ description: "Path to the file to write (relative or absolute)" }),
	content: Type.String({ description: "The content to write to the file" }),
});

type WriteSchema = typeof writeSchema;

export function createWriteTool(cwd: string): AgentTool<WriteSchema> {
	return {
		name: "write",
		label: "Write File",
		description:
			"Write content to a file. Creates the file if it doesn't exist, or overwrites if it does. " +
			"Creates parent directories as needed.",
		parameters: writeSchema,
		execute: async (_toolCallId, args, _signal) => {
			try {
				const absolutePath = resolvePath(args.path, cwd);
				await mkdir(dirname(absolutePath), { recursive: true });
				await writeFile(absolutePath, args.content, "utf-8");

				const lineCount = args.content.split("\n").length;
				return {
					content: [
						{
							type: "text" as const,
							text: `Successfully wrote ${lineCount} lines to ${args.path}`,
						},
					],
					details: {},
				};
			} catch (err: any) {
				return {
					content: [{ type: "text" as const, text: `Error writing file: ${err.message}` }],
					details: { error: true },
				};
			}
		},
	};
}
