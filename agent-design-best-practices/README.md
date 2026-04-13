# AI Agent 设计与开发最佳实践

> 系统掌握 AI 智能体的设计理论、架构模式、开发工具与工程实践，
> 基于 Anthropic 官方研究与行业前沿经验整理。

## 适合谁

- 希望系统学习 AI 智能体设计理论的开发者
- 正在构建基于大语言模型（LLM）的智能体应用的工程师
- 对 Claude Agent SDK、MCP 协议等前沿框架感兴趣的技术人员
- 希望了解智能体安全、评估与生产部署的架构师

## 内容概览

```
基础概念          理论基础            核心模式              工具设计
──────────        ──────────          ──────────            ──────────
智能体定义         思维链 (CoT)        提示链                命名规范
工作流 vs 智能体   ReAct 模式          路由                  JSON Schema
设计哲学           强化学习            并行化                工具搜索
                  上下文工程           协调者-执行者          作用域管理
                                     评估者-优化者
                                     ReAct 智能体

SDK 实战           MCP 协议           多智能体系统           评估体系
──────────        ──────────          ──────────            ──────────
内置工具           协议架构            架构模式              评估优先
Hooks 系统         三大原语            子智能体设计           评估方法论
子智能体           SDK 实现            Token 成本            持续迭代
权限控制           应用场景            扩展策略

安全防护           长时运行            行业趋势              参考资料
──────────        ──────────          ──────────            ──────────
IAM 模式           双智能体模式        单体到多智能体         官方文章
沙箱隔离           进度追踪            技能生态              关键人物
注入防护           会话管理            反馈循环              延伸阅读
```

## 目录

1. [基础概念与设计哲学](./01-fundamentals.md) — 智能体定义、工作流 vs 智能体、简单优先设计哲学
2. [理论基础](./02-theory.md) — 思维链、ReAct、强化学习、上下文工程
3. [六大核心设计模式](./03-design-patterns.md) — 提示链、路由、并行化、协调者-执行者、评估者-优化者、ReAct
4. [工具设计最佳实践](./04-tool-design.md) — 命名规范、JSON Schema、工具搜索、作用域管理
5. [Claude Agent SDK 实战](./05-claude-agent-sdk.md) — 内置工具、Hooks、子智能体、MCP 集成、权限控制
6. [MCP 协议详解](./06-mcp-protocol.md) — 协议架构、三大原语、SDK 实现、应用场景
7. [多智能体系统](./07-multi-agent-systems.md) — 架构模式、子智能体设计、Token 成本与扩展策略
8. [评估体系](./08-evaluation.md) — 评估优先原则、评估方法论、持续迭代
9. [安全与防护](./09-security.md) — IAM 模式、沙箱隔离、注入防护、生产安全清单
10. [长时运行智能体架构](./10-long-running-agents.md) — 双智能体模式、进度追踪、会话管理
11. [行业趋势与展望 (2025-2026)](./11-trends.md) — 单体到多智能体、技能生态、反馈循环
12. [参考资料与延伸阅读](./12-references.md) — 官方文章、关键人物、延伸阅读

## 信息来源

- **Anthropic 官方研究**: "Building Effective Agents" (Erik Schluntz & Barry Zhang)
- **Anthropic 工程博客**: Context Engineering、Tool Design、Evals、Multi-Agent Systems 等系列文章
- **Claude Agent SDK 文档**: 官方 SDK 文档与最佳实践
- **MCP 协议规范**: Model Context Protocol 官方规范
- **开发者社区**: Anthropic 团队成员（Barry Zhang、Amanda Askell、Alex Albert、Erik Schluntz）在 X 上分享的实战经验
