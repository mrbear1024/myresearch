/**
 * Bash tool: Execute shell commands.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { truncateOutput } from "./utils.js";

const bashSchema = Type.Object({
	command: Type.String({ description: "Bash command to execute" }),
	timeout: Type.Optional(
		Type.Number({ description: "Timeout in seconds (optional, default: 120)" }),
	),
});

type BashSchema = typeof bashSchema;

function getShellConfig(): { shell: string; args: string[] } {
	const shell = process.env.SHELL ?? "/bin/bash";
	return { shell, args: ["-c"] };
}

function killProcessTree(pid: number): void {
	try {
		process.kill(-pid, "SIGTERM");
	} catch {
		try {
			process.kill(pid, "SIGTERM");
		} catch {
			// Process already dead
		}
	}
}

export function createBashTool(cwd: string): AgentTool<BashSchema> {
	return {
		name: "bash",
		label: "Bash",
		description:
			"Execute a bash command and return its output (stdout and stderr combined). " +
			"Commands run in the working directory. Use timeout to limit execution time.",
		parameters: bashSchema,
		execute: async (_toolCallId, args, signal) => {
			return new Promise((resolve) => {
				if (!existsSync(cwd)) {
					resolve({
						content: [
							{ type: "text" as const, text: `Working directory does not exist: ${cwd}` },
						],
						details: { error: true },
					});
					return;
				}

				const { shell, args: shellArgs } = getShellConfig();
				const child = spawn(shell, [...shellArgs, args.command], {
					cwd,
					detached: true,
					env: { ...process.env },
					stdio: ["ignore", "pipe", "pipe"],
				});

				let output = "";
				let timedOut = false;
				const timeoutMs = (args.timeout ?? 120) * 1000;

				const timeoutHandle = setTimeout(() => {
					timedOut = true;
					if (child.pid) killProcessTree(child.pid);
				}, timeoutMs);

				child.stdout?.on("data", (data: Buffer) => {
					output += data.toString();
				});
				child.stderr?.on("data", (data: Buffer) => {
					output += data.toString();
				});

				const onAbort = () => {
					if (child.pid) killProcessTree(child.pid);
				};
				signal?.addEventListener("abort", onAbort, { once: true });

				child.on("close", (code) => {
					clearTimeout(timeoutHandle);
					signal?.removeEventListener("abort", onAbort);

					const { text } = truncateOutput(output);
					let result = text;

					if (timedOut) {
						result += `\n\n(Command timed out after ${args.timeout ?? 120}s)`;
					}
					if (code !== null && code !== 0) {
						result += `\n\n(Exit code: ${code})`;
					}

					resolve({
						content: [{ type: "text" as const, text: result || "(no output)" }],
						details: { exitCode: code, timedOut },
					});
				});

				child.on("error", (err) => {
					clearTimeout(timeoutHandle);
					signal?.removeEventListener("abort", onAbort);
					resolve({
						content: [
							{ type: "text" as const, text: `Error executing command: ${err.message}` },
						],
						details: { error: true },
					});
				});
			});
		},
	};
}
