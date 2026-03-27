# 第二章：PostgreSQL 高级查询与性能优化

## 课程大纲

1. JOIN 连接查询
2. 子查询与 CTE
3. 窗口函数
4. 索引详解与优化
5. 事务与并发控制
6. 视图与物化视图
7. 存储过程与触发器
8. 查询性能分析 (EXPLAIN)

---

## 2.1 JOIN 连接查询

### JOIN 类型总览

```
表A: [1, 2, 3]    表B: [2, 3, 4]

INNER JOIN:     [2, 3]        -- 交集
LEFT JOIN:      [1, 2, 3]     -- A全部 + 交集
RIGHT JOIN:     [2, 3, 4]     -- B全部 + 交集
FULL JOIN:      [1, 2, 3, 4]  -- 并集
CROSS JOIN:     3×3 = 9行      -- 笛卡尔积
```

### 实战示例

```sql
-- 准备数据
-- users 表: 用户信息
-- posts 表: 文章 (author_id -> users.id)
-- comments 表: 评论 (post_id -> posts.id, user_id -> users.id)
-- post_likes 表: 点赞 (user_id, post_id)

-- INNER JOIN: 查询文章及其作者
SELECT p.title, u.username AS author
FROM posts p
INNER JOIN users u ON p.author_id = u.id
WHERE p.status = 'published';

-- LEFT JOIN: 查询所有用户及其文章数（包含没写文章的用户）
SELECT
  u.username,
  count(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
GROUP BY u.id, u.username
ORDER BY post_count DESC;

-- 多表 JOIN: 文章 + 作者 + 评论数 + 点赞数
SELECT
  p.id,
  p.title,
  u.username AS author,
  count(DISTINCT c.id) AS comment_count,
  count(DISTINCT pl.user_id) AS like_count
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN post_likes pl ON p.id = pl.post_id
WHERE p.status = 'published'
GROUP BY p.id, p.title, u.username
ORDER BY like_count DESC;

-- LATERAL JOIN: 每个用户最新的3篇文章
SELECT u.username, latest_posts.*
FROM users u
CROSS JOIN LATERAL (
  SELECT title, created_at
  FROM posts
  WHERE author_id = u.id
  ORDER BY created_at DESC
  LIMIT 3
) AS latest_posts;

-- 自连接: 查询嵌套评论（评论及其父评论）
SELECT
  c.content AS reply,
  parent.content AS reply_to
FROM comments c
LEFT JOIN comments parent ON c.parent_id = parent.id
WHERE c.post_id = 1;
```

---

## 2.2 子查询与 CTE

### 子查询

```sql
-- WHERE 中的子查询
SELECT * FROM users
WHERE id IN (
  SELECT DISTINCT author_id FROM posts WHERE status = 'published'
);

-- EXISTS (通常比 IN 更高效)
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM posts p
  WHERE p.author_id = u.id AND p.status = 'published'
);

-- 标量子查询（返回单值）
SELECT
  p.title,
  (SELECT username FROM users WHERE id = p.author_id) AS author_name,
  (SELECT count(*) FROM comments WHERE post_id = p.id) AS comment_count
FROM posts p;

-- FROM 中的子查询（派生表）
SELECT author_name, avg_views
FROM (
  SELECT
    u.username AS author_name,
    avg(p.view_count) AS avg_views
  FROM users u
  JOIN posts p ON u.id = p.author_id
  GROUP BY u.id, u.username
) AS author_stats
WHERE avg_views > 100;
```

### CTE (Common Table Expressions)

CTE 让复杂查询更清晰可读，是编写复杂 SQL 的利器。

