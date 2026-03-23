# 05 — 数据库基础

> 学习目标：理解关系型数据库的核心概念，掌握 SQL 基础和 Supabase 的使用。

## 什么是数据库

数据库 = 有组织的数据存储系统。就像一个有很多张工作表的 Excel 文件。

```
数据库（Database）
├── 表（Table）= 一张工作表
│   ├── 列（Column）= 表头（字段名和类型）
│   └── 行（Row）= 一条数据记录
```

## SQL 基础

SQL（Structured Query Language）是操作数据库的语言。

### 查询数据（SELECT）

```sql
-- 查询所有用户
SELECT * FROM users;

-- 查询指定字段
SELECT name, email FROM users;

-- 带条件查询
SELECT * FROM users WHERE age > 18;

-- 排序
SELECT * FROM messages ORDER BY created_at DESC;

-- 限制数量
SELECT * FROM messages LIMIT 10;

-- 组合条件
SELECT * FROM messages
WHERE role = 'user'
  AND conversation_id = 'xxx'
ORDER BY created_at ASC;
```

### 插入数据（INSERT）

```sql
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

-- 插入多条
INSERT INTO users (name, email) VALUES
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com');
```

### 更新数据（UPDATE）

```sql
-- 更新指定记录
UPDATE users SET name = 'Alice Wang' WHERE id = '123';

-- 更新多个字段
UPDATE users SET name = 'Alice Wang', age = 26 WHERE id = '123';
```

### 删除数据（DELETE）

```sql
-- 删除指定记录
DELETE FROM users WHERE id = '123';

-- ⚠️ 没有 WHERE 会删除所有数据！
-- DELETE FROM users;  -- 千万小心！
```

### 关联查询（JOIN）

```sql
-- 查询消息及其所属对话
SELECT messages.content, conversations.title
FROM messages
JOIN conversations ON messages.conversation_id = conversations.id
WHERE conversations.id = 'xxx';
```

## Schema 设计

### 基本原则

1. **每张表有一个主键（Primary Key）** — 通常是 `id`
2. **用外键（Foreign Key）关联表** — 如 `conversation_id` 关联到 `conversations` 表
3. **选择合适的数据类型** — 数字用 `integer`、文字用 `text`、日期用 `timestamp`

### 常用数据类型

| 类型 | 用途 | 例子 |
|------|------|------|
| `uuid` | 唯一标识符 | 主键 |
| `text` | 文本 | 名字、内容 |
| `integer` | 整数 | 年龄、数量 |
| `boolean` | 布尔值 | 是否激活 |
| `timestamp` | 时间戳 | 创建时间 |
| `jsonb` | JSON 数据 | 灵活的结构化数据 |

### 设计示例：聊天应用

```sql
-- 用户表
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 对话表
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text DEFAULT '新对话',
  created_at timestamp with time zone DEFAULT now()
);

-- 消息表
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
```

关系图：

```
users  1 ←→ N  conversations  1 ←→ N  messages
一个用户有多个对话         一个对话有多条消息
```

## Supabase 中使用数据库

### 通过 JavaScript 客户端

```typescript
import { supabase } from '@/lib/supabase';

// 查询
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true });

// 插入
const { data, error } = await supabase
  .from('messages')
  .insert({ conversation_id: id, role: 'user', content: '你好' })
  .select()
  .single();

// 更新
const { error } = await supabase
  .from('conversations')
  .update({ title: '新标题' })
  .eq('id', conversationId);

// 删除
const { error } = await supabase
  .from('conversations')
  .delete()
  .eq('id', conversationId);
```

### 行级安全（RLS）

RLS 控制用户只能访问自己的数据：

```sql
-- 启用 RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的对话
CREATE POLICY "用户只能查看自己的对话" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的对话
CREATE POLICY "用户只能创建自己的对话" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 小结

- **SQL** 是操作数据库的标准语言：`SELECT`、`INSERT`、`UPDATE`、`DELETE`
- **Schema 设计**要考虑表之间的关系（一对多、多对多）
- **Supabase** 提供了 JavaScript 客户端，不用直接写 SQL
- **RLS** 在数据库层面保证数据安全
- 数据库设计没有唯一正确答案，但有最佳实践
