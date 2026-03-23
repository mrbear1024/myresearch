# 04 — 软件工程中的伟大思想

> 学习目标：理解抽象、分层、分治等计算机科学的核心思维方式，这些思想贯穿所有软件工程实践。

## 为什么这些思想重要

编程语言和框架每几年就换一批，但底层的思维方式几十年没变。掌握这些思想，你就拥有了**理解任何新技术的底层能力**。

这些思想不仅用在写代码上——需求分析、系统设计、团队管理，处处都在用它们。

## 1. 抽象（Abstraction）

> 隐藏复杂性，只暴露必要的接口。

抽象是计算机科学中最强大的思想，没有之一。

### 日常类比

你开车时不需要理解发动机的工作原理——方向盘、油门、刹车就是汽车的「抽象接口」。

### 在编程中

```typescript
// 底层细节：HTTP 请求、JSON 解析、错误处理、重试逻辑...
// 抽象之后：一个简单的函数调用
const user = await getUser(userId);
```

你不需要知道 `getUser` 内部是用 REST 还是 GraphQL、是连数据库还是调缓存。你只需要知道：给它 userId，它返回 user。

### 抽象的层次

```
你写的代码
  ↓ 调用
React / Next.js（框架抽象了 DOM 操作和路由）
  ↓ 调用
JavaScript（语言抽象了内存管理和系统调用）
  ↓ 调用
V8 引擎（抽象了机器码生成）
  ↓ 运行在
操作系统（抽象了硬件）
  ↓ 运行在
CPU / 内存 / 硬盘
```

每一层都隐藏了下面的复杂性，让你只关注当前层的问题。

### 好的抽象 vs 坏的抽象

```typescript
// ✅ 好的抽象：接口清晰，隐藏了复杂性
await sendEmail(to, subject, body);

// ❌ 泄漏的抽象：使用者需要了解内部实现
await sendEmail(to, subject, body, smtpHost, smtpPort, authToken, retryCount);

// ❌ 过度抽象：为了抽象而抽象，增加了理解成本
await new EmailServiceFactory()
  .createBuilder()
  .withRecipient(to)
  .withSubject(subject)
  .withBody(body)
  .build()
  .send();
```

> 💡 Joel Spolsky 的「抽象泄漏定律」：所有非平凡的抽象在某种程度上都是泄漏的。完美的抽象不存在，但好的抽象大多数时候能工作。

## 2. 分层（Layering）

> 将系统组织成一层一层的结构，每层只和相邻的层交互。

### 经典的三层架构

```
┌─────────────────────────┐
│    展示层（UI）           │  用户看到的界面
├─────────────────────────┤
│    业务逻辑层             │  规则和流程
├─────────────────────────┤
│    数据访问层             │  数据库操作
└─────────────────────────┘
```

### 在 Next.js 项目中

```
┌─────────────────────────┐
│  React 组件              │  pages, components
│  （展示层）               │  只关心 UI 如何渲染
├─────────────────────────┤
│  Server Actions / API    │  app/api/, lib/
│  （业务逻辑层）           │  处理业务规则和数据转换
├─────────────────────────┤
│  Supabase Client         │  lib/db.ts
│  （数据访问层）           │  只关心数据如何存取
└─────────────────────────┘
```

### 分层的价值

- **替换某一层不影响其他层**：换数据库不需要改 UI，改 UI 不需要动数据库
- **关注点隔离**：每层的开发者只需要理解自己那层
- **可测试**：可以单独测试每一层

### 网络协议的分层（TCP/IP）

分层思想最经典的应用：

```
应用层（HTTP）    — 你的 Web 应用
传输层（TCP）     — 可靠传输
网络层（IP）      — 寻址和路由
链路层（以太网）   — 物理传输
```

每次你打开一个网页，数据都经过这四层的封装和解封，但你完全不需要知道底层细节。

## 3. 分治（Divide and Conquer）

> 把一个大问题分解成多个小问题，分别解决，再合并结果。

### 核心思路

```
大问题
├── 子问题 A → 解决 A
├── 子问题 B → 解决 B
└── 子问题 C → 解决 C
    合并 A + B + C → 大问题解决
```

### 在开发中

```
"做一个电商网站"（太大了，无从下手）

分治之后：
├── 用户系统（注册、登录、个人信息）
├── 商品系统（列表、详情、搜索）
├── 购物车（添加、删除、数量）
├── 订单系统（下单、支付、退款）
└── 后台管理（商品管理、订单管理）

每个子系统再继续分：
用户系统
├── 注册功能
│   ├── 注册表单（前端）
│   ├── 注册 API（后端）
│   └── 用户表设计（数据库）
├── 登录功能
└── 个人信息功能
```

### 与 AI 编程的关系

分治是**用 AI 编程最重要的技能**。AI 不擅长一次性完成巨大的任务，但擅长做一个个清晰的小任务：

