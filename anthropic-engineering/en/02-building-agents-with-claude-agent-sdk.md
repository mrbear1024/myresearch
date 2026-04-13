# Building Agents with the Claude Agent SDK

> Source: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
> Published: September 29, 2025

Since sharing our lessons on [building effective agents](https://www.anthropic.com/engineering/building-effective-agents), we released Claude Code, an agentic coding solution originally built to support developer productivity at Anthropic. Over the past several months, Claude Code has become far more than a coding tool. At Anthropic, we've been using it for deep research, video creation, and note-taking, among countless other non-coding applications. In fact, it has begun to power almost all of our major agent loops.

The agent harness that powers Claude Code (the Claude Code SDK) can power many other types of agents, too. To reflect this broader vision, we renamed the Claude Code SDK to the **Claude Agent SDK**.

In this post, we'll share why we built the Claude Agent SDK, how to build your own agents with it, and best practices from our team's own deployments.

## Why the Claude Agent SDK?

The key design principle behind Claude Code is that Claude needs the same tools that programmers use every day. It needs to be able to find appropriate files in a codebase, write and edit files, lint the code, run it, debug, edit, and sometimes take these actions iteratively until the code succeeds.

By giving Claude access to the user's computer via the terminal, it had what it needed to write code like programmers do. But this has also made Claude in Claude Code effective at non-coding tasks.

We realized the same agent loop could power many types of agents. So we built the Claude Agent SDK: a standalone package that gives you programmatic control over tools, permissions, cost limits, and output.

## The agent loop

Agents often operate in a specific feedback loop: **gather context → take action → verify work → repeat**. This offers a useful way to think about agents, and the capabilities they should be given.

When you start an agent, the SDK runs the same execution loop that powers Claude Code: Claude evaluates your prompt, calls tools to take action, receives the results, and repeats until the task is complete.

The Agent SDK gives you the same tools, agent loop, and context management that power Claude Code, programmable in Python and TypeScript.

## Gathering context

When developing an agent, you want to give it more than just a prompt: it needs to be able to fetch and update its own context.

The file system represents information that could be pulled into the model's context. When Claude encounters large files, like logs or user-uploaded files, it will decide which way to load these into its context by using bash scripts like `grep` and `tail`. In essence, **the folder and file structure of an agent becomes a form of context engineering**.

We suggest starting with agentic search, and only adding semantic search if you need faster results or more variations.

## Taking action with tools

**Tools are the primary building blocks of execution for your agent.** Tools are prominent in Claude's context window, making them the primary actions Claude will consider when deciding how to complete a task. This means you should be conscious about how you design your tools to maximize context efficiency.

For an email agent, for example, you might define tools like `fetchInbox` or `searchEmails` as the agent's primary, most frequent actions.

### MCP integration

The Model Context Protocol (MCP) provides standardized integrations to external services, handling authentication and API calls automatically. This means you can connect your agent to tools like Slack, GitHub, Google Drive, or Asana without writing custom integration code or managing OAuth flows yourself.

For an email agent example, you might want to search Slack messages to understand team context, or check Asana tasks. With MCP servers, these integrations work out of the box—your agent can simply call tools like `search_slack_messages` or `get_asana_tasks` and MCP handles the rest.

## Verifying work

Evaluation is the final critical piece of building an agent. You can have another language model "judge" the output of your agent based on fuzzy rules, though this is generally not very robust and can have heavy latency tradeoffs.

## Context management

The Claude Agent SDK's compact feature automatically summarizes previous messages when the context limit approaches, built on Claude Code's compact slash command. This allows agents to handle long-running tasks without running out of context.

### Subagents

Claude Agent SDK supports subagents by default, which are useful for parallelization and context management. Subagents use their own isolated context windows and only send relevant information back to the orchestrator.

## Types of agents you can build

- **Personal assistant agents**: Build agents that can help you book travel and manage your calendar, as well as schedule appointments, put together briefs, and more.
- **Customer support agents**: Build agents that can handle high-ambiguity user requests, like customer service tickets, by collecting and reviewing user data, connecting to external APIs, messaging users back, and escalating to humans when needed.
- **Deep research agents**: Build agents that can conduct comprehensive research across large document collections by searching through file systems, analyzing and synthesizing information from multiple sources, cross-referencing data across files, and generating detailed reports.
- **Finance agents**: Build agents that understand portfolios and evaluate investments.

## Getting started

With the agent loop in mind—gathering context, taking action, and verifying work—you can build reliable agents that are easy to deploy and iterate on. The Claude Agent SDK is available today in both Python and TypeScript.

In Python:
```bash
pip install claude-agent-sdk
```

In TypeScript:
```bash
npm install @anthropic-ai/claude-agent-sdk
```

You can get started with the [Claude Agent SDK documentation](https://docs.anthropic.com/en/agent-sdk/overview) today.
