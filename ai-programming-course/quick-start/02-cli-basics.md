# 02 — CLI 基础

> 学习目标：掌握终端/命令行的基本操作，能够自如地导航文件系统、运行命令，理解环境变量和 Shell 配置。

## 什么是终端（Terminal）

终端是用文字和计算机交互的工具。虽然看起来不如图形界面直观，但它更高效、更强大，是开发者的核心工具。

- **Mac**：打开「终端」应用，或在 VS Code 中按 `` Ctrl+` ``
- **Linux / WSL**：Ctrl+Alt+T，或在 VS Code 中按 `` Ctrl+` ``
- **Windows**：打开 WSL 终端（推荐），或使用 PowerShell

## 核心命令

### 导航

```bash
pwd                   # 显示当前所在目录（Print Working Directory）
ls                    # 列出当前目录的文件和文件夹
ls -la                # 列出所有文件（包括隐藏文件）及详细信息
cd Documents          # 进入 Documents 目录
cd ..                 # 返回上一级目录
cd ~                  # 回到用户主目录
cd ~/projects         # 直接跳转到指定路径
```

### 文件和目录操作

```bash
mkdir my-project      # 创建目录
mkdir -p a/b/c        # 创建多层目录
touch index.ts        # 创建空文件
cp file.txt copy.txt  # 复制文件
mv old.txt new.txt    # 移动/重命名文件
rm file.txt           # 删除文件（不可恢复！）
rm -rf folder         # 删除目录及其内容（谨慎使用！）
```

### 查看文件内容

```bash
cat file.txt          # 显示文件全部内容
head file.txt         # 显示文件前 10 行
tail file.txt         # 显示文件后 10 行
```

## 开发常用命令

```bash
npm install           # 安装项目依赖
npm run dev           # 启动开发服务器
npx create-next-app   # 用 npx 运行一次性命令
claude                # 启动 Claude Code（推荐）
codex                 # 启动 Codex（备选）
code .                # 用 VS Code 打开当前目录
cursor .              # 用 Cursor 打开当前目录
```

## 环境变量

环境变量是操作系统中的「全局设置」，程序可以读取它们来获取配置信息。在开发中非常常用，比如存放 API 密钥、数据库地址等。

### 查看和设置环境变量

```bash
# 查看所有环境变量
env

# 查看某个环境变量的值
echo $HOME                    # 用户主目录
echo $PATH                    # 系统查找命令的路径列表

# 临时设置（只在当前终端会话有效）
export MY_NAME="张三"
echo $MY_NAME                 # 输出：张三

# 查看 PATH 中有哪些路径（更易读的格式）
echo $PATH | tr ':' '\n'
```

### PATH — 最重要的环境变量

`PATH` 决定了你在终端输入一个命令时，系统去哪里找到它。

```bash
# 当你输入 node 时，系统会按 PATH 中的路径依次查找 node 这个程序
which node                    # 显示 node 命令的实际位置
which claude                  # 显示 claude 命令的实际位置
```

如果遇到 `command not found`，很可能是对应程序的路径不在 `PATH` 里。

### .env 文件 — 项目级环境变量

开发项目时，敏感配置（API 密钥等）放在项目根目录的 `.env` 文件中：

```bash
# .env 文件内容示例
OPENAI_API_KEY=sk-xxx123
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
```

> ⚠️ `.env` 文件包含敏感信息，**永远不要提交到 Git**。后续学 Git 时会教你用 `.gitignore` 排除它。

## Shell 配置

Shell 是终端背后的「解释器」，负责理解和执行你输入的命令。常见的 Shell 有：

- **zsh** — macOS 默认，功能丰富（推荐）
- **bash** — Linux/WSL 默认，最通用

### 配置文件在哪里

每次打开终端，Shell 会自动读取配置文件来加载你的个性化设置：

```bash
# zsh 的配置文件（macOS 默认）
~/.zshrc

# bash 的配置文件（Linux/WSL 默认）
~/.bashrc
```

### 配置文件能做什么

```bash
# 用编辑器打开配置文件（以 zsh 为例）
code ~/.zshrc                 # 或 nano ~/.zshrc

# ---------- 以下是配置文件中的常用内容 ----------

# 1. 设置永久环境变量（每次开终端自动生效）
export EDITOR="code"                          # 默认编辑器
export ANTHROPIC_API_KEY="sk-ant-xxx"         # Claude API 密钥

# 2. 命令别名（给常用命令起短名字）
alias ll="ls -la"                             # ll 代替 ls -la
alias gs="git status"                         # gs 代替 git status
alias gp="git push"                           # gp 代替 git push
alias dev="npm run dev"                       # dev 代替 npm run dev
alias cc="claude"                             # cc 代替 claude

# 3. 将自定义路径加入 PATH
export PATH="$HOME/.local/bin:$PATH"
```

### 修改配置后如何生效

```bash
# 方法 1：重新加载配置文件（不需要重启终端）
source ~/.zshrc               # zsh 用户
source ~/.bashrc              # bash 用户

# 方法 2：关闭终端再重新打开
```

### 推荐的初始配置

对于本课程，建议在你的 Shell 配置文件中加入以下内容：

```bash
# ---------- AI 编程课程推荐配置 ----------

# 常用别名
alias ll="ls -la"
alias gs="git status"
alias gp="git push"
alias ga="git add"
alias gc="git commit"
alias dev="npm run dev"
alias cc="claude"

# nvm 自动加载（如果还没有的话）
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## 实用技巧

| 技巧 | 操作 |
|------|------|
| Tab 补全 | 输入文件名开头几个字母，按 Tab 自动补全 |
| 上下箭头 | 浏览历史命令 |
| Ctrl+C | 终止当前运行的命令 |
| Ctrl+L | 清屏 |
| ↑ 然后回车 | 重新运行上一条命令 |

## 小练习

### 练习 1：文件操作

1. 打开终端，用 `pwd` 查看你在哪
2. 用 `mkdir` 创建一个 `test-project` 目录
3. 用 `cd` 进入该目录
4. 用 `touch` 创建一个 `hello.txt` 文件
5. 用 `ls` 确认文件已创建
6. 用 `cd ..` 回到上级目录
7. 用 `rm -rf test-project` 删除测试目录

### 练习 2：环境变量和 Shell 配置

1. 运行 `echo $SHELL` 查看你当前用的是哪个 Shell
2. 运行 `echo $PATH | tr ':' '\n'` 查看 PATH 中的路径
3. 运行 `export HELLO="你好"` 设置一个临时环境变量
4. 运行 `echo $HELLO` 确认变量已设置
5. 打开你的 Shell 配置文件（`code ~/.zshrc` 或 `code ~/.bashrc`）
6. 添加一个别名，比如 `alias ll="ls -la"`
7. 运行 `source ~/.zshrc`（或 `~/.bashrc`）使配置生效
8. 输入 `ll` 验证别名是否生效

完成以上练习，你就掌握了 CLI 的基本功了！
