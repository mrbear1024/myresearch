/**
 * Edit tool: String replacement editing in files.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { readFile, writeFile } from "node:fs/promises";
import { resolvePath } from "./utils.js";

const editSchema = Type.Object({
	path: Type.String({ description: "Path to the file to edit (relative or absolute)" }),
	old_string: Type.String({ description: "The exact string to find and replace" }),
	new_string: Type.String({ description: "The replacement string" }),
	replace_all: Type.Optional(
		Type.Boolean({ description: "Replace all occurrences (default: false)" }),
	),
});

type EditSchema = typeof editSchema;

export function createEditTool(cwd: string): AgentTool<EditSchema> {
	return {
		name: "edit",
		label: "Edit File",
		description:
			"Edit a file by replacing an exact string with a new string. " +
			"The old_string must match exactly (including whitespace and indentation). " +
			"The match must be unique in the file unless replace_all is true.",
		parameters: editSchema,
		execute: async (_toolCallId, args, _signal) => {
			try {
				const absolutePath = resolvePath(args.path, cwd);
				const content = await readFile(absolutePath, "utf-8");

				if (!content.includes(args.old_string)) {
					return {
						content: [
							{
								type: "text" as const,
								text: `Error: old_string not found in file. Make sure the string matches exactly, including whitespace and indentation.`,
							},
						],
						details: { error: true },
					};
				}

				if (!args.replace_all) {
					const firstIdx = content.indexOf(args.old_string);
					const secondIdx = content.indexOf(args.old_string, firstIdx + 1);
					if (secondIdx !== -1) {
						const occurrences = content.split(args.old_string).length - 1;
						return {
							content: [
								{
									type: "text" as const,
									text: `Error: old_string found ${occurrences} times in file. Provide more context to make the match unique, or set replace_all to true.`,
								},
							],
							details: { error: true },
						};
					}
				}

				const newContent = args.replace_all
					? content.split(args.old_string).join(args.new_string)
					: content.replace(args.old_string, args.new_string);

				await writeFile(absolutePath, newContent, "utf-8");

				const replacements = args.replace_all
					? content.split(args.old_string).length - 1
					: 1;

				return {
					content: [
						{
							type: "text" as const,
							text: `Successfully edited ${args.path} (${replacements} replacement${replacements > 1 ? "s" : ""})`,
						},
					],
					details: {},
				};
			} catch (err: any) {
				return {
					content: [{ type: "text" as const, text: `Error editing file: ${err.message}` }],
					details: { error: true },
				};
			}
		},
	};
}
