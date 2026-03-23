# 11 — 性能与监控

> 学习目标：了解 Web 性能的基本概念，学会使用工具进行性能分析和优化。

## 为什么关注性能

- 页面加载超过 3 秒，用户就会离开
- 搜索引擎会降低慢网站的排名
- 移动端用户对性能更敏感

## Core Web Vitals

Google 定义的三个核心性能指标：

| 指标 | 含义 | 目标 |
|------|------|------|
| **LCP** | 最大内容绘制时间 | < 2.5 秒 |
| **FID** | 首次输入延迟 | < 100 毫秒 |
| **CLS** | 累积布局偏移 | < 0.1 |

简单理解：
- **LCP** — 页面主要内容多快能看到
- **FID** — 点击按钮后多快有反应
- **CLS** — 页面内容会不会突然跳动

## Lighthouse 性能检测

1. 打开 Chrome DevTools（F12）
2. 点击 **Lighthouse** 面板
3. 选择 "Performance"
4. 点击 "Analyze page load"

Lighthouse 会给出评分（0-100）和具体的优化建议。

## Next.js 性能优化

### 图片优化

```tsx
// ❌ 原生 img 标签（不优化）
<img src="/photo.jpg" alt="照片" />

// ✅ Next.js Image 组件（自动优化）
import Image from 'next/image';
<Image src="/photo.jpg" alt="照片" width={800} height={600} />
```

Next.js Image 组件会自动：
- 转换为 WebP 格式
- 根据设备尺寸提供不同大小
- 懒加载（滚动到可见区域才加载）

### 代码分割

Next.js 自动按页面分割代码。对于大型组件，可以手动懒加载：

```tsx
import dynamic from 'next/dynamic';

// 用户需要时才加载（如 Markdown 编辑器）
const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), {
  loading: () => <p>加载中...</p>,
});
```

### 缓存策略

```typescript
// 静态页面（构建时生成，CDN 缓存）
// 默认的 Server Component 就是静态的

// 增量静态再生（ISR）— 定时更新
export const revalidate = 3600; // 每小时重新生成

// 动态数据（每次请求都获取新数据）
export const dynamic = 'force-dynamic';
```

### 数据获取优化

```typescript
// ❌ 瀑布式请求（串行，慢）
const user = await fetchUser(id);
const posts = await fetchPosts(id);    // 等 user 完成后才开始

// ✅ 并行请求（快）
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
]);
```

## 数据库性能

### 索引

常用于查询条件的字段应该创建索引：

```sql
-- 给 conversation_id 创建索引（加速按对话查询消息）
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- 给 created_at 创建索引（加速按时间排序）
CREATE INDEX idx_messages_created ON messages(created_at);
```

### 只查需要的字段

```typescript
// ❌ 查所有字段
const { data } = await supabase.from('users').select('*');

// ✅ 只查需要的字段
const { data } = await supabase.from('users').select('id, name, avatar_url');
```

## 监控

### Vercel Analytics

Vercel 内置分析功能，可以看到：
- 页面访问量
- Core Web Vitals 数据
- 访问者来源

在 `app/layout.tsx` 中添加：

```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 错误监控

生产环境的错误需要被捕获和上报。可以使用 Sentry 等工具，也可以简单地在全局错误处理中记录：

```tsx
// app/error.tsx — Next.js 全局错误处理
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error('页面错误:', error);

  return (
    <div>
      <h2>出了点问题</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

## 小结

- **Lighthouse** 是最简单的性能检测工具
- **Next.js** 内置了很多优化（Image、代码分割、缓存）
- **数据库索引和精确查询** 对性能影响很大
- **监控** 帮你发现生产环境的性能问题
- 不需要过早优化，先让功能正常工作，再关注性能
