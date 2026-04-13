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

---

## 目录

- [1. 基础概念与设计哲学](#1-基础概念与设计哲学)
- [2. 理论基础](#2-理论基础)
- [3. 六大核心设计模式](#3-六大核心设计模式)
- [4. 工具设计最佳实践](#4-工具设计最佳实践)
- [5. Claude Agent SDK 实战](#5-claude-agent-sdk-实战)
- [6. MCP 协议详解](#6-mcp-协议详解)
- [7. 多智能体系统](#7-多智能体系统)
- [8. 评估体系](#8-评估体系)
- [9. 安全与防护](#9-安全与防护)
- [10. 长时运行智能体架构](#10-长时运行智能体架构)
- [11. 行业趋势与展望 (2025-2026)](#11-行业趋势与展望-2025-2026)
- [12. 参考资料与延伸阅读](#12-参考资料与延伸阅读)

---

## 1. 基础概念与设计哲学

> 学习目标：理解 AI 智能体的核心定义，区分工作流与智能体，掌握"简单优先"的设计哲学。

### 1.1 什么是 AI 智能体（AI Agent）

AI 智能体是一个能够**感知环境、自主推理、采取行动**的系统。与传统聊天机器人不同，智能体具备：

- **工具使用能力**：调用外部 API、读写文件、执行代码
- **自主决策**：根据当前状态动态决定下一步行动
- **多步执行**：在一个循环中持续运行，直到任务完成
- **环境感知**：通过工具获取外部信息并据此调整策略

```
┌─────────────────────────────────────────┐
│              AI 智能体循环               │
│                                         │
│    ┌──────────┐                         │
│    │  感知     │  ← 工具返回结果          │
│    │ Perceive │                         │
│    └────┬─────┘                         │
│         │                               │
│         ▼                               │
│    ┌──────────┐                         │
│    │  推理     │  ← LLM 思考与规划       │
│    │ Reason   │                         │
│    └────┬─────┘                         │
│         │                               │
│         ▼                               │
│    ┌──────────┐                         │
│    │  行动     │  → 调用工具 / 返回结果   │
│    │  Act     │                         │
│    └────┬─────┘                         │
│         │                               │
│         └──── 循环直到任务完成 ───────────┘
│                                         │
└─────────────────────────────────────────┘
```

### 1.2 工作流（Workflow）与智能体（Agent）的区别

Anthropic 在 "Building Effective Agents" 一文中明确区分了两个概念：

| 维度 | 工作流 (Workflow) | 智能体 (Agent) |
|------|-------------------|----------------|
| 控制方式 | 预定义的代码路径编排 LLM | LLM 自主决定流程和工具使用 |
| 确定性 | 高 — 步骤固定 | 低 — 动态决策 |
| 灵活性 | 低 — 难以应对意外情况 | 高 — 可自适应 |
| 可预测性 | 强 — 结果可控 | 弱 — 结果可能出乎意料 |
| 适用场景 | 明确的流水线任务 | 开放式的复杂问题 |
| 调试难度 | 低 | 高 |
| Token 成本 | 低 | 高 |

```
简单                                                    复杂
  │                                                      │
  ▼                                                      ▼
单次提示 → 提示链 → 路由 → 并行化 → 协调者-执行者 → 自主智能体
  │         │       │      │            │              │
  └─── 工作流（Workflow）──────────────┘  └── 智能体（Agent）─┘
```

**关键原则**：优先选择复杂度最低的方案。如果简单的提示链能解决问题，就不要用自主智能体。

### 1.3 设计哲学：简单优先

Anthropic 研究工程师 Barry Zhang 提出了三条核心设计原则：

**原则一：不要为所有事情构建智能体**

> "Don't build agents for everything." — Barry Zhang

智能体增加价值的任务特征：
- 需要**对话与行动相结合**
- 有**明确的成功标准**
- 能**建立反馈循环**
- 需要**有意义的人类监督**

**原则二：保持设计简单**

> "Any complexity up front is really going to kill iteration speed." — Barry Zhang

智能体的三个基本组成部分：
1. **工具 (Tools)**：接口和 API
2. **系统提示 (System Prompt)**：定义目标、约束和理想行为
3. **思维过程 (Thinking)**：启用扩展推理

优先在这三个基本组件上迭代，获得最高投入产出比。

**原则三：像智能体一样思考**

> "Think like the agents." — Barry Zhang

开发者常犯的错误是从人类视角设计智能体。正确的做法是站在智能体的角度思考：
- 智能体看到了什么上下文？
- 当前可用的工具是什么？
- 什么信息会帮助它做出更好的决策？

---

## 2. 理论基础

> 学习目标：掌握支撑智能体设计的四大理论基石 — 思维链、ReAct、强化学习和上下文工程。

### 2.1 思维链（Chain-of-Thought, CoT）

思维链 (Chain-of-Thought) 是让 LLM 在输出最终答案之前，先生成**中间推理步骤**的技术。对于智能体而言，这意味着在调用工具之前先输出推理块。

**核心机制**：

```
传统方式：
  用户输入 → 直接输出工具调用

思维链方式：
  用户输入 → [推理：分析任务需求] → [推理：选择合适工具] → 输出工具调用
```

**在智能体中的应用**：

```typescript
// 系统提示中启用思维链
const systemPrompt = `
你是一个编程助手智能体。

在每次工具调用之前，先用 <thinking> 标签输出你的推理过程：
1. 当前任务的状态是什么？
2. 下一步应该做什么？
3. 哪个工具最适合完成这一步？
4. 需要传递什么参数？

然后再调用工具。
`;
```

**Extended Thinking（扩展思维）**：

Claude 模型支持 Extended Thinking 功能，让模型在回复前进行更深入的思考。对于智能体场景，这能显著提升：
- 工具选择的准确性
- 复杂任务的分解能力
- 错误恢复和重新规划能力

```typescript
// 使用 Anthropic API 启用 Extended Thinking
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 16000,
  thinking: {
    type: "enabled",
    budget_tokens: 10000, // 分配给思考的 token 预算
  },
  messages: [
    { role: "user", content: "分析这段代码的性能瓶颈并给出优化方案" },
  ],
});
```

### 2.2 ReAct 模式（Reasoning + Acting）

ReAct 是将**推理 (Reasoning)** 和**行动 (Acting)** 交替执行的模式。它是目前智能体设计中最广泛使用的范式之一。

**核心循环**：

```
┌────────────────────────────────────────────────────┐
│                   ReAct 循环                        │
│                                                    │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│   │ Thought  │───▶│  Action  │───▶│Observation│    │
│   │ (推理)    │    │ (行动)    │    │ (观察)    │    │
│   └──────────┘    └──────────┘    └─────┬────┘    │
│        ▲                                │         │
│        │                                │         │
│        └────────────────────────────────┘         │
│                                                    │
│   终止条件：任务完成 或 达到最大步数                   │
└────────────────────────────────────────────────────┘
```

**ReAct 与纯 CoT 的对比**：

| 维度 | 纯 CoT | ReAct |
|------|--------|-------|
| 推理 | 一次性完成所有推理 | 交替推理，每步可调整 |
| 行动 | 推理完成后统一行动 | 推理一步，行动一步 |
| 信息获取 | 仅依赖初始上下文 | 可通过工具获取新信息 |
| 错误恢复 | 难以中途修正 | 可根据观察结果调整策略 |
| 适用场景 | 简单推理任务 | 需要与外部交互的复杂任务 |

**实现示例**：

```typescript
// 简化的 ReAct 智能体循环
async function reactAgent(
  query: string,
  tools: Tool[],
  maxSteps: number = 10
) {
  const messages: Message[] = [{ role: "user", content: query }];

  for (let step = 0; step < maxSteps; step++) {
    // 1. 推理 + 行动：LLM 生成思考过程和工具调用
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      system: REACT_SYSTEM_PROMPT,
      messages,
      tools,
      max_tokens: 4096,
    });

    // 2. 检查是否完成（stop_reason 不是 tool_use）
    if (response.stop_reason === "end_turn") {
      return extractFinalAnswer(response);
    }

    // 3. 观察：执行工具调用并获取结果
    const toolResults = await executeToolCalls(response);

    // 4. 将结果加入消息历史，继续循环
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  return "达到最大步数限制，任务未完成";
}
```

### 2.3 强化学习与智能体（Reinforcement Learning for Agents）

在智能体场景中，强化学习 (Reinforcement Learning, RL) 的理念可以通过**持久化的修正机制**来应用，而不需要传统的模型训练。

**Agent RL 框架核心思想**：

```
┌──────────────────────────────────────────┐
│          Agent RL 学习循环                │
│                                          │
│   执行任务 → 获得反馈 → 分析修正           │
│      │                    │              │
│      │                    ▼              │
│      │           ┌──────────────┐        │
│      │           │ 一次性修正？  │        │
│      │           └───┬──────┬───┘        │
│      │            是 │      │ 否         │
│      │               ▼      ▼            │
│      │           忽略    保存到           │
│      │                  corrections.md   │
│      │                       │           │
│      └───── 下次执行时加载 ◀──┘           │
└──────────────────────────────────────────┘
```

**关键实现方式**：

1. **修正变为永久规则**：每次修正都评估是否为通用模式
2. **持久化记忆文件**：`corrections.md` 保存所有可泛化的规则
3. **反馈捕获**：每次技能执行后收集用户反馈
4. **分类存储**：区分一次性修正和可泛化模式

**感知-推理-行动轨迹用于微调**：

智能体的每次执行都会产生完整的行为轨迹：
```
轨迹 = [(感知₁, 推理₁, 行动₁), (感知₂, 推理₂, 行动₂), ...]
```

这些轨迹可以用于：
- **行为克隆**：从成功轨迹中学习
- **偏好优化**：对比成功与失败轨迹
- **策略改进**：基于奖励信号优化行动选择

### 2.4 上下文工程（Context Engineering）

上下文工程 (Context Engineering) 是 Anthropic 提出的新范式，比传统的提示工程 (Prompt Engineering) 更全面。Amanda Askell 指出：提示工程本质上是**清晰的沟通**。

**定义**：在 LLM 推理的整个生命周期中，策划和维护**最优的 token 配置**，包括系统指令、工具定义、MCP 资源、外部数据和消息历史。

**性能对比**：上下文工程比传统提示工程在智能体场景下**提升约 54%** 的性能。

**四大核心策略**：

| 策略 | 描述 | 应用场景 |
|------|------|---------|
| 迭代策划 (Iterative Curation) | 每轮对话精炼数据，最大化信号 | 多轮对话中逐步精简上下文 |
| 压缩 (Compaction) | 总结对话历史以保留上下文 | 长对话接近 token 限制时 |
| 结构化笔记 (Structured Notes) | 外部存储重要信息 | 跨会话保持状态 |
| 子智能体 (Sub-agents) | 专门化任务生成精简输出 | 复杂任务分解 |

**提示工程 vs 上下文工程**：

| 维度 | 提示工程 | 上下文工程 |
|------|---------|-----------|
| 关注点 | 单次提示的措辞 | 整个上下文窗口的优化 |
| 范围 | 系统提示 + 用户消息 | 系统提示 + 工具 + MCP + 历史 + 外部数据 |
| 时间维度 | 静态 | 动态，随对话演进 |
| 优化目标 | 单次回复质量 | 多步执行的整体表现 |
| 技术手段 | 措辞、格式、示例 | 策划、压缩、结构化、委派 |

**系统提示编写指南**：

```
✅ 好的做法：
- 使用极其清晰、直接的语言
- 给出具体的行为指引而非抽象原则
- 描述启发式规则而非死板步骤
- 为智能体场景设计灵活的指引

❌ 避免的做法：
- 使用僵硬的 few-shot 示例（在自主循环中容易适得其反）
- 过于详细的步骤说明（限制了智能体的灵活性）
- 模糊的指令（如"做得好一点"）
- 过长的系统提示（挤占工具和历史的空间）
```

---

## 3. 六大核心设计模式

> 学习目标：掌握 Anthropic 提出的六大可组合智能体设计模式，理解各模式的适用场景与实现方法。
>
> 来源：Erik Schluntz & Barry Zhang, "Building Effective Agents"

```
六大模式概览：

┌──────────┐  ┌──────────┐  ┌──────────┐
│ 提示链    │  │  路由     │  │  并行化   │
│ Prompt   │  │ Routing  │  │ Parallel │
│ Chaining │  │          │  │ ization  │
└──────────┘  └──────────┘  └──────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐
│ 协调者    │  │ 评估者    │  │  ReAct   │
│ Orchest- │  │ Evaluat- │  │ 智能体    │
│ rator    │  │ or-Opt   │  │          │
└──────────┘  └──────────┘  └──────────┘
```

### 3.1 提示链（Prompt Chaining）

将一个复杂任务分解为**顺序执行**的多个 LLM 调用，每步处理前一步的输出。

**适用场景**：
- 任务可以清晰分解为固定的子步骤
- 愿意用延迟换取更高的准确性
- 每一步需要不同的提示策略

```
┌─────┐    ┌─────┐    ┌─────┐    ┌──────┐
│ LLM │───▶│ LLM │───▶│ LLM │───▶│ 最终  │
│ 步骤1│    │ 步骤2│    │ 步骤3│    │ 输出  │
└─────┘    └─────┘    └─────┘    └──────┘
              │
              ▼
          ┌──────┐
          │ 质量  │  ← 可选：中间步骤设置检查点
          │ 检查  │
          └──────┘
```

**代码示例**：

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// 提示链示例：先生成大纲，再填充内容
async function promptChaining(topic: string) {
  // 步骤 1：生成大纲
  const outlineResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      { role: "user", content: `为"${topic}"生成详细大纲，包含 3-5 个要点。` },
    ],
  });
  const outline = outlineResponse.content[0].type === "text"
    ? outlineResponse.content[0].text : "";

  // 步骤 2：基于大纲生成完整内容
  const contentResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      { role: "user", content: `基于以下大纲撰写完整文章：\n\n${outline}` },
    ],
  });

  return contentResponse.content[0];
}
```

### 3.2 路由（Routing）

对输入进行分类，将其导向**专门的处理路径**。每条路径可以有不同的提示、工具或模型。

**适用场景**：
- 输入可以明确分类为不同类别
- 不同类别需要不同的处理策略
- 单一提示难以兼顾所有场景

```
                    ┌──────────────┐
                    │   分类器      │
                    │  Classifier  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ 路径 A   │ │ 路径 B   │ │ 路径 C   │
        │ 代码问题  │ │ 数据分析  │ │ 文档写作  │
        └──────────┘ └──────────┘ └──────────┘
```

**代码示例**：

```typescript
// 路由模式：根据用户意图分发到不同处理器
async function routingAgent(userInput: string) {
  // 步骤 1：用轻量模型分类
  const classification = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `将以下请求分类为：code_help | data_analysis | writing | general
只输出类别名。\n\n请求：${userInput}`,
    }],
  });

  const category = extractText(classification).trim();

  // 步骤 2：路由到专门处理器
  const handlers: Record<string, string> = {
    code_help: "你是资深编程专家。帮助用户解决代码问题。",
    data_analysis: "你是数据分析师。帮助用户分析和可视化数据。",
    writing: "你是专业写作助手。帮助用户撰写高质量内容。",
    general: "你是通用助手。回答用户的问题。",
  };

  return client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: handlers[category] || handlers.general,
    messages: [{ role: "user", content: userInput }],
  });
}
```

### 3.3 并行化（Parallelization）

同时运行多个 LLM 调用并汇总结果。两种子模式：

**分段 (Sectioning)** — 将任务拆分为独立子任务并行处理：

```
              ┌──────────┐
              │  输入     │
              └────┬─────┘
         ┌────────┼────────┐
         ▼        ▼        ▼
    ┌────────┐┌────────┐┌────────┐
    │ LLM A  ││ LLM B  ││ LLM C  │   ← 同时执行
    │ 子任务1 ││ 子任务2 ││ 子任务3 │
    └───┬────┘└───┬────┘└───┬────┘
        └─────────┼─────────┘
              ┌───┴───┐
              │  汇总  │
              └───────┘
