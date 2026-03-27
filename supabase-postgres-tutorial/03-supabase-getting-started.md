# 第三章：Supabase 平台入门与架构

## 课程大纲

1. Supabase 架构概览
2. 项目创建与配置
3. 客户端 SDK 使用
4. 数据库操作 (CRUD)
5. 数据库迁移与管理
6. Supabase CLI

---

## 3.1 Supabase 架构概览

Supabase 是一个开源的 Firebase 替代方案，基于 PostgreSQL 构建。

### 核心组件

```
┌────────────────────────────────────────────────────────┐
│                    客户端应用                            │
│           (Web / Mobile / Server)                       │
└──────────┬────────────┬────────────┬──────────────┬────┘
           │            │            │              │
    ┌──────▼──────┐ ┌──▼──────┐ ┌──▼─────┐  ┌────▼────┐
    │  PostgREST  │ │ GoTrue  │ │Realtime│  │ Storage │
    │  (REST API) │ │ (Auth)  │ │  (WS)  │  │  (S3)   │
    └──────┬──────┘ └──┬──────┘ └──┬─────┘  └────┬────┘
           │            │            │              │
    ┌──────▼────────────▼────────────▼──────────────▼────┐
    │                  PostgreSQL                         │
    │           (核心数据库 + 扩展)                        │
    └────────────────────────────────────────────────────┘
```

| 组件 | 作用 | 技术 |
|------|------|------|
| **PostgreSQL** | 核心数据库 | PostgreSQL 15+ |
| **PostgREST** | 自动生成 REST API | 基于数据库 schema 自动映射 |
| **GoTrue** | 认证服务 | JWT + OAuth |
| **Realtime** | 实时数据推送 | WebSocket + PostgreSQL CDC |
| **Storage** | 文件存储 | S3 兼容 |
| **Edge Functions** | 无服务器函数 | Deno Runtime |
| **pg_graphql** | GraphQL API | PostgreSQL 扩展 |
| **Kong** | API 网关 | 路由、限流、认证 |

### Supabase 与直接使用 PostgreSQL 的区别

```
Supabase 在 PostgreSQL 之上提供:
1. 自动 REST API (无需写后端代码)
2. 内置认证系统 (支持 Email/OAuth/Magic Link)
3. 行级安全策略 (RLS) 直接在数据库层面控制权限
4. 实时订阅 (数据变更自动推送到客户端)
5. 文件存储 (与数据库权限系统集成)
6. Dashboard (可视化管理数据库)
7. 自动数据库备份
8. 连接池 (内置 PgBouncer)
```

---

## 3.2 项目创建与配置

### 在线创建 (supabase.com)

1. 注册 Supabase 账号
2. 创建新项目，选择区域和密码
3. 等待数据库初始化完成
4. 获取项目 URL 和 API Key

### 本地开发 (推荐)

```bash
# 安装 Supabase CLI
npm install -g supabase

# 初始化项目
supabase init

# 启动本地开发环境 (需要 Docker)
supabase start

# 输出类似:
#   API URL: http://127.0.0.1:54321
#   GraphQL URL: http://127.0.0.1:54321/graphql/v1
#   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
#   Studio URL: http://127.0.0.1:54323
#   anon key: eyJ...
#   service_role key: eyJ...

# 停止
supabase stop

# 查看状态
supabase status
```

### 项目结构

```
my-app/
├── supabase/
│   ├── config.toml          # Supabase 项目配置
│   ├── migrations/           # 数据库迁移文件
│   │   ├── 20250101000000_create_users.sql
│   │   └── 20250102000000_create_posts.sql
│   ├── seed.sql              # 种子数据
│   └── functions/            # Edge Functions
│       └── hello/
│           └── index.ts
├── src/                      # 应用代码
│   └── lib/
│       └── supabase.ts       # Supabase 客户端初始化
├── .env.local                # 环境变量
└── package.json
```

---

## 3.3 客户端 SDK

### 安装

