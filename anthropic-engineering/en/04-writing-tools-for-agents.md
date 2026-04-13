# Writing Effective Tools for AI Agents—Using AI Agents

> Source: https://www.anthropic.com/engineering/writing-tools-for-agents
> Published: 2025

Tools are a new kind of software. Unlike traditional APIs designed for deterministic systems, tools represent a contract between deterministic systems and non-deterministic agents. They need to be understandable by AI models, not just human developers.

In this post, we share what we've learned about designing effective tools for AI agents, drawing from our experience building and optimizing tools internally with Claude Code.

## Tools as a new software paradigm

When you write a tool for an agent, you're writing software that will be interpreted and called by a language model. This means the design considerations are different from traditional API design. The model needs to understand:

- What the tool does
- When to use it
- What inputs it expects
- What outputs it produces
- How it differs from similar tools

Most of the advice in this post came from repeatedly optimizing internal tool implementations with Claude Code.

## Prompt-engineering your tool descriptions

One of the most effective methods for improving tools is prompt-engineering your tool descriptions and specs, because these are loaded into your agents' context and can collectively steer agents toward effective tool-calling behaviors.

When writing tool descriptions and specs, think of how you would describe your tool to a new hire on your team, and make implicit context explicit. Include:

- A clear, concise description of what the tool does
- When to use this tool vs. alternatives
- Expected input formats with examples
- Edge cases and error handling
- Clear boundaries from other tools

For Claude Code, tool responses are restricted to 25,000 tokens by default. This prevents any single tool result from overwhelming the context window.

## Tool design principles

### Make tools discoverable

Tool names should clearly convey their purpose. If you have `search_files` and `find_in_codebase`, the overlap creates ambiguity. Choose one name that accurately describes the action.

### Reduce ambiguity

When multiple tools have overlapping functionality, agents struggle to choose the right one. Ensure each tool has a distinct, well-defined purpose. If two tools are similar, either merge them or clearly document when each should be used.

### Design for the model's strengths

Models are better at some input formats than others. For example:
- File paths should be absolute, not relative
- Structured inputs (JSON) should avoid unnecessary escaping
- Outputs should be in formats the model can easily parse

### Keep outputs focused

Return only the information the agent needs. Large, noisy outputs waste context tokens and can confuse the model. Consider pagination, filtering, or summarization for tools that can return large results.

## Testing tools with agents

Wrapping your tools in a local MCP server or Desktop extension (DXT) will allow you to connect and test your tools in Claude Code or the Claude Desktop app. This is the fastest way to iterate on tool design.

Testing approaches:
1. **Manual testing**: Try common use cases and edge cases manually
2. **Automated benchmarks**: Create test suites that evaluate tool usage across scenarios
3. **Real-world observation**: Monitor how agents use your tools in practice and identify failure patterns

## Tool composition

Well-designed tools work together as a coherent toolkit. Consider:
- How tools chain together in common workflows
- Whether the output of one tool serves as natural input for another
- Whether you need atomic operations vs. compound actions

## Error handling

Tools should return clear, actionable error messages. When a tool fails, the agent needs to understand:
- What went wrong
- Whether it should retry
- Whether it should try an alternative approach

Avoid generic error messages. Instead of "operation failed," return "file not found at /path/to/file—check if the path exists."

## Conclusion

Designing tools for AI agents requires a mindset shift from traditional API design. You're creating interfaces for a non-deterministic consumer that needs to understand intent, not just specification. Invest time in clear descriptions, focused outputs, and thorough testing—the quality of your tools directly impacts the quality of your agent.
