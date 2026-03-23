# 07 — 实战：构建 AI 智能体项目

> 学习目标：理解 AI Agent 的概念，构建一个具有工具调用能力的 AI 智能体。

## 什么是 AI 智能体（Agent）

普通的 AI 聊天 = **你问一个问题，AI 给一个回答**。

AI 智能体 = **你给一个目标，AI 自己思考、使用工具、分步执行来完成目标**。

```
普通聊天：
  用户："今天北京天气怎么样？"
  AI："我无法获取实时天气信息。"

AI 智能体：
  用户："今天北京天气怎么样？"
  AI：[调用天气 API] → [获取数据] → "北京今天晴，25°C，适合外出。"
```

关键区别：智能体可以**使用工具**来获取信息和执行操作。

## 我们要构建什么

一个**研究助手智能体**：

- 用户输入一个主题
- AI 智能体自动搜索相关信息
- 整理并总结搜索结果
- 把结果保存到数据库

## 第一步：理解工具调用（Tool Calling）

AI 模型本身只能生成文本。但通过"工具调用"机制，AI 可以请求执行外部函数：

```typescript
// 定义一个工具
const tools = {
  searchWeb: {
    description: '搜索互联网获取最新信息',
    parameters: {
      query: { type: 'string', description: '搜索关键词' },
    },
    execute: async ({ query }) => {
      // 实际执行搜索的代码
      const results = await fetch(`/api/search?q=${query}`);
      return results.json();
    },
  },
};
```

AI 看到工具定义后，会在需要时主动"选择"使用某个工具。

## 第二步：创建智能体 API 路由

创建 `app/api/agent/route.ts`：

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `你是一个研究助手。当用户提出问题时，你会：
1. 分析问题，确定需要搜索的关键信息
2. 使用提供的工具获取信息
3. 整理并总结获取到的信息
4. 给出结构化的回答`,
    messages,
    tools: {
      getWeather: tool({
        description: '获取指定城市的天气信息',
        parameters: z.object({
          city: z.string().describe('城市名称'),
        }),
        execute: async ({ city }) => {
          // 示例：返回模拟的天气数据
          // 实际项目中可以调用真实的天气 API
          return {
            city,
            temperature: '25°C',
            condition: '晴',
            humidity: '45%',
          };
        },
      }),
      calculate: tool({
        description: '执行数学计算',
        parameters: z.object({
          expression: z.string().describe('数学表达式，如 "2 + 3 * 4"'),
        }),
        execute: async ({ expression }) => {
          try {
            // 注意：实际生产中不应该用 eval，这里仅作演示
            const result = new Function(`return ${expression}`)();
            return { expression, result };
          } catch {
            return { expression, error: '计算错误' };
          }
        },
      }),
    },
    maxSteps: 5, // 最多调用 5 次工具
  });

  return result.toDataStreamResponse();
}
```

## 第三步：创建智能体界面

创建 `app/agent/page.tsx`：

```tsx
'use client';

import { useChat } from 'ai/react';

export default function AgentPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agent',
  });

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">AI 研究助手</h1>
        <p className="text-sm text-gray-500">我可以帮你查天气、做计算，试试问我！</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto max-w-sm'
                  : 'bg-gray-100 mr-auto max-w-lg'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* 显示工具调用信息 */}
            {message.toolInvocations?.map((toolInvocation, i) => (
              <div key={i} className="ml-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-medium">🔧 调用工具：{toolInvocation.toolName}</p>
                {'result' in toolInvocation && (
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(toolInvocation.result, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 p-3">智能体正在思考和执行...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="问我任何问题..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}
```

## 第四步：安装依赖并测试

```bash
npm install zod    # 如果还没安装的话
npm run dev
```

访问 `http://localhost:3000/agent`，试试：

- "北京今天天气怎么样？"
- "帮我算一下 123 * 456 + 789"
- "上海和北京今天哪个更热？"（智能体会调用两次天气工具）

## 扩展思路

你可以让 AI 帮你添加更多工具：

```
"请帮我给 AI 智能体添加一个新工具：搜索新闻。
使用 [某新闻 API] 获取最新新闻。
参考现有的 getWeather 工具的写法。"
```

常见的工具类型：
- 网页搜索
- 数据库查询
- 发送邮件
- 文件操作
- 第三方 API 调用

## Git 提交

```bash
git add .
git commit -m "实现 AI 智能体研究助手"
git push
```

## 小结

- **AI 智能体 = AI + 工具调用** — 让 AI 不仅能说，还能做
- **工具定义**包含描述和参数，AI 根据对话内容自主选择工具
- **maxSteps** 控制 AI 最多调用几次工具（防止无限循环）
- 智能体是当前 AI 应用的重要方向，值得深入探索
