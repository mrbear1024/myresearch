# 第七章：实战项目 — 全栈博客应用

## 课程大纲

1. 项目架构设计
2. 数据库 Schema 设计
3. RLS 策略设计
4. API 层实现
5. 前端集成
6. 部署与生产环境配置

---

## 7.1 项目架构设计

### 功能需求

```
一个完整的博客应用, 支持:
- 用户注册/登录 (GitHub OAuth + 邮箱密码)
- 发布/编辑/删除文章
- 文章分类与标签
- 评论系统 (嵌套评论)
- 点赞功能
- 实时评论推送
- 用户头像上传
- 全文搜索
- 文章浏览统计
```

### 技术栈

```
前端:   Next.js 14+ (App Router) + TypeScript
后端:   Supabase (PostgreSQL + Auth + Storage + Realtime)
样式:   Tailwind CSS
部署:   Vercel + Supabase Cloud
```

---

## 7.2 数据库 Schema 设计

### 完整迁移文件

```sql
-- supabase/migrations/20250101000000_initial_schema.sql

------------------------------------------------------
-- 1. 启用必要的扩展
------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- 模糊搜索

------------------------------------------------------
-- 2. 辅助函数
------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

------------------------------------------------------
-- 3. 用户 Profile 表
------------------------------------------------------
CREATE TABLE public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username   TEXT UNIQUE NOT NULL,
  full_name  TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  bio        TEXT DEFAULT '',
  website    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 注册时自动创建 Profile
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
    COALESCE(
      NEW.raw_user_meta_data ->> 'user_name',        -- GitHub
      NEW.raw_user_meta_data ->> 'username',          -- 自定义
      split_part(NEW.email, '@', 1)                   -- 默认
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

------------------------------------------------------
-- 4. 分类表
------------------------------------------------------
CREATE TABLE public.categories (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

------------------------------------------------------
-- 5. 文章表
------------------------------------------------------
CREATE TABLE public.posts (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  excerpt       TEXT DEFAULT '',
  content       TEXT DEFAULT '',
  cover_image   TEXT DEFAULT '',
  tags          TEXT[] DEFAULT '{}',
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count    INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 全文搜索触发器
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_posts_search
  BEFORE INSERT OR UPDATE OF title, excerpt, content ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

-- 自动设置 published_at
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_set_published_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

------------------------------------------------------
-- 6. 评论表
------------------------------------------------------
CREATE TABLE public.comments (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id    BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id  BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

------------------------------------------------------
-- 7. 点赞表
------------------------------------------------------
CREATE TABLE public.post_likes (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

------------------------------------------------------
-- 8. 索引
------------------------------------------------------
CREATE INDEX idx_profiles_username ON public.profiles (username);
CREATE INDEX idx_posts_author ON public.posts (author_id);
CREATE INDEX idx_posts_category ON public.posts (category_id);
CREATE INDEX idx_posts_status_published ON public.posts (published_at DESC) WHERE status = 'published';
CREATE INDEX idx_posts_slug ON public.posts (slug);
CREATE INDEX idx_posts_tags ON public.posts USING GIN (tags);
CREATE INDEX idx_posts_search ON public.posts USING GIN (search_vector);
CREATE INDEX idx_posts_title_trgm ON public.posts USING GIN (title gin_trgm_ops);
CREATE INDEX idx_comments_post ON public.comments (post_id, created_at);
CREATE INDEX idx_comments_user ON public.comments (user_id);
CREATE INDEX idx_comments_parent ON public.comments (parent_id);
CREATE INDEX idx_post_likes_post ON public.post_likes (post_id);

------------------------------------------------------
-- 9. RLS 策略
------------------------------------------------------

-- Profiles
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Categories
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

-- Posts: 公开读取已发布文章
CREATE POLICY "posts_public_read" ON public.posts
  FOR SELECT USING (status = 'published');

-- Posts: 作者可以读取自己的所有文章
CREATE POLICY "posts_author_read" ON public.posts
  FOR SELECT TO authenticated
  USING (author_id = auth.uid());

-- Posts: 作者创建
CREATE POLICY "posts_author_insert" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Posts: 作者更新
CREATE POLICY "posts_author_update" ON public.posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Posts: 作者删除
CREATE POLICY "posts_author_delete" ON public.posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- Comments: 公开读取
CREATE POLICY "comments_public_read" ON public.comments
  FOR SELECT USING (true);

-- Comments: 认证用户创建
CREATE POLICY "comments_auth_insert" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Comments: 作者更新自己的评论
CREATE POLICY "comments_author_update" ON public.comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments: 作者删除自己的评论
CREATE POLICY "comments_author_delete" ON public.comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Post Likes: 公开读取
CREATE POLICY "likes_public_read" ON public.post_likes
  FOR SELECT USING (true);

-- Post Likes: 认证用户点赞
CREATE POLICY "likes_auth_insert" ON public.post_likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Post Likes: 取消自己的点赞
CREATE POLICY "likes_auth_delete" ON public.post_likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

------------------------------------------------------
-- 10. 存储桶
------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Storage RLS
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

------------------------------------------------------
-- 11. 实用数据库函数
------------------------------------------------------

-- 浏览量递增
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id BIGINT)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE posts SET view_count = view_count + 1 WHERE id = p_post_id;
$$;

-- 全文搜索函数
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT, result_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  published_at TIMESTAMPTZ,
  relevance REAL
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.published_at,
    ts_rank(p.search_vector, websearch_to_tsquery('english', search_query)) AS relevance
  FROM posts p
  WHERE p.status = 'published'
    AND p.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY relevance DESC
  LIMIT result_limit;
$$;

-- 获取热门文章
CREATE OR REPLACE FUNCTION get_trending_posts(days INTEGER DEFAULT 7, result_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  view_count INTEGER,
  like_count BIGINT,
  comment_count BIGINT,
  score NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.view_count,
    COALESCE(likes.cnt, 0) AS like_count,
    COALESCE(comments.cnt, 0) AS comment_count,
    (p.view_count * 1 + COALESCE(likes.cnt, 0) * 10 + COALESCE(comments.cnt, 0) * 5)::numeric AS score
  FROM posts p
  LEFT JOIN (
    SELECT post_id, count(*) AS cnt FROM post_likes GROUP BY post_id
  ) likes ON likes.post_id = p.id
  LEFT JOIN (
    SELECT post_id, count(*) AS cnt FROM comments GROUP BY post_id
  ) comments ON comments.post_id = p.id
  WHERE p.status = 'published'
    AND p.published_at > now() - (days || ' days')::interval
  ORDER BY score DESC
  LIMIT result_limit;
$$;

-- 开启 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
```

