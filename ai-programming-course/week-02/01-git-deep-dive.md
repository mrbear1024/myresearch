# 01 — Git 深入

> 学习目标：掌握 Git 分支、合并、协作流程，从"会用"进阶到"熟练"。

## 回顾：Day 1 学了什么

Day 1 你学了 Git 的生存包：`init` → `add` → `commit` → `push`。现在我们要解锁更多能力。

## 分支（Branch）

### 什么是分支

分支就像平行宇宙 — 你可以在一个分支上做新功能，不影响主线代码。

```
main ──────●─────●─────●─────────●── (稳定版本)
                  \               /
feature    　      ●──●──●──●──── (新功能开发)
```

### 基本操作

```bash
# 查看所有分支
git branch

# 创建新分支
git branch feature/login

# 切换到新分支
git checkout feature/login

# 创建并切换（快捷方式）
git checkout -b feature/login

# 回到主分支
git checkout main
```

### 分支命名规范

```
feature/login        # 新功能
fix/chat-scroll      # Bug 修复
refactor/api-routes  # 代码重构
```

## 合并（Merge）

完成功能后，把分支合并回主线：

```bash
# 先切回主分支
git checkout main

# 合并功能分支
git merge feature/login

# 删除已合并的分支（可选）
git branch -d feature/login
```

### 合并冲突

当两个分支修改了同一处代码，Git 无法自动合并：

```
<<<<<<< HEAD
const title = "聊天应用";
=======
const title = "AI 聊天助手";
>>>>>>> feature/login
```

解决方法：
1. 打开冲突文件
2. 选择要保留的代码（或两者都保留）
3. 删除 `<<<<<<<`、`=======`、`>>>>>>>` 标记
4. `git add .` → `git commit`

遇到复杂冲突时，把冲突内容给 AI，让它帮你分析。

## Pull Request（PR）

PR 是团队协作的核心流程：

1. 从 `main` 创建功能分支
2. 在分支上开发并提交
3. 推送分支到 GitHub
4. 在 GitHub 上创建 Pull Request
5. 团队成员审查代码
6. 审查通过后合并到 `main`

```bash
# 推送分支到远程
git push -u origin feature/login

# 然后在 GitHub 网页上创建 PR
```

## 常用进阶命令

```bash
# 查看提交历史
git log --oneline

# 查看具体改动
git diff

# 暂存当前改动（临时切换分支时有用）
git stash
git stash pop        # 恢复暂存的改动

# 撤销未提交的修改
git checkout -- file.txt

# 查看某个文件的修改历史
git log --oneline file.txt
```

## .gitignore 进阶

```gitignore
# 依赖
node_modules/

# 环境变量
.env
.env.local
.env.*.local

# 构建产物
.next/
out/
dist/

# 编辑器配置
.vscode/
.idea/

# 系统文件
.DS_Store
Thumbs.db
```

## Git 工作流建议

### 个人项目

```
1. 在 main 上直接开发（小项目够用）
2. 经常 commit（每完成一个小功能就提交）
3. 定期 push（防止本地代码丢失）
```

### 团队项目

```
1. main 保持稳定，不直接在上面开发
2. 每个功能创建分支
3. 通过 PR 合并代码
4. 合并前进行代码审查
```

## 小练习

1. 创建一个新分支 `feature/dark-mode`
2. 在分支上做一些修改并提交
3. 切回 `main`，确认修改不在 main 上
4. 把分支合并到 `main`
5. 删除功能分支

## 小结

- **分支**让你安全地开发新功能，不影响主线
- **合并**把分支的成果集成到主线
- **PR** 是团队协作和代码审查的标准流程
- 遇到合并冲突不要慌，仔细看冲突内容或让 AI 帮忙
