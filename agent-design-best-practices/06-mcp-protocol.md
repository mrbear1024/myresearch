# 6. MCP 协议详解（Model Context Protocol）

> 学习目标：理解 MCP 协议的架构设计、三大核心原语，掌握 MCP 服务器的开发方法与实际应用场景。
>
> 来源：Anthropic, "Introducing the Model Context Protocol" & MCP 官方规范

## 6.1 协议架构

MCP（Model Context Protocol）是 Anthropic 于 2024 年 11 月推出的**开放标准**，用于标准化 AI 系统与外部工具、数据源和服务的集成方式。

**核心架构**：基于 JSON-RPC 2.0 的客户端-服务器模式。

```
┌─────────────────────────────────────────────────────┐
│                     宿主应用                          │
│                   (Host App)                         │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│   │ MCP 客户端│  │ MCP 客户端│  │ MCP 客户端│          │
│   │ Client A │  │ Client B │  │ Client C │          │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│        │             │             │                │
└────────┼─────────────┼─────────────┼────────────────┘
         │             │             │
    JSON-RPC 2.0  JSON-RPC 2.0  JSON-RPC 2.0
         │             │             │
    ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐
    │ MCP 服务器│  │ MCP 服务器│  │ MCP 服务器│
    │ GitHub   │  │ Postgres │  │ Slack    │
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │             │             │
    ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐
    │ GitHub   │  │ 数据库    │  │ Slack    │
    │ API      │  │          │  │ API      │
    └──────────┘  └──────────┘  └──────────┘
```

**关键设计决策**：
- **协议而非框架**：MCP 定义的是通信标准，不绑定特定实现
- **一对多映射**：一个宿主应用可连接多个 MCP 服务器
- **双向通信**：客户端和服务器都可以发起请求
- **传输无关**：支持 stdio、HTTP+SSE 等多种传输方式

## 6.2 三大原语（Three Primitives）

MCP 定义了三种核心原语，各有不同的控制方对象：

| 原语 | 控制方 | 描述 | 类比 |
|------|--------|------|------|
| **Tools** | 模型控制 | 模型可调用的操作 | 函数 / API 端点 |
| **Resources** | 应用控制 | 应用可访问的数据 | 文件 / 数据库记录 |
| **Prompts** | 用户控制 | 预定义的提示模板 | 快捷指令 / 宏 |

### Tools（工具）

模型自主决定何时调用，是智能体与外部系统交互的核心方式：

```typescript
// MCP 服务器中定义工具
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "query_database",
      description: "执行 SQL 查询并返回结果",
      inputSchema: {
        type: "object",
        properties: {
          sql: {
            type: "string",
            description: "要执行的 SQL 查询语句（只读）",
          },
        },
        required: ["sql"],
      },
    },
  ],
}));
```

### Resources（资源）

由应用程序控制，提供上下文数据给模型：

```typescript
// MCP 服务器中定义资源
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "file:///project/README.md",
      name: "项目说明文档",
      mimeType: "text/markdown",
    },
    {
      uri: "db://users/schema",
      name: "用户表结构",
      mimeType: "application/json",
    },
  ],
}));
```

### Prompts（提示模板）

由用户触发的预定义交互模板：

```typescript
// MCP 服务器中定义提示模板
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "code_review",
      description: "审查指定文件的代码质量",
      arguments: [
        {
          name: "file_path",
          description: "要审查的文件路径",
          required: true,
        },
      ],
    },
  ],
}));
```

## 6.3 SDK 与实现

MCP 提供了多语言 SDK：

| 语言 | 包名 | 成熟度 |
|------|------|--------|
| TypeScript | `@modelcontextprotocol/sdk` | 最成熟 |
| Python | `mcp` | 成熟 |
| C# | `ModelContextProtocol` | 可用 |
| Java | `io.modelcontextprotocol` | 可用 |

**构建一个完整的 MCP 服务器（TypeScript）**：

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// 创建服务器
const server = new Server(
  { name: "my-agent-tools", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 注册工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_weather",
      description: "获取指定城市的天气信息",
      inputSchema: {
        type: "object",
        properties: {
          city: { type: "string", description: "城市名称" },
        },
        required: ["city"],
      },
    },
  ],
}));

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_weather") {
    const city = request.params.arguments?.city as string;
    // 实际应用中这里调用天气 API
    return {
      content: [
        {
          type: "text",
          text: `${city}：晴，25°C，湿度 60%`,
        },
      ],
    };
  }
  throw new Error(`未知工具: ${request.params.name}`);
});

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

## 6.4 实际应用场景

### 数据库集成

```
智能体 → MCP Client → MCP Server (Postgres)
                          │
                          ▼
                    ┌──────────┐
                    │ PostgreSQL│
                    │ 数据库    │
                    └──────────┘
```

### API 网关

```
智能体 → MCP Client → MCP Server (API Gateway)
                          │
               ┌──────────┼──────────┐
               ▼          ▼          ▼
          ┌────────┐ ┌────────┐ ┌────────┐
          │GitHub  │ │Jira    │ │Slack   │
          │API     │ │API     │ │API     │
          └────────┘ └────────┘ └────────┘
```

### 文件系统访问

```
智能体 → MCP Client → MCP Server (Filesystem)
                          │
                     ┌────┴────┐
                     │ 受限目录  │  ← 只能访问允许的路径
                     │ /project │
                     └─────────┘
```

## 6.5 生产环境注意事项

MCP 在协议层面还缺少三个关键原语：

| 缺失原语 | 问题 | 当前解决方案 |
|----------|------|-------------|
| **身份传播** (Identity Propagation) | 无法知道谁在调用工具 | 在应用层实现认证 |
| **自适应工具预算** (Adaptive Tool Budgeting) | 无法限制工具调用次数 | 在智能体层面限制 |
| **结构化错误语义** (Structured Error Semantics) | 错误信息缺乏标准格式 | 自定义错误处理 |