---

## 7.3 前端集成示例

### 文章列表页

```typescript
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string; tag?: string; search?: string }
}) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page || '1')
  const perPage = 20
  const offset = (page - 1) * perPage

  // 搜索
  if (searchParams.search) {
    const { data: posts } = await supabase
      .rpc('search_posts', {
        search_query: searchParams.search,
        result_limit: perPage,
      })
    return <PostList posts={posts || []} />
  }

  // 常规列表
  let query = supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, cover_image, tags,
      view_count, published_at,
      author:profiles!author_id (username, avatar_url),
      likes:post_likes (count),
      comments (count)
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (searchParams.tag) {
    query = query.contains('tags', [searchParams.tag])
  }

  const { data: posts, count } = await query

  return (
    <div>
      <PostList posts={posts || []} />
      <Pagination
        currentPage={page}
        totalPages={Math.ceil((count || 0) / perPage)}
      />
    </div>
  )
}
```

### 文章详情页

```typescript
// app/posts/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id (*),
      comments (
        id, content, created_at, parent_id,
        user:profiles!user_id (username, avatar_url)
      ),
      likes:post_likes (count)
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  // 异步增加浏览量
  supabase.rpc('increment_view_count', { p_post_id: post.id })

  return <PostDetail post={post} />
}
```

### 实时评论组件

```typescript
// components/RealtimeComments.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimeComments({ postId, initialComments }) {
  const [comments, setComments] = useState(initialComments)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          // 获取评论者信息
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          setComments(prev => [...prev, { ...payload.new, user: profile }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId])

  const handleSubmit = async (content: string, parentId?: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId || null,
      content,
    })
  }

  return (
    <div>
      <CommentForm onSubmit={handleSubmit} />
      <CommentList comments={comments} onReply={handleSubmit} />
    </div>
  )
}
```

---

## 7.4 部署与生产环境配置

### 环境变量

```bash
# .env.local (本地开发)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# .env.production (生产)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # 仅服务端
```

### 部署检查清单

```
数据库:
☐ 所有表都启用了 RLS
☐ 所有表都有适当的 RLS 策略
☐ 关键列有索引
☐ 外键列有索引
☐ 物化视图有定时刷新任务
☐ 已设置数据库备份

安全:
☐ service_role key 仅在服务端使用
☐ anon key 只在客户端使用
☐ CORS 配置正确
☐ 禁用了不需要的 Auth Provider
☐ 邮箱确认已开启
☐ Rate limiting 已配置

性能:
☐ 使用连接池 (端口 6543)
☐ 查询已优化 (EXPLAIN 分析)
☐ 没有 N+1 查询问题
☐ 大表有分页
☐ 静态资源使用 CDN

监控:
☐ 开启 pg_stat_statements
☐ 监控慢查询
☐ 监控连接数
☐ 监控磁盘使用
☐ 设置错误告警
```

### 生产数据库优化

```sql
-- 检查表大小
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS data_size,
  pg_size_pretty(pg_indexes_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- 检查未使用的索引
SELECT
  indexrelname AS index_name,
  relname AS table_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
  AND indexrelname NOT LIKE '%_unique'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 检查缓存命中率 (应该 > 99%)
SELECT
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
FROM pg_statio_user_tables;

-- 检查连接数
SELECT
  state,
  count(*)
FROM pg_stat_activity
GROUP BY state;

-- 查看活跃的长查询
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
  AND state != 'idle';
```

---

## 总结

### 学习路径建议

```
第1周:  PostgreSQL 基础 (第1章) — 数据类型、CRUD、约束
第2周:  PostgreSQL 进阶 (第2章) — JOIN、CTE、窗口函数、索引
第3周:  Supabase 入门 (第3章) — SDK、数据操作、迁移
第4周:  认证与权限 (第4章) — Auth、RLS 策略设计
第5周:  实时与存储 (第5章) — Realtime、Storage
第6周:  高级功能 (第6章) — Edge Functions、pg_cron、扩展
第7-8周: 实战项目 (第7章) — 从零构建完整应用
```

### 推荐资源

```
官方文档:
- PostgreSQL: https://www.postgresql.org/docs/
- Supabase:   https://supabase.com/docs

社区:
- Supabase Discord
- Supabase GitHub Discussions
- Stack Overflow [supabase] 标签
```