```sql
-- 基本 CTE
WITH active_authors AS (
  SELECT DISTINCT author_id
  FROM posts
  WHERE status = 'published'
    AND created_at > now() - INTERVAL '30 days'
),
author_stats AS (
  SELECT
    u.id,
    u.username,
    count(p.id) AS post_count,
    sum(p.view_count) AS total_views
  FROM users u
  JOIN posts p ON u.id = p.author_id
  WHERE u.id IN (SELECT author_id FROM active_authors)
  GROUP BY u.id, u.username
)
SELECT * FROM author_stats
ORDER BY total_views DESC
LIMIT 10;

-- 递归 CTE: 查询评论树
WITH RECURSIVE comment_tree AS (
  -- 基础条件: 顶级评论
  SELECT id, content, parent_id, user_id, 0 AS depth,
         ARRAY[id] AS path
  FROM comments
  WHERE post_id = 1 AND parent_id IS NULL

  UNION ALL

  -- 递归条件: 子评论
  SELECT c.id, c.content, c.parent_id, c.user_id, ct.depth + 1,
         ct.path || c.id
  FROM comments c
  JOIN comment_tree ct ON c.parent_id = ct.id
  WHERE ct.depth < 10  -- 防止无限递归
)
SELECT
  repeat('  ', depth) || content AS indented_comment,
  depth,
  path
FROM comment_tree
ORDER BY path;

-- 递归 CTE: 组织架构树
WITH RECURSIVE org_tree AS (
  SELECT id, name, manager_id, 0 AS level
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  SELECT e.id, e.name, e.manager_id, ot.level + 1
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT * FROM org_tree ORDER BY level, name;

-- CTE + INSERT/UPDATE/DELETE (可写 CTE)
WITH deactivated AS (
  UPDATE users
  SET is_active = false
  WHERE last_login_at < now() - INTERVAL '1 year'
  RETURNING id, email
)
INSERT INTO deactivation_log (user_id, email, deactivated_at)
SELECT id, email, now()
FROM deactivated;
```

---

## 2.3 窗口函数

窗口函数是 SQL 中最强大的分析工具，可以在不改变行数的情况下进行聚合计算。

### 语法结构

```
函数名() OVER (
  PARTITION BY 分区列     -- 可选, 分组
  ORDER BY 排序列         -- 可选, 排序
  ROWS/RANGE 框架定义     -- 可选, 窗口范围
)
```

### 排名函数

```sql
SELECT
  title,
  author_id,
  view_count,
  -- ROW_NUMBER: 唯一序号 (1,2,3,4,5)
  ROW_NUMBER() OVER (ORDER BY view_count DESC) AS row_num,

  -- RANK: 并列排名, 跳过 (1,2,2,4,5)
  RANK() OVER (ORDER BY view_count DESC) AS rank,

  -- DENSE_RANK: 并列排名, 不跳过 (1,2,2,3,4)
  DENSE_RANK() OVER (ORDER BY view_count DESC) AS dense_rank,

  -- NTILE: 分桶 (分成4组)
  NTILE(4) OVER (ORDER BY view_count DESC) AS quartile

FROM posts
WHERE status = 'published';

-- 每个作者浏览量最高的文章
SELECT * FROM (
  SELECT
    p.*,
    ROW_NUMBER() OVER (PARTITION BY author_id ORDER BY view_count DESC) AS rn
  FROM posts p
  WHERE status = 'published'
) ranked
WHERE rn = 1;
```

### 聚合窗口函数

```sql
SELECT
  title,
  author_id,
  view_count,

  -- 按作者分组的统计
  sum(view_count) OVER (PARTITION BY author_id) AS author_total_views,
  avg(view_count) OVER (PARTITION BY author_id)::int AS author_avg_views,
  count(*) OVER (PARTITION BY author_id) AS author_post_count,

  -- 占比
  round(view_count * 100.0 / sum(view_count) OVER (PARTITION BY author_id), 2)
    AS pct_of_author_views,

  -- 全局统计
  sum(view_count) OVER () AS global_total_views

FROM posts
WHERE status = 'published';
```

### 偏移函数

```sql
SELECT
  title,
  created_at,
  view_count,

  -- 前一行 / 后一行
  LAG(view_count) OVER (ORDER BY created_at) AS prev_views,
  LEAD(view_count) OVER (ORDER BY created_at) AS next_views,

  -- 与前一行的差值
  view_count - LAG(view_count, 1, 0) OVER (ORDER BY created_at) AS views_diff,

  -- 第一行 / 最后一行
  FIRST_VALUE(title) OVER (ORDER BY view_count DESC) AS most_viewed,
  LAST_VALUE(title) OVER (
    ORDER BY view_count DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS least_viewed

FROM posts;
```

### 滑动窗口

