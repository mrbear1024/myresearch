# Equipping Agents for the Real World with Agent Skills

> Source: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
> Published: October 16, 2025

As AI agents take on increasingly complex real-world tasks, they need structured ways to acquire and apply domain-specific knowledge. This led us to create **Agent Skills**: organized folders of instructions, scripts, and resources that agents can discover and load dynamically to perform better at specific tasks.

In this post, we explain what Skills are, show how they work, and share best practices for building your own.

**Update**: Agent Skills has been published as an open standard for cross-platform portability.

## What is a Skill?

At its simplest, a skill is a directory that contains a **SKILL.md** file. This file describes the skill's purpose, provides instructions for the agent, and optionally references additional resources like scripts, templates, and configuration files.

Skills are triggered in the context window via your system prompt. When an agent encounters a task that matches a skill's description, it loads that skill's instructions and resources into its working context.

```
my-skill/
├── SKILL.md          # Core instructions and metadata
├── scripts/          # Helper scripts
├── templates/        # Output templates
└── resources/        # Reference materials
```

## Progressive disclosure

**Progressive disclosure** is the core design principle that makes Agent Skills flexible and scalable. Like a well-organized manual, skills let Claude load information only as needed.

Rather than stuffing all possible instructions into a single prompt, progressive disclosure allows agents to:
1. Discover available skills based on the task at hand
2. Load only the relevant skill's instructions
3. Dive deeper into sub-resources as needed

This approach keeps the context window efficient while providing access to deep domain knowledge.

## Building effective Skills

### Start with evaluation

Before building a skill, define how you'll measure its effectiveness. Create test cases that represent the tasks the skill should handle, and establish baseline performance without the skill.

### Structure for scale

When the SKILL.md file becomes unwieldy, split content into separate files and reference them. If certain contexts are mutually exclusive or rarely used together, keeping paths separate reduces token usage.

### Think from Claude's perspective

Write instructions as if you're onboarding a new team member. Make implicit knowledge explicit. Include:
- The "why" behind decisions, not just the "what"
- Common pitfalls and how to avoid them
- Decision trees for ambiguous situations
- Examples of good and bad outputs

### Use scripts for deterministic tasks

For tasks that require exact execution (like running specific commands, parsing structured data, or applying formatting rules), include scripts rather than relying on the agent to figure out the steps each time.

## Skill composition

Instead of building fragmented, custom-designed agents for each use case, anyone can now specialize their agents with composable capabilities by capturing and sharing their procedural knowledge. Skills can reference other skills, creating composable layers of capability.

## Best practices

1. **Keep SKILL.md focused**: One skill should address one domain or workflow
2. **Version your skills**: Track changes as you iterate
3. **Test with real tasks**: Don't just test happy paths—include edge cases
4. **Document assumptions**: Make context explicit for the agent
5. **Use progressive disclosure**: Don't load everything upfront—let the agent drill down as needed

## Conclusion

Agent Skills represent a shift from monolithic prompts to modular, composable capabilities. By organizing domain knowledge into discoverable, loadable units, we enable agents to tackle a much wider range of real-world tasks effectively. Skills are now an open standard—we encourage the community to build, share, and iterate on skills together.
