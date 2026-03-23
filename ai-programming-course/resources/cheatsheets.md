# 速查表

> 常用命令和语法的快速参考。

## Git 速查

```bash
# 基础流程
git init                          # 初始化仓库
git add .                         # 暂存所有改动
git commit -m "说明"               # 提交
git push origin main              # 推送到远程

# 分支操作
git branch                        # 查看分支
git checkout -b feature/xxx       # 创建并切换分支
git checkout main                 # 切换回主分支
git merge feature/xxx             # 合并分支
git branch -d feature/xxx        # 删除已合并的分支

# 查看信息
git status                        # 查看状态
git log --oneline                 # 查看提交历史
git diff                          # 查看改动内容

# 撤销操作
git stash                         # 暂存当前改动
git stash pop                     # 恢复暂存的改动
git checkout -- file.txt          # 撤销文件修改
git revert <hash>                 # 创建新 commit 撤销某次改动

# 远程
git remote add origin <url>       # 添加远程仓库
git push -u origin main           # 首次推送并关联
git pull origin main              # 拉取远程更新
```

## CLI 速查

```bash
# 导航
pwd                               # 当前目录
ls                                # 列出文件
ls -la                            # 列出所有文件（含隐藏）
cd <dir>                          # 进入目录
cd ..                             # 上一级
cd ~                              # 主目录

# 文件操作
mkdir <dir>                       # 创建目录
touch <file>                      # 创建文件
cp <src> <dst>                    # 复制
mv <src> <dst>                    # 移动/重命名
rm <file>                         # 删除文件
rm -rf <dir>                      # 删除目录

# Node.js / npm
node <file>                       # 运行 JS/TS 文件
npm install                       # 安装依赖
npm install <pkg>                 # 安装包
npm install -D <pkg>              # 安装开发依赖
npm run dev                       # 运行开发服务器
npm run build                     # 构建生产版本
npm test                          # 运行测试
npx <cmd>                         # 运行一次性命令

# 快捷键
Ctrl+C                            # 终止命令
Ctrl+L                            # 清屏
Tab                               # 自动补全
↑ / ↓                             # 浏览历史命令
```

## TypeScript 速查

```typescript
// 基本类型
let s: string = "hello";
let n: number = 42;
let b: boolean = true;
let arr: number[] = [1, 2, 3];

// 接口
interface User {
  id: string;
  name: string;
  email?: string;              // 可选
}

// 类型别名
type Status = "active" | "inactive";
type ID = string | number;    // 联合类型

// 函数
function greet(name: string): string {
  return `Hello, ${name}`;
}

// 异步函数
async function fetchData(): Promise<User[]> {
  const res = await fetch("/api/users");
  return res.json();
}

// 泛型
function first<T>(arr: T[]): T {
  return arr[0];
}

// 安全访问
const name = user?.name;           // 可选链
const display = name ?? "匿名";    // 空值合并
```

## SQL 速查

```sql
-- 查询
SELECT * FROM users;
SELECT name, email FROM users WHERE age > 18;
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- 插入
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

-- 更新
UPDATE users SET name = 'New Name' WHERE id = '123';

-- 删除
DELETE FROM users WHERE id = '123';

-- 关联查询
SELECT m.content, c.title
FROM messages m
JOIN conversations c ON m.conversation_id = c.id;

-- 计数
SELECT COUNT(*) FROM messages WHERE role = 'user';

-- 分组统计
SELECT role, COUNT(*) as count
FROM messages
GROUP BY role;
```

## Supabase JavaScript 客户端速查

```typescript
import { supabase } from '@/lib/supabase';

// 查询
const { data } = await supabase.from('users').select('*');
const { data } = await supabase.from('users').select('id, name');
const { data } = await supabase.from('users').select('*').eq('id', '123').single();
const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
const { data } = await supabase.from('users').select('*').limit(10);

// 插入
const { data } = await supabase.from('users').insert({ name: 'Alice' }).select().single();

// 更新
await supabase.from('users').update({ name: 'New' }).eq('id', '123');

// 删除
await supabase.from('users').delete().eq('id', '123');

// 认证
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
const { data: { user } } = await supabase.auth.getUser();
```

## Next.js App Router 速查

```
文件系统路由：
app/page.tsx               →  /
app/about/page.tsx         →  /about
app/blog/[slug]/page.tsx   →  /blog/:slug
app/api/users/route.ts     →  /api/users

特殊文件：
layout.tsx                 →  共享布局
loading.tsx                →  加载状态
error.tsx                  →  错误处理
not-found.tsx              →  404 页面

指令：
'use client'               →  客户端组件
'use server'               →  Server Action
```

## React Hooks 速查

```tsx
// 状态
const [value, setValue] = useState(initialValue);

// 副作用
useEffect(() => {
  // 执行操作
  return () => { /* 清理 */ };
}, [dependencies]);

// 引用
const ref = useRef(initialValue);

// 回调缓存
const fn = useCallback(() => { ... }, [deps]);

// 计算缓存
const value = useMemo(() => compute(), [deps]);
```