```sql
-- 7天移动平均
SELECT
  date,
  daily_revenue,
  avg(daily_revenue) OVER (
    ORDER BY date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d,

  -- 累计总和
  sum(daily_revenue) OVER (
    ORDER BY date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_revenue

FROM daily_stats;
```

---

## 2.4 索引详解

### 索引类型

```sql
-- B-Tree 索引（默认, 适合等值和范围查询）
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_posts_created ON posts (created_at DESC);

-- 多列索引（注意列顺序: 最常过滤的列放前面）
CREATE INDEX idx_posts_author_status ON posts (author_id, status);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);

-- 部分索引（只索引符合条件的行, 更小更快）
CREATE INDEX idx_posts_published ON posts (created_at DESC)
WHERE status = 'published';

-- GIN 索引（适合 JSONB、数组、全文搜索）
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX idx_posts_metadata ON posts USING GIN (metadata);
CREATE INDEX idx_posts_metadata_path ON posts USING GIN (metadata jsonb_path_ops);

-- GiST 索引（适合几何、范围、全文搜索）
CREATE INDEX idx_reservations_during ON reservations USING GiST (during);

-- 表达式索引
CREATE INDEX idx_users_email_lower ON users (lower(email));

-- 覆盖索引 (INCLUDE)
CREATE INDEX idx_posts_slug ON posts (slug) INCLUDE (title, author_id);
-- 查询只需要 slug + title + author_id 时, 不需要回表

-- 并发创建索引（不锁表, 生产环境推荐）
CREATE INDEX CONCURRENTLY idx_posts_title ON posts (title);
```

### 索引使用原则

```
1. 主键和唯一约束自动创建索引
2. 外键列建议创建索引（加速 JOIN 和级联操作）
3. WHERE 频繁过滤的列创建索引
4. ORDER BY 的列创建索引
5. 不要过度索引: 每个索引都有写入开销
6. 定期检查未使用的索引并删除
```

### 查看索引使用情况

```sql
-- 查看表的所有索引
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'posts';

-- 查看索引使用统计
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;  -- 使用次数少的排前面

-- 删除未使用的索引
DROP INDEX IF EXISTS idx_unused;
DROP INDEX CONCURRENTLY IF EXISTS idx_unused;  -- 不锁表
```

---

## 2.5 事务与并发控制

### 事务基础

```sql
-- 显式事务
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- 出错时回滚
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  -- 如果发现余额不足
  ROLLBACK;

-- SAVEPOINT (部分回滚)
BEGIN;
  INSERT INTO orders (...) VALUES (...);
  SAVEPOINT sp1;
  INSERT INTO order_items (...) VALUES (...);  -- 可能失败
  -- 如果 order_items 插入失败
  ROLLBACK TO sp1;
  -- orders 的插入仍然有效
COMMIT;
```

### 事务隔离级别

```sql
-- PostgreSQL 支持的隔离级别
-- READ COMMITTED (默认): 每条语句看到语句开始前已提交的数据
-- REPEATABLE READ: 整个事务看到事务开始时的快照
-- SERIALIZABLE: 最严格, 事务仿佛串行执行

BEGIN ISOLATION LEVEL REPEATABLE READ;
  SELECT balance FROM accounts WHERE id = 1;
  -- 其他事务此时修改了 balance, 但本事务看不到
  UPDATE accounts SET balance = balance + 100 WHERE id = 1;
COMMIT;  -- 如果有冲突, 会报错并需要重试

-- 查看当前隔离级别
SHOW transaction_isolation;
```

### 锁机制

```sql
-- 行锁: FOR UPDATE (悲观锁)
BEGIN;
  SELECT * FROM products WHERE id = 1 FOR UPDATE;
  -- 此行被锁定, 其他事务的 FOR UPDATE 会等待
  UPDATE products SET stock = stock - 1 WHERE id = 1;
COMMIT;

-- FOR UPDATE SKIP LOCKED (跳过已锁定的行, 适合任务队列)
BEGIN;
  SELECT * FROM job_queue
  WHERE status = 'pending'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  -- 处理任务...
COMMIT;

-- FOR UPDATE NOWAIT (不等待, 立即报错)
SELECT * FROM products WHERE id = 1 FOR UPDATE NOWAIT;

-- 建议锁 (Advisory Lock, 应用级分布式锁)
SELECT pg_advisory_lock(12345);       -- 获取锁 (阻塞)
SELECT pg_try_advisory_lock(12345);   -- 尝试获取 (非阻塞)
SELECT pg_advisory_unlock(12345);     -- 释放锁
```

