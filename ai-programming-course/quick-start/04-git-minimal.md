# 03 — Git 最小可用知识

> 学习目标：掌握 Git 的最基本操作，能够管理代码版本和推送到 GitHub。

## 什么是 Git

Git 是版本控制工具，它帮你：

- **记录每次改动** — 像游戏存档一样，随时可以回溯
- **多人协作** — 多个人同时修改同一个项目不会冲突
- **备份代码** — 推送到 GitHub，代码永远不会丢

## 最小知识：5 个命令走天下

### 1. 初始化项目

```bash
git init
```

在项目目录下运行，把普通文件夹变成 Git 仓库。

### 2. 查看状态

```bash
git status
```

查看哪些文件被修改了、哪些还没保存。红色 = 未暂存，绿色 = 已暂存。

### 3. 添加文件到暂存区

```bash
git add .              # 添加所有改动
git add index.ts       # 添加指定文件
```

### 4. 提交（存档）

```bash
git commit -m "添加登录功能"
```

把暂存区的改动保存为一个「存档点」。`-m` 后面是这次改动的说明。

### 5. 推送到 GitHub

```bash
git push origin main
```

把本地的存档推送到远程仓库（GitHub）。

## 完整工作流

```
编写代码 → git add . → git commit -m "说明" → git push
```

每完成一个小功能，就执行一次这个流程。

## 首次设置

```bash
# 配置你的身份（只需设置一次）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

## 连接 GitHub

1. 在 GitHub 上创建一个新仓库（New Repository）
2. 按照 GitHub 给出的指引连接本地仓库：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

## .gitignore — 忽略不需要的文件

在项目根目录创建 `.gitignore` 文件，列出不需要跟踪的文件：

```
node_modules/
.env.local
.env
.next/
```

这些文件不应该推送到 GitHub（依赖包太大、环境变量包含密钥）。

## 常见问题

- **push 被拒绝**：可能远程有新的改动，先 `git pull` 再 `git push`
- **不小心 commit 了不该提交的文件**：Week 2 会详细讲解如何处理
- **commit message 写错了**：现在不用在意，先把代码推上去最重要

## 小结

现在你只需要记住这个循环：

```
改代码 → git add . → git commit -m "做了什么" → git push
```

Git 还有很多强大的功能（分支、合并、回滚等），我们会在 Week 2 深入学习。现在掌握这些就足够了。
