/**
 * Grep tool: Search file contents with regex.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { spawn } from "node:child_process";
import { truncateOutput } from "./utils.js";

const grepSchema = Type.Object({
	pattern: Type.String({ description: "Regular expression pattern to search for" }),
	path: Type.Optional(
		Type.String({ description: "File or directory to search in (default: current directory)" }),
	),
	include: Type.Optional(
		Type.String({ description: "Glob pattern to filter files (e.g., '*.ts', '*.py')" }),
	),
	context: Type.Optional(
		Type.Number({ description: "Number of context lines before and after each match" }),
	),
});

type GrepSchema = typeof grepSchema;

export function createGrepTool(cwd: string): AgentTool<GrepSchema> {
	return {
		name: "grep",
		label: "Search",
		description:
			"Search for a regex pattern in files. Uses ripgrep (rg) if available, falls back to grep. " +
			"Returns matching lines with file paths and line numbers.",
		parameters: grepSchema,
		execute: async (_toolCallId, args, signal) => {
			return new Promise((resolve) => {
				const searchPath = args.path ?? ".";

				const rgArgs: string[] = [
					"--line-number",
					"--no-heading",
					"--color=never",
				];

				if (args.include) {
					rgArgs.push("--glob", args.include);
				}
				if (args.context) {
					rgArgs.push("-C", String(args.context));
				}

				rgArgs.push(args.pattern, searchPath);

				const child = spawn("rg", rgArgs, {
					cwd,
					stdio: ["ignore", "pipe", "pipe"],
				});

				let output = "";
				let stderr = "";

				child.stdout?.on("data", (data: Buffer) => {
					output += data.toString();
				});
				child.stderr?.on("data", (data: Buffer) => {
					stderr += data.toString();
				});

				const onAbort = () => {
					child.kill("SIGTERM");
				};
				signal?.addEventListener("abort", onAbort, { once: true });

				child.on("close", (code) => {
					signal?.removeEventListener("abort", onAbort);

					if (code === 1 && !output) {
						resolve({
							content: [{ type: "text" as const, text: "No matches found." }],
							details: {},
						});
						return;
					}

					if (code !== 0 && code !== 1 && !output) {
						resolve({
							content: [
								{
									type: "text" as const,
									text: `Search error: ${stderr || "Unknown error"}`,
								},
							],
							details: { error: true },
						});
						return;
					}

					const { text } = truncateOutput(output);
					const matchCount = output.trim().split("\n").filter(Boolean).length;
					resolve({
						content: [
							{
								type: "text" as const,
								text: `Found ${matchCount} matching lines:\n\n${text}`,
							},
						],
						details: {},
					});
				});

				child.on("error", (_err) => {
					signal?.removeEventListener("abort", onAbort);
					// rg not available, fall back to grep
					const fallbackArgs: string[] = ["-rn", "--color=never"];
					if (args.include) {
						fallbackArgs.push("--include", args.include);
					}
					if (args.context) {
						fallbackArgs.push("-C", String(args.context));
					}
					fallbackArgs.push(args.pattern, searchPath);

					const fallback = spawn("grep", fallbackArgs, {
						cwd,
						stdio: ["ignore", "pipe", "pipe"],
					});

					let fbOutput = "";
					fallback.stdout?.on("data", (data: Buffer) => {
						fbOutput += data.toString();
					});
					fallback.stderr?.on("data", () => {
						// ignore
					});

					fallback.on("close", (fbCode) => {
						if (fbCode === 1 && !fbOutput) {
							resolve({
								content: [{ type: "text" as const, text: "No matches found." }],
								details: {},
							});
							return;
						}
						const { text } = truncateOutput(fbOutput);
						resolve({
							content: [{ type: "text" as const, text: text || "No matches found." }],
							details: {},
						});
					});
					fallback.on("error", (fallbackErr) => {
						resolve({
							content: [
								{
									type: "text" as const,
									text: `Neither rg nor grep available: ${fallbackErr.message}`,
								},
							],
							details: { error: true },
						});
					});
				});
			});
		},
	};
}
