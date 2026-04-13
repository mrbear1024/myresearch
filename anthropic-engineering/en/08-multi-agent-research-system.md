# How We Built Our Multi-Agent Research System

> Source: https://www.anthropic.com/engineering/multi-agent-research-system
> Published: 2025

The Research feature uses multiple Claude agents to explore complex topics more effectively. In this post, we share the engineering challenges and lessons learned from building this system.

A multi-agent system with Claude Opus 4 as the lead agent and Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4 by 90.2% on our internal research eval.

## Why multi-agent?

Some research tasks are too complex for a single agent operating within one context window. They require exploring multiple sources simultaneously, synthesizing information from different angles, and managing more context than fits in a single window.

We found that multi-agent systems excel at tasks that involve:
- Heavy parallelization across many sources
- Information that exceeds single context windows
- Interfacing with numerous complex tools

## Architecture

The Research system uses a multi-agent architecture with an **orchestrator-worker pattern**. A lead agent (Claude Opus 4) breaks down the research question, delegates subtasks to worker agents (Claude Sonnet 4), and synthesizes their findings.

### Scaling rules

Agents struggle to judge appropriate effort for different tasks, so we embedded scaling rules in the prompts:
- **Simple fact-finding**: 1 agent with 3–10 tool calls
- **Moderate research**: 3–5 subagents with focused responsibilities
- **Complex research**: More than 10 subagents with clearly divided responsibilities

## Prompting strategy

Our prompting strategy focuses on instilling good heuristics rather than rigid rules. We studied how skilled humans approach research tasks and encoded these strategies in our prompts.

### Guiding the thinking process

Rather than prescribing exact steps, we guide the agent's reasoning process—encouraging it to consider multiple hypotheses, seek disconfirming evidence, and synthesize across sources.

### Teaching orchestrators to delegate

The lead agent needs to know when to delegate vs. when to handle a subtask itself. We found that explicit delegation criteria in the prompt significantly improved task distribution.

### Parallel tool calling

Subagents can make multiple tool calls in parallel, dramatically reducing total research time. The orchestrator coordinates these parallel efforts and manages information flow.

## Token usage patterns

In our data:
- Agents typically use about **4× more tokens** than chat interactions
- Multi-agent systems use about **15× more tokens** than chats

This makes token efficiency critical for multi-agent systems. We use aggressive compaction and selective information passing to keep costs manageable.

## Lessons learned

1. **Start simple, add complexity only when needed**: Not every research question needs 10 subagents. The system should scale effort to match query complexity.
2. **Subagent quality matters more than quantity**: A few well-prompted subagents outperform many poorly-directed ones.
3. **Information synthesis is the hardest part**: Combining findings from multiple agents into a coherent, non-redundant response requires careful orchestration.
4. **Evaluation is essential**: We built custom evals to measure research quality, including factual accuracy, completeness, and source diversity.

## Results

On our internal research benchmark, the multi-agent system showed dramatic improvements:
- 90.2% improvement over single-agent Claude Opus 4
- Better source diversity and factual coverage
- More structured and comprehensive outputs

The journey from prototype to production taught us critical lessons about system architecture, tool design, and prompt engineering that apply well beyond research tasks.