```
❌ "帮我做一个电商网站"
✅ "帮我做用户注册功能：一个注册表单 + 调用 Supabase Auth 的注册 API"
```

## 4. 封装（Encapsulation）

> 把数据和操作数据的方法绑定在一起，对外隐藏内部状态。

### 在 React 中

```typescript
// useState 就是封装的典型例子
const [count, setCount] = useState(0);
// 你不需要知道 React 内部如何存储和更新 count
// 你只需要通过 setCount 来修改它

// 自定义 Hook 封装复杂逻辑
function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(content: string) {
    setIsLoading(true);
    // ... 复杂的发送逻辑
    setIsLoading(false);
  }

  return { messages, isLoading, sendMessage };
}

// 使用时，不需要关心内部实现
const { messages, isLoading, sendMessage } = useChat();
```

## 5. 接口与契约（Interface & Contract）

> 定义「做什么」和「怎么做」之间的边界。

### 接口是一种承诺

```typescript
// 接口定义了「做什么」
interface MessageService {
  send(message: string): Promise<void>;
  getHistory(): Promise<Message[]>;
}

// 实现定义了「怎么做」—— 可以有多种实现
class SupabaseMessageService implements MessageService {
  async send(message: string) { /* Supabase 实现 */ }
  async getHistory() { /* Supabase 实现 */ }
}

class LocalMessageService implements MessageService {
  async send(message: string) { /* 本地存储实现 */ }
  async getHistory() { /* 本地存储实现 */ }
}
```

### API 就是接口

```
POST /api/chat
请求：{ message: "你好" }
响应：{ reply: "你好！有什么可以帮你的？" }
```

前端不关心后端用什么语言、什么数据库。只要接口（URL、请求格式、响应格式）不变，前后端可以独立变化。

## 6. 组合优于继承（Composition over Inheritance）

> 用小的、独立的部分组合出复杂的功能，而不是通过继承构建层级关系。

### React 就是组合的典范

```tsx
// 小组件
function Avatar({ url }) { return <img src={url} /> }
function Name({ name }) { return <span>{name}</span> }
function Badge({ role }) { return <span>{role}</span> }

// 组合成大组件
function UserCard({ user }) {
  return (
    <div>
      <Avatar url={user.avatar} />
      <Name name={user.name} />
      <Badge role={user.role} />
    </div>
  );
}

// 再组合成更大的组件
function UserList({ users }) {
  return users.map(user => <UserCard key={user.id} user={user} />);
}
```

### Unix 哲学

```bash
# 每个命令只做一件事，通过管道组合
cat access.log | grep "ERROR" | sort | uniq -c | sort -rn | head -10
```

这就是组合的力量——简单的工具通过组合完成复杂的任务。

## 7. 单一职责（Single Responsibility）

> 一个模块应该只有一个改变的理由。

```typescript
// ❌ 这个函数做了太多事情
async function handleUserAction(action: string, data: any) {
  if (action === 'login') { /* 登录逻辑 */ }
  if (action === 'register') { /* 注册逻辑 */ }
  if (action === 'resetPassword') { /* 重置密码逻辑 */ }
  // 记录日志
  // 发送通知
  // 更新统计
}

// ✅ 每个函数只做一件事
async function login(credentials: Credentials) { /* 只处理登录 */ }
async function register(userData: UserData) { /* 只处理注册 */ }
async function resetPassword(email: string) { /* 只处理重置密码 */ }
```

## 这些思想之间的关系

```
           抽象
          /    \
       分层    封装
        |       |
      接口    组合
        \     /
        分治
         |
      单一职责
```

它们不是孤立的，而是相互支撑：
- **抽象** 是基础——所有其他思想都是抽象的具体应用
- **分层** 是纵向的抽象——不同层次的关注点分离
- **分治** 是横向的分解——把大问题拆成小问题
- **封装** 保护抽象的边界——隐藏内部实现
- **接口** 定义抽象的契约——承诺做什么
- **组合** 用抽象构建更大的抽象——小积木搭大房子
- **单一职责** 确保每个抽象足够小——一个模块一件事

## 关键收获

1. **抽象**：隐藏复杂性，只暴露必要的接口
2. **分层**：系统分层组织，每层只关心自己的事
3. **分治**：大问题拆成小问题，逐个解决
4. **封装**：数据和操作绑定，对外隐藏内部状态
5. **接口**：定义「做什么」和「怎么做」之间的边界
6. **组合**：用简单的部分拼出复杂的功能
7. **单一职责**：一个模块只做一件事

> 这些思想不只是编程技巧，更是一种**解决复杂问题的思维方式**。无论你将来用什么语言、什么框架，这些思想都会伴随你的整个职业生涯。

## 延伸阅读

- 《计算机程序的构造和解释》（SICP） — Harold Abelson
- 《代码大全》（Code Complete） — Steve McConnell
- 《Unix 编程艺术》（The Art of UNIX Programming） — Eric Raymond
