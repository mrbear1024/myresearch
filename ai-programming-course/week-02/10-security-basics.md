# 10 — 安全基础

> 学习目标：理解 Web 应用的常见安全问题，避免在项目中引入安全漏洞。

## 为什么关注安全

AI 生成的代码**经常忽略安全性**。作为开发者，你需要知道基本的安全要求。

## 密钥管理

### 绝对不能做的事

```bash
# ❌ 把密钥硬编码在代码中
const apiKey = "sk-1234567890abcdef";

# ❌ 把 .env 文件提交到 Git
git add .env
git commit -m "添加环境变量"  # 灾难！

# ❌ 在前端代码中使用服务端密钥
const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;  # NEXT_PUBLIC_ 会暴露给浏览器
```

### 正确做法

```bash
# 1. 环境变量存放在 .env.local（被 .gitignore 忽略）
OPENAI_API_KEY=sk-xxx           # 没有 NEXT_PUBLIC_ 前缀，只在服务端可用

# 2. .gitignore 中包含
.env
.env.local
.env.*.local

# 3. 在 Vercel/部署平台中单独配置环境变量

# 4. 如果不小心泄露了密钥，立即轮换（重新生成新密钥）
```

## 认证与授权

**认证（Authentication）** — 你是谁？（登录）
**授权（Authorization）** — 你能做什么？（权限）

```typescript
// API 路由中检查认证
export async function GET(request: Request) {
  // 获取当前用户
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  // 只返回该用户的数据
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id);  // 授权：只能看自己的

  return NextResponse.json(data);
}
```

## 输入验证

永远不信任用户输入：

```typescript
import { z } from 'zod';

const messageSchema = z.object({
  content: z
    .string()
    .min(1, '消息不能为空')
    .max(10000, '消息过长')
    .trim(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = messageSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: '无效输入' }, { status: 400 });
  }

  // 使用验证后的数据
  const { content } = result.data;
}
```

## 常见漏洞

### XSS（跨站脚本攻击）

```tsx
// ❌ 危险：直接渲染用户输入的 HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 安全：React 默认转义文本内容
<div>{userInput}</div>

// 如果确实需要渲染 HTML（如 Markdown），使用安全的库
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### SQL 注入

```typescript
// ❌ 危险：拼接 SQL
const query = `SELECT * FROM users WHERE name = '${userInput}'`;

// ✅ 安全：使用参数化查询（Supabase 自动处理）
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('name', userInput);
```

### CSRF（跨站请求伪造）

Next.js 的 Server Actions 内置了 CSRF 防护。API 路由建议检查 `Origin` 或 `Referer` 头。

## CORS（跨域资源共享）

```typescript
// next.config.ts — 如果需要允许其他域名访问你的 API
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-frontend.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

## 安全清单

每次上线前检查：

- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 没有硬编码的密钥
- [ ] API 路由有认证检查
- [ ] 用户输入有验证
- [ ] 没有使用 `dangerouslySetInnerHTML`（除非经过清理）
- [ ] 数据库启用了 RLS
- [ ] HTTPS 已启用（Vercel 默认支持）

## 小结

- **密钥管理** — 不要提交密钥到 Git，不要在前端暴露敏感密钥
- **认证授权** — 确认用户身份，限制数据访问范围
- **输入验证** — 永远不信任客户端传来的数据
- **了解常见漏洞** — XSS、SQL 注入、CSRF 的基本防护
- AI 生成的代码经常忽略安全，需要你主动检查
