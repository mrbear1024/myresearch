# 第四章：Supabase 认证与权限体系

## 课程大纲

1. Supabase Auth 架构
2. 邮箱/密码认证
3. OAuth 社交登录
4. Magic Link 与 OTP
5. 会话管理与 JWT
6. Row Level Security (RLS) 详解
7. RLS 最佳实践

---

## 4.1 Supabase Auth 架构

### 认证流程

```
1. 用户通过 SDK 发起认证请求
2. GoTrue 服务验证凭据
3. 验证成功后颁发 JWT (包含 user_id, role 等信息)
4. 客户端携带 JWT 请求 API
5. PostgREST 从 JWT 提取用户信息
6. PostgreSQL 通过 RLS 策略决定数据访问权限
```

### 核心概念

```
auth.users          -- Supabase 管理的用户表 (不可直接修改)
auth.uid()          -- 获取当前认证用户的 ID
auth.role()         -- 获取当前角色 (anon / authenticated)
auth.jwt()          -- 获取完整 JWT payload

anon key            -- 公开的 API key, 权限受 RLS 限制
service_role key    -- 有完全权限的 key, 绕过 RLS, 仅限服务端使用
```

---

## 4.2 邮箱/密码认证

```typescript
// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password-123',
  options: {
    data: {
      username: 'newuser',      // 自定义元数据, 存储在 raw_user_meta_data
      avatar_url: 'https://...',
    },
    emailRedirectTo: 'https://myapp.com/welcome',  // 邮箱确认后跳转
  },
})
// data.user: 用户对象
// data.session: 如果不需要邮箱确认, 直接返回会话

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password-123',
})
// data.session: { access_token, refresh_token, user, ... }

// 登出
const { error } = await supabase.auth.signOut()

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()

// 获取当前会话
const { data: { session } } = await supabase.auth.getSession()

// 重置密码
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'https://myapp.com/reset-password' }
)

// 更新密码 (用户已登录)
const { error } = await supabase.auth.updateUser({
  password: 'new-password-456',
})

// 更新用户元数据
const { error } = await supabase.auth.updateUser({
  data: { username: 'updated_name' },
})
```

---

## 4.3 OAuth 社交登录

### 支持的 Provider

```
Google, GitHub, GitLab, Bitbucket, Discord, Slack,
Twitter/X, Facebook, Apple, Azure, Keycloak, Notion,
Spotify, Twitch, LinkedIn, Zoom, Figma, Kakao, ...
```

### 配置与使用

```typescript
// 发起 OAuth 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://myapp.com/auth/callback',
    scopes: 'read:user user:email',        // 请求额外权限
    queryParams: {
      access_type: 'offline',               // Google: 获取 refresh_token
      prompt: 'consent',                    // Google: 强制显示授权页
    },
  },
})
// data.url: OAuth 授权页面 URL

// 处理回调 (在 redirectTo 页面)
// Supabase SDK 会自动从 URL fragment 中提取 token
// 如果使用 SSR, 需要手动处理:
const { data, error } = await supabase.auth.exchangeCodeForSession(code)
```

### Next.js / SvelteKit 等框架中的 OAuth 回调处理

```typescript
// app/auth/callback/route.ts (Next.js App Router)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(requestUrl.origin)
}
```

---

## 4.4 Magic Link 与 OTP

```typescript
// Magic Link (邮箱中的登录链接)
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://myapp.com/auth/callback',
    shouldCreateUser: true,    // 如果用户不存在则创建
  },
})

// OTP (一次性验证码)
// 发送验证码到手机
const { error } = await supabase.auth.signInWithOtp({
  phone: '+8613800138000',
})

// 验证 OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+8613800138000',
  token: '123456',
  type: 'sms',
})

// 邮箱 OTP 验证
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
})
// 用户收到6位验证码
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email',
})
```

---

## 4.5 会话管理

```typescript
// 监听认证状态变化
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event)
    // event 值:
    // 'INITIAL_SESSION'    -- 初始加载
    // 'SIGNED_IN'          -- 登录成功
    // 'SIGNED_OUT'         -- 登出
    // 'TOKEN_REFRESHED'    -- Token 刷新
    // 'USER_UPDATED'       -- 用户信息更新
    // 'PASSWORD_RECOVERY'  -- 密码重置

    if (event === 'SIGNED_IN') {
      // 登录后的逻辑
    }
    if (event === 'SIGNED_OUT') {
      // 登出后的逻辑
    }
  }
)

// 取消监听
subscription.unsubscribe()

// 手动刷新会话
const { data, error } = await supabase.auth.refreshSession()

// 设置会话 (用于 SSR 场景)
const { data, error } = await supabase.auth.setSession({
  access_token: 'xxx',
  refresh_token: 'xxx',
})
```

### JWT 结构

```json
{
  "aud": "authenticated",
  "exp": 1700000000,
  "iat": 1699996400,
  "iss": "https://xxx.supabase.co/auth/v1",
  "sub": "user-uuid-here",           // 用户 ID
  "email": "user@example.com",
  "phone": "",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "username": "alice"
  },
  "role": "authenticated"
}
```

---

## 4.6 Row Level Security (RLS) 详解

RLS 是 Supabase 安全模型的核心。它在数据库层面控制每一行数据的访问权限。

### 基本概念

