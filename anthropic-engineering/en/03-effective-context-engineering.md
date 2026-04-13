# Effective Context Engineering for AI Agents

> Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
> Authors: Prithvi Rajasekaran, Ethan Dixon, Carly Ryan, Jeremy Hadfield
> Published: September 29, 2025

As we move towards engineering more capable agents that operate over multiple turns of inference and longer time horizons, we need strategies for managing the entire context state—system instructions, tools, Model Context Protocol (MCP), external data, message history, and more.

Prompt engineering was about finding the right words. Context engineering is about finding the right system configuration. In this post, we share what we've learned from building Claude Code and other agent systems about the art and science of curating what will go into the limited context window.

## From prompt engineering to context engineering

Prompt engineering asks: "How do I phrase this instruction?" Context engineering asks: "What total configuration of context will most likely produce the behavior I want from my model?"

Context—the set of tokens included when sampling from an LLM—has expanded well beyond a single prompt. It now encompasses system prompts, tool definitions, MCP integrations, external data sources, and evolving message history. Given that LLMs are constrained by a finite attention budget, good context engineering means finding the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome.

| Prompt Engineering | Context Engineering |
|---|---|
| Focuses on writing and organizing instructions | Manages the complete set of tokens |
| For discrete tasks (classification, generation) | For continuous agent operations |
| Emphasis on system prompts | Includes tools, MCP, external data, history |
| Discrete task | Iterative and continuous |

## The attention budget

LLMs operate under fundamental architectural constraints. Just like human working memory, their effective attention is limited. As we add more tokens to the context, the model's ability to precisely retrieve and use specific information can degrade—a phenomenon we call **context rot**.

This isn't a flaw of any particular model—it's a characteristic that emerges across all models. The practical implication is that we need to be intentional about what goes into the context window.

## System prompt structure

Organizing your prompts into distinct sections—using techniques like XML tagging or Markdown headers to delineate these sections—helps Claude navigate them effectively. We recommend using structures like `<background_information>`, `<instructions>`, `## Tool guidance`, and `## Output description`.

### The golden zone

There's a balance between specificity and flexibility in prompts. Too rigid, and the agent can't adapt to novel situations. Too vague, and the agent makes poor decisions. The "golden zone" is the sweet spot where instructions are specific enough to guide behavior but flexible enough to handle variation.

## Few-shot examples

Curate a set of diverse, canonical examples that effectively portray the expected behavior of the agent rather than stuffing edge cases into prompts. Examples should demonstrate the range of expected behaviors, not just edge cases.

## Dynamic context retrieval

Rather than pre-loading all possible context up front, effective agents discover and retrieve context just-in-time at runtime. Claude Code employs a hybrid model: CLAUDE.md files are naively dropped into context up front, while primitives like `glob` and `grep` allow it to navigate its environment and retrieve files just-in-time.

### Progressive disclosure

Progressive disclosure is when agents incrementally discover relevant context through signals like file sizes, timestamps, and hierarchies. Rather than dumping all information at once, agents can explore and load information as needed—like a developer navigating an unfamiliar codebase.

## Tool design as context engineering

Tools are loaded into the model's context window, which means their definitions consume attention budget. Poor tool design can waste context on ambiguous or overlapping capabilities.

Key principles:
- Eliminate overlapping tools that create ambiguity
- Keep tool descriptions concise but complete
- Use tool names that clearly convey their purpose
- Consider the total token cost of your tool definitions

## Compaction

Compaction—summarizing conversation contents nearing the context window limit—serves as the first lever in context engineering to drive better long-term coherence. In Claude Code, context compaction is implemented by passing the message history to the model to summarize and compress the most critical details, preserving architectural decisions, unresolved bugs, and implementation details while discarding redundant tool outputs.

## Structured note-taking

Agents can write notes persisted in memory outside the context window. These notes act as an external memory that the agent can retrieve later, allowing it to maintain important information across compaction boundaries.

## Multi-agent context management

Sub-agent architectures provide another powerful context management strategy. A main agent coordinates while specialized sub-agents perform deep technical work, each operating within their own context window. Sub-agents return condensed summaries to the orchestrator, keeping the main context window clean.

In our data, agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens than chats—making context efficiency particularly important.

## Conclusion

Context engineering represents a natural evolution of prompt engineering. As agents take on longer-running, more complex tasks, thoughtfully managing the complete context state—not just the prompt—becomes critical to building reliable, effective AI systems.
