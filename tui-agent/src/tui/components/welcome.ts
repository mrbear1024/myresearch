/**
 * Welcome banner component.
 */

import { theme } from "../theme.js";
import { VERSION } from "../../config.js";

export function renderWelcome(modelName: string, cwd: string): string {
	const banner = `
${theme.accentBold("╔══════════════════════════════════════════╗")}
${theme.accentBold("║")}   ${theme.bold("TUI Agent")} ${theme.muted(`v${VERSION}`)}                      ${theme.accentBold("║")}
${theme.accentBold("║")}   ${theme.muted("AI coding assistant for your terminal")}   ${theme.accentBold("║")}
${theme.accentBold("╚══════════════════════════════════════════╝")}

  ${theme.muted("Model:")}  ${theme.accent(modelName)}
  ${theme.muted("CWD:")}    ${theme.accent(cwd)}

  ${theme.muted("Type your message and press")} ${theme.bold("Enter")} ${theme.muted("to send.")}
  ${theme.muted("Press")} ${theme.bold("Ctrl+C")} ${theme.muted("to abort, ")}${theme.bold("Ctrl+D")} ${theme.muted("to exit.")}
  ${theme.muted("Use")} ${theme.bold("Shift+Enter")} ${theme.muted("or")} ${theme.bold("\\\\n")} ${theme.muted("for multi-line input.")}
`;
	return banner;
}