```

**投票 (Voting)** — 同一任务多次执行，取多数结果：

```
              ┌──────────┐
              │ 同一输入  │
              └────┬─────┘
         ┌────────┼────────┐
         ▼        ▼        ▼
    ┌────────┐┌────────┐┌────────┐
    │ 执行 1  ││ 执行 2  ││ 执行 3  │
    └───┬────┘└───┬────┘└───┬────┘
        └─────────┼─────────┘
           ┌──────┴──────┐
           │  多数投票     │
           └─────────────┘
```

**代码示例**：

```typescript
// 并行化 — 分段模式：多维度代码审查
async function parallelCodeReview(code: string) {
  const [security, performance, style] = await Promise.all([
    client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: "你是安全审计专家。分析代码中的安全漏洞。",
      messages: [{ role: "user", content: code }],
    }),
    client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: "你是性能优化专家。分析代码中的性能瓶颈。",
      messages: [{ role: "user", content: code }],
    }),
    client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: "你是代码质量专家。分析代码风格和可维护性。",
      messages: [{ role: "user", content: code }],
    }),
  ]);

  return { security, performance, style };
}
```

### 3.4 协调者-执行者（Orchestrator-Workers）

由中央 LLM（协调者）**动态分解**任务，将子任务分配给执行者。与并行化的区别：子任务不是预定义的，而是由协调者根据输入动态决定。

```
                 ┌─────────────┐
                 │   协调者      │
                 │ Orchestrator │
                 └──────┬──────┘
                        │
              动态分解任务为子任务
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ 执行者 A  │   │ 执行者 B  │   │ 执行者 C  │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        └───────────────┼──────────────┘
                        ▼
                 ┌─────────────┐
                 │  协调者汇总   │
                 └─────────────┘
