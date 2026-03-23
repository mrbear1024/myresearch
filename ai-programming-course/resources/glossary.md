# 技术术语表

> 常用技术术语的中文解释，按类别分组。

## 通用概念

| 术语 | 英文 | 解释 |
|------|------|------|
| API | Application Programming Interface | 软件之间交流的接口，像菜单一样定义了可以做什么操作 |
| SDK | Software Development Kit | 软件开发工具包，提供现成的函数和工具 |
| CLI | Command Line Interface | 命令行界面，用文字和计算机交互 |
| IDE | Integrated Development Environment | 集成开发环境，写代码的软件（如 VS Code） |
| CRUD | Create, Read, Update, Delete | 增删改查，数据操作的四种基本类型 |
| MVP | Minimum Viable Product | 最小可行产品，用最少的功能验证想法 |
| SaaS | Software as a Service | 软件即服务，通过网络提供的在线软件 |
| 开源 | Open Source | 代码公开，任何人可以查看和使用 |

## 前端

| 术语 | 英文 | 解释 |
|------|------|------|
| 组件 | Component | 可复用的 UI 部件，如按钮、卡片、表单 |
| 状态 | State | 组件中的可变数据，变化会触发界面更新 |
| 属性 | Props | 父组件传给子组件的数据，只读 |
| 钩子 | Hook | React 提供的函数（useState, useEffect 等），用于管理组件逻辑 |
| 渲染 | Render | 把数据和组件转换成用户看到的界面 |
| 路由 | Route/Router | URL 和页面的对应关系 |
| SSR | Server-Side Rendering | 服务端渲染，在服务器上生成 HTML |
| CSR | Client-Side Rendering | 客户端渲染，在浏览器中生成界面 |
| DOM | Document Object Model | 浏览器中网页的树形结构表示 |
| 响应式 | Responsive | 界面自动适应不同屏幕尺寸 |

## 后端

| 术语 | 英文 | 解释 |
|------|------|------|
| 服务器 | Server | 接收和处理请求的计算机程序 |
| 端点 | Endpoint | API 的具体访问地址，如 /api/users |
| 中间件 | Middleware | 在请求处理之前/之后执行的代码 |
| 认证 | Authentication | 验证用户身份（你是谁） |
| 授权 | Authorization | 验证用户权限（你能做什么） |
| Token | Token | 令牌，用于认证的加密字符串 |
| Session | Session | 会话，记录用户登录状态 |
| REST | Representational State Transfer | 一种 API 设计风格 |
| 请求体 | Request Body | HTTP 请求中携带的数据 |
| 状态码 | Status Code | HTTP 响应的数字标识（200 成功、404 未找到等） |

## 数据库

| 术语 | 英文 | 解释 |
|------|------|------|
| Schema | Schema | 数据库结构定义（表、字段、关系） |
| 表 | Table | 存储数据的结构，像 Excel 的工作表 |
| 行/记录 | Row/Record | 表中的一条数据 |
| 列/字段 | Column/Field | 表中的一个数据属性 |
| 主键 | Primary Key | 唯一标识一条记录的字段 |
| 外键 | Foreign Key | 引用其他表主键的字段，建立表间关系 |
| 索引 | Index | 加速查询的数据结构，像书的目录 |
| 迁移 | Migration | 数据库结构的版本化变更 |
| SQL | Structured Query Language | 操作数据库的语言 |
| RLS | Row Level Security | 行级安全，控制用户对数据行的访问权限 |

## Git 与协作

| 术语 | 英文 | 解释 |
|------|------|------|
| 仓库 | Repository (Repo) | 代码项目的存储空间 |
| 提交 | Commit | 保存一次代码改动的快照 |
| 分支 | Branch | 代码的平行版本，用于独立开发功能 |
| 合并 | Merge | 把一个分支的改动合并到另一个分支 |
| 冲突 | Conflict | 两个分支修改了同一处代码，需要手动解决 |
| PR | Pull Request | 请求将分支合并的流程，通常包含代码审查 |
| Fork | Fork | 复制别人的仓库到自己账号下 |
| Clone | Clone | 把远程仓库下载到本地 |

## 部署与运维

| 术语 | 英文 | 解释 |
|------|------|------|
| 部署 | Deploy | 把代码发布到服务器上运行 |
| CI/CD | Continuous Integration/Deployment | 持续集成/持续部署，自动化构建和发布 |
| 环境变量 | Environment Variable | 配置信息，如 API 密钥，不写在代码里 |
| CDN | Content Delivery Network | 内容分发网络，让用户就近访问资源 |
| 域名 | Domain | 网站的地址，如 example.com |
| SSL/HTTPS | Secure Sockets Layer | 加密通信协议，URL 以 https:// 开头 |
| 回滚 | Rollback | 恢复到之前的版本 |

## AI 相关

| 术语 | 英文 | 解释 |
|------|------|------|
| LLM | Large Language Model | 大语言模型，如 GPT、Claude |
| 提示词 | Prompt | 给 AI 的指令文本 |
| 智能体 | Agent | 能使用工具和自主执行任务的 AI |
| 工具调用 | Tool Calling/Function Calling | AI 请求执行外部函数的能力 |
| 上下文 | Context | 对话中的背景信息 |
| Token | Token | AI 处理文本的基本单位（约 4 个字符 = 1 token） |
| 流式输出 | Streaming | AI 逐字生成回答，而不是等全部生成再显示 |
| RAG | Retrieval-Augmented Generation | 检索增强生成，让 AI 参考外部知识回答 |
