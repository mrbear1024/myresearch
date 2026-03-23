# 01 — 开发环境搭建

> 学习目标：安装并配置开发所需的全部工具，确保环境可用。

## 操作系统

推荐使用 **macOS** 或 **Linux** 进行开发。大多数开发工具、教程和生产环境都基于 Unix 系统，使用 macOS/Linux 能获得最顺畅的体验。

**Windows 用户请使用 WSL（Windows Subsystem for Linux）：**

```bash
# 在 PowerShell（管理员）中运行
wsl --install
```

安装完成后重启电脑，WSL 会自动安装 Ubuntu。后续所有开发操作都在 WSL 终端中进行，体验与 Linux 一致。

> ⚠️ 本课程后续的命令和操作都基于 Unix 环境（macOS / Linux / WSL）。如果你使用原生 Windows（不装 WSL），可能会遇到路径、权限、工具兼容性等问题。强烈建议 Windows 用户先装好 WSL 再继续。

## 需要安装的工具

### 1. Node.js（JavaScript 运行环境）

推荐使用 nvm（Node Version Manager）安装，方便管理多个版本。

**Mac / Linux / WSL：**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端后安装 Node.js
nvm install --lts
nvm use --lts

# 验证安装
node --version
npm --version
```

### 2. AI 编程工具

推荐优先级（从高到低）：

- **[Claude Code](https://claude.ai/code)** — Anthropic 官方命令行 AI 代理，能直接读写文件、运行命令、自主完成多步骤任务
- **[Codex](https://github.com/openai/codex)** — OpenAI 的命令行 AI 代理，类似 Claude Code 的开源替代
- **[Cursor](https://cursor.sh/)** — 基于 VS Code 的 AI 原生编辑器，适合不习惯命令行的用户

建议优先使用 **Claude Code** 或 **Codex**，它们在终端中直接操作代码库，效率更高，能培养你对项目结构的整体理解。Cursor 作为备选，适合需要图形界面的场景。

> 💡 使用 Claude Code / Codex 时，你仍然需要一个编辑器来浏览代码。推荐安装 **[VS Code](https://code.visualstudio.com/)**（免费）作为代码浏览器。

#### Claude Code App — 随时随地写代码

除了命令行版本，Claude 还提供了 **Claude Code App**（手机/平板），让你在没有电脑的时候也能编程：

- **配置 GitHub 授权**：在 App 中连接你的 GitHub 账号，Claude 可以直接读取和修改你的代码仓库
- **随时随地 Coding**：通勤、等人、午休时，用手机也能让 AI 帮你写代码、修 bug、做 code review
- **典型场景**：
  - 在手机上让 Claude 修复一个 bug 并提交 PR
  - 审查团队成员的代码变更
  - 快速创建新功能的脚手架代码

下载地址：在 App Store 或 Google Play 搜索 **Claude**，登录后在设置中开启 GitHub 连接。

### 3. Git

**Mac：**
```bash
# Xcode Command Line Tools 自带 Git
xcode-select --install
```

**Linux / WSL：**
```bash
sudo apt install git   # Ubuntu/Debian
```

验证：
```bash
git --version
```

### 4. 安装 Claude Code / Codex

```bash
# Claude Code（推荐）
npm install -g @anthropic-ai/claude-code

# Codex（备选）
npm install -g @openai/codex
```

### 5. 推荐的 VS Code 扩展

- **ESLint** — 代码规范检查
- **Prettier** — 代码格式化
- **Tailwind CSS IntelliSense** — Tailwind 样式提示

### 6. CLI 工具（后续会用到）

```bash
# Vercel CLI
npm install -g vercel

# Supabase CLI（可选，也可以用网页管理）
npm install -g supabase
```

## 验证环境

运行以下命令，确认所有工具已就绪：

```bash
node --version    # 应显示 v18+ 或 v20+
npm --version     # 应显示 9+ 或 10+
git --version     # 应显示 git version 2.x
```

如果所有命令都正常输出版本号，恭喜你，开发环境已经搭建好了！

## 常见问题

- **命令找不到（command not found）**：重启终端再试
- **权限问题**：Mac/Linux 用户避免使用 `sudo npm install -g`，用 nvm 管理 Node.js 即可
- **网络问题**：如果下载慢，可以配置 npm 镜像源
