# 03 — 前端核心知识

> 学习目标：理解 React 组件模型和 Next.js 的核心概念。

## React 的核心思想

React 的一句话总结：**UI = f(state)**

界面是数据（state）的函数。数据变了，界面自动更新。

## 组件（Component）

组件是 React 的基本单元。一个组件 = 一段可复用的 UI。

```tsx
// 最简单的组件
function Welcome() {
  return <h1>欢迎使用 AI 聊天</h1>;
}

// 带参数的组件
interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant";
}

function MessageBubble({ content, role }: MessageBubbleProps) {
  return (
    <div className={role === "user" ? "bg-blue-500 text-white" : "bg-gray-100"}>
      {content}
    </div>
  );
}

// 使用组件
function ChatPage() {
  return (
    <div>
      <MessageBubble content="你好" role="user" />
      <MessageBubble content="你好！有什么我可以帮你的？" role="assistant" />
    </div>
  );
}
```

### Props（属性）

Props 是父组件传给子组件的数据，**只读，不能修改**。

```tsx
// 父组件传 props
<MessageBubble content="你好" role="user" />

// 子组件接收 props
function MessageBubble({ content, role }: MessageBubbleProps) { ... }
```

## State（状态）

State 是组件内部的可变数据。State 变了，组件自动重新渲染。

```tsx
'use client';
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);  // [当前值, 设置函数]

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}
```

### 常用的 React Hooks

```tsx
// useState — 管理简单状态
const [value, setValue] = useState(initialValue);

// useEffect — 副作用（数据获取、订阅等）
useEffect(() => {
  // 组件挂载时执行
  fetchData();

  return () => {
    // 组件卸载时清理（可选）
  };
}, [dependency]); // 依赖变化时重新执行

// useRef — 引用 DOM 元素或保存不触发渲染的值
const inputRef = useRef<HTMLInputElement>(null);
```

## Next.js 核心概念

### App Router 路由

文件夹结构 = URL 结构：

```
app/
├── page.tsx              →  /
├── chat/
│   └── page.tsx          →  /chat
├── agent/
│   └── page.tsx          →  /agent
├── auth/
│   ├── login/
│   │   └── page.tsx      →  /auth/login
│   └── signup/
│       └── page.tsx      →  /auth/signup
└── api/
    └── chat/
        └── route.ts      →  /api/chat (API 端点)
```

### Server Components vs Client Components

Next.js App Router 默认所有组件是 **Server Component**：

```tsx
// Server Component（默认）— 在服务器上渲染
// ✅ 可以直接访问数据库
// ✅ 不会发送到浏览器，减少 JS 包大小
// ❌ 不能用 useState、useEffect、事件处理

async function UserList() {
  const users = await db.query('SELECT * FROM users');
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

```tsx
// Client Component — 加 'use client' 声明
// ✅ 可以用 hooks、事件处理、浏览器 API
// ❌ 不能直接访问数据库

'use client';
import { useState } from 'react';

function ChatInput() {
  const [input, setInput] = useState('');
  return <input value={input} onChange={e => setInput(e.target.value)} />;
}
```

**简单规则：需要交互（点击、输入、动画）→ Client Component，其余用 Server Component。**

### Layout

`layout.tsx` 是页面的共享外壳：

```tsx
// app/layout.tsx — 全局布局
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <nav>导航栏</nav>
        {children}         {/* 这里放页面内容 */}
        <footer>页脚</footer>
      </body>
    </html>
  );
}
```

## 样式：Tailwind CSS

Tailwind 用 class 名直接写样式，不需要单独的 CSS 文件：

```tsx
// 常用 Tailwind class
<div className="
  flex              // display: flex
  items-center      // align-items: center
  justify-between   // justify-content: space-between
  p-4               // padding: 1rem
  bg-white          // background: white
  rounded-lg        // border-radius: 0.5rem
  shadow            // box-shadow
  hover:bg-gray-50  // 悬停时的背景色
  text-sm           // 小号文字
  font-bold         // 粗体
">
  内容
</div>
```

不需要记住所有 class 名。安装 **Tailwind CSS IntelliSense** 扩展，会自动提示。

## 数据获取

```tsx
// Server Component 中直接 fetch（推荐）
async function PostList() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return <div>{/* 渲染 posts */}</div>;
}

// Client Component 中用 useEffect
'use client';
function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  return <div>{/* 渲染 posts */}</div>;
}
```

## 小结

- **组件** = 可复用的 UI 块，通过 Props 传递数据
- **State** = 组件内部的可变数据，变化触发重新渲染
- **Server vs Client Component** — 需要交互的用 Client，其余用 Server
- **App Router** — 文件夹结构决定 URL
- **Tailwind CSS** — 用 class 名写样式，简单高效
- 不需要一次学完 React 的所有 API，先掌握这些核心概念即可
