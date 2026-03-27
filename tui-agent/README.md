# TUI Agent

基于 [pi-mono](https://github.com/badlogic/pi-mono) 架构构建的终端 AI 编程智能体，实现了类似 Claude Code 的核心功能。

## 功能特性

- **多模型支持** — 通过 `@mariozechner/pi-ai` 统一接入 Anthropic Claude、OpenAI、Google Gemini、Mistral 等主流 LLM 提供商
- **7 个编码工具** — read、write、edit、bash、grep、find、ls，覆盖日常编程操作
- **实时流式输出** — 打字机效果逐字显示 AI 回复
- **工具调用可视化** — 实时展示工具名称、参数、执行结果
- **交互式 TUI 模式** — 多轮对话、上下文保持、Ctrl+C 中断
- **单次执行模式** — 通过 `--prompt` 参数执行单个任务后退出
- **项目上下文感知** — 自动读取 CLAUDE.md 文件，注入 Git 分支等环境信息

## 快速开始

```bash
# 安装依赖
cd tui-agent && npm install

# 配置 API Key（至少设置一个）
export ANTHROPIC_API_KEY=sk-ant-...
# 或
export OPENAI_API_KEY=sk-...

# 交互模式
npm run dev

# 单次执行
npm run dev -- "列出当前目录所有 TypeScript 文件"

# 指定模型
npm run dev -- -m openai:gpt-4o
```

## CLI 参数

```
tui-agent [options] [prompt]

选项:
  -m, --model <model>    指定模型 (默认: anthropic:claude-sonnet-4-20250514)
  -d, --cwd <dir>        工作目录 (默认: 当前目录)
  -p, --prompt <text>    单次执行模式
  -h, --help             帮助信息
  -v, --version          版本号

交互模式命令:
  /help                  显示帮助
  /clear                 清除对话历史
  /exit                  退出
```

---

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI Entry (index.ts)                     │
│                    参数解析 → 模式选择 → 启动                      │
├────────────────────────┬────────────────────────────────────────┤
│    Interactive Mode    │           Print Mode                   │
│      (TuiApp)          │     (runPrintMode)                     │
├────────────────────────┴────────────────────────────────────────┤
│                     AgentSession (agent-session.ts)              │
│              统一管理 Agent 实例 + 模型 + 工具 + 系统提示            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│   │  pi-agent-core│   │    pi-ai     │   │     pi-tui       │   │
│   │  Agent 运行时  │   │ 多模型统一API │   │  终端 UI 组件库   │   │
│   │              │   │              │   │                  │   │
│   │ • Agent Loop │   │ • Anthropic  │   │ • Markdown       │   │
│   │ • Tool Exec  │   │ • OpenAI     │   │ • Editor         │   │
│   │ • State Mgmt │   │ • Google     │   │ • Box/Text       │   │
│   │ • Events     │   │ • Mistral    │   │ • SelectList     │   │
│   │ • Streaming  │   │ • Bedrock    │   │ • Terminal       │   │
│   └──────┬───────┘   └──────┬───────┘   └──────────────────┘   │
│          │                  │                                   │
│   ┌──────┴──────────────────┴───────┐                           │
│   │         7 个编码工具             │                           │
│   │  read │ write │ edit │ bash     │                           │
│   │  grep │ find  │ ls             │                           │
│   └────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### 核心依赖（来自 pi-mono）

本项目直接使用 pi-mono 发布的三个核心 npm 包，而非从零构建：

| 包名 | 版本 | 职责 |
|------|------|------|
| `@mariozechner/pi-ai` | ^0.62.0 | 统一多提供商 LLM API，支持 Anthropic、OpenAI、Google、Mistral、Bedrock、Azure 等 |
| `@mariozechner/pi-agent-core` | ^0.62.0 | Agent 运行时核心：Agent 类、Agent Loop、工具执行、状态管理、事件系统 |
| `@mariozechner/pi-tui` | ^0.62.0 | 终端 UI 库：差分渲染、Markdown 组件、编辑器、键盘管理 |

**选择直接使用而非重写的原因：** 这三个包经过 3000+ commits 的迭代，提供了成熟的流式处理、工具执行引擎和终端渲染。我们专注于构建上层应用逻辑（工具实现、会话管理、TUI 交互），而非重复造轮子。

---

## 实现思路

### 1. 项目结构

```
tui-agent/
├── package.json                 # 依赖管理与脚本
├── tsconfig.json                # TypeScript 配置（ESM + NodeNext）
├── .env.example                 # API Key 配置模板
├── src/
│   ├── index.ts                 # CLI 入口：参数解析 + 模式路由
│   ├── config.ts                # 配置管理：API Key、模型解析、路径
│   ├── agent-session.ts         # 会话管理：组装 Agent + Model + Tools
│   ├── system-prompt.ts         # 系统提示构建器
│   ├── tools/                   # 7 个编码工具
│   │   ├── index.ts             # 工具注册表
│   │   ├── utils.ts             # 共享工具：路径解析、行号、截断
│   │   ├── read.ts              # 读取文件（支持 offset/limit）
│   │   ├── write.ts             # 写入/创建文件
│   │   ├── edit.ts              # 字符串替换编辑
│   │   ├── bash.ts              # 执行 Shell 命令
│   │   ├── grep.ts              # 正则搜索（rg → grep 回退）
│   │   ├── find.ts              # Glob 文件搜索
│   │   └── ls.ts                # 目录列表
│   ├── tui/                     # TUI 界面层
│   │   ├── app.ts               # 主应用：事件循环 + 渲染调度
│   │   ├── theme.ts             # 颜色主题
│   │   └── components/          # UI 组件
│   │       ├── welcome.ts       # 欢迎横幅
│   │       ├── assistant-message.ts  # 流式消息渲染
│   │       ├── tool-execution.ts     # 工具执行展示
│   │       ├── user-input.ts         # 用户输入
│   │       └── footer.ts             # 状态栏
│   └── utils/                   # 通用工具
│       ├── git.ts               # Git 信息
│       └── shell.ts             # Shell 检测
```

### 2. Agent 运行循环（核心机制）

Agent 的核心是一个**事件驱动的循环**，参考 pi-mono 的 `agent-loop.ts` 设计：

```
用户输入
   ↓
┌─────────────────────────┐
│    Agent Loop (内循环)    │
│                         │
│  1. 组装上下文           │  ← System Prompt + 历史消息 + 工具定义
│  2. 调用 LLM (流式)      │  ← streamSimple() → SSE 事件流
│  3. 解析响应              │
│     ├─ 文本 → 直接输出    │  ← message_update 事件
│     ├─ 思考 → 显示指示器  │  ← thinking 内容
│     └─ 工具调用 → 执行    │  ← tool_execution_start → execute → tool_execution_end
│  4. 工具结果注入上下文     │
│  5. 检查是否需要继续      │  ← 有工具结果？→ 回到步骤 1
│     └─ 无工具调用 → 结束  │  ← agent_end 事件
└─────────────────────────┘
   ↓
等待下一次用户输入
```

**关键数据流：**

```typescript
// AgentSession 组装过程
const agent = new Agent({
  initialState: {
    systemPrompt,           // 系统提示（含项目上下文）
    model: getModel("anthropic", "claude-sonnet-4-20250514"),
    tools: createAllTools(cwd),  // 7 个工具
    thinkingLevel: "medium",     // 推理深度
  },
});

// 事件订阅 → TUI 渲染
agent.subscribe((event: AgentEvent) => {
  switch (event.type) {
    case "message_update":  // 流式文本 → stdout
    case "tool_execution_start":  // 工具开始 → 显示工具名和参数
    case "tool_execution_end":    // 工具结束 → 显示结果
    case "agent_end":       // 循环结束 → 显示 footer + 重新提示输入
  }
});
```

### 3. 工具系统设计

每个工具遵循 pi-mono 的 `AgentTool` 接口：

```typescript
interface AgentTool<TParameters extends TSchema> {
  name: string;              // 工具标识符
  label: string;             // UI 显示名称
  description: string;       // LLM 看到的工具描述
  parameters: TParameters;   // TypeBox JSON Schema 定义参数
  execute: (                 // 执行函数
    toolCallId: string,
    params: Static<TParameters>,
    signal?: AbortSignal,
  ) => Promise<AgentToolResult>;
}

interface AgentToolResult<T = any> {
  content: (TextContent | ImageContent)[];  // 返回给 LLM 的内容
  details: T;                                // UI 展示用的额外信息
}
```

**工具实现要点：**

| 工具 | 核心实现 | 关键特性 |
|------|---------|---------|
| **read** | `fs.readFile` + 行号格式化 | offset/limit 分页读取，大文件自动截断（2000行/200KB） |
| **write** | `fs.writeFile` + `mkdir -p` | 自动创建父目录 |
| **edit** | 字符串 `indexOf` + `replace` | 唯一匹配检查，`replace_all` 支持批量替换 |
| **bash** | `child_process.spawn` | detached 进程组、超时杀死进程树、AbortSignal 支持 |
| **grep** | 优先 `rg`，回退 `grep` | `--glob` 文件过滤，`-C` 上下文行 |
| **find** | 递归 `readdir` + `minimatch` | 跳过 `.hidden` 和 `node_modules`，最多 1000 结果 |
| **ls** | `readdir` + `stat` | 目录优先排序，文件大小格式化 |

### 4. TUI 渲染架构

TUI 采用**事件驱动渲染**模式，将 Agent 事件映射到终端输出：

```
AgentEvent                    TUI 渲染
─────────────────────────────────────────────
agent_start           →  设置 streaming 状态
message_start         →  打印 "Assistant" 标签
message_update        →  增量输出文本 delta（打字机效果）
                         检测 thinking 块 → 显示思考指示器
message_end           →  换行
tool_execution_start  →  打印 "⚡ toolName args"
tool_execution_end    →  打印工具结果（截断显示）
turn_end              →  更新 token 计数
agent_end             →  显示 footer 状态栏 → 重新显示输入提示
```

**流式输出的实现：**

```typescript
// 关键：通过比较文本长度实现增量输出
case "message_update": {
  const assistantMsg = event.message as AssistantMessage;
  for (const block of assistantMsg.content) {
    if (block.type === "text") {
      // pi-ai 的流式事件包含完整的累积文本
      // 我们只输出新增的 delta 部分
      const delta = block.text.slice(currentTextContent.length);
      process.stdout.write(delta);  // 无缓冲直接写入 → 打字机效果
      currentTextContent = block.text;
    }
  }
}
```

### 5. 系统提示工程

系统提示通过 `system-prompt.ts` 动态构建，包含三部分：

```
┌────────────────────────────────────┐
│         System Prompt              │
├────────────────────────────────────┤
│ 1. 角色定义                        │
│    "你是一个专家级 AI 编码助手..."     │
├────────────────────────────────────┤
│ 2. 环境上下文                      │
│    • 工作目录: /path/to/project    │
│    • 平台: linux                   │
│    • Git 分支: main                │
│    • 仓库名: my-project            │
├────────────────────────────────────┤
│ 3. 工具使用指南                     │
│    • 7 个工具的使用说明              │
│    • 编码最佳实践                   │
├────────────────────────────────────┤
│ 4. 项目上下文 (可选)                │
│    ← 从 CLAUDE.md / AGENTS.md 读取 │
│    项目特定规则和约定                │
└────────────────────────────────────┘
```

### 6. 双模式运行

```
                    CLI Entry (index.ts)
                         │
                    parseCliArgs()
                         │
              ┌──────────┴──────────┐
              │                     │
         有 --prompt?           无 prompt
              │                     │
     ┌────────┴────────┐    ┌──────┴──────┐
     │  Print Mode     │    │  TUI Mode   │
     │                 │    │             │
     │ • 单次执行       │    │ • 交互循环   │
     │ • stdout 输出    │    │ • readline  │
     │ • stderr 工具日志│    │ • 事件渲染   │
     │ • 执行完退出      │    │ • /commands │
     └─────────────────┘    │ • Ctrl+C/D  │
                            └─────────────┘
```

**Print 模式** 适合管道和脚本集成：
```bash
# AI 回复输出到 stdout，工具日志输出到 stderr
tui-agent "explain this codebase" > summary.md 2> tools.log
```

### 7. 与 pi-mono 的对应关系

| pi-mono 模块 | 本项目对应 | 说明 |
|-------------|-----------|------|
| `packages/ai/` | 直接依赖 `@mariozechner/pi-ai` | 统一 LLM API |
| `packages/agent/src/agent.ts` | 直接依赖 `@mariozechner/pi-agent-core` | Agent 类 |
| `packages/agent/src/agent-loop.ts` | 由 pi-agent-core 内部调用 | Agent 循环 |
| `packages/agent/src/types.ts` | 导入类型：AgentTool, AgentEvent, AgentState | 类型定义 |
| `packages/coding-agent/src/core/tools/` | `src/tools/` (自行实现) | 7 个工具 |
| `packages/coding-agent/src/modes/interactive/` | `src/tui/` (简化实现) | TUI 界面 |
| `packages/tui/` | 直接依赖 `@mariozechner/pi-tui` | TUI 组件库 |

### 8. 扩展方向

当前实现是一个功能完整的 MVP，可以在以下方向扩展：

- **权限系统** — 在 `beforeToolCall` 钩子中实现危险操作确认
- **会话持久化** — 保存/恢复对话到 `~/.tui-agent/sessions/`
- **上下文压缩** — 长对话自动摘要，参考 pi-mono 的 compaction 机制
- **扩展系统** — 加载外部工具，参考 pi-mono 的 extensions 架构
- **Web UI** — 参考 pi-mono 的 `pi-web-ui` 包添加浏览器界面
- **MCP 协议** — 支持 Model Context Protocol 接入外部工具服务器

## 技术栈

| 组件 | 技术 |
|------|------|
| 语言 | TypeScript 5.7 (ESM) |
| 运行时 | Node.js ≥ 20 |
| LLM API | @mariozechner/pi-ai |
| Agent 运行时 | @mariozechner/pi-agent-core |
| TUI 库 | @mariozechner/pi-tui |
| Schema 验证 | @sinclair/typebox |
| 终端颜色 | chalk 5 |
| 环境变量 | dotenv |
| Glob 匹配 | minimatch |

## 许可证

MIT
