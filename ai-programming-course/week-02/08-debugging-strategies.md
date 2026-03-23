# 08 — 调试策略

> 学习目标：掌握系统化的调试方法和浏览器开发者工具的使用。

## 调试思维

Week 1 讲了如何用 AI 调试。本节补充**工具和方法论**，让你在 AI 帮不上忙时也能自己解决问题。

## 浏览器 DevTools

按 `F12` 或 `Cmd+Option+I` 打开。

### Console 面板

```
查看错误信息（红色）
查看警告信息（黄色）
查看 console.log 输出
直接运行 JavaScript 代码
```

### Network 面板

```
查看所有网络请求
检查 API 请求和响应
查看请求状态码（200, 404, 500...）
检查请求头和响应体
查看请求耗时
```

**调试 API 问题时，Network 面板是最重要的工具。**

操作：
1. 打开 Network 面板
2. 操作页面触发请求
3. 点击具体请求查看详情
4. 检查 Status（状态码）和 Response（响应内容）

### Elements 面板

```
检查 DOM 结构
查看和修改 CSS 样式
实时调试布局问题
```

### Sources 面板

```
设置断点（Breakpoint）
单步执行代码
查看变量值
调用栈追踪
```

## 系统化调试方法

### 1. 二分法

不知道 bug 在哪？用二分法缩小范围：

```
1. 在代码中间加 console.log
2. 如果输出正常 → bug 在后半部分
3. 如果输出异常 → bug 在前半部分
4. 继续在问题区域的中间加 console.log
5. 重复直到找到问题行
```

### 2. 最小复现

把问题简化到最少的代码：

```
1. 新建一个空页面
2. 把怀疑出问题的代码搬过去
3. 一点一点加代码，直到 bug 出现
4. 最后加的那部分代码就是问题所在
```

### 3. 读错误信息

错误信息的结构：

```
TypeError: Cannot read properties of undefined (reading 'map')
    at ChatPage (app/chat/page.tsx:24:18)
    at renderWithHooks (react-dom.development.js:16305:18)
```

- 第 1 行：**什么错误** — TypeError，访问了 undefined 的 map 属性
- 第 2 行：**在哪出错** — `app/chat/page.tsx` 第 24 行第 18 列
- 后续行：**调用链** — 帮你理解代码执行路径

## console 调试技巧

```typescript
// 基本输出
console.log('变量值:', variable);

// 表格形式显示数组/对象
console.table(users);

// 分组显示
console.group('请求详情');
console.log('URL:', url);
console.log('Method:', method);
console.log('Body:', body);
console.groupEnd();

// 计时
console.time('数据加载');
await fetchData();
console.timeEnd('数据加载'); // 输出: 数据加载: 234ms

// 条件输出
console.assert(user !== null, '用户不应该为空');
```

## 常见问题速查

| 现象 | 可能原因 | 排查方法 |
|------|---------|---------|
| 页面白屏 | 组件渲染报错 | Console 查看错误 |
| 数据不显示 | API 未返回数据 | Network 检查请求 |
| 点击无反应 | 事件处理器没绑定 | Elements 检查元素 |
| 样式错乱 | CSS 类名冲突或拼写错误 | Elements 检查样式 |
| 页面卡顿 | 无限循环或大量重渲染 | Performance 面板 |
| 401 错误 | Token 过期或未携带 | Network 检查请求头 |

## 调试清单

遇到 bug 时，按顺序检查：

1. **控制台有报错吗？** → 直接看错误信息
2. **API 请求成功了吗？** → Network 面板检查
3. **数据对吗？** → console.log 打印关键变量
4. **最近改了什么？** → `git diff` 看最近的改动
5. **以上都正常？** → 设断点单步调试

## 小结

- **DevTools 是前端开发者最重要的工具** — Console 看错误，Network 看请求
- **系统化思维** — 二分法、最小复现，比盲目猜测高效得多
- **读错误信息** — 90% 的答案在错误信息里
- 调试能力和编码能力同样重要，需要刻意练习
