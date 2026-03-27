/**
 * Tool registry: all available tools.
 */

import type { AgentTool } from "@mariozechner/pi-agent-core";
import { createReadTool } from "./read.js";
import { createBashTool } from "./bash.js";
import { createWriteTool } from "./write.js";
import { createEditTool } from "./edit.js";
import { createGrepTool } from "./grep.js";
import { createFindTool } from "./find.js";
import { createLsTool } from "./ls.js";

export { createReadTool } from "./read.js";
export { createBashTool } from "./bash.js";
export { createWriteTool } from "./write.js";
export { createEditTool } from "./edit.js";
export { createGrepTool } from "./grep.js";
export { createFindTool } from "./find.js";
export { createLsTool } from "./ls.js";

export type ToolName = "read" | "bash" | "write" | "edit" | "grep" | "find" | "ls";

export function createAllTools(cwd: string): AgentTool<any>[] {
	return [
		createReadTool(cwd),
		createBashTool(cwd),
		createWriteTool(cwd),
		createEditTool(cwd),
		createGrepTool(cwd),
		createFindTool(cwd),
		createLsTool(cwd),
	];
}
