# 02 — CLI 基础

> 学习目标：掌握终端/命令行的基本操作，能够自如地导航文件系统和运行命令。

## 什么是终端（Terminal）

终端是用文字和计算机交互的工具。虽然看起来不如图形界面直观，但它更高效、更强大，是开发者的核心工具。

- **Mac**：打开「终端」应用，或在 VS Code / Cursor 中按 `` Ctrl+` ``
- **Windows**：使用 PowerShell 或 Git Bash
- **Linux**：Ctrl+Alt+T

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
code .                # 用 VS Code 打开当前目录
cursor .              # 用 Cursor 打开当前目录
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

1. 打开终端，用 `pwd` 查看你在哪
2. 用 `mkdir` 创建一个 `test-project` 目录
3. 用 `cd` 进入该目录
4. 用 `touch` 创建一个 `hello.txt` 文件
5. 用 `ls` 确认文件已创建
6. 用 `cd ..` 回到上级目录
7. 用 `rm -rf test-project` 删除测试目录

完成以上步骤，你就已经掌握了 CLI 的基本功了！