```bash
# JavaScript/TypeScript
npm install @supabase/supabase-js

# Python
pip install supabase

# Flutter/Dart
flutter pub add supabase_flutter

# Swift
# 通过 Swift Package Manager 添加 supabase-swift

# Kotlin
# 通过 Gradle 添加 io.github.jan-tennert.supabase
```

### 初始化客户端

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 类型安全: 使用 CLI 生成的类型
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 服务端使用 (有完整权限, 绕过 RLS)
// 注意: 永远不要在客户端暴露 service_role key
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
```

### 生成 TypeScript 类型

```bash
# 从远程数据库生成
supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts

# 从本地数据库生成
supabase gen types typescript --local > src/lib/database.types.ts
```

---

## 3.4 数据库 CRUD 操作 (Supabase Client)

### 查询数据 (SELECT)

```typescript
// 基本查询
const { data, error } = await supabase
  .from('posts')
  .select('*')

// 选择特定列
const { data } = await supabase
  .from('posts')
  .select('id, title, slug, created_at')

// 关联查询 (JOIN)
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    content,
    published_at,
    author:users!author_id (
      id,
      username,
      avatar_url
    ),
    comments (
      id,
      content,
      user:users!user_id (username)
    ),
    likes:post_likes (count)
  `)
  .eq('status', 'published')
  .order('published_at', { ascending: false })

// 过滤条件
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')             // status = 'published'
  .neq('author_id', 5)                    // author_id != 5
  .gt('view_count', 100)                  // view_count > 100
  .gte('view_count', 100)                 // view_count >= 100
  .lt('created_at', '2025-01-01')         // created_at < '2025-01-01'
  .lte('created_at', '2025-12-31')        // created_at <= '2025-12-31'
  .like('title', '%PostgreSQL%')           // title LIKE '%PostgreSQL%'
  .ilike('title', '%postgresql%')          // title ILIKE (不区分大小写)
  .is('published_at', null)                // published_at IS NULL
  .in('status', ['published', 'draft'])    // status IN (...)
  .contains('tags', ['postgresql'])        // tags @> ARRAY[...]
  .containedBy('tags', ['a', 'b', 'c'])   // tags <@ ARRAY[...]
  .overlaps('tags', ['react', 'vue'])      // tags && ARRAY[...]
  .textSearch('title', 'postgresql & guide') // 全文搜索

// 排序与分页
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })        // 获取总数
  .order('created_at', { ascending: false })
  .range(0, 19)                             // 前20条 (0-indexed)

// OR 条件
const { data } = await supabase
  .from('posts')
  .select('*')
  .or('status.eq.published,status.eq.draft')

// 嵌套 OR + AND
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('author_id', 1)
  .or('status.eq.published,view_count.gt.1000')

// 查询单条数据
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('slug', 'my-post')
  .single()          // 返回单个对象而不是数组, 如果没有匹配或多条则报错

// maybeSingle: 0或1条都不报错
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('slug', 'my-post')
  .maybeSingle()     // 没有匹配返回 null
```

### 插入数据 (INSERT)

```typescript
// 单条插入
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'My New Post',
    content: 'Hello World',
    slug: 'my-new-post',
    author_id: 1,
    tags: ['typescript', 'supabase'],
    metadata: { reading_time: 5 },
  })
  .select()          // 返回插入的数据
  .single()

// 批量插入
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: 'Post 1', slug: 'post-1', author_id: 1 },
    { title: 'Post 2', slug: 'post-2', author_id: 1 },
    { title: 'Post 3', slug: 'post-3', author_id: 2 },
  ])
  .select()

// UPSERT (冲突时更新)
const { data, error } = await supabase
  .from('posts')
  .upsert(
    { slug: 'my-post', title: 'Updated Title', author_id: 1 },
    { onConflict: 'slug' }      // 指定冲突列
  )
  .select()
  .single()

// UPSERT 忽略重复
const { data, error } = await supabase
  .from('posts')
  .upsert(
    { slug: 'my-post', title: 'Updated Title', author_id: 1 },
    { onConflict: 'slug', ignoreDuplicates: true }
  )
```

### 更新数据 (UPDATE)

