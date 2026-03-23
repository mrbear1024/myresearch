# 08 — 部署到 Vercel

> 学习目标：将应用部署到 Vercel，让全世界都能访问你的作品。

## 部署前准备

确认以下事项：

- 代码已推送到 GitHub
- `.env.local` 中的环境变量已记录（部署时需要配置）
- 应用在本地运行正常

## 第一步：推送代码到 GitHub

如果还没有推送到 GitHub：

```bash
# 在 GitHub 上创建一个新仓库（不要勾选 README）
# 然后运行：
git remote add origin https://github.com/你的用户名/my-ai-chat.git
git push -u origin main
```

## 第二步：连接 Vercel

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 **Add New** → **Project**
3. 选择你刚推送的 GitHub 仓库
4. Vercel 会自动检测到这是 Next.js 项目

## 第三步：配置环境变量

在部署设置页面，展开 **Environment Variables**，添加：

| 变量名 | 值 |
|--------|-----|
| `OPENAI_API_KEY` | 你的 OpenAI API 密钥 |
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |

> ⚠️ 不带 `NEXT_PUBLIC_` 前缀的变量只在服务端可用（更安全）。带前缀的会暴露给浏览器。API 密钥一定不要加前缀。

## 第四步：部署

点击 **Deploy**，等待构建完成（通常 1-2 分钟）。

部署成功后，你会得到一个 URL，类似：

```
https://my-ai-chat-xxx.vercel.app
```

打开这个 URL，你的应用已经在线了！

## 自动部署

从现在开始，每次你推送代码到 GitHub：

```bash
git add .
git commit -m "新功能"
git push
```

Vercel 会**自动重新部署**。你不需要手动操作。

## 自定义域名（可选）

如果你有自己的域名：

1. 在 Vercel 项目设置 → **Domains**
2. 添加你的域名
3. 按提示在域名注册商处添加 DNS 记录
4. 等待 DNS 生效（几分钟到几小时）

## 部署后检查

- [ ] 首页能正常打开
- [ ] 聊天功能正常工作
- [ ] AI 能正常回复
- [ ] 聊天记录能保存（检查 Supabase）

## 常见问题

- **构建失败**：查看 Vercel 的构建日志，通常是 TypeScript 类型错误或缺少环境变量
- **API 不工作**：检查环境变量是否正确配置
- **页面 404**：确认文件结构和路由是否正确

遇到问题时，把 Vercel 的错误日志复制给 AI，让它帮你分析。

## Git 提交

```bash
git add .
git commit -m "配置 Vercel 部署"
git push
```

## 小结

恭喜！你的应用已经上线了！让我们回顾一下今天完成的事情：

```
搭建环境 → 创建项目 → 构建聊天功能 → 接入数据库 → 部署上线
```

从零到一个线上可用的 AI 聊天应用，全程用 AI 辅助完成。你已经迈出了 AI 编程的第一步！
