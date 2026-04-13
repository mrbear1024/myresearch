# Claude Code Auto Mode: A Safer Way to Skip Permissions

> Source: https://www.anthropic.com/engineering/claude-code-auto-mode
> Published: 2025

Auto mode is a new mode for Claude Code that delegates approvals to model-based classifiers—a middle ground between manual review and no guardrails.

## The challenge

Claude Code's permission system ensures safety, but frequent prompts interrupt complex workflows. Users wanted more autonomy without sacrificing security. The question was: how do we reduce friction while maintaining safety?

## How auto mode works

Auto mode uses **two layers of defense**: one for what Claude reads, one for what Claude does.

### Input layer: prompt injection detection

At the input layer, a server-side prompt-injection probe scans tool outputs before they enter the agent's context. This catches attempts to hijack the agent through malicious content in files, web pages, or API responses.

If the probe detects a potential injection, the suspect content is flagged and the agent is warned, allowing it to proceed with caution rather than blindly executing injected instructions.

### Output layer: transcript classification

At the output layer, a transcript classifier evaluates each action before it executes. The classifier analyzes:
- The full conversation context
- The proposed action
- Whether the action is consistent with the user's original intent

Actions that appear safe are auto-approved. Actions that seem risky or inconsistent with the user's request are escalated for manual review.

## Permission rules in auto mode

On entering auto mode, permission rules that are known to grant arbitrary code execution are dropped, including:
- Blanket shell access
- Wildcarded script interpreters (`python`, `node`, `ruby`, and similar)
- Package manager run commands

This prevents auto mode from becoming a vector for unrestricted code execution while still allowing Claude to perform most development tasks autonomously.

## Safety properties

Auto mode maintains several key safety properties:
1. **Intent alignment**: Actions must be consistent with the user's request
2. **Injection resistance**: Content from external sources is scanned before processing
3. **Escalation path**: Uncertain actions are always escalated to the user
4. **No arbitrary execution**: Dangerous patterns are blocked even in auto mode

## Results

In testing, auto mode:
- Reduced permission prompts significantly for standard development tasks
- Caught prompt injection attempts from malicious file content
- Maintained safety on adversarial benchmarks
- Improved user productivity for long-running coding sessions

## When to use auto mode

Auto mode works best for:
- Long coding sessions with many file edits
- Tasks within well-defined project boundaries
- Development workflows where the actions are predictable

For tasks involving sensitive data, production deployments, or unfamiliar codebases, manual mode remains the recommended approach.
