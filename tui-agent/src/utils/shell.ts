/**
 * Shell utilities.
 */

import * as os from "node:os";

export function getShellName(): string {
	const shell = process.env.SHELL ?? (os.platform() === "win32" ? "cmd.exe" : "/bin/sh");
	const parts = shell.split("/");
	return parts[parts.length - 1];
}
