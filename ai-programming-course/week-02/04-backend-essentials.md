# 04 — 后端核心知识

> 学习目标：理解后端开发的核心概念，包括 API 路由、Server Actions、认证。

## 什么是后端

**前端** = 用户看到和交互的界面（浏览器中运行）
**后端** = 处理数据和业务逻辑的服务（服务器上运行）

```
浏览器（前端）  ←→  服务器（后端）  ←→  数据库
     UI              业务逻辑            数据存储
```

## Next.js 中的后端

Next.js 让你在同一个项目中写前后端代码。

### Route Handlers（API 路由）

在 `app/api/` 目录下创建后端接口：

```typescript
// app/api/users/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/users — 获取用户列表
export async function GET() {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/users — 创建新用户
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: '缺少必填字段' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ name, email })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

### Server Actions

Next.js 14+ 的新方式，直接在服务端执行函数：

```typescript
// app/actions.ts
'use server';

import { supabase } from '@/lib/supabase';

export async function createMessage(content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ content, role: 'user' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
```

```tsx
// 在组件中直接调用
'use client';
import { createMessage } from './actions';

function ChatForm() {
  async function handleSubmit(formData: FormData) {
    const content = formData.get('content') as string;
    await createMessage(content);
  }

  return (
    <form action={handleSubmit}>
      <input name="content" />
      <button type="submit">发送</button>
    </form>
  );
}
```

## HTTP 方法

| 方法 | 用途 | 例子 |
|------|------|------|
| GET | 获取数据 | 获取用户列表 |
| POST | 创建数据 | 注册新用户 |
| PUT | 更新全部数据 | 更新用户信息 |
| PATCH | 更新部分数据 | 只改用户名 |
| DELETE | 删除数据 | 删除用户 |

## 请求和响应

```typescript
// 请求（Request）
// 前端发送
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
});

// 响应（Response）
const data = await response.json();
console.log(data); // { id: '1', name: 'Alice', email: 'alice@example.com' }
```

## 状态码

| 状态码 | 含义 | 常见场景 |
|--------|------|---------|
| 200 | 成功 | 请求成功 |
| 201 | 已创建 | 新资源创建成功 |
| 400 | 错误请求 | 参数不对 |
| 401 | 未认证 | 没有登录 |
| 403 | 禁止访问 | 没有权限 |
| 404 | 未找到 | 资源不存在 |
| 500 | 服务器错误 | 后端代码出 bug |

## 认证（Authentication）

使用 Supabase Auth 实现用户认证：

```typescript
// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser();

// 退出
await supabase.auth.signOut();
```

## 中间件（Middleware）

中间件在请求到达页面之前执行，常用于认证检查：

```typescript
// middleware.ts（放在项目根目录）
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  // 如果没有登录，重定向到登录页
  if (!token && request.nextUrl.pathname.startsWith('/chat')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/agent/:path*'],
};
```

## 环境变量

```bash
# .env.local

# 服务端变量（不暴露给浏览器）
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# 客户端变量（浏览器可见，前缀 NEXT_PUBLIC_）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**安全规则：API 密钥、数据库密码等敏感信息，绝不使用 `NEXT_PUBLIC_` 前缀。**

## 小结

- **API 路由**处理 HTTP 请求，是前后端通信的桥梁
- **Server Actions** 是 Next.js 简化后端操作的新方式
- **HTTP 方法和状态码**是理解 API 通信的基础
- **认证**验证用户身份，**中间件**保护需要登录的页面
- **环境变量**分客户端和服务端，敏感信息只放服务端
