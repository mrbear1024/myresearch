# 4. 工具设计最佳实践

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