```

**适用场景**：
- 无法预先确定子任务的数量和类型
- 需要根据中间结果调整策略
- 复杂且动态的任务

**代码示例**：

```typescript
// 协调者-执行者模式
async function orchestratorWorker(task: string) {
  // 协调者分解任务
  const plan = await client.messages.create({
    model: "claude-opus-4-6", // 协调者用最强模型
    max_tokens: 2048,
    system: `你是任务协调者。将任务分解为子任务。
输出 JSON：{ "subtasks": [{"id": 1, "description": "..."}, ...] }`,
    messages: [{ role: "user", content: task }],
  });

  const subtasks = JSON.parse(extractText(plan)).subtasks;

  // 执行者并行处理
  const results = await Promise.all(
    subtasks.map((st: { id: number; description: string }) =>
      client.messages.create({
        model: "claude-sonnet-4-6", // 执行者用高性价比模型
        max_tokens: 2048,
        messages: [{ role: "user", content: st.description }],
      })
    )
  );

  // 协调者汇总
  return client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: "将所有子任务结果整合为连贯的最终输出。",
    messages: [{
      role: "user",
      content: results.map((r, i) =>
        `子任务 ${i + 1}：\n${extractText(r)}`
      ).join("\n\n"),
    }],
  });
}
```

### 3.5 评估者-优化者（Evaluator-Optimizer）

一个 LLM 生成输出，另一个 LLM 评估并提供反馈，形成**迭代优化循环**。

```
   ┌──────────┐         ┌──────────┐
   │ 生成者    │────────▶│ 评估者    │
   │Generator │         │Evaluator │
   └─────▲────┘         └────┬─────┘
         │    反馈 / 改进建议  │
         └───────────────────┘

   终止条件：评估通过 或 达到最大迭代次数
