# 12. 参考资料与延伸阅读

## 12.1 Anthropic 官方资源

### 核心研究与博客

| 标题 | 类型 | 链接 |
|------|------|------|
| Building Effective Agents | 研究论文 | [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents) |
| Building agents with the Claude Agent SDK | 工程博客 | [anthropic.com/engineering/building-agents-with-the-claude-agent-sdk](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) |
| Writing effective tools for AI agents | 工程博客 | [anthropic.com/engineering/writing-tools-for-agents](https://www.anthropic.com/engineering/writing-tools-for-agents) |
| Effective context engineering for AI agents | 工程博客 | [anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) |
| Demystifying evals for AI agents | 工程博客 | [anthropic.com/engineering/demystifying-evals-for-ai-agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) |
| Effective harnesses for long-running agents | 工程博客 | [anthropic.com/engineering/effective-harnesses-for-long-running-agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) |
| Code execution with MCP | 工程博客 | [anthropic.com/engineering/code-execution-with-mcp](https://www.anthropic.com/engineering/code-execution-with-mcp) |
| How We Built Our Multi-Agent Research System | 工程博客 | [anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system) |
| Introducing Advanced Tool Use | 工程博客 | [anthropic.com/engineering/advanced-tool-use](https://www.anthropic.com/engineering/advanced-tool-use) |
| Introducing the Model Context Protocol | 公告 | [anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol) |
| Our Framework for Developing Safe and Trustworthy Agents | 公告 | [anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents) |

### 官方文档

| 资源 | 链接 |
|------|------|
| Claude Agent SDK 概述 | [platform.claude.com/docs/en/agent-sdk/overview](https://platform.claude.com/docs/en/agent-sdk/overview) |
| Agent SDK 快速开始 | [platform.claude.com/docs/en/agent-sdk/quickstart](https://platform.claude.com/docs/en/agent-sdk/quickstart) |
| 子智能体文档 | [platform.claude.com/docs/en/agent-sdk/subagents](https://platform.claude.com/docs/en/agent-sdk/subagents) |
| 安全部署指南 | [platform.claude.com/docs/en/agent-sdk/secure-deployment](https://platform.claude.com/docs/en/agent-sdk/secure-deployment) |
| 自定义工具文档 | [platform.claude.com/docs/en/agent-sdk/custom-tools](https://platform.claude.com/docs/en/agent-sdk/custom-tools) |
| Tool Use 实现指南 | [platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use) |
| TypeScript SDK 参考 | [platform.claude.com/docs/en/agent-sdk/sdk-typescript](https://platform.claude.com/docs/en/agent-sdk/sdk-typescript) |
| Python SDK 参考 | [platform.claude.com/docs/en/agent-sdk/python](https://platform.claude.com/docs/en/agent-sdk/python) |

### 代码仓库与示例

| 仓库 | 说明 |
|------|------|
| [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook) | 官方 Cookbook，包含智能体模式实现 |
| [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | Claude 实用示例和笔记本 |
| [anthropics/claude-agent-sdk-demos](https://github.com/anthropics/claude-agent-sdk-demos) | Agent SDK 生产示例 |
| [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) | Python Agent SDK |
| [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk) | TypeScript Agent SDK (npm) |

## 12.2 关键人物

### Erik Schluntz

- **职位**：Anthropic, Member of Technical Staff
- **贡献**："Building Effective Agents" 论文合著者；Claude Code 早期开发者；SWE-Bench SOTA 实现
- **核心观点**：最好的智能体系统往往是最简单的；模型能力比框架复杂度更重要
- **X**: [@ErikSchluntz](https://x.com/ErikSchluntz)

### Barry Zhang

- **职位**：Anthropic, Research Engineer
- **贡献**："Building Effective Agents" 论文合著者；六大设计模式提出者
- **核心观点**：
  - "Don't build agents for everything."
  - "Any complexity up front is really going to kill iteration speed."
  - "Think like the agents."
- **三要素**：工具 + 系统提示 + 思维过程

### Amanda Askell

- **职位**：Anthropic, Head of Personality Alignment
- **贡献**：上下文工程 (Context Engineering) 先驱；Claude 系统提示设计者
- **核心观点**：
  - 提示工程本质上是清晰的沟通
  - 上下文工程比传统提示工程提升 54%
  - 智能体场景应避免僵硬的 few-shot 示例
- **X**: [@AmandaAskell](https://x.com/AmandaAskell)

### Alex Albert

- **职位**：Anthropic, Developer Relations
- **贡献**：Claude Agent SDK 推广；多智能体系统研究
- **核心观点**：
  - 多智能体系统比单智能体提升 90%+
  - "Claude Code is the everything agent"
  - MCP 可在 5 分钟内为 Claude 连接搜索引擎
- **X**: [@alexalbert__](https://x.com/alexalbert__)

## 12.3 核心概念速查

| 概念 | 英文 | 章节 |
|------|------|------|
| 思维链 | Chain-of-Thought (CoT) | [第 2 章](./02-theory.md) |
| ReAct 模式 | Reasoning + Acting | [第 2 章](./02-theory.md) |
| 上下文工程 | Context Engineering | [第 2 章](./02-theory.md) |
| 提示链 | Prompt Chaining | [第 3 章](./03-design-patterns.md) |
| 路由 | Routing | [第 3 章](./03-design-patterns.md) |
| 并行化 | Parallelization | [第 3 章](./03-design-patterns.md) |
| 协调者-执行者 | Orchestrator-Workers | [第 3 章](./03-design-patterns.md) |
| 评估者-优化者 | Evaluator-Optimizer | [第 3 章](./03-design-patterns.md) |
| 模型上下文协议 | Model Context Protocol (MCP) | [第 6 章](./06-mcp-protocol.md) |
| 多智能体系统 | Multi-Agent Systems | [第 7 章](./07-multi-agent-systems.md) |
| 评估驱动开发 | Eval-Driven Development | [第 8 章](./08-evaluation.md) |
| 提示注入 | Prompt Injection | [第 9 章](./09-security.md) |

## 12.4 本仓库相关内容

| 资源 | 链接 | 关联 |
|------|------|------|
| AI 编程课程 — AI 智能体项目 | [week-01/07-project-ai-agent.md](../ai-programming-course/week-01/07-project-ai-agent.md) | 实战：构建一个 AI 智能体 |
| AI 编程课程 — AI 时代工程 | [week-03/09-ai-era-engineering.md](../ai-programming-course/week-03/09-ai-era-engineering.md) | 上下文工程、AI 友好代码 |
| AI 安全与防范 — 防护最佳实践 | [05-defense-best-practices.md](../ai-security-prevention/05-defense-best-practices.md) | 安全防护的深入探讨 |
| TUI Agent 项目 | [tui-agent/README.md](../tui-agent/README.md) | 智能体架构的完整实现参考 |
