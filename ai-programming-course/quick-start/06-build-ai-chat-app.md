# 06 — 实战：构建 AI 聊天应用

> 学习目标：使用 AI 辅助，构建一个完整的 AI 聊天界面，实现对话功能。

## 整体思路

我们要构建的功能：

1. 一个聊天界面，用户可以输入消息
2. 消息发送到后端 API
3. 后端调用 AI 模型（OpenAI / Anthropic）
4. AI 的回复以流式（打字机效果）显示在界面上

## 第一步：配置 API 密钥

在项目根目录创建 `.env.local` 文件：

```bash
# 使用 OpenAI
OPENAI_API_KEY=sk-你的密钥

# 或使用 Anthropic
ANTHROPIC_API_KEY=sk-ant-你的密钥
```

> ⚠️ 这个文件已经在 `.gitignore` 中，不会被提交到 GitHub。**绝对不要把 API 密钥推送到公开仓库。**

## 第二步：创建后端 API 路由

创建文件 `app/api/chat/route.ts`：

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

**让 AI 帮你理解这段代码：**

> "请解释这个 Next.js API 路由的作用，特别是 streamText 和 toDataStreamResponse 的含义。"

## 第三步：创建聊天界面

创建文件 `app/chat/page.tsx`：

```tsx
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white ml-auto max-w-xs'
                : 'bg-gray-100 text-gray-900 mr-auto max-w-md'
            }`}
          >
            <p className="text-sm font-medium mb-1">
              {message.role === 'user' ? '你' : 'AI'}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 text-gray-500 p-3 rounded-lg mr-auto">
            AI 正在思考...
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="输入你的消息..."
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

## 第四步：测试

1. 确保开发服务器正在运行：`npm run dev`
2. 访问 `http://localhost:3000/chat`
3. 输入消息，点击发送
4. 你应该能看到 AI 的回复以流式方式显示

## 第五步：更新首页导航

修改 `app/page.tsx`，添加一个链接到聊天页：

```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">我的 AI 聊天应用</h1>
      <Link
        href="/chat"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        开始聊天
      </Link>
    </main>
  );
}
```

## 如何用 AI 辅助开发

在这个过程中，你可以随时向 AI 提问：

- **遇到报错**："我在运行 npm run dev 时遇到了这个错误：[粘贴错误信息]，请帮我解决。"
- **想加功能**："我想给聊天界面加一个清除历史的按钮，请帮我修改代码。"
- **不理解代码**："`'use client'` 这行是什么意思？为什么需要它？"
- **想改样式**："请帮我把聊天气泡改成微信风格的样式。"

关键策略：**先让 AI 生成，然后自己阅读理解，再提出修改意见。**

## Git 提交

```bash
git add .
git commit -m "实现 AI 聊天功能"
```

## 常见问题

- **API 报错 401**：检查 `.env.local` 中的 API 密钥是否正确
- **页面空白**：检查浏览器控制台（F12）是否有错误
- **流式响应不工作**：确保安装了正确版本的 `ai` 包

## 小结

你已经构建了一个能工作的 AI 聊天应用！虽然代码是 AI 帮你生成的，但理解每一部分的作用很重要。花几分钟回顾一下刚才写的代码，确保你大致理解了数据流向：

```
用户输入 → 前端组件 → API 路由 → AI 模型 → 流式响应 → 显示在界面
```