```

**适用场景**：
- 有明确的评估标准（如代码能否通过测试）
- 迭代改进的收益大于成本
- 任务需要高质量输出

**代码示例**：

```typescript
// 评估者-优化者模式
async function evaluatorOptimizer(task: string, maxIter = 3) {
  let output = extractText(await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: task }],
  }));

  for (let i = 0; i < maxIter; i++) {
    // 评估
    const feedback = extractText(await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `评估输出质量。满意则回复"PASS"，否则列出改进建议。`,
      messages: [{
        role: "user",
        content: `任务：${task}\n\n输出：\n${output}`,
      }],
    }));

    if (feedback.includes("PASS")) break;

    // 优化
    output = extractText(await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `基于反馈改进：\n反馈：${feedback}\n当前：${output}`,
      }],
    }));
  }

  return output;
}
```

### 3.6 ReAct 智能体模式

最完整的模式 — LLM 在**自主循环**中交替推理和行动，动态使用工具。

```
   用户输入 ──▶ LLM 推理 + 选择工具
                     │
            ┌────────┴────────┐
         end_turn          tool_use
            │                 │
         返回结果        执行工具获取结果
                              │
                       结果加入消息历史
                              │
                       回到 LLM 推理 ◀──┘
```

**ReAct 是其他模式的超集**：配备工具的自主智能体可以在内部按需执行提示链、路由等模式。

**适用场景**：
- 需要灵活应对不可预见的情况
- 任务需要多步工具交互
- 问题空间开放、无法预先规划所有步骤

---

## 4. 工具设计最佳实践

> 学习目标：掌握智能体工具的设计原则，包括命名规范、Schema 定义、按需发现和作用域管理。
>
> 来源：Anthropic Engineering Blog, "Writing effective tools for AI agents"

工具是智能体与外部世界交互的桥梁。工具定义在上下文中非常显眼，是智能体首要考虑的行动选项。因此工具设计直接影响智能体的行为质量。

### 4.1 工具命名与组织

**规则一：使用服务名作为前缀**

```
✅ 好的命名：
  github_list_prs       — 清晰表明是 GitHub 的 PR 列表
  slack_send_message    — 清晰表明是 Slack 发送消息
  db_query_users        — 清晰表明是数据库查询用户

