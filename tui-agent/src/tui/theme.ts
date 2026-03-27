/**
 * Color theme for the TUI.
 */

import chalk from "chalk";

export const theme = {
	// Main colors
	accent: chalk.cyan,
	accentBold: chalk.cyan.bold,
	muted: chalk.gray,
	error: chalk.red,
	warning: chalk.yellow,
	success: chalk.green,
	info: chalk.blue,

	// UI elements
	border: chalk.gray,
	borderActive: chalk.cyan,
	title: chalk.bold,
	subtitle: chalk.gray,

	// Message roles
	userLabel: chalk.green.bold,
	assistantLabel: chalk.cyan.bold,
	toolLabel: chalk.yellow.bold,
	systemLabel: chalk.magenta.bold,

	// Code
	code: chalk.white,
	codeBlock: chalk.white,

	// Status
	streaming: chalk.cyan,
	thinking: chalk.magenta,
	toolRunning: chalk.yellow,

	// Helpers
	bold: chalk.bold,
	dim: chalk.dim,
	italic: chalk.italic,
	underline: chalk.underline,
};
