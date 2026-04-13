# 让 Claude Code 更安全、更自主

> 来源：https://www.anthropic.com/engineering/claude-code-sandboxing
> 发布时间：2025年

Claude Code 的新沙箱功能（sandboxing features）——bash 工具沙箱和 Web 版 Claude Code——通过启用两层边界来减少权限提示并增强用户安全性：文件系统隔离和网络隔离。在内部使用中，沙箱安全地将权限提示减少了 84%。

## 问题：权限疲劳（Permission Fatigue）

当 Claude Code 需要运行命令、读取项目外的文件或发起网络请求时，它会请求权限。这是安全的，但会造成摩擦——尤其是在长时间运行的任务中，智能体可能需要数十次审批。

用户要么花费过多时间审批安全的操作，要么授予一揽子权限从而降低安全性。我们需要找到一个折中方案。

## 沙箱方法

沙箱创建预定义的边界，让 Claude 在其中更自由地工作，而不是对每个操作都请求权限。关键洞察在于：智能体需要执行的大多数操作都可以安全地限制在明确定义的边界内。

我们基于操作系统级别的原语（OS-level primitives）构建：
- **Linux**：使用 bubblewrap 进行文件系统和进程隔离
- **macOS**：使用 seatbelt 进行沙箱化

这些在操作系统层面实施限制，使其能够有效抵御提示注入（prompt injection）和其他攻击。

## 两层沙箱

### 文件系统隔离（Filesystem Isolation）

沙箱限制 Claude 可以读取和写入的目录。默认情况下，Claude 对项目目录拥有完全访问权限，对系统库和工具拥有只读访问权限，但无法访问敏感目录，如 `~/.ssh`、`~/.aws` 或其他项目。

### 网络隔离（Network Isolation）

网络沙箱控制 Claude 可以连接的主机。对于开发任务，你可以允许访问 `localhost`、公司的 API 端点和包注册表（package registries），同时屏蔽其他所有内容。

## 沙箱运行时（Sandbox Runtime）

一个新的沙箱运行时作为研究预览的 Beta 版本提供，让你可以精确定义智能体可以访问哪些目录和网络主机，而无需启动和管理容器的额外开销。

配置示例：
```json
{
  "filesystem": {
    "read": ["/project", "/usr/lib"],
    "write": ["/project"]
  },
  "network": {
    "allow": ["localhost", "registry.npmjs.org"]
  }
}
```

## Web 版 Claude Code

Web 版 Claude Code 将沙箱化推进了一步，每个会话都在自己的隔离环境中运行。这提供了：
- 每个会话完全独立的文件系统隔离
- 网络控制
- 无法访问用户的本地机器
- 实时进度跟踪

## 成果

在内部使用中：
- 权限提示减少了 **84%**
- 沙箱会话中未发生安全事件
- 用户报告心流状态和生产力显著提升

## 启示

沙箱代表了我们在智能体权限思维方式上的根本性转变：从逐项操作审批转向基于边界的约束（boundary-based containment）。通过预先定义安全边界，我们可以在保持强大安全保障的同时赋予智能体更多自主权。

这种方法具有良好的扩展性——随着智能体承担更复杂的任务，沙箱确保它们能在指定空间内自由工作，而无需持续的人工审批。