❌ 差的命名：
  list                  — 列出什么？
  send                  — 发送到哪里？
  query                 — 查询什么？
```

**规则二：功能拆分，而非万能工具**

```
✅ 好的拆分：
  fetchInbox()          — 获取收件箱
  searchEmails()        — 搜索邮件
  getEmailById()        — 按 ID 获取邮件

❌ 差的设计：
  emailTool()           — 一个工具做所有事情
```

**规则三：动词 + 名词的清晰组合**

| 模式 | 示例 |
|------|------|
| `get_*` | `get_user_profile`, `get_file_contents` |
| `list_*` | `list_pull_requests`, `list_branches` |
| `create_*` | `create_issue`, `create_branch` |
| `update_*` | `update_pull_request`, `update_config` |
| `delete_*` | `delete_file`, `delete_branch` |
| `search_*` | `search_code`, `search_issues` |

### 4.2 工具定义与 JSON Schema

好的工具定义应包含**清晰的描述**和**严格的参数 Schema**：

```typescript
// 一个规范的工具定义示例
const tools = [
  {
    name: "github_search_code",
    description: `在 GitHub 仓库中搜索代码。
使用场景：当需要查找特定函数、变量或代码模式时使用。
注意：搜索范围限于当前仓库，支持正则表达式。`,
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "搜索关键词或正则表达式",
        },
        file_extension: {
          type: "string",
          description: "限定文件扩展名，如 'ts', 'py'（可选）",
        },
        max_results: {
          type: "number",
          description: "返回的最大结果数量，默认 10",
          default: 10,
        },
      },
      required: ["query"],
    },
  },
];
```

**工具描述编写要点**：
- 说明**何时使用**这个工具
- 说明**参数的含义**和有效值
- 说明**返回值的格式**
- 列出**常见用法示例**

### 4.3 工具搜索与按需发现（Tool Search）

当智能体可用工具超过数十个时，一次性加载所有工具定义会消耗大量 token（50,000+ token 仅用于工具定义）。

**解决方案：Tool Search Tool**

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ 智能体    │────▶│ tool_search  │────▶│ 返回匹配的    │
│ 需要工具  │     │ (元工具)      │     │ 工具定义      │
└──────────┘     └──────────────┘     └──────────────┘
```