```sql
-- 启用 RLS (Supabase 的表默认应该启用)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 重要: 启用 RLS 后, 如果没有任何策略, 默认拒绝所有访问
-- service_role 不受 RLS 限制

-- 创建策略的语法
CREATE POLICY "策略名称" ON 表名
  FOR 操作类型            -- SELECT / INSERT / UPDATE / DELETE / ALL
  TO 角色                 -- anon / authenticated / 自定义角色
  USING (条件表达式)       -- 读取时的过滤条件 (SELECT/UPDATE/DELETE)
  WITH CHECK (条件表达式); -- 写入时的验证条件 (INSERT/UPDATE)
```

### 常见 RLS 策略模式

#### 模式 1: 公开只读

```sql
-- 任何人都能读取已发布的文章
CREATE POLICY "公开读取已发布文章" ON posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
```

#### 模式 2: 仅认证用户可读

```sql
-- 只有登录用户才能查看
CREATE POLICY "认证用户可读" ON posts
  FOR SELECT
  TO authenticated
  USING (true);
```

#### 模式 3: 用户只能操作自己的数据

```sql
-- 用户只能查看自己的文章（包括草稿）
CREATE POLICY "用户读取自己的文章" ON posts
  FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

-- 用户只能创建自己的文章
CREATE POLICY "用户创建文章" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- 用户只能更新自己的文章
CREATE POLICY "用户更新自己的文章" ON posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())         -- 只能选中自己的文章
  WITH CHECK (author_id = auth.uid());   -- 更新后 author_id 也必须是自己

-- 用户只能删除自己的文章
CREATE POLICY "用户删除自己的文章" ON posts
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());
```

#### 模式 4: 基于用户角色

```sql
-- 创建用户角色表
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role    TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'))
);

-- 辅助函数: 获取用户角色
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

-- 管理员可以查看所有文章
CREATE POLICY "管理员读取所有文章" ON posts
  FOR SELECT
  TO authenticated
  USING (get_user_role() = 'admin');

-- 管理员可以删除任何文章
CREATE POLICY "管理员删除文章" ON posts
  FOR DELETE
  TO authenticated
  USING (get_user_role() IN ('admin', 'moderator'));
```

#### 模式 5: 基于团队/组织

```sql
-- 团队成员表
CREATE TABLE team_members (
  team_id  BIGINT REFERENCES teams(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role     TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  PRIMARY KEY (team_id, user_id)
);

-- 项目表 (属于团队)
CREATE TABLE projects (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id  BIGINT REFERENCES teams(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 团队成员可以查看自己团队的项目
CREATE POLICY "团队成员可查看项目" ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- 只有团队 owner/admin 可以创建项目
CREATE POLICY "团队管理员创建项目" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = projects.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
    )
  );
```

#### 模式 6: 基于 JWT 自定义 Claims

```sql
-- 在 JWT 中添加自定义 claims (通过 auth hook 或手动设置)
-- 适合需要高性能的场景, 避免每次查询都联表

-- 假设 JWT 包含 { app_metadata: { role: "admin", org_id: "123" } }
CREATE POLICY "基于JWT角色的策略" ON posts
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "基于JWT组织的策略" ON projects
  FOR SELECT
  TO authenticated
  USING (
    org_id = (auth.jwt() -> 'app_metadata' ->> 'org_id')::bigint
  );
```

---

## 4.7 RLS 最佳实践

### 性能优化

```sql
-- 1. 使用 SECURITY DEFINER 函数封装复杂查询
-- 避免 RLS 策略中重复的复杂子查询
CREATE OR REPLACE FUNCTION is_team_member(p_team_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER  -- 以函数创建者权限执行, 绕过该函数内的 RLS
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$;

CREATE POLICY "团队成员访问" ON projects
  FOR SELECT
  TO authenticated
  USING (is_team_member(team_id));

-- 2. 确保 RLS 用到的列有索引
CREATE INDEX idx_posts_author_id ON posts (author_id);
CREATE INDEX idx_team_members_user_team ON team_members (user_id, team_id);

-- 3. 避免在 USING 中做复杂计算
-- 不好: USING (expensive_function(column))
-- 好:   预先计算并存储结果, 用简单比较
```

### 安全注意事项

```sql
-- 1. 新表一定要启用 RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- 2. 确保每种操作都有对应策略
-- 不要只设置 SELECT 策略而忘记 INSERT/UPDATE/DELETE

-- 3. 使用 SECURITY DEFINER 函数时注意:
--    - 始终设置 search_path
--    - 仔细验证输入参数
--    - 不要暴露敏感数据

-- 4. 测试策略
-- 模拟匿名用户
SET role anon;
SET request.jwt.claims = '{}';
SELECT * FROM posts;  -- 应该只能看到公开数据
RESET role;

-- 模拟认证用户
SET role authenticated;
SET request.jwt.claims = '{"sub": "user-uuid", "role": "authenticated"}';
SELECT * FROM posts;  -- 应该能看到自己的数据
RESET role;

-- 5. 查看所有 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check
FROM pg_policies
ORDER BY tablename;
```

### 创建用户 Profile 的常见模式

```sql
-- 公开的用户 Profile 表
CREATE TABLE public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username   TEXT UNIQUE NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  bio        TEXT DEFAULT '',
  website    TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 任何人可以查看 profile
CREATE POLICY "公开查看Profile" ON profiles
  FOR SELECT USING (true);

-- 只能更新自己的 profile
CREATE POLICY "更新自己的Profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 注册时自动创建 profile (通过触发器)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```