```typescript
// 基本更新
const { data, error } = await supabase
  .from('posts')
  .update({
    title: 'Updated Title',
    status: 'published',
    published_at: new Date().toISOString(),
  })
  .eq('id', 1)
  .select()
  .single()

// 条件更新
const { data, error } = await supabase
  .from('posts')
  .update({ status: 'archived' })
  .eq('status', 'draft')
  .lt('created_at', '2024-01-01')
  .select()
```

### 删除数据 (DELETE)

```typescript
// 基本删除
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', 1)

// 条件删除
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('status', 'draft')
  .lt('created_at', '2024-01-01')
  .select()          // 返回删除的数据

// 注意: 不带条件的 delete() 会删除所有行(如果 RLS 允许)
// Supabase 默认要求至少有一个过滤条件
```

### 调用 RPC (数据库函数)

```typescript
// 调用自定义函数
const { data, error } = await supabase
  .rpc('get_post_stats', { p_post_id: 1 })

// 调用返回多行的函数
const { data, error } = await supabase
  .rpc('search_posts', { search_term: 'postgresql' })
  .select('*')
  .limit(10)

// 调用无返回值的函数
const { error } = await supabase
  .rpc('increment_view_count', { p_post_id: 1 })
```

---

## 3.5 数据库迁移

### 创建迁移

```bash
# 创建新的迁移文件
supabase migration new create_users_table

# 生成的文件: supabase/migrations/20250101120000_create_users_table.sql
```

### 编写迁移

```sql
-- supabase/migrations/20250101120000_create_users_table.sql

-- 创建用户表
CREATE TABLE public.users (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  username   VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio        TEXT DEFAULT '',
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 创建更新时间戳触发器
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 创建索引
CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_username ON public.users (username);
```

### 管理迁移

```bash
# 查看迁移状态
supabase migration list

# 应用迁移到本地数据库
supabase db reset       # 重置并重新应用所有迁移

# 推送到远程
supabase db push        # 将迁移应用到远程数据库

# 从远程数据库拉取变更 (如果在 Dashboard 中手动修改了表)
supabase db pull        # 生成差异迁移文件

# 查看差异
supabase db diff --use-migra -f my_changes

# 种子数据
# 编辑 supabase/seed.sql, 在 db reset 时自动执行
```

### 种子数据

```sql
-- supabase/seed.sql

INSERT INTO public.users (email, username) VALUES
  ('alice@example.com', 'alice'),
  ('bob@example.com', 'bob'),
  ('charlie@example.com', 'charlie');

INSERT INTO public.posts (title, slug, content, author_id, status) VALUES
  ('First Post', 'first-post', 'Hello World!', 1, 'published'),
  ('Second Post', 'second-post', 'More content', 1, 'draft'),
  ('Bob''s Post', 'bobs-post', 'From Bob', 2, 'published');
```

---

## 3.6 Supabase CLI 常用命令

```bash
# 项目管理
supabase init                  # 初始化项目
supabase start                 # 启动本地服务
supabase stop                  # 停止本地服务
supabase status                # 查看本地服务状态
supabase link --project-ref xxx # 链接远程项目

# 数据库
supabase db reset              # 重置本地数据库
supabase db push               # 推送迁移到远程
supabase db pull               # 从远程拉取变更
supabase db diff               # 查看本地与迁移的差异
supabase db dump --data-only   # 导出数据
supabase db lint               # 检查数据库规范

# 迁移
supabase migration new name    # 创建迁移
supabase migration list        # 列出迁移状态
supabase migration repair      # 修复迁移状态

# 类型生成
supabase gen types typescript --local     # 从本地生成类型
supabase gen types typescript --project-id xxx  # 从远程生成类型

# Edge Functions
supabase functions new hello   # 创建函数
supabase functions serve       # 本地运行
supabase functions deploy hello # 部署函数

# 密钥管理
supabase secrets set MY_KEY=value  # 设置远程密钥
supabase secrets list              # 列出密钥

# 检查
supabase inspect db calls          # 查看数据库统计
supabase inspect db long-running-queries
supabase inspect db table-sizes
supabase inspect db index-sizes
supabase inspect db unused-indexes
```
