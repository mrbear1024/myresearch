/**
 * System prompt builder: assembles context for the agent.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execSync } from "node:child_process";

/** Try to read CLAUDE.md or similar context file from project root */
function readProjectContext(cwd: string): string | undefined {
	const candidates = ["CLAUDE.md", ".claude/CLAUDE.md", "AGENTS.md"];
	for (const candidate of candidates) {
		const filePath = path.join(cwd, candidate);
		if (fs.existsSync(filePath)) {
			try {
				return fs.readFileSync(filePath, "utf-8");
			} catch {
				continue;
			}
		}
	}
	return undefined;
}

/** Get git info for the current directory */
function getGitInfo(cwd: string): { branch?: string; repoName?: string } {
	try {
		const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf-8" }).trim();
		const repoName = path.basename(
			execSync("git rev-parse --show-toplevel", { cwd, encoding: "utf-8" }).trim(),
		);
		return { branch, repoName };
	} catch {
		return {};
	}
}

export function buildSystemPrompt(cwd: string): string {
	const projectContext = readProjectContext(cwd);
	const gitInfo = getGitInfo(cwd);

	let prompt = `You are an expert AI coding assistant, similar to Claude Code. You help users with software engineering tasks by reading, writing, editing files, running commands, and searching code.

# Environment
- Working directory: ${cwd}
- Platform: ${os.platform()}
- Node.js: ${process.version}`;

	if (gitInfo.branch) {
		prompt += `\n- Git branch: ${gitInfo.branch}`;
	}
	if (gitInfo.repoName) {
		prompt += `\n- Repository: ${gitInfo.repoName}`;
	}

	prompt += `

# Available Tools
You have access to the following tools:

1. **read** - Read file contents with line numbers. Use offset/limit for large files.
2. **write** - Create or overwrite files. Creates parent directories automatically.
3. **edit** - Edit files by exact string replacement. The old_string must match uniquely.
4. **bash** - Execute shell commands. Use for running tests, git operations, installations, etc.
5. **grep** - Search for regex patterns in files. Returns matching lines with context.
6. **find** - Find files matching glob patterns. Useful for discovering project structure.
7. **ls** - List directory contents with file types and sizes.

# Guidelines
- Read files before editing them to understand context.
- Use the appropriate tool for each task (e.g., grep for searching, read for viewing).
- Make minimal, targeted changes. Don't refactor code that wasn't requested.
- When editing, provide enough context in old_string for a unique match.
- Run tests or builds after making changes when appropriate.
- Be concise in your responses. Focus on what was done and what's important.
- If a task is ambiguous, ask for clarification rather than guessing.`;

	if (projectContext) {
		prompt += `

# Project Context
The following project context was loaded from the project's configuration file:

${projectContext}`;
	}

	return prompt;
}
