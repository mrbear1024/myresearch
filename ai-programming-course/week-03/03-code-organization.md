# 03 — 代码组织：项目结构设计

> 学习目标：学会设计清晰的项目结构，理解模块划分和关注点分离的原则。

## 为什么项目结构重要

好的项目结构就像一个整理有序的房间——你能快速找到任何东西。坏的项目结构就像堆满杂物的仓库——连作者自己都找不到文件。

```
❌ 所有文件堆在一起：
src/
├── index.ts
├── utils.ts           # 1000 行的工具函数
├── api.ts             # 所有 API 都在这里
├── components.tsx     # 所有组件都在这里
└── types.ts           # 所有类型都在这里

✅ 按职责组织：
src/
├── app/               # 路由和页面
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
│       └── chat/route.ts
├── components/        # UI 组件
│   ├── ChatInput.tsx
│   ├── MessageList.tsx
│   └── Sidebar.tsx
├── lib/               # 业务逻辑和工具
│   ├── ai.ts
│   ├── db.ts
│   └── auth.ts
└── types/             # 类型定义
    └── index.ts
```

## 组织原则

### 1. 关注点分离（Separation of Concerns）

每个文件/模块只负责一件事：

| 关注点 | 对应位置 | 例子 |
|--------|---------|------|
| 页面路由 | `app/` | URL → 页面的映射 |
| UI 展示 | `components/` | 按钮、表单、列表 |
| 业务逻辑 | `lib/` | 调用 API、处理数据 |
| 数据访问 | `lib/db.ts` | 数据库查询 |
| 类型定义 | `types/` | TypeScript 接口和类型 |

### 2. 就近原则（Colocation）

相关的文件放在一起：

```
# 组件和它的样式、测试放在同一个目录
components/
├── ChatInput/
│   ├── ChatInput.tsx         # 组件
│   ├── ChatInput.test.tsx    # 测试
│   └── ChatInput.module.css  # 样式
```

### 3. 单一职责

一个文件不超过 200-300 行。如果超过了，说明它做了太多事情，需要拆分。

```
# 拆分前：一个巨大的 utils.ts
utils.ts (800 行)

# 拆分后：按功能分成多个小文件
lib/
├── format.ts    # 格式化相关
├── validate.ts  # 验证相关
├── date.ts      # 日期相关
└── string.ts    # 字符串相关
```

## Next.js 项目结构推荐

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 全局布局
│   │   ├── page.tsx            # 首页
│   │   ├── globals.css         # 全局样式
│   │   ├── chat/
│   │   │   └── page.tsx        # /chat 页面
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # /api/chat 接口
│   ├── components/             # 可复用的 UI 组件
│   │   ├── ui/                 # 基础 UI（按钮、输入框等）
│   │   └── features/           # 业务组件（聊天窗口、用户卡片等）
│   ├── lib/                    # 工具和业务逻辑
│   │   ├── supabase.ts         # Supabase 客户端
│   │   ├── ai.ts               # AI API 封装
│   │   └── utils.ts            # 通用工具函数
│   └── types/                  # TypeScript 类型
│       └── index.ts
├── public/                     # 静态资源（图片、图标等）
├── CLAUDE.md                   # AI 编程规则
├── .env.local                  # 环境变量（不提交到 Git）
├── .env.example                # 环境变量模板（提交到 Git）
├── package.json
└── tsconfig.json
```

## 命名约定

| 类型 | 约定 | 例子 |
|------|------|------|
| 组件文件 | PascalCase | `ChatInput.tsx` |
| 工具文件 | camelCase | `formatDate.ts` |
| 目录名 | kebab-case | `chat-history/` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 环境变量 | UPPER_SNAKE_CASE | `OPENAI_API_KEY` |

## 何时重组结构

当出现以下信号时，说明需要调整项目结构：

- 经常在文件夹之间来回找文件
- 一个文件超过了 300 行
- 新功能不知道该放在哪个目录
- 多个文件中有重复的代码
- 修改一个功能需要改很多不相关的文件

## 用 AI 辅助组织代码

```
提示词示例：

请分析这个项目的目录结构，指出组织不合理的地方，
并建议更好的结构。重点关注：
1. 是否符合关注点分离
2. 是否有过大的文件需要拆分
3. 命名是否一致
```

## 关键收获

1. **关注点分离**：每个文件/模块只负责一件事
2. **就近原则**：相关文件放在一起
3. **单一职责**：文件不超过 200-300 行
4. **一致的命名**：团队统一命名约定
5. **持续整理**：项目结构不是一次性设计好的，随着项目成长持续调整
