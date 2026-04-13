# Making Claude Code More Secure and Autonomous

> Source: https://www.anthropic.com/engineering/claude-code-sandboxing
> Published: 2025

Claude Code's new sandboxing features—a bash tool sandbox and Claude Code on the web—reduce permission prompts and increase user safety by enabling two boundaries: filesystem and network isolation. In internal usage, sandboxing safely reduced permission prompts by 84%.

## The problem: permission fatigue

When Claude Code needs to run a command, read a file outside the project, or make a network request, it asks for permission. This is safe but creates friction—especially for long-running tasks where the agent might need dozens of approvals.

Users either spend too much time approving safe operations, or they grant blanket permissions that reduce safety. We needed a middle ground.

## Sandboxing approach

Sandboxing creates pre-defined boundaries within which Claude can work more freely, instead of asking for permission for each action. The key insight is that most operations an agent needs to perform can be safely contained within well-defined boundaries.

We built on top of OS-level primitives:
- **Linux**: bubblewrap for filesystem and process isolation
- **macOS**: seatbelt for sandboxing

These enforce restrictions at the OS level, making them robust against prompt injection and other attacks.

## Two layers of sandboxing

### Filesystem isolation

The sandbox restricts which directories Claude can read from and write to. By default, Claude has full access to the project directory and read-only access to system libraries and tools, but cannot access sensitive directories like `~/.ssh`, `~/.aws`, or other projects.

### Network isolation

Network sandboxing controls which hosts Claude can connect to. For development tasks, you might allow access to `localhost`, your company's API endpoints, and package registries, while blocking everything else.

## The sandbox runtime

A new sandbox runtime, available in beta as a research preview, lets you define exactly which directories and network hosts your agent can access, without the overhead of spinning up and managing a container.

Configuration example:
```json
{
  "filesystem": {
    "read": ["/project", "/usr/lib"],
    "write": ["/project"]
  },
  "network": {
    "allow": ["localhost", "registry.npmjs.org"]
  }
}
```

## Claude Code on the web

Claude Code on the web takes sandboxing further by running each session in its own isolated environment. This provides:
- Complete filesystem isolation per session
- Network controls
- No access to the user's local machine
- Real-time progress tracking

## Results

In internal usage:
- Permission prompts reduced by **84%**
- No security incidents from sandboxed sessions
- Users reported significantly improved flow and productivity

## Implications

Sandboxing represents a fundamental shift in how we think about agent permissions: from per-action approval to boundary-based containment. By defining safe boundaries upfront, we can give agents more autonomy while maintaining strong security guarantees.

This approach scales well—as agents take on more complex tasks, sandboxing ensures they can work freely within their designated space without requiring constant human approval.
