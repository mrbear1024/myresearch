/**
 * Read tool: Read file contents with line numbers.
 */

import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";
import { Type, type TObject, type TString, type TOptional, type TNumber } from "@sinclair/typebox";
import { readFile } from "node:fs/promises";
import { addLineNumbers, resolvePath, truncateOutput } from "./utils.js";

const readSchema = Type.Object({
	path: Type.String({ description: "Path to the file to read (relative or absolute)" }),
	offset: Type.Optional(Type.Number({ description: "Line number to start reading from (1-indexed)" })),
	limit: Type.Optional(Type.Number({ description: "Maximum number of lines to read" })),
});

type ReadSchema = typeof readSchema;

export function createReadTool(cwd: string): AgentTool<ReadSchema> {
	return {
		name: "read",
		label: "Read File",
		description:
			"Read the contents of a file. Returns the file content with line numbers. " +
			"Use offset and limit to read specific portions of large files. " +
			"The path can be relative to the working directory or absolute.",
		parameters: readSchema,
		execute: async (_toolCallId, args, _signal) => {
			try {
				const absolutePath = resolvePath(args.path, cwd);
				const raw = await readFile(absolutePath, "utf-8");
				let lines = raw.split("\n");

				const offset = args.offset ? Math.max(1, args.offset) : 1;
				const startIdx = offset - 1;

				if (startIdx >= lines.length) {
					return {
						content: [
							{
								type: "text" as const,
								text: `File has ${lines.length} lines, but offset ${offset} is beyond the end.`,
							},
						],
						details: {},
					};
				}

				if (args.limit) {
					lines = lines.slice(startIdx, startIdx + args.limit);
				} else {
					lines = lines.slice(startIdx);
				}

				const numbered = addLineNumbers(lines.join("\n"), offset);
				const { text, truncated } = truncateOutput(numbered);

				let result = text;
				if (truncated) {
					result += `\n\n(File truncated. Total lines: ${raw.split("\n").length}. Use offset/limit to read specific portions.)`;
				}

				return { content: [{ type: "text" as const, text: result }], details: {} };
			} catch (err: any) {
				return {
					content: [{ type: "text" as const, text: `Error reading file: ${err.message}` }],
					details: { error: true },
				};
			}
		},
	};
}
