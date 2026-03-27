# 第五章：Supabase 实时功能与存储

## 课程大纲

1. Realtime 实时订阅
2. Broadcast 广播
3. Presence 在线状态
4. Storage 文件存储
5. Storage 与 RLS

---

## 5.1 Realtime 实时订阅

Supabase Realtime 基于 PostgreSQL 的逻辑复制（Logical Replication）实现数据变更的实时推送。

### 开启 Realtime

```sql
-- 在 Supabase Dashboard 中开启, 或通过 SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- 查看已开启 Realtime 的表
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### 订阅数据变更

```typescript
// 订阅表的所有变更
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*',              // INSERT | UPDATE | DELETE | *
      schema: 'public',
      table: 'posts',
    },
    (payload) => {
      console.log('Change:', payload)
      // payload 结构:
      // {
      //   eventType: 'INSERT' | 'UPDATE' | 'DELETE',
      //   new: { ... },      // 新数据 (INSERT/UPDATE)
      //   old: { ... },      // 旧数据 (UPDATE/DELETE, 需开启 replica identity)
      //   schema: 'public',
      //   table: 'posts',
      //   commit_timestamp: '...',
      // }
    }
  )
  .subscribe()

// 只订阅 INSERT 事件
const channel = supabase
  .channel('new-posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
    },
    (payload) => {
      console.log('New post:', payload.new)
    }
  )
  .subscribe()

// 带过滤条件的订阅
const channel = supabase
  .channel('my-posts')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posts',
      filter: 'author_id=eq.123',     // 只订阅指定作者的文章
    },
    (payload) => {
      console.log('My post changed:', payload)
    }
  )
  .subscribe()

// 支持的过滤操作符
// column=eq.value       等于
// column=neq.value      不等于
// column=gt.value       大于
// column=gte.value      大于等于
// column=lt.value       小于
// column=lte.value      小于等于
// column=in.(a,b,c)     在列表中

// 取消订阅
supabase.removeChannel(channel)

// 取消所有订阅
supabase.removeAllChannels()
```

### 开启 old 记录 (用于 UPDATE/DELETE)

```sql
-- 默认只返回主键的旧值, 开启 FULL 可以返回完整旧记录
ALTER TABLE posts REPLICA IDENTITY FULL;

-- 恢复默认
ALTER TABLE posts REPLICA IDENTITY DEFAULT;
```

### 在 React 中使用

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function PostList() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    // 初始加载
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      if (data) setPosts(data)
    }
    fetchPosts()

    // 订阅变更
    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts(prev => [payload.new as Post, ...prev])
          }
          if (payload.eventType === 'UPDATE') {
            setPosts(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new as Post : p)
            )
          }
          if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
```

---

## 5.2 Broadcast 广播

Broadcast 用于客户端之间的低延迟消息传递，不经过数据库。

```typescript
// 发送广播消息
const channel = supabase.channel('room-1')

// 订阅
channel
  .on('broadcast', { event: 'cursor-move' }, (payload) => {
    console.log('Cursor moved:', payload)
  })
  .on('broadcast', { event: 'chat-message' }, (payload) => {
    console.log('New message:', payload)
  })
  .subscribe()

// 发送
channel.send({
  type: 'broadcast',
  event: 'cursor-move',
  payload: { x: 100, y: 200, user_id: 'abc' },
})

channel.send({
  type: 'broadcast',
  event: 'chat-message',
  payload: { text: 'Hello!', sender: 'Alice' },
})
```

### 应用场景

```
- 实时协作编辑器中的光标位置
- 在线聊天消息
- 实时游戏状态同步
- 打字指示器 ("xxx 正在输入...")
- 通知推送
```

---

## 5.3 Presence 在线状态

Presence 用于追踪和同步用户的在线状态。

```typescript
const channel = supabase.channel('online-users')

// 追踪当前用户
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', state)
    // { 'user-1': [{ user_id: '1', username: 'alice', online_at: '...' }] }
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', key, newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', key, leftPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: currentUser.id,
        username: currentUser.username,
        online_at: new Date().toISOString(),
      })
    }
  })

// 更新状态
await channel.track({
  user_id: currentUser.id,
  username: currentUser.username,
  status: 'away',
})

// 取消追踪 (离线)
await channel.untrack()
```

