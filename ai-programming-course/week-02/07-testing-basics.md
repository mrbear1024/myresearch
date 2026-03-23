# 07 — 测试入门

> 学习目标：理解测试的价值，学会编写基本的测试，用 AI 辅助生成测试用例。

## 为什么需要测试

- **防止回退** — 修改代码后，测试确保老功能没被破坏
- **重构信心** — 有测试在，你敢大胆改代码
- **文档作用** — 测试描述了代码应该如何工作
- **AI 验证** — 验证 AI 生成的代码是否正确

## 测试类型

```
单元测试（Unit Test）     — 测试单个函数/组件
集成测试（Integration）   — 测试多个部分协作
端到端测试（E2E）         — 模拟真实用户操作
```

初学者先掌握**单元测试**即可。

## 搭建测试环境

```bash
# 安装 Vitest（现代测试框架，比 Jest 更快）
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## 第一个测试

### 测试纯函数

```typescript
// lib/utils.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, truncate } from './utils';

describe('formatDate', () => {
  it('应该格式化日期为中文格式', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toContain('2024');
  });
});

describe('truncate', () => {
  it('短文本不截断', () => {
    expect(truncate('你好', 10)).toBe('你好');
  });

  it('长文本截断并加省略号', () => {
    expect(truncate('这是一段很长的文本', 4)).toBe('这是一段...');
  });
});
```

运行测试：

```bash
npm test
```

## 测试模式

### Arrange-Act-Assert（3A 模式）

```typescript
it('应该正确计算总价', () => {
  // Arrange（准备）
  const items = [
    { name: '商品A', price: 100 },
    { name: '商品B', price: 200 },
  ];

  // Act（执行）
  const total = calculateTotal(items);

  // Assert（断言）
  expect(total).toBe(300);
});
```

### 常用断言

```typescript
expect(value).toBe(expected);           // 严格相等
expect(value).toEqual(expected);        // 深度相等（对象/数组）
expect(value).toBeTruthy();             // 真值
expect(value).toBeFalsy();              // 假值
expect(value).toContain(item);          // 包含
expect(fn).toThrow();                   // 抛出错误
expect(value).toBeGreaterThan(number);  // 大于
```

## 用 AI 生成测试

这是 AI 的强项！把你的代码给 AI：

```
"请为以下函数编写全面的测试用例，使用 Vitest。
包括正常情况、边界情况和错误情况：

[粘贴你的函数代码]"
```

AI 通常会生成比你自己想到的更全面的测试用例。

### 测试驱动提示词

更高级的用法 — 先写测试，再让 AI 实现：

```
"我需要一个 validateEmail 函数，以下是测试用例：

it('有效邮箱返回 true', () => {
  expect(validateEmail('user@example.com')).toBe(true);
});

it('无效邮箱返回 false', () => {
  expect(validateEmail('not-an-email')).toBe(false);
});

it('空字符串返回 false', () => {
  expect(validateEmail('')).toBe(false);
});

请实现 validateEmail 函数，让所有测试通过。"
```

## 该测试什么

### 优先测试

- 核心业务逻辑（计算、转换、验证）
- 工具函数
- 复杂的条件分支

### 不需要测试

- 简单的 UI 渲染（Tailwind class 名）
- 第三方库的功能（它们有自己的测试）
- 一目了然的简单代码

## 小结

- 测试是代码质量的保险 — 改代码后跑一遍测试，没问题就放心
- **单元测试**最简单也最实用，先从这里开始
- **AI 生成测试**是高效的工作方式 — 给代码，让 AI 写测试
- 不需要 100% 测试覆盖率，先覆盖核心逻辑
