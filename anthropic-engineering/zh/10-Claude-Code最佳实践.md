# Claude Code 最佳实践

> 来源：https://www.anthropic.com/engineering/claude-code-best-practices
> 发布时间：2025年

Claude Code 是一款智能编程工具（agentic coding tool），能够阅读你的代码库、编辑文件、运行命令，并与你的开发工具集成。无论是在终端、IDE、桌面应用还是浏览器中，Claude Code 都能规划实现方案、跨多个文件编写代码，并验证代码是否正常运行。

在这篇文章中，我们将分享充分发挥 Claude Code 价值的最佳实践。

## 项目设置

### CLAUDE.md

**CLAUDE.md** 是一个放置在项目根目录下的 Markdown 文件，Claude Code 在每次会话开始时都会读取它。你可以用它来设定：
- 编码规范和风格指南
- 架构决策和设计模式（patterns）
- 首选的库和框架
- 构建和测试命令
- 代码审查清单

可以把 CLAUDE.md 想象成为 AI 协作者准备的入职文档。你提供的上下文越多，Claude Code 就越能理解你项目的惯例。

CLAUDE.md 文件可以放置在多个层级：
- **仓库根目录**：项目级别的惯例
- **子目录**：模块级别的指南
- **用户主目录**（`~/.claude/CLAUDE.md`）：跨所有项目的个人偏好

### 模型上下文协议（Model Context Protocol, MCP）

模型上下文协议（Model Context Protocol, MCP）是一个用于将 AI 工具连接到外部数据源的开放标准。通过 MCP，Claude Code 可以：
- 从 Confluence 或 Notion 读取设计文档
- 在 Jira 或 Linear 中更新工单
- 从 Slack 对话中获取数据
- 访问数据库和 API

MCP 服务器提供标准化的集成方式，因此你无需为每个服务编写自定义代码。

## 高效工作流

### 修复 Bug

对于 Bug，粘贴错误信息或描述症状——Claude Code 会在你的代码库中追踪问题、定位根本原因并实现修复。

### 编写测试

Claude Code 擅长为未经测试的代码编写测试。将它指向某个文件或模块，它就会生成全面的测试套件（test suites），覆盖正常路径（happy paths）、边界情况（edge cases）和错误条件（error conditions）。

### 代码重构（Code Refactoring）

描述你期望的重构（例如，"将这段逻辑提取为一个共享工具函数"），Claude Code 会处理跨多文件的修改，更新整个代码库中的导入和引用。

### 繁琐任务

Claude Code 能处理诸如修复整个项目中的 lint 错误、解决合并冲突（merge conflicts）、更新依赖项以及编写发布说明等繁琐任务。

## 多智能体协调（Multi-agent Coordination）

你可以同时启动多个 Claude Code 智能体（agents），让它们并行处理一个任务的不同部分。一个主导智能体负责协调工作、分配子任务并合并结果。

这种方式特别适用于：
- 涉及大量文件的大型重构
- 并行的功能开发
- 同时运行不同的测试策略

## 使用 Agent SDK 构建

如果需要完全自定义的工作流，Agent SDK 让你可以利用 Claude Code 的工具和能力构建自己的智能体，完全掌控编排（orchestration）、工具访问和权限管理。

## 自动记忆（Auto-memory）

Claude Code 在工作过程中还会构建自动记忆，将构建命令和调试洞察等学习成果跨会话保存。这意味着随着时间的推移，它在处理你的特定项目时会变得越来越得心应手。

## 获得最佳效果的技巧

1. **具体明确**："修复登录端点中的身份验证 Bug"比"修复那个 Bug"效果更好
2. **提供上下文**：分享错误信息、日志或相关文档
3. **善用 CLAUDE.md**：一次性设好项目惯例，每次会话都能受益
4. **迭代推进**：从一个聚焦的任务开始，审查结果，然后在此基础上继续
5. **信任但要验证**：Claude Code 会编写测试来验证自己的工作——记得审查这些测试
6. **大任务使用多智能体**：将复杂项目拆分为可并行的子任务
