# 核心科学家与领军人物

## 1. Yann LeCun (杨立昆)

**身份**：图灵奖得主 (2018)，原 Meta/FAIR 首席 AI 科学家，NYU Silver 教授。2025年11月离开 Meta，创立 **AMI Labs**。

**核心主张**：
- LLM 是通向人类水平智能的"死胡同"——它们处理语言 token 但缺乏对物理现实的理解
- 世界模型是一个"现实的抽象数字孪生"，是实现自主机器智能的关键
- 提倡用"高级机器智能 (AMI)"替代"AGI"这个术语

**JEPA 架构 (Joint Embedding Predictive Architecture)**：
- 与生成式模型不同，JEPA 在**抽象嵌入空间**（而非像素空间）中进行预测，丢弃不可预测的噪声
- **I-JEPA** (2023)：图像 JEPA——通过比较抽象表征进行自监督学习
- **V-JEPA** (2024)：视频 JEPA——在表征空间中预测被遮蔽的视频部分
- **V-JEPA 2** (2025年6月)：在100万小时视频上训练，实现零样本机器人控制，仅需62小时机器人数据
- **LeJEPA** (2025年11月)：由 Balestriero & LeCun 提供 JEPA 的首个严格理论基础

**AMI Labs**：
- 2025年12月在巴黎创立，2026年1月正式启动
- 2026年3月完成 **10.3亿美元种子轮**（欧洲有史以来最大种子轮），估值35亿美元
- 投资者：Bezos Expeditions, Eric Schmidt, Mark Cuban, NVIDIA, Samsung, Toyota Ventures
- 核心团队：Alex LeBrun (CEO), Saining Xie (CSO), Pascale Fung (CRIO), Michael Rabbat (VP of World Models)

---

## 2. Fei-Fei Li (李飞飞)

**身份**：斯坦福大学计算机科学教授，斯坦福 HAI 联合主任，原 Google Cloud 首席科学家。ImageNet 的创建者——催化了深度学习革命。被称为"AI 教母"。

**核心理念**：**空间智能 (Spatial Intelligence)**
> "如果 AI 要真正有用，它必须理解世界，而不仅仅是文字。"
> "这是超越语言的前沿——连接想象力、感知和行动的能力。"

**World Labs**：
- 2024年创立，联合创始人：Justin Johnson, Christoph Lassner, Ben Mildenhall
- 初始融资 2.3亿美元（估值10亿美元）
- 2026年2月融资 **10亿美元**（投资者：AMD, Autodesk, NVIDIA, Fidelity, Emerson Collective, Sea）
- 估值达到 **50亿美元**

**Marble 产品** (2025年11月)：
- 首个商业产品，从文本、图像、视频或3D布局生成可编辑、可下载的3D交互环境
- 输出高斯泼溅 (Gaussian Splats)、网格 (Meshes) 或视频
- RTFM 模型将 H100 GPU 需求降低了数个数量级

**荣誉**：
- 伊丽莎白女王工程奖 (2025)
- VinFuture 大奖 (2024)
- TIME 2025年度人物特刊

---

## 3. Jürgen Schmidhuber

**身份**：深度学习先驱，LSTM 共同发明人，IDSIA (瑞士 AI 实验室) 主任，KAUST 教授。

**关键贡献**：
- **1990年**：发表 "Making the World Differentiable" (TU Munich TR FKI-126-90)——被广泛认为是**第一篇**使用循环神经网络作为世界模型进行规划的论文
  - 提出使用完全循环自监督 NN 预测感官输入（包括像素和奖励信号）
  - 通过可微世界模型的反向传播进行规划
- 早期提出人工好奇心和内在动机概念
- **2018年**：与 David Ha 合著现代世界模型的奠基论文 "World Models"

---

## 4. David Ha (大卫·哈)

**身份**：原高盛 MD，东京大学博士。Google Brain Resident (2016-17)，Research Scientist (2018-22)，领导 Google Brain Japan。后任 Stability AI 战略主管。现为 **Sakana AI** 联合创始人兼 CEO。

**关键贡献**：
- 2018年与 Schmidhuber 合著 "World Models" (arXiv: 1803.10122)
  - 提出 VAE + RNN 的世界模型架构
  - 引入"在梦境中训练"(Dream Training) 概念
  - 交互式网站：[worldmodels.github.io](https://worldmodels.github.io/)
  - NeurIPS 2018 正式发表为 "Recurrent World Models Facilitate Policy Evolution"

---

## 5. Danijar Hafner

**身份**：Google DeepMind 高级研究科学家 (Staff Research Scientist)，旧金山。

**关键贡献——Dreamer 系列**：
- **PlaNet** (2018/2019)：引入 RSSM (Recurrent State-Space Model)，数据效率比无模型方法高 5000%。ICML 2019。
- **DreamerV1** (2019/2020)：通过潜在想象学习行为，在想象的轨迹中反向传播价值梯度。ICLR 2020。
- **DreamerV2** (2020/2021)：用分类变量替代高斯潜变量，在 Atari 上超越人类。ICLR 2021。
- **DreamerV3** (2023/2025)：单一配置跨 150+ 任务，首次在 Minecraft 中不使用人类数据收集钻石。**发表于 Nature (2025)**。

---

## 6. 其他重要研究者

| 研究者 | 机构 | 贡献 |
|--------|------|------|
| **Demis Hassabis** | Google DeepMind CEO | 诺贝尔化学奖得主 (2024)，推动世界模型作为 AGI 的关键路径 |
| **Yoshua Bengio** | Mila / 蒙特利尔大学 | 图灵奖得主，认为世界模型对构建安全 AI 至关重要 |
| **Ilya Sutskever** | OpenAI 联合创始人 | 主张 LLM 通过下一词预测学习到了鲁棒的世界模型 |
| **Timothy Lillicrap** | Google DeepMind | PlaNet, DreamerV1/V2/V3 合著者 |
| **Jimmy Ba** | 多伦多大学 / DeepMind | DreamerV3 合著者 |
| **Saining Xie** | AMI Labs CSO | 原 Meta，世界模型架构关键人物 |
| **Randall Balestriero** | AMI Labs | LeJEPA 理论论文合著者 |
| **张国锋** | 浙江大学 | InSpatio-WorldFM 开源空间智能模型 |
| **丁靖涛** | 清华大学 | ACM Computing Surveys 世界模型综述第一作者 |