### 实际应用: 在线用户列表

```typescript
function OnlineUsers() {
  const [users, setUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    const channel = supabase.channel('presence-room')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineUsers = Object.values(state).flat()
        setUsers(onlineUsers as PresenceUser[])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            username: currentUser.username,
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      <h3>在线用户 ({users.length})</h3>
      {users.map(u => (
        <span key={u.user_id}>{u.username}</span>
      ))}
    </div>
  )
}
```

---

## 5.4 Storage 文件存储

Supabase Storage 提供 S3 兼容的文件存储，与数据库权限系统深度集成。

### 创建存储桶

```sql
-- 通过 SQL 创建
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);     -- public: 公开访问

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,                                   -- 私有
  10485760,                                -- 10MB 大小限制
  ARRAY['application/pdf', 'image/png', 'image/jpeg']  -- 文件类型限制
);
```

### 上传文件

```typescript
// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar-1.png', file, {
    cacheControl: '3600',
    upsert: false,           // true: 覆盖同名文件
    contentType: 'image/png',
  })
// data: { id, path, fullPath }

// 上传 Base64
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar-2.png', decode(base64String), {
    contentType: 'image/png',
  })

// 使用用户 ID 作为路径 (配合 RLS)
const filePath = `${user.id}/avatar.png`
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(filePath, file, { upsert: true })
```

### 下载与获取 URL

```typescript
// 获取公开 URL (public bucket)
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar-1.png')
// data.publicUrl: https://xxx.supabase.co/storage/v1/object/public/avatars/public/avatar-1.png

// 带图片转换的 URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar-1.png', {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',       // 'cover' | 'contain' | 'fill'
      quality: 80,
      format: 'origin',      // 'origin' | 'avif' | 'webp'
    },
  })

// 创建签名 URL (private bucket, 有时效)
const { data, error } = await supabase.storage
  .from('documents')
  .createSignedUrl('reports/q1-2025.pdf', 3600)  // 有效期 3600 秒
// data.signedUrl

// 批量签名 URL
const { data, error } = await supabase.storage
  .from('documents')
  .createSignedUrls(['file1.pdf', 'file2.pdf'], 3600)

// 下载文件
const { data, error } = await supabase.storage
  .from('documents')
  .download('reports/q1-2025.pdf')
// data: Blob
```

### 管理文件

```typescript
// 列出文件
const { data, error } = await supabase.storage
  .from('avatars')
  .list('public', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
    search: 'avatar',        // 文件名搜索
  })

// 移动/重命名
const { error } = await supabase.storage
  .from('avatars')
  .move('old/path.png', 'new/path.png')

// 复制
const { error } = await supabase.storage
  .from('avatars')
  .copy('source.png', 'destination.png')

// 删除
const { error } = await supabase.storage
  .from('avatars')
  .remove(['public/avatar-1.png', 'public/avatar-2.png'])

// 清空存储桶
const { error } = await supabase.storage.emptyBucket('temp')

// 删除存储桶
const { error } = await supabase.storage.deleteBucket('temp')
```

---

## 5.5 Storage RLS 策略

```sql
-- Storage 的 RLS 策略作用于 storage.objects 表

-- 1. 公开桶: 任何人可读
CREATE POLICY "公开头像可读" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- 2. 认证用户可上传到自己的目录
CREATE POLICY "用户上传头像" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. 用户可以更新自己目录的文件
CREATE POLICY "用户更新头像" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. 用户可以删除自己目录的文件
CREATE POLICY "用户删除头像" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. 私有文档: 只有文件所有者可以访问
CREATE POLICY "私有文档访问" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 辅助函数说明:
-- storage.foldername(name)  -- 返回路径中的文件夹部分数组
-- storage.filename(name)    -- 返回文件名
-- storage.extension(name)   -- 返回扩展名
```

### 完整的文件上传流程示例

```typescript
async function uploadAvatar(file: File) {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Not authenticated')

  // 生成唯一文件名
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/avatar.${fileExt}`

  // 上传
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  // 获取公开 URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath, {
      transform: { width: 200, height: 200, resize: 'cover' },
    })

  // 更新用户 profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', user.id)

  if (updateError) throw updateError

  return data.publicUrl
}
```
