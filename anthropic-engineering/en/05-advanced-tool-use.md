# Introducing Advanced Tool Use on the Claude Developer Platform

> Source: https://www.anthropic.com/engineering/advanced-tool-use
> Author: Bin Wu
> Contributors: Adam Jones, Artur Renault, Henry Tay, Jake Noble, Noah Picard, Sam Jiang, and the Claude Developer Platform team
> Published: November 24, 2025

To build effective agents, they need to work with unlimited tool libraries without stuffing every definition into context upfront. Today, we're releasing three new beta features that let Claude discover, learn, and execute tools dynamically. These features move tool use from simple function calling toward intelligent orchestration.

As agents tackle more complex workflows spanning dozens of tools and large datasets, dynamic discovery, efficient execution, and reliable invocation become foundational.

## The challenge: tool scaling

Tool definitions alone can consume massive token budgets. 58 tools use approximately 55K tokens, and we've seen tool definitions consume 134K tokens before optimization. As the number of tools grows, the traditional approach of loading all definitions upfront becomes untenable.

## Tool Search Tool

Instead of loading all tool definitions upfront, the Tool Search Tool discovers tools on-demand, so Claude only sees the tools it actually needs for the current task. This represents an 85% reduction in token usage while maintaining access to the full tool library.

The Tool Search Tool allows Claude to use search to access thousands of tools without consuming its context window. When Claude needs a capability, it searches for the relevant tool, retrieves its definition, and uses it—all within a single conversation turn.

**Results**: Tool Search Tool preserves 191,300 tokens of context compared to 122,800 with Claude's traditional approach. Opus 4 improved from 49% to 74%, and Opus 4.5 improved from 79.5% to 88.1% with Tool Search Tool enabled.

## Programmatic Tool Calling

Programmatic Tool Calling enables Claude to orchestrate tools through code rather than through individual API round-trips. Instead of Claude requesting tools one at a time, Claude writes code that calls multiple tools, processes their outputs, and controls what information actually enters its context window.

The script runs in the Code Execution tool (a sandboxed environment), pausing when it needs results from your tools. Each API round-trip requires model inference. When Claude orchestrates 20+ tool calls in a single code block, you eliminate 19+ inference passes.

By keeping intermediate results out of Claude's context, Programmatic Tool Calling dramatically reduces token consumption—average usage dropped from 43,588 to 27,297 tokens, a 37% reduction on complex research tasks.

## Tool Use Examples

Tool Use Examples provides a universal standard for demonstrating how to effectively use a given tool. By providing examples of correct tool usage patterns, you reduce parameter errors and malformed calls.

Examples serve as few-shot demonstrations that help Claude understand:
- The expected input format
- Common parameter combinations
- Typical usage patterns
- Edge cases to handle

## Getting started

We recommend starting with your biggest bottleneck:
- **Context bloat from tool definitions** → Tool Search Tool
- **Large intermediate results polluting context** → Programmatic Tool Calling
- **Parameter errors and malformed calls** → Tool Use Examples

These three features work together to create a more efficient, reliable tool use experience. Start with one, measure the impact, and layer on additional features as needed.
