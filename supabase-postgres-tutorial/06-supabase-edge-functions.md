# 第六章：Supabase Edge Functions 与集成

## 课程大纲

1. Edge Functions 基础
2. 编写与部署
3. 常见使用场景
4. 数据库 Webhook
5. pg_cron 定时任务
6. 常用 PostgreSQL 扩展
7. 第三方集成

---

## 6.1 Edge Functions 基础

Edge Functions 是运行在 Deno Runtime 上的无服务器函数，部署在全球边缘节点。

### 特点

```
- 基于 Deno, 支持 TypeScript
- 全球边缘部署, 低延迟
- 可以访问 Supabase 客户端
- 支持 npm 包 (通过 npm: specifier)
- 请求超时: 默认 60 秒 (可配置)
- 内存限制: 150MB
```

### 创建 Edge Function

```bash
# 创建新函数
supabase functions new send-email

# 生成的文件结构:
# supabase/functions/send-email/index.ts
```

---

## 6.2 编写与部署

### 基本结构

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // CORS 处理
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // 获取请求体
    const { to, subject, body } = await req.json()

    // 创建 Supabase 客户端 (继承请求者的权限)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 业务逻辑...
    // 例如调用第三方邮件 API
    const result = await sendEmail(to, subject, body)

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### 使用 Admin 客户端

```typescript
// 使用 service_role key (绕过 RLS)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// 可以执行管理操作
const { data } = await supabaseAdmin
  .from('users')
  .select('*')      // 绕过 RLS
```

### 本地开发与部署

```bash
# 本地运行 (热重载)
supabase functions serve

# 本地运行指定函数
supabase functions serve send-email --env-file .env.local

# 部署单个函数
supabase functions deploy send-email

# 部署所有函数
supabase functions deploy

# 设置密钥
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set STRIPE_SECRET_KEY=sk_xxxxx

# 查看密钥
supabase secrets list
```

### 客户端调用

```typescript
// 调用 Edge Function
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Hello',
    body: 'World',
  },
})

// 带自定义 headers
const { data, error } = await supabase.functions.invoke('my-function', {
  body: { key: 'value' },
  headers: { 'x-custom-header': 'custom-value' },
})

// 不需要认证的函数调用
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/public-function`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ key: 'value' }),
  }
)
```

---

## 6.3 常见使用场景

### 场景 1: 支付处理 (Stripe)

```typescript
// supabase/functions/create-checkout/index.ts
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const supabase = createClient(/* ... */)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${req.headers.get('origin')}/success`,
    cancel_url: `${req.headers.get('origin')}/cancel`,
    metadata: { user_id: user.id },
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 场景 2: AI 集成 (OpenAI)

```typescript
// supabase/functions/ai-chat/index.ts
serve(async (req) => {
  const { messages } = await req.json()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      stream: true,
    }),
  })

  // 流式返回
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
})
```

### 场景 3: 图片处理

```typescript
// supabase/functions/resize-image/index.ts
import { ImageMagick, initialize } from 'https://deno.land/x/imagemagick_deno/mod.ts'

await initialize()

serve(async (req) => {
  const { bucket, path, width, height } = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 下载原图
  const { data: fileData } = await supabaseAdmin.storage
    .from(bucket)
    .download(path)

  const buffer = await fileData!.arrayBuffer()

  // 调整大小
  const resizedImage = await ImageMagick.read(new Uint8Array(buffer), (img) => {
    img.resize(width, height)
    return img.write((data) => new Uint8Array(data))
  })

  // 上传处理后的图片
  const newPath = path.replace(/(\.[^.]+)$/, `_${width}x${height}$1`)
  await supabaseAdmin.storage
    .from(bucket)
    .upload(newPath, resizedImage, { upsert: true })

  return new Response(JSON.stringify({ path: newPath }))
})
```

---

## 6.4 数据库 Webhook

数据库 Webhook 可以在数据变更时自动触发 Edge Function。

### 通过 SQL 创建 Webhook 触发器

```sql
-- 创建一个 webhook 函数, 在数据变更时调用 Edge Function
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload JSONB;
BEGIN
  payload = jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', to_jsonb(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
  );

  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
