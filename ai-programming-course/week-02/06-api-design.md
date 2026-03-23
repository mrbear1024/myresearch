# 06 — API 设计

> 学习目标：理解 RESTful API 设计原则，能设计清晰、一致的 API。

## 什么是 API

API（Application Programming Interface）是软件之间交流的接口。就像餐厅的菜单 — 前端（顾客）看菜单（API）点菜，后端（厨房）按菜单做菜。

## REST 设计原则

REST 的核心：**用 URL 表示资源，用 HTTP 方法表示操作**。

### 资源命名

```
✅ 好的 URL 设计（名词、复数）
GET    /api/users              # 获取用户列表
GET    /api/users/123          # 获取单个用户
POST   /api/users              # 创建用户
PUT    /api/users/123          # 更新用户
DELETE /api/users/123          # 删除用户

❌ 差的 URL 设计
GET    /api/getUsers           # 不要用动词
POST   /api/createUser         # 动作应该由 HTTP 方法表示
GET    /api/user               # 应该用复数
```

### 嵌套资源

```
GET    /api/conversations/123/messages     # 获取对话的消息
POST   /api/conversations/123/messages     # 在对话中创建消息
```

## Next.js 中实现 RESTful API

```
app/api/
├── conversations/
│   ├── route.ts                        # GET(列表), POST(创建)
│   └── [id]/
│       ├── route.ts                    # GET(详情), PUT(更新), DELETE(删除)
│       └── messages/
│           └── route.ts                # GET(消息列表), POST(发送消息)
```

### 动态路由参数

```typescript
// app/api/conversations/[id]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) {
    return NextResponse.json({ error: '对话不存在' }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

## 请求验证

永远不要信任客户端传来的数据：

```typescript
import { z } from 'zod';

// 定义验证规则
const createMessageSchema = z.object({
  content: z.string().min(1, '消息不能为空').max(10000, '消息太长'),
  role: z.enum(['user', 'assistant']),
});

export async function POST(request: Request) {
  const body = await request.json();

  // 验证输入
  const result = createMessageSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors },
      { status: 400 }
    );
  }

  // 使用验证后的数据
  const { content, role } = result.data;
  // ...
}
```

## 错误处理

### 统一错误格式

```typescript
// 定义统一的错误响应格式
function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('users').select('*');

    if (error) return errorResponse(error.message, 500);

    return NextResponse.json(data);
  } catch (e) {
    return errorResponse('服务器内部错误', 500);
  }
}
```

## 分页

数据量大时需要分页：

```typescript
// GET /api/messages?page=1&limit=20
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
```

## API 设计清单

设计新 API 时过一遍：

- [ ] URL 使用名词复数
- [ ] 用 HTTP 方法区分操作
- [ ] 请求参数有验证
- [ ] 有错误处理，返回合适的状态码
- [ ] 响应格式一致
- [ ] 敏感操作需要认证

## 小结

- **REST** = 用 URL 表示资源 + HTTP 方法表示操作
- **验证输入** — 用 zod 等库验证请求数据
- **统一格式** — 成功和错误响应保持一致的结构
- **分页** — 大数据量时必须分页
- 好的 API 设计让前端开发更顺畅，也让 AI 更容易生成正确的调用代码
