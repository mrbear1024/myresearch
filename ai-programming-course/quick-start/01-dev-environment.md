# 01 — 开发环境搭建

> 学习目标：安装并配置开发所需的全部工具，确保环境可用。

## 需要安装的工具

### 1. Node.js（JavaScript 运行环境）

推荐使用 nvm（Node Version Manager）安装，方便管理多个版本。

**Mac / Linux：**

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

**Windows：**

下载 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)，安装后在 PowerShell 中运行同样的命令。

### 2. 代码编辑器

推荐两个选择：

- **[VS Code](https://code.visualstudio.com/)** — 最流行的编辑器，免费
- **[Cursor](https://cursor.sh/)** — 基于 VS Code 的 AI 原生编辑器

建议初学者直接使用 **Cursor**，内置 AI 辅助功能更强大。

### 3. Git

**Mac：**
```bash
# Xcode Command Line Tools 自带 Git
xcode-select --install
```

**Windows：**
下载 [Git for Windows](https://git-scm.com/download/win)

**Linux：**
```bash
sudo apt install git   # Ubuntu/Debian
```

验证：
```bash
git --version
```

### 4. 推荐的 VS Code / Cursor 扩展

- **ESLint** — 代码规范检查
- **Prettier** — 代码格式化
- **GitHub Copilot**（VS Code 用户）— AI 代码补全
- **Tailwind CSS IntelliSense** — Tailwind 样式提示

### 5. CLI 工具（后续会用到）

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
