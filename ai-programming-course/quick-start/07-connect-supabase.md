# 07 — 接入 Supabase 后端

> 学习目标：将 Supabase 集成到项目中，实现聊天记录的持久化存储。

## 为什么需要后端

目前我们的聊天应用有个问题：刷新页面后，所有聊天记录都消失了。因为数据只存在浏览器内存中。

我们需要一个数据库来保存聊天记录。Supabase 提供了现成的 PostgreSQL 数据库。

## 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)，注册/登录
2. 点击 **New Project**
3. 填写项目名称，选择区域（推荐选离你最近的），设置数据库密码
4. 等待项目创建完成（约 1-2 分钟）

## 第二步：创建数据库表

在 Supabase Dashboard 中，进入 **SQL Editor**，运行以下 SQL：

```sql
-- 创建聊天会话表
create table conversations (
  id uuid default gen_random_uuid() primary key,
  title text default '新对话',
  created_at timestamp with time zone default now()
);

-- 创建消息表
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- 启用行级安全（暂时允许所有操作，后续会加认证）
alter table conversations enable row level security;
alter table messages enable row level security;

-- 临时策略：允许所有操作（学习用，生产环境需要更严格的策略）
create policy "允许所有操作" on conversations for all using (true);
create policy "允许所有操作" on messages for all using (true);
```

## 第三步：获取连接信息

在 Supabase Dashboard → **Settings** → **API**，找到：

- **Project URL**：`https://xxxx.supabase.co`
- **anon public key**：`eyJhbGci...`

添加到 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
```

## 第四步：创建 Supabase 客户端

创建文件 `lib/supabase.ts`：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## 第五步：保存和加载聊天记录

创建文件 `lib/chat-storage.ts`：

```typescript
import { supabase } from './supabase';

// 创建新对话
export async function createConversation() {
  const { data, error } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 保存消息
export async function saveMessage(conversationId: string, role: string, content: string) {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content });

  if (error) throw error;
}

// 加载对话的所有消息
export async function loadMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// 获取所有对话列表
export async function listConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

## 第六步：在聊天界面中使用

这部分代码相对复杂，建议**让 AI 帮你完成**：

> "我已经创建了 Supabase 客户端和聊天存储函数（createConversation, saveMessage, loadMessages），请帮我修改聊天页面 app/chat/page.tsx，实现：
> 1. 页面加载时创建新对话
> 2. 用户发送消息时保存到数据库
> 3. AI 回复完成后也保存到数据库
> 把上面的代码也给 AI 作为上下文。"

## 验证

1. 发送几条消息
2. 在 Supabase Dashboard → **Table Editor** 中查看 `messages` 表
3. 你应该能看到刚才的聊天记录
4. 刷新页面后，消息应该还在

## Git 提交

```bash
git add .
git commit -m "接入 Supabase，实现聊天记录持久化"
```

## 小结

你的应用现在有了真正的后端！聊天记录保存在 Supabase 的 PostgreSQL 数据库中。关键概念：

- **数据库表（Table）** — 像 Excel 表格，存储结构化数据
- **SQL** — 操作数据库的语言
- **CRUD** — Create（创建）、Read（读取）、Update（更新）、Delete（删除）
- **RLS（行级安全）** — 控制谁能访问哪些数据
