# 05 — 用 AI 创建项目

> 学习目标：使用 AI 辅助创建一个 Next.js 项目，并理解项目结构。

## 创建 Next.js 项目

打开终端，运行：

```bash
npx create-next-app@latest my-ai-chat --typescript --tailwind --app --use-npm
```

各参数含义：
- `my-ai-chat` — 项目名称
- `--typescript` — 使用 TypeScript
- `--tailwind` — 使用 Tailwind CSS 做样式
- `--app` — 使用 App Router（Next.js 推荐的路由方式）
- `--use-npm` — 使用 npm 作为包管理器

安装完成后：

```bash
cd my-ai-chat
npm run dev
```

打开浏览器访问 `http://localhost:3000`，看到 Next.js 的欢迎页面就说明成功了。

## 项目结构

```
my-ai-chat/
├── app/                    # 应用代码（最重要的目录）
│   ├── layout.tsx          # 全局布局（每个页面都会包含）
│   ├── page.tsx            # 首页（对应 /）
│   └── globals.css         # 全局样式
├── public/                 # 静态资源（图片等）
├── package.json            # 项目配置和依赖列表
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.ts      # Tailwind CSS 配置
├── next.config.ts          # Next.js 配置
└── .gitignore              # Git 忽略文件配置
```

**关键理解：**
- `app/` 目录下的文件夹结构 = 网站的 URL 结构
- `page.tsx` = 一个页面
- `layout.tsx` = 页面的通用外壳（导航栏、页脚等）

## 用 AI 理解代码

现在是用 AI 的好时机。打开 `app/page.tsx`，问 AI：

> "请解释这个 Next.js 页面组件的每一行代码，我是初学者。"

你也可以问：

> "Next.js 的 App Router 是如何根据文件夹结构生成路由的？请举例说明。"

## 第一次修改

打开 `app/page.tsx`，把默认内容替换为：

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">我的 AI 聊天应用</h1>
    </main>
  );
}
```

保存文件，浏览器会自动刷新显示新内容（这就是热更新）。

## 第一次 Git 提交

```bash
git add .
git commit -m "初始化 Next.js 项目"
```

## 安装后续需要的依赖

```bash
# Vercel AI SDK — 用于构建 AI 聊天功能
npm install ai @ai-sdk/openai

# Supabase 客户端（后面会用到）
npm install @supabase/supabase-js
```

安装完后再提交一次：

```bash
git add .
git commit -m "安装 AI SDK 和 Supabase 依赖"
```

## 小结

你现在有了一个运行中的 Next.js 项目，安装了所需的依赖，并且用 Git 做了两次版本记录。下一步，我们要在这个项目上构建 AI 聊天功能。
