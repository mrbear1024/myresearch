/**
 * Git utilities.
 */

import { execSync } from "node:child_process";

export interface GitInfo {
	branch: string | null;
	repoName: string | null;
	isRepo: boolean;
}

export function getGitInfo(cwd: string): GitInfo {
	try {
		const branch = execSync("git rev-parse --abbrev-ref HEAD", {
			cwd,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();

		const topLevel = execSync("git rev-parse --show-toplevel", {
			cwd,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();

		const parts = topLevel.split("/");
		const repoName = parts[parts.length - 1];

		return { branch, repoName, isRepo: true };
	} catch {
		return { branch: null, repoName: null, isRepo: false };
	}
}