---

## 2.6 视图与物化视图

### 普通视图

```sql
-- 创建视图（每次查询实时计算）
CREATE VIEW published_posts AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.content,
  p.view_count,
  p.published_at,
  u.username AS author_name,
  u.avatar_url AS author_avatar,
  (SELECT count(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
  (SELECT count(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published';

-- 使用视图
SELECT * FROM published_posts WHERE author_name = 'alice';

-- 可更新视图（简单视图支持 INSERT/UPDATE/DELETE）
CREATE VIEW active_users AS
SELECT * FROM users WHERE is_active = true;

UPDATE active_users SET username = 'new_name' WHERE id = 1;  -- 直接更新底层表
```

### 物化视图

```sql
-- 创建物化视图（结果被缓存, 适合计算密集型查询）
CREATE MATERIALIZED VIEW author_stats AS
SELECT
  u.id AS author_id,
  u.username,
  count(p.id) AS total_posts,
  coalesce(sum(p.view_count), 0) AS total_views,
  coalesce(avg(p.view_count), 0)::int AS avg_views,
  max(p.published_at) AS last_published_at
FROM users u
LEFT JOIN posts p ON u.id = p.author_id AND p.status = 'published'
GROUP BY u.id, u.username
WITH DATA;  -- 立即填充数据 (WITH NO DATA 则不填充)

-- 在物化视图上创建索引
CREATE UNIQUE INDEX idx_author_stats_id ON author_stats (author_id);
CREATE INDEX idx_author_stats_views ON author_stats (total_views DESC);

-- 刷新物化视图
REFRESH MATERIALIZED VIEW author_stats;

-- 并发刷新（需要唯一索引, 不锁读取）
REFRESH MATERIALIZED VIEW CONCURRENTLY author_stats;

-- 定时刷新: 使用 pg_cron 扩展 或 外部调度
-- Supabase 中可以使用 pg_cron:
SELECT cron.schedule(
  'refresh-author-stats',
  '*/15 * * * *',  -- 每15分钟
  'REFRESH MATERIALIZED VIEW CONCURRENTLY author_stats'
);
```

---

## 2.7 存储过程与函数

### 创建函数

```sql
-- 基本函数
CREATE OR REPLACE FUNCTION get_post_stats(p_post_id BIGINT)
RETURNS TABLE (
  comment_count BIGINT,
  like_count BIGINT,
  view_count INTEGER
)
LANGUAGE sql
STABLE  -- 标记为稳定函数（不修改数据）
AS $$
  SELECT
    (SELECT count(*) FROM comments WHERE post_id = p_post_id),
    (SELECT count(*) FROM post_likes WHERE post_id = p_post_id),
    (SELECT view_count FROM posts WHERE id = p_post_id);
$$;

-- PL/pgSQL 函数
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id BIGINT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = p_post_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post % not found', p_post_id;
  END IF;
END;
$$;

-- 带条件逻辑的函数
CREATE OR REPLACE FUNCTION publish_post(p_post_id BIGINT, p_user_id BIGINT)
RETURNS posts
LANGUAGE plpgsql
SECURITY DEFINER  -- 以函数创建者的权限执行
AS $$
DECLARE
  v_post posts;
BEGIN
  SELECT * INTO v_post FROM posts
  WHERE id = p_post_id AND author_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found or unauthorized';
  END IF;

  IF v_post.status = 'published' THEN
    RAISE EXCEPTION 'Post is already published';
  END IF;

  UPDATE posts
  SET status = 'published', published_at = now(), updated_at = now()
  WHERE id = p_post_id
  RETURNING * INTO v_post;

  RETURN v_post;
END;
$$;

-- 调用函数
SELECT * FROM get_post_stats(1);
SELECT increment_view_count(1);
SELECT * FROM publish_post(1, 1);
```

