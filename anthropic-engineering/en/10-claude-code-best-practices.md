# Claude Code Best Practices

> Source: https://www.anthropic.com/engineering/claude-code-best-practices
> Published: 2025

Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools. Available in your terminal, IDE, desktop app, and browser, Claude Code plans the approach, writes the code across multiple files, and verifies it works.

In this post, we share best practices for getting the most out of Claude Code.

## Setting up your project

### CLAUDE.md

**CLAUDE.md** is a markdown file added to your project root that Claude Code reads at the start of every session. Use it to set:
- Coding standards and style guidelines
- Architecture decisions and patterns
- Preferred libraries and frameworks
- Build and test commands
- Review checklists

Think of CLAUDE.md as onboarding documentation for an AI collaborator. The more context you provide, the better Claude Code will understand your project's conventions.

CLAUDE.md files can be placed at multiple levels:
- **Repository root**: Project-wide conventions
- **Subdirectories**: Module-specific guidelines
- **Home directory** (`~/.claude/CLAUDE.md`): Personal preferences across all projects

### Model Context Protocol (MCP)

The Model Context Protocol (MCP) is an open standard for connecting AI tools to external data sources. With MCP, Claude Code can:
- Read design docs from Confluence or Notion
- Update tickets in Jira or Linear
- Pull data from Slack conversations
- Access databases and APIs

MCP servers provide standardized integrations, so you don't need custom code for each service.

## Effective workflows

### Bug fixing

For bugs, paste an error message or describe the symptom—Claude Code traces the issue through your codebase, identifies the root cause, and implements a fix.

### Writing tests

Claude Code excels at writing tests for untested code. Point it at a file or module, and it will generate comprehensive test suites covering happy paths, edge cases, and error conditions.

### Code refactoring

Describe the desired refactoring (e.g., "extract this logic into a shared utility"), and Claude Code handles the multi-file changes, updating imports and references throughout the codebase.

### Tedious tasks

Claude Code handles tedious tasks like fixing lint errors across a project, resolving merge conflicts, updating dependencies, and writing release notes.

## Multi-agent coordination

You can spawn multiple Claude Code agents that work on different parts of a task simultaneously. A lead agent coordinates the work, assigns subtasks, and merges results.

This is particularly useful for:
- Large refactoring across many files
- Parallel feature development
- Running different testing strategies simultaneously

## Building with the Agent SDK

For fully custom workflows, the Agent SDK lets you build your own agents powered by Claude Code's tools and capabilities, with full control over orchestration, tool access, and permissions.

## Auto-memory

Claude Code also builds auto-memory as it works, saving learnings like build commands and debugging insights across sessions. This means it gets better at working with your specific project over time.

## Tips for best results

1. **Be specific**: "Fix the authentication bug in the login endpoint" works better than "fix the bug"
2. **Provide context**: Share error messages, logs, or relevant documentation
3. **Use CLAUDE.md**: Set up project conventions once, benefit in every session
4. **Iterate**: Start with a focused task, review the result, then build on it
5. **Trust but verify**: Claude Code writes tests to verify its own work—review them
6. **Use multi-agent for large tasks**: Break complex projects into parallel subtasks
