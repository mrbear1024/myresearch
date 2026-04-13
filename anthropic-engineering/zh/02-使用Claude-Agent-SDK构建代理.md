# 使用 Claude Agent SDK 构建代理

> 来源：https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
> 发布日期：2025年9月29日

自从我们分享了[构建高效代理](https://www.anthropic.com/engineering/building-effective-agents)的经验之后，我们发布了 Claude Code——一个最初为支持 Anthropic 内部开发者生产力而构建的智能体编码解决方案。在过去几个月里，Claude Code 已经远远超越了编码工具的范畴。在 Anthropic 内部，我们一直将它用于深度研究、视频创作和笔记记录等各种非编码应用。事实上，它已经开始驱动我们几乎所有的主要代理循环。

驱动 Claude Code 的代理框架（Claude Code SDK）也可以驱动许多其他类型的代理。为了反映这一更广泛的愿景，我们将 Claude Code SDK 更名为 **Claude Agent SDK**。

在这篇文章中，我们将分享为什么构建 Claude Agent SDK、如何用它构建自己的代理，以及我们团队自身部署中的最佳实践。

## 为什么需要 Claude Agent SDK？

Claude Code 背后的关键设计原则是：Claude 需要与程序员日常使用的相同工具。它需要能够在代码库中找到合适的文件、编写和编辑文件、对代码进行 lint 检查、运行代码、调试、编辑，有时还需要迭代执行这些操作直到代码成功。

通过让 Claude 通过终端访问用户的计算机，它获得了像程序员一样编写代码所需的一切。但这也使得 Claude Code 中的 Claude 在非编码任务上同样高效。

我们意识到同样的代理循环可以驱动多种类型的代理。因此我们构建了 Claude Agent SDK：一个独立的包，为你提供对工具、权限、成本限制和输出的编程控制。

## 代理循环（Agent Loop）

代理通常在一个特定的反馈循环中运行：**收集上下文 → 采取行动 → 验证工作 → 重复**。这提供了一种有用的方式来思考代理及其应该具备的能力。

当你启动一个代理时，SDK 运行与 Claude Code 相同的执行循环：Claude 评估你的提示，调用工具采取行动，接收结果，并重复直到任务完成。

Claude Agent SDK 为你提供与 Claude Code 相同的工具、代理循环和上下文管理功能，可在 Python 和 TypeScript 中编程使用。

## 收集上下文

开发代理时，你不仅要给它一个提示（prompt）：它还需要能够获取和更新自己的上下文。

文件系统代表了可以被拉入模型上下文的信息。当 Claude 遇到大文件（如日志或用户上传的文件）时，它会决定使用 `grep` 和 `tail` 等 bash 脚本将这些内容加载到上下文中。本质上，**代理的文件夹和文件结构本身就是一种上下文工程（context engineering）**。

我们建议从智能体搜索（agentic search）开始，只有在需要更快结果或更多变体时才添加语义搜索。

## 使用工具采取行动

**工具是代理执行的主要构建模块。** 工具在 Claude 的上下文窗口中占据显著位置，使其成为 Claude 在决定如何完成任务时首先考虑的操作。这意味着你应该注意如何设计工具以最大化上下文效率。

例如，对于电子邮件代理，你可能会定义 `fetchInbox` 或 `searchEmails` 等工具作为代理的主要、最常用操作。

### MCP 集成

模型上下文协议（Model Context Protocol，MCP）提供了与外部服务的标准化集成，自动处理认证和 API 调用。这意味着你可以将代理连接到 Slack、GitHub、Google Drive 或 Asana 等工具，无需编写自定义集成代码或自行管理 OAuth 流程。

例如，对于电子邮件代理，你可能想搜索 Slack 消息以了解团队上下文，或检查 Asana 任务。通过 MCP 服务器，这些集成开箱即用——你的代理可以简单地调用 `search_slack_messages` 或 `get_asana_tasks` 等工具，MCP 会处理其余部分。

## 验证工作

评估是构建代理的最后一个关键环节。你可以让另一个语言模型基于模糊规则来"评判"代理的输出，但这通常不够健壮，且可能有较大的延迟代价。

## 上下文管理

Claude Agent SDK 的压缩（compact）功能会在接近上下文限制时自动总结之前的消息，基于 Claude Code 的 compact 斜杠命令构建。这使代理能够处理长时间运行的任务而不会耗尽上下文。

### 子代理（Subagents）

Claude Agent SDK 默认支持子代理，这对并行化和上下文管理非常有用。子代理使用自己独立的上下文窗口，只将相关信息发送回协调器。

## 你可以构建的代理类型

- **个人助理代理**：构建可以帮助你预订旅行和管理日历、安排约会、整理简报等的代理。
- **客户支持代理**：构建可以处理高度模糊用户请求（如客服工单）的代理，通过收集和审查用户数据、连接外部 API、回复用户消息以及在需要时上报给人工。
- **深度研究代理**：构建可以跨大型文档集合进行全面研究的代理，通过搜索文件系统、分析和综合多个来源的信息、交叉引用数据并生成详细报告。
- **金融代理**：构建能够理解投资组合并评估投资的代理。

## 开始使用

围绕代理循环——收集上下文、采取行动和验证工作——你可以构建易于部署和迭代的可靠代理。Claude Agent SDK 现已在 Python 和 TypeScript 中提供。

Python：
```bash
pip install claude-agent-sdk
```

TypeScript：
```bash
npm install @anthropic-ai/claude-agent-sdk
```

你可以立即开始使用 [Claude Agent SDK 文档](https://docs.anthropic.com/en/agent-sdk/overview)。
