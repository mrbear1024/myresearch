# 5. Claude Agent SDK 实战

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
