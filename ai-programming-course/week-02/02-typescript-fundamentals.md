# 02 — TypeScript 基础

> 学习目标：理解 TypeScript 的类型系统，写出更安全的代码。

## 为什么需要 TypeScript

JavaScript 是"动态类型" — 变量可以是任何类型，错误只在运行时才发现。

TypeScript 是"静态类型" — 在写代码时就能发现类型错误。

```typescript
// JavaScript：运行时才报错
function add(a, b) { return a + b; }
add("1", 2); // "12"，不是 3！

// TypeScript：写代码时就报错
function add(a: number, b: number): number { return a + b; }
add("1", 2); // ❌ 编辑器直接标红
```

## 基本类型

```typescript
// 原始类型
let name: string = "Alice";
let age: number = 25;
let isStudent: boolean = true;

// 数组
let scores: number[] = [90, 85, 92];
let names: string[] = ["Alice", "Bob"];

// 对象
let user: { name: string; age: number } = {
  name: "Alice",
  age: 25,
};
```

## Interface — 定义对象的形状

```typescript
// 定义接口
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;        // ? 表示可选
}

// 使用接口
const user: User = {
  id: "1",
  name: "Alice",
  email: "alice@example.com",
  // age 可以省略，因为是可选的
};

// 函数参数使用接口
function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}
```

## Type — 类型别名

```typescript
// 类型别名
type MessageRole = "user" | "assistant" | "system";

// 联合类型
type ID = string | number;

// 对象类型（和 interface 类似）
type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
};
```

### Interface vs Type

- `interface` — 主要用于定义对象结构，可以被 extends 继承
- `type` — 更灵活，可以定义联合类型、交叉类型等

日常使用中，两者差别不大。团队保持一致即可。

## 泛型（Generics）

泛型让你写出可复用的、类型安全的代码：

```typescript
// 没有泛型：只能处理 string
function firstItem(arr: string[]): string {
  return arr[0];
}

// 有泛型：任何类型都行
function firstItem<T>(arr: T[]): T {
  return arr[0];
}

firstItem<number>([1, 2, 3]);    // 返回 number
firstItem<string>(["a", "b"]);   // 返回 string
```

实际中最常见的泛型使用：

```typescript
// API 响应的通用类型
interface ApiResponse<T> {
  data: T;
  error: string | null;
}

// 用户列表响应
type UsersResponse = ApiResponse<User[]>;
// 等同于 { data: User[]; error: string | null }
```

## 函数类型

```typescript
// 函数参数和返回值类型
function add(a: number, b: number): number {
  return a + b;
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b;

// 异步函数
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// 回调函数类型
function onMessage(callback: (message: Message) => void) {
  // ...
}
```

## 常用实践

### 组件 Props 类型

```typescript
// React 组件的 props 类型
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

function Button({ label, onClick, variant = "primary", disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### 处理可能为空的值

```typescript
// 使用可选链（Optional Chaining）
const userName = user?.name;          // 如果 user 是 undefined，返回 undefined
const city = user?.address?.city;     // 多层安全访问

// 使用空值合并（Nullish Coalescing）
const displayName = user?.name ?? "匿名用户";  // 如果是 null/undefined，用默认值
```

## TypeScript 配置速查

`tsconfig.json` 中最重要的选项：

```json
{
  "compilerOptions": {
    "strict": true,           // 开启严格模式（推荐）
    "target": "ES2017",       // 编译目标
    "jsx": "react-jsx",       // JSX 支持
    "paths": {                // 路径别名
      "@/*": ["./src/*"]
    }
  }
}
```

## 小结

- TypeScript = JavaScript + 类型安全
- `interface` 和 `type` 用来定义数据结构
- 泛型 `<T>` 让代码可复用且类型安全
- `?` 表示可选，`?.` 安全访问，`??` 空值默认
- 不需要一次学完所有 TypeScript 特性，遇到不懂的问 AI 即可