智能体只需持有一个 `tool_search` 工具，通过它按需发现和加载所需工具：

```typescript
// 元工具：搜索可用工具
const toolSearchTool = {
  name: "tool_search",
  description: "搜索可用工具。输入关键词，返回匹配的工具名称和描述。",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "搜索关键词，如 'github pull request'",
      },
    },
    required: ["query"],
  },
};
```

### 4.4 工具作用域与上下文效率

**核心原则：最大化上下文效率**

- 每个工具定义消耗上下文空间
- 只暴露当前任务需要的工具
- 不同子智能体配备不同的工具集

```
┌──────────────────────────────────────────────┐
│              工具作用域策略                     │
│                                              │
│   研究智能体：read, search, web_fetch         │
│   实现智能体：read, write, edit, bash         │
│   审查智能体：read, search, comment           │
│   部署智能体：bash, deploy, monitor           │
└──────────────────────────────────────────────┘
```

**每个智能体只配备它需要的工具**，这既节省 token，也减少了智能体的选择困难。

---

## 5. Claude Agent SDK 实战

> 学习目标：掌握 Claude Agent SDK 的核心功能，包括内置工具、Hooks 系统、子智能体和权限控制。
>
> 来源：Anthropic Official Documentation & Engineering Blog

### 5.1 SDK 概述

