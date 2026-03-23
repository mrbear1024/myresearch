# 04 — 推荐技术栈介绍

> 学习目标：理解我们选用的每个技术的作用，以及它们如何协同工作。

## 整体架构

```
用户浏览器
    ↓
  Vercel（托管平台）
    ↓
  Next.js（全栈框架）
   ├── 前端页面（React 组件）
   └── API 路由（后端逻辑）
         ↓
    Supabase（后端服务）
    ├── PostgreSQL 数据库
    ├── 用户认证
    └── 实时功能
```

## 技术逐个看

### TypeScript — 编程语言

TypeScript = JavaScript + 类型系统。

```typescript
// JavaScript：运行时才发现错误
function greet(name) {
  return name.toUpperCase(); // 如果传入数字就会崩溃
}

// TypeScript：写代码时就发现错误
function greet(name: string): string {
  return name.toUpperCase(); // 编辑器会提示：只能传字符串
}
```

**为什么用 TypeScript：**
- 类型提示帮助 AI 生成更准确的代码
- 编辑器自动补全更智能
- 很多 bug 在写代码时就能被发现

### Next.js — 全栈框架

Next.js 是基于 React 的全栈框架，前端和后端都能搞定。

**它帮你解决的问题：**
- 页面路由（`/about` → `app/about/page.tsx`）
- 服务端渲染（SEO 友好）
- API 接口（`app/api/chat/route.ts`）
- 自动代码分割和优化

一个框架搞定前后端，不用分开管理两个项目。

### Supabase — 后端即服务

Supabase 提供了后端开发需要的核心功能：

- **数据库**：PostgreSQL，可靠的关系型数据库
- **认证**：用户注册、登录、OAuth（Google/GitHub 登录）
- **存储**：文件上传
- **实时**：数据变化时自动推送给前端

你不需要自己搭建服务器，Supabase 帮你全包了。有慷慨的免费额度。

### Vercel — 部署平台

Vercel 是 Next.js 的官方推荐部署平台：

- 连接 GitHub，代码推送后**自动部署**
- 每个 Pull Request 自动生成**预览链接**
- 全球 CDN，访问速度快
- 免费额度足够个人项目

### Git + GitHub — 版本控制与代码托管

- **Git**：本地管理代码版本
- **GitHub**：云端存储代码，也是开发者社区

## 它们如何协同工作

```
1. 你在本地用 Next.js + TypeScript 写代码
2. 代码中调用 Supabase 的 API 读写数据
3. 用 Git 提交代码到 GitHub
4. Vercel 监听 GitHub，自动拉取代码并部署
5. 用户通过 Vercel 提供的域名访问你的应用
```

## 为什么选这个组合

| 优势 | 说明 |
|------|------|
| 全免费起步 | 所有工具都有免费额度，足够学习和小项目 |
| 全栈一体 | 不需要分开学前端和后端 |
| 生态庞大 | 遇到问题容易搜到解决方案，AI 也很熟悉 |
| 生产可用 | 不是玩具技术栈，可以做真正的产品 |
| AI 友好 | 这些技术在 AI 训练数据中占比高，AI 生成的代码质量好 |

## 小结

不需要现在就理解所有细节。随着后面的实战，你会逐渐熟悉每个部分。关键是：**这套技术栈能让你快速把想法变成可访问的产品**。