```

---

## 6.5 pg_cron 定时任务

pg_cron 是 PostgreSQL 的定时任务扩展，在 Supabase 中开箱即用。

```sql
-- 启用扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建定时任务
-- 每天凌晨清理过期会话
SELECT cron.schedule(
  'clean-expired-sessions',                      -- 任务名
  '0 0 * * *',                                    -- cron 表达式 (每天午夜)
  $$ DELETE FROM sessions WHERE expires_at < now() $$
);

-- 每15分钟刷新物化视图
SELECT cron.schedule(
  'refresh-stats',
  '*/15 * * * *',
  $$ REFRESH MATERIALIZED VIEW CONCURRENTLY author_stats $$
);

-- 每周一发送周报 (调用 Edge Function)
SELECT cron.schedule(
  'weekly-report',
  '0 9 * * 1',                                    -- 每周一早上9点
  $$
    SELECT net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/weekly-report',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer xxx"}'::jsonb,
      body := '{}'::jsonb
    )
  $$
);

-- 查看所有定时任务
SELECT * FROM cron.job;

-- 查看任务执行历史
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- 删除定时任务
SELECT cron.unschedule('clean-expired-sessions');

-- Cron 表达式说明:
-- ┌───────────── 分钟 (0-59)
-- │ ┌───────────── 小时 (0-23)
-- │ │ ┌───────────── 日 (1-31)
-- │ │ │ ┌───────────── 月 (1-12)
-- │ │ │ │ ┌───────────── 星期 (0-7, 0和7都是周日)
-- │ │ │ │ │
-- * * * * *
--
-- 常见示例:
-- */5 * * * *    每5分钟
-- 0 * * * *      每小时
-- 0 0 * * *      每天午夜
-- 0 9 * * 1-5    工作日早上9点
-- 0 0 1 * *      每月1号
```

---

## 6.6 常用 PostgreSQL 扩展

Supabase 预装了大量有用的扩展。

```sql
-- 查看可用扩展
SELECT * FROM pg_available_extensions ORDER BY name;

-- 查看已安装扩展
SELECT * FROM pg_extension;
```

### 常用扩展

```sql
-- 1. uuid-ossp: UUID 生成
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT uuid_generate_v4();

-- 2. pgcrypto: 加密函数
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SELECT crypt('my-password', gen_salt('bf'));              -- 密码哈希
SELECT encode(digest('data', 'sha256'), 'hex');           -- SHA256

-- 3. pg_trgm: 模糊搜索/相似度
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_posts_title_trgm ON posts USING GIN (title gin_trgm_ops);
SELECT title, similarity(title, 'postgre') AS sim
FROM posts
WHERE title % 'postgre'    -- 相似度搜索
ORDER BY sim DESC;

-- 4. btree_gist: GiST 索引扩展
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- 支持排除约束 (见第一章)

-- 5. pg_stat_statements: 查询统计
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;

-- 6. http: HTTP 请求 (pg_net)
-- Supabase 使用 pg_net 扩展
CREATE EXTENSION IF NOT EXISTS pg_net;
SELECT net.http_post(
  url := 'https://api.example.com/webhook',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body := '{"event": "test"}'::jsonb
);

-- 7. vector (pgvector): 向量搜索 (AI 应用)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content  TEXT,
  embedding VECTOR(1536)    -- OpenAI ada-002 维度
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 语义搜索
SELECT id, content, 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;
```

---

## 6.7 第三方集成

### Next.js 集成

```bash
npm install @supabase/ssr @supabase/supabase-js
```

```typescript
// lib/supabase/server.ts (Next.js App Router)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中无法设置 cookie
          }
        },
      },
    }
  )
}

// lib/supabase/client.ts (客户端)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// middleware.ts (刷新过期 session)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### 与其他服务集成

```typescript
// Resend (邮件)
import { Resend } from 'npm:resend'
const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// Stripe (支付)
import Stripe from 'npm:stripe'
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

// OpenAI
import OpenAI from 'npm:openai'
const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

// Twilio (短信)
// 通过 REST API 调用
```