Claude Agent SDK（原 Claude Code SDK）是 Anthropic 官方提供的智能体开发框架。Alex Albert 指出将其从 "Claude Code SDK" 更名为 "Claude Agent SDK" 是因为它不仅仅适用于编码场景，而是构建**任何通用智能体**的最佳方式。

**支持语言**：
- TypeScript: `@anthropic-ai/claude-agent-sdk` (npm)
- Python: `claude-agent-sdk-python` (GitHub)

**核心特性**：
- 内置工具集
- 生命周期 Hooks
- 子智能体编排
- MCP 服务器集成
- 权限控制系统
- 会话管理

### 5.2 内置工具（Built-in Tools）

| 工具 | 功能 | 适用场景 |
|------|------|---------|
| `Read` | 读取文件内容 | 理解代码、查看配置 |
| `Write` | 写入新文件 | 创建新文件、完整重写 |
| `Edit` | 编辑现有文件 | 修改代码、修复 bug |
| `Bash` | 执行 shell 命令 | 运行测试、安装依赖、系统操作 |
| `Glob` | 文件模式匹配 | 查找文件（替代 `find`） |
| `Grep` | 内容搜索 | 搜索代码（替代 `grep/rg`） |
| `WebSearch` | 网络搜索 | 查找文档、最新信息 |
| `WebFetch` | 获取网页内容 | 读取网页、API 文档 |

**工具选择原则**：

