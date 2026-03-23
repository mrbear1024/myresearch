# 03 — Markdown 基础

> 学习目标：掌握 Markdown 语法，能够编写格式清晰的文档、README 和笔记。

## 为什么要学 Markdown

Markdown 是开发者世界的「通用文档语言」。你会在以下场景中不断用到它：

- **GitHub**：项目说明（README.md）、Issue、PR 描述、评论
- **AI 编程**：CLAUDE.md（项目规则文件）、.cursorrules
- **技术文档**：API 文档、教程、Wiki
- **笔记工具**：Notion、Obsidian、Typora 都支持 Markdown
- **博客**：大多数技术博客平台原生支持 Markdown

简单说：**会 Markdown = 会写开发者世界里的文档**。

## 基本语法

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```

> 💡 一个文件通常只有一个 `#` 一级标题，作为文档的主标题。

### 段落和换行

```markdown
这是第一段。段落之间用空行分隔。

这是第二段。
如果只是换行（没有空行），在行末加两个空格
或者直接空一行。
```

### 文字样式

```markdown
**粗体文字**
*斜体文字*
~~删除线~~
`行内代码`
```

效果：**粗体文字**、*斜体文字*、~~删除线~~、`行内代码`

### 列表

```markdown
无序列表：
- 第一项
- 第二项
  - 子项（缩进两个空格）
  - 另一个子项

有序列表：
1. 第一步
2. 第二步
3. 第三步
```

### 链接和图片

```markdown
[链接文字](https://example.com)
![图片描述](./images/screenshot.png)
```

### 引用

```markdown
> 这是一段引用。
> 可以多行。
>
> 也可以有空行。
```

### 代码块

用三个反引号包裹代码，并标注语言名称，可以获得语法高亮：

````markdown
```typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
```

```bash
npm install
npm run dev
```
````

常用语言标注：`typescript`、`javascript`、`bash`、`json`、`html`、`css`、`sql`、`python`

### 表格

```markdown
| 名称 | 用途 | 价格 |
|------|------|------|
| Claude Code | AI 编程 | 按量付费 |
| VS Code | 代码编辑器 | 免费 |
| Vercel | 部署 | 有免费额度 |
```

效果：

| 名称 | 用途 | 价格 |
|------|------|------|
| Claude Code | AI 编程 | 按量付费 |
| VS Code | 代码编辑器 | 免费 |
| Vercel | 部署 | 有免费额度 |

### 分隔线

```markdown
---
```

### 任务列表（GitHub 特有）

```markdown
- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 另一个待办
```

## 开发中的实际应用

### README.md — 项目说明文件

每个项目都应该有一个 `README.md`，它是别人（和未来的你）了解项目的第一入口：

```markdown
# 我的 AI 聊天应用

一个基于 Next.js 和 Claude API 的 AI 聊天应用。

## 功能

- 与 AI 实时对话
- 聊天记录持久化存储
- 深色/浅色主题切换

## 快速开始

​```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API Key

# 启动开发服务器
npm run dev
​```

## 技术栈

- Next.js 14
- TypeScript
- Supabase
- Tailwind CSS
```

### CLAUDE.md — AI 编程规则文件

`CLAUDE.md` 是 Claude Code 的项目级配置，告诉 AI 这个项目的规则和上下文：

```markdown
# CLAUDE.md

## 项目概述
这是一个 AI 聊天应用，使用 Next.js + Supabase。

## 开发命令
- `npm run dev` — 启动开发服务器
- `npm run build` — 构建生产版本
- `npm test` — 运行测试

## 代码规范
- 使用 TypeScript，所有函数必须有类型注解
- 组件放在 src/components/ 目录
- API 路由放在 src/app/api/ 目录
```

### Git Commit 和 PR 描述

```markdown
## 变更说明

添加了用户注册功能：

- 新增注册页面 `/register`
- 集成 Supabase Auth
- 添加邮箱验证流程

## 测试

- [x] 注册成功流程
- [x] 重复邮箱检测
- [x] 邮箱验证链接
```

## 编辑工具

写 Markdown 不需要特殊工具，任何文本编辑器都可以。但以下工具能提供实时预览：

- **VS Code** — 内置 Markdown 预览（`Cmd+Shift+V`）
- **Typora** — 所见即所得的 Markdown 编辑器
- **GitHub** — 在线直接渲染 Markdown 文件

## 小练习

1. 在你的项目目录中创建一个 `README.md`
2. 写上项目标题、简介、功能列表和快速开始指南
3. 在 VS Code 中按 `Cmd+Shift+V`（Mac）或 `Ctrl+Shift+V`（Linux）预览效果
4. 试着创建一个包含表格和代码块的文档

> 💡 本课程的所有内容都是用 Markdown 写的。你正在看的这份文档就是一个 Markdown 文件！
