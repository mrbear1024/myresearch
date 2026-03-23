# 09 — 部署流水线

> 学习目标：理解 CI/CD 的概念，配置 GitHub Actions 实现自动化测试和部署。

## 什么是 CI/CD

- **CI（持续集成）** — 代码推送后，自动运行测试和检查
- **CD（持续部署）** — 测试通过后，自动部署到线上

```
推送代码 → 自动测试 → 自动检查 → 自动部署
```

Day 1 中，Vercel 已经帮你实现了 CD（推送即部署）。现在我们加上 CI（自动测试）。

## GitHub Actions

GitHub Actions 是 GitHub 内置的自动化工具，免费额度足够个人项目。

### 创建第一个 Workflow

创建文件 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 安装 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 类型检查
        run: npx tsc --noEmit

      - name: 代码规范检查
        run: npm run lint

      - name: 运行测试
        run: npm test -- --run
```

### 工作流程解释

```
on:          → 什么时候触发（推送或 PR 到 main）
jobs:        → 要做什么
runs-on:     → 在什么环境运行
steps:       → 具体步骤（按顺序执行）
```

## 完善 package.json 脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "type-check": "tsc --noEmit"
  }
}
```

## PR 工作流

配置了 CI 后的开发流程：

```
1. 创建功能分支
2. 开发并提交
3. 推送分支到 GitHub
4. 创建 Pull Request
5. GitHub Actions 自动运行测试 ← CI 自动触发
6. Vercel 自动创建预览链接 ← CD 自动触发
7. 测试通过 + 代码审查通过 → 合并
8. 合并到 main → 自动部署到生产环境
```

## 环境管理

```
开发环境（Development）  → 本地电脑，npm run dev
预览环境（Preview）      → Vercel 为每个 PR 自动创建
生产环境（Production）   → main 分支部署的线上版本
```

每个环境可以有不同的环境变量（不同的数据库、API 密钥等）。

## Vercel 预览部署

Vercel 为每个 PR 自动生成预览链接：

```
PR #5: fix/chat-scroll
预览链接: https://my-app-git-fix-chat-scroll-username.vercel.app
```

你可以在预览环境中测试改动，确认没问题再合并。

## 回滚

上线后发现问题？

**Vercel 回滚：**
1. 打开 Vercel Dashboard → Deployments
2. 找到上一个正常的部署
3. 点击 "..." → "Promote to Production"

**Git 回滚：**
```bash
# 查看提交历史
git log --oneline

# 创建一个新 commit 撤销某次改动
git revert <commit-hash>
git push
```

## 小结

- **CI/CD** 自动化了测试和部署流程，减少人为错误
- **GitHub Actions** 免费且强大，适合个人和小团队
- **PR + CI + 预览部署** 是现代开发的标准工作流
- 出了问题可以**快速回滚**，不需要手忙脚乱
