# 04 — 阅读和评估 AI 生成的代码

> 学习目标：学会阅读 AI 生成的代码，判断其质量和可靠性。

## 为什么需要阅读代码

AI 生成的代码就像外包团队交付的代码 — **你不能直接用，必须审查**。

常见问题：
- 看起来对，但有隐蔽的逻辑错误
- 使用了过时或不存在的 API
- 安全处理不到位
- 代码风格和项目不一致

## 阅读代码的方法

### 1. 先看整体结构

不要一行一行读，先看：

- 这段代码做了什么？（大方向）
- 数据从哪里来，到哪里去？
- 有哪些函数/组件？

### 2. 关注关键路径

```typescript
// 以一个 API 路由为例
export async function POST(req: Request) {
  // 1. 输入：从请求中获取数据
  const { email, password } = await req.json();

  // 2. 处理：调用 Supabase 认证
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // 3. 输出：返回结果
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ user: data.user });
}
```

关键路径：**输入 → 处理 → 输出**。先确认这三步是否正确。

### 3. 检查常见陷阱

#### 错误处理是否完整

```typescript
// ❌ 没有错误处理
const data = await fetch('/api/data');
const json = await data.json();

// ✅ 有错误处理
const data = await fetch('/api/data');
if (!data.ok) {
  throw new Error(`API error: ${data.status}`);
}
const json = await data.json();
```

#### 类型是否正确

```typescript
// ❌ 用了 any，绕过了类型检查
function processData(data: any) { ... }

// ✅ 明确的类型
interface UserData {
  id: string;
  name: string;
  email: string;
}
function processData(data: UserData) { ... }
```

#### 是否使用了真实的 API

AI 有时会编造不存在的函数或库。看到不熟悉的 API 调用时：
- 在项目依赖中确认库是否安装了
- 搜索官方文档确认函数是否存在
- 检查参数是否和文档一致

### 4. 运行并测试

最终的验证方式永远是**运行代码**：

- 保存文件，看浏览器是否报错
- 打开浏览器开发者工具（F12），检查 Console 和 Network
- 测试正常流程和异常流程

## 快速评估清单

拿到 AI 生成的代码后，过一遍这个清单：

- [ ] **能运行吗？** — 保存后没有报错
- [ ] **做对了吗？** — 功能和预期一致
- [ ] **import 对吗？** — 引入的库都安装了，路径正确
- [ ] **有错误处理吗？** — 异常情况不会导致崩溃
- [ ] **安全吗？** — 没有暴露敏感信息，有输入验证
- [ ] **风格一致吗？** — 和项目现有代码风格相似

## 不理解的代码怎么办

直接问 AI：

```
"请逐行解释以下代码的作用，特别是：
1. [具体不理解的部分]
2. 为什么要这样写
3. 有没有更简单的写法

[粘贴代码]"
```

## 小结

- **不要盲目接受** AI 生成的代码
- 先看整体结构，再关注关键路径，最后检查细节
- **运行是最好的验证** — 能跑通的代码不一定对，但跑不通的代码一定有问题
- 不理解就问 AI 解释，这是学习的最好时机
- 随着经验积累，你阅读代码的速度和质量会不断提高