### 触发器

```sql
-- 自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 审计日志触发器
CREATE TABLE audit_log (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation  TEXT NOT NULL,
  old_data   JSONB,
  new_data   JSONB,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END,
    current_user
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger();

-- 数据验证触发器
CREATE OR REPLACE FUNCTION validate_post()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND (NEW.title IS NULL OR NEW.content IS NULL) THEN
    RAISE EXCEPTION 'Published posts must have title and content';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_post_before_publish
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION validate_post();
```

---

## 2.8 查询性能分析 (EXPLAIN)

### 使用 EXPLAIN

```sql
-- 查看查询计划
EXPLAIN SELECT * FROM posts WHERE author_id = 1;

-- 查看实际执行信息（会真正执行查询）
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM posts WHERE author_id = 1;

-- JSON 格式（方便程序解析）
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM posts WHERE author_id = 1;
```

### 读懂 EXPLAIN 输出

```
关键指标:
- Seq Scan:       顺序扫描（全表扫描, 通常需要优化）
- Index Scan:     索引扫描（好）
- Index Only Scan: 仅索引扫描（最好, 不需要回表）
- Bitmap Scan:    位图扫描（多条件组合时使用）
- Hash Join:      哈希连接
- Nested Loop:    嵌套循环连接
- Sort:           排序操作
- cost=0.00..1.23: 预估成本（第一行成本..总成本）
- rows=100:       预估行数
- actual time:    实际执行时间
- Buffers:        缓冲区使用（shared hit=缓存命中, read=磁盘读取）
```

### 常见性能优化策略

```sql
-- 1. 添加缺失的索引
-- 问题: Seq Scan on posts (cost=... rows=10000)
-- 解决:
CREATE INDEX idx_posts_author ON posts (author_id);

-- 2. 避免 SELECT *
-- 不推荐
SELECT * FROM posts WHERE id = 1;
-- 推荐
SELECT id, title, status FROM posts WHERE id = 1;

-- 3. 使用部分索引减少索引大小
CREATE INDEX idx_active_users ON users (email) WHERE is_active = true;

-- 4. 使用 EXISTS 替代 IN (大数据集)
-- 慢
SELECT * FROM users WHERE id IN (SELECT author_id FROM posts);
-- 快
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM posts p WHERE p.author_id = u.id);

-- 5. 批量操作替代循环
-- 慢: 逐条 INSERT
-- 快: 批量 INSERT
INSERT INTO posts (title, author_id) VALUES
  ('Title 1', 1), ('Title 2', 1), ('Title 3', 2);

-- 6. 合理使用连接池
-- 推荐使用 PgBouncer (Supabase 内置)
-- 连接字符串使用 6543 端口 (pooler) 而不是 5432 端口

-- 7. 定期维护
ANALYZE posts;     -- 更新统计信息
VACUUM posts;      -- 清理死行
VACUUM ANALYZE posts;  -- 两者一起
REINDEX INDEX idx_posts_author;  -- 重建索引

-- 8. 查看慢查询
SELECT
  query,
  calls,
  mean_exec_time::numeric(10,2) AS avg_ms,
  total_exec_time::numeric(10,2) AS total_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 2.9 全文搜索

```sql
-- 创建全文搜索列
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- 填充搜索向量
UPDATE posts SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'B');

-- 创建 GIN 索引
CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);

-- 自动更新搜索向量
CREATE OR REPLACE FUNCTION posts_search_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_search_vector
  BEFORE INSERT OR UPDATE OF title, content ON posts
  FOR EACH ROW
  EXECUTE FUNCTION posts_search_trigger();

-- 执行全文搜索
SELECT
  title,
  ts_rank(search_vector, query) AS relevance
FROM posts,
  to_tsquery('english', 'postgresql & tutorial') AS query
WHERE search_vector @@ query
ORDER BY relevance DESC;

-- 高亮显示匹配文本
SELECT
  title,
  ts_headline('english', content, to_tsquery('english', 'postgresql'),
    'StartSel=<mark>, StopSel=</mark>, MaxWords=50') AS snippet
FROM posts
WHERE search_vector @@ to_tsquery('english', 'postgresql');
```
