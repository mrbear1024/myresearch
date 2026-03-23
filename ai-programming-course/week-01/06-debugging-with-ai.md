# 06 — 用 AI 调试代码

> 学习目标：建立系统化的调试流程，高效利用 AI 定位和修复问题。

## 调试的心态

Bug 是正常的。专业开发者每天都在和 bug 打交道。关键不是避免 bug，而是**快速找到并修复它们**。

## 调试三步法

### 1. 收集信息

在找 AI 帮忙之前，先收集这些信息：

```
- 错误信息（完整的，不要截断）
- 出错的代码
- 你期望的行为 vs 实际的行为
- 你做了什么操作导致了这个错误
```

### 2. 给 AI 完整上下文

```
"我的 Next.js 聊天应用在发送消息时报错。

【错误信息】
TypeError: Cannot read properties of undefined (reading 'map')
  at ChatPage (app/chat/page.tsx:24:18)

【相关代码】
app/chat/page.tsx:
[粘贴代码]

【操作步骤】
1. 打开 /chat 页面
2. 输入消息并点击发送
3. 页面崩溃，显示上述错误

【期望行为】
消息应该被发送到 API 并显示 AI 的回复
```

### 3. 验证修复

AI 给出修复方案后：

1. 理解 AI 说的原因 — 不要只复制粘贴修复代码
2. 应用修复
3. 测试原来出错的操作
4. 测试其他相关功能（确保没有引入新问题）

## 常见错误类型

### 类型错误（TypeScript）

```
Type 'string' is not assignable to type 'number'
```

通常是数据类型不匹配。让 AI 帮你检查类型定义。

### 运行时错误

```
TypeError: Cannot read properties of undefined (reading 'xxx')
```

某个变量是 `undefined`，但你试图访问它的属性。检查数据是否正确加载。

### 网络错误

```
POST http://localhost:3000/api/chat 500 (Internal Server Error)
```

API 路由出错了。查看终端中 Next.js 服务器的输出，找到具体错误。

### 环境变量问题

```
Error: Missing environment variable: OPENAI_API_KEY
```

检查 `.env.local` 文件是否存在且内容正确。修改环境变量后需要重启开发服务器。

### 依赖问题

```
Module not found: Can't resolve 'xxx'
```

缺少依赖包。运行 `npm install xxx` 安装。

## 调试工具

### 浏览器控制台（F12 → Console）

- 红色错误信息 — 前端代码出错
- 网络请求（Network 标签）— API 调用是否成功

### 终端输出

开发服务器的终端会显示：
- 服务端错误
- API 路由的错误信息
- 编译错误

### console.log — 最简单的调试方法

```typescript
// 在怀疑出问题的地方加上 console.log
console.log('messages:', messages);
console.log('data:', data);
console.log('error:', error);
```

在浏览器控制台或终端中查看输出值，确认数据是否符合预期。

## AI 调试模板

遇到问题时，复制这个模板：

```
我在开发 [项目/功能] 时遇到了问题。

技术栈：Next.js + TypeScript + Supabase

错误信息：
[粘贴完整错误]

相关代码文件：
[粘贴代码]

我已经尝试：
1. [你试过的方法]

请帮我：
1. 分析错误原因
2. 给出修复方案
3. 解释为什么会出这个错
```

## 小结

- **先收集信息再求助** — 越完整的信息，AI 越能帮到你
- **理解原因比修复更重要** — 下次遇到类似问题就能自己解决
- **console.log 是你的好朋友** — 不确定时就打印看看
- 调试能力是区分新手和进阶开发者的关键技能