```
优先使用专用工具，而非通用 Bash 命令：
  Read     > cat, head, tail
  Edit     > sed, awk
  Write    > echo >, cat <<EOF
  Glob     > find, ls
  Grep     > grep, rg
```

### 5.3 Hooks 系统

Hooks 允许在智能体生命周期的关键节点执行自定义逻辑：

```
┌─────────────┐
│ SessionStart │ ← 会话开始时执行
└──────┬──────┘
       ▼
┌─────────────┐
│PreToolUse   │ ← 工具调用前执行（可阻止调用）
└──────┬──────┘
       ▼
┌─────────────┐
│ 工具执行     │
└──────┬──────┘
       ▼
┌─────────────┐
│PostToolUse  │ ← 工具调用后执行（可修改结果）
└──────┬──────┘
       ▼
┌─────────────┐
│   Stop      │ ← 智能体停止前执行
└──────┬──────┘
       ▼
┌─────────────┐
│ SessionEnd  │ ← 会话结束时执行
└─────────────┘
```

**五种 Hook 类型**：

| Hook | 触发时机 | 常见用途 |
|------|---------|---------|
| `SessionStart` | 会话创建时 | 环境初始化、加载配置 |
| `PreToolUse` | 工具调用前 | 安全验证、参数校验、阻止危险操作 |
| `PostToolUse` | 工具调用后 | 日志记录、结果过滤、审计 |
| `Stop` | 智能体停止前 | 清理资源、保存状态 |
| `SessionEnd` | 会话结束时 | 生成报告、释放资源 |

**配置示例**（settings.json）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 validate_command.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 audit_log.py"
          }
        ]
      }
    ]
  }
}
```

### 5.4 子智能体（Subagents）

子智能体是在独立上下文中运行的专门化智能体，由主智能体调度。

**使用子智能体的好处**：

| 优势 | 说明 |
|------|------|
| 上下文保护 | 探索和实现分开，不污染主对话 |
| 约束执行 | 限制每个子智能体可用的工具 |
| 可复用 | 一次配置，跨项目使用 |
| 专门化 | 每个子智能体有专属系统提示 |
| 成本控制 | 可将任务路由到更快更便宜的模型 |

**设计原则**：

```
✅ 好的子智能体设计：
  - 给每个子智能体一个明确的职责
  - 定义清晰的输入 / 输出格式
  - 限制工具集（研究型只给 read/search，实现型给 edit/write）
  - 使用独立的系统提示

❌ 差的子智能体设计：
  - 一个子智能体做所有事情
  - 输入输出格式模糊
  - 给所有子智能体相同的工具集
```

**性能数据**：Anthropic 研究表明，使用 Claude Opus 作为协调者 + Sonnet 作为执行者的多智能体系统，相比单智能体性能**提升 90.2%**。

### 5.5 MCP 服务器集成

Claude Agent SDK 通过 MCP（Model Context Protocol）连接外部系统：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

### 5.6 权限控制与安全

**核心原则：默认拒绝，显式允许**

```
┌───────────────────────────────────────────┐
│            权限模型                         │
│                                           │
│  默认状态：所有操作需要用户确认               │
│                                           │
│  允许列表：                                 │
│    ✅ Read — 读取文件（只读操作，安全）       │
│    ✅ Glob — 搜索文件名（只读操作，安全）     │
│    ✅ Grep — 搜索内容（只读操作，安全）       │
│                                           │
│  需确认：                                   │
│    ⚠️  Edit — 修改文件                     │
│    ⚠️  Write — 创建新文件                  │
│    ⚠️  Bash — 执行命令                     │
│                                           │
│  拒绝列表：                                 │
│    ❌ rm -rf /                             │
│    ❌ git push --force                     │
│    ❌ 访问 .env / credentials              │
└───────────────────────────────────────────┘
```

> "Permission sprawl is the fastest path to unsafe autonomy."
> — Anthropic Secure Deployment Guide

---

---
