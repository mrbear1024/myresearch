# 3. 六大核心设计模式

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
