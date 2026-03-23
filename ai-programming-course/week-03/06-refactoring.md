# 05 — 重构的艺术

> 学习目标：识别代码坏味道，掌握常用重构手法，学会用 AI 辅助重构。

## 什么是重构

重构 = 在不改变外部行为的前提下，改善代码的内部结构。

```
重构前：代码能跑，但很乱
重构后：代码能跑，而且很清晰
```

重构**不是**重写。重写是推倒重来，重构是逐步改善。

## 代码坏味道（Code Smells）

「坏味道」是需要重构的信号。以下是最常见的几种：

### 1. 过长的函数

```typescript
// ❌ 一个函数做了太多事
async function handleSubmit(data: FormData) {
  // 验证（20 行）
  // 格式化数据（15 行）
  // 调用 API（10 行）
  // 更新 UI（15 行）
  // 发送通知（10 行）
  // 记录日志（5 行）
}

// ✅ 拆分成多个小函数
async function handleSubmit(data: FormData) {
  const validated = validateForm(data);
  const formatted = formatForApi(validated);
  const result = await submitToApi(formatted);
  updateUI(result);
  notifyUser(result);
}
```

### 2. 重复代码

```typescript
// ❌ 同样的逻辑在三个地方出现
// file1.ts
const name = user.firstName + ' ' + user.lastName;
// file2.ts
const fullName = user.firstName + ' ' + user.lastName;
// file3.ts
const displayName = user.firstName + ' ' + user.lastName;

// ✅ 提取为一个函数
function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
```

### 3. 过深的嵌套

```typescript
// ❌ 嵌套地狱
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      if (data.isValid) {
        // 终于到了真正的逻辑...
      }
    }
  }
}

// ✅ 提前返回（Guard Clauses）
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission) return;
if (!data.isValid) return;
// 直接写核心逻辑
```

### 4. 魔法数字/字符串

```typescript
// ❌ 数字的含义不明确
if (password.length < 8) { ... }
if (retryCount > 3) { ... }
setTimeout(fn, 86400000);

// ✅ 用有意义的常量
const MIN_PASSWORD_LENGTH = 8;
const MAX_RETRY_COUNT = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
```

## 何时重构

### 适合重构的时机

- **添加新功能前**：先整理相关代码，再加新功能
- **修复 bug 时**：顺便改善周围的代码
- **Code Review 中**：发现问题及时指出和修复

### 不适合重构的时机

- 临近截止日期
- 没有测试覆盖（重构可能引入 bug）
- 代码即将被废弃

## 用 AI 辅助重构

AI 是重构的利器，因为它能快速理解代码并生成替代方案：

```
提示词示例：

请重构这段代码，重点改善：
1. 函数过长 — 拆分成更小的函数
2. 消除重复代码
3. 改善命名

要求：
- 保持外部行为不变
- 每次只做一种重构
- 解释你做了什么改动以及为什么
```

### 重构步骤（使用 Claude Code）

```bash
# 1. 确保测试通过
npm test

# 2. 用 Claude Code 进行重构
claude
# > 请帮我重构 src/lib/chat.ts，这个文件有 400 行，需要拆分

# 3. 重构后再次运行测试
npm test

# 4. 确认测试通过后提交
git add -A && git commit -m "refactor: 拆分 chat.ts 为独立模块"
```

## 关键收获

1. **重构 ≠ 重写**：小步改进，不要推倒重来
2. **识别坏味道**：过长函数、重复代码、深嵌套、魔法数字
3. **有测试再重构**：没有测试就重构等于裸奔
4. **小步前进**：每次只做一种重构，做完就测试
5. **AI 是最好的重构伙伴**：让 AI 分析代码并建议改善方案
