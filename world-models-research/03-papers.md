# 里程碑论文

## 一、奠基性论文

### 1. Making the World Differentiable (1990)
- **作者**：Jürgen Schmidhuber
- **发表**：TU Munich 技术报告 FKI-126-90
- **链接**：[PDF](https://people.idsia.ch/~juergen/FKI-126-90_(revised)bw_ocr.pdf)
- **贡献**：第一篇使用循环神经网络作为世界模型进行规划的论文。提出学习环境动态的可微模型用于强化学习。

### 2. World Models (2018)
- **作者**：David Ha, Jürgen Schmidhuber
- **发表**：NeurIPS 2018 (正式标题: "Recurrent World Models Facilitate Policy Evolution")
- **链接**：[arXiv:1803.10122](https://arxiv.org/abs/1803.10122) | [worldmodels.github.io](https://worldmodels.github.io/)
- **贡献**：现代世界模型概念的奠基之作。VAE + RNN 架构，"在梦境中训练"概念。交互式网站是学习世界模型的最佳入门资料。

### 3. A Path Towards Autonomous Machine Intelligence (2022)
- **作者**：Yann LeCun
- **发表**：OpenReview 立场论文
- **链接**：[OpenReview PDF](https://openreview.net/pdf?id=BZ5a1r-kVsf)
- **贡献**：提出 JEPA 架构、层级规划和世界模型作为通向人类级 AI 的路径。AI 领域最有影响力的路线图文档之一。

---

## 二、Dreamer 系列 (Danijar Hafner et al.)

### 4. PlaNet: Learning Latent Dynamics for Planning from Pixels (2018/2019)
- **作者**：Danijar Hafner, Timothy Lillicrap, Ian Fischer, Ruben Villegas, David Ha, Honglak Lee
- **发表**：ICML 2019
- **链接**：[arXiv:1811.04551](https://arxiv.org/abs/1811.04551)
- **贡献**：引入 RSSM (Recurrent State-Space Model)。数据效率比无模型方法高 5000%。

### 5. DreamerV1: Dream to Control (2019/2020)
- **作者**：Danijar Hafner et al.
- **发表**：ICLR 2020
- **链接**：[arXiv:1912.01603](https://arxiv.org/abs/1912.01603)
- **贡献**：通过潜在想象学习行为，在想象轨迹中反向传播价值梯度。

### 6. DreamerV2: Mastering Atari with Discrete World Models (2020/2021)
- **作者**：Danijar Hafner et al.
- **发表**：ICLR 2021
- **链接**：[arXiv:2010.02193](https://arxiv.org/abs/2010.02193)
- **贡献**：用分类变量替代高斯潜变量，在 Atari 上超越人类水平。

### 7. DreamerV3: Mastering Diverse Domains through World Models (2023/2025)
- **作者**：Danijar Hafner, Jurgis Pasukonis, Jimmy Ba, Timothy Lillicrap
- **发表**：**Nature (2025)**
- **链接**：[arXiv:2301.04104](https://arxiv.org/abs/2301.04104) | [Nature](https://www.nature.com/articles/s41586-025-08744-2)
- **贡献**：单一配置跨 150+ 任务域。首次在 Minecraft 中不使用人类数据从零收集钻石。

---

## 三、JEPA 系列论文

### 8. I-JEPA (2023)
- **作者**：Meta AI / Yann LeCun 团队
- **链接**：[Meta AI Blog](https://ai.meta.com/blog/yann-lecun-ai-model-i-jepa/)
- **贡献**：图像 JEPA——通过比较抽象表征而非像素进行学习。

### 9. V-JEPA (2024)
- **作者**：Meta AI / Yann LeCun 团队
- **链接**：[Meta AI Blog](https://ai.meta.com/blog/v-jepa-yann-lecun-ai-model-video-joint-embedding-predictive-architecture/)
- **贡献**：视频 JEPA——在表征空间中预测被遮蔽的视频部分。非生成式模型。

### 10. V-JEPA 2 (2025)
- **作者**：Meta FAIR
- **发表**：arXiv 2025年6月
- **链接**：[arXiv:2506.09985](https://arxiv.org/abs/2506.09985) | [GitHub](https://github.com/facebookresearch/jepa)
- **贡献**：在100万小时视频上训练。首个同时实现 SOTA 视觉理解和预测的世界模型。零样本机器人控制，比 NVIDIA Cosmos 快 30 倍。

### 11. Image World Models (2024)
- **链接**：[arXiv:2403.00504](https://arxiv.org/abs/2403.00504)
- **贡献**：将 JEPA 预测泛化到遮蔽之外的更广泛损坏类型。

### 12. LeJEPA (2025)
- **作者**：Randall Balestriero, Yann LeCun
- **链接**：[arXiv:2511.08544](https://arxiv.org/abs/2511.08544)
- **贡献**：JEPA 的首个严格理论基础，引入 SIGReg 正则化方法。

---

## 四、视频生成作为世界模拟器

### 13. Video Generation Models as World Simulators (Sora 技术报告, 2024)
- **作者**：OpenAI
- **链接**：[OpenAI](https://openai.com/index/video-generation-models-as-world-simulators/)
- **贡献**：将视频生成模型定义为世界模拟器。扩大视频生成规模 = 构建通用世界模拟器。

### 14. Is Sora a World Simulator? (2024)
- **链接**：[arXiv:2405.03520](https://arxiv.org/html/2405.03520v1)
- **贡献**：批判性综述，检验视频生成模型是否真正构成世界模型。调查 250+ 研究。

### 15. Sora: A Review on Background, Technology, Limitations (2024)
- **链接**：[arXiv:2402.17177](https://arxiv.org/abs/2402.17177)
- **贡献**：对 Sora 技术的逆向工程分析。

### 16. Genie: Generative Interactive Environments (2024)
- **作者**：Google DeepMind
- **链接**：[arXiv:2402.15391](https://arxiv.org/abs/2402.15391)
- **贡献**：11B 参数基础世界模型，从无标签互联网视频训练。首个从文本/图像/草图生成交互式虚拟环境。

### 17. Cosmos World Foundation Model Platform (2025)
- **作者**：NVIDIA (77位作者)
- **链接**：[arXiv:2501.03575](https://arxiv.org/abs/2501.03575) | [nvidia.com/cosmos](https://www.nvidia.com/en-us/ai/cosmos/)
- **贡献**：面向物理 AI 的开放世界基础模型平台。在 2000万小时数据上训练。

### 18. Cosmos 2.5 (2025)
- **链接**：[arXiv:2511.00062](https://arxiv.org/abs/2511.00062)
- **贡献**：基于流的架构，统一 Text2World/Image2World/Video2World。

---

## 五、自动驾驶世界模型

### 19. GAIA-1 (2023)
- **作者**：Wayve
- **链接**：[arXiv:2309.17080](https://arxiv.org/abs/2309.17080)
- **贡献**：9B 参数生成式世界模型，无监督序列建模。

### 20. GAIA-2 (2025)
- **作者**：Wayve
- **链接**：[arXiv:2503.20523](https://arxiv.org/html/2503.20523v1)
- **贡献**：潜在扩散世界模型，多智能体交互，多相机一致性。

### 21. A Survey of World Models for Autonomous Driving (2025)
- **作者**：Tuo Feng, Wenguan Wang, Yi Yang (浙江大学)
- **链接**：[arXiv:2501.11260](https://arxiv.org/pdf/2501.11260)
- **贡献**：自动驾驶世界模型的三层分类法。

---

## 六、游戏模拟世界模型

### 22. GameNGen: Diffusion Models Are Real-Time Game Engines (2024)
- **作者**：Google Research, 特拉维夫大学, Google DeepMind
- **链接**：[arXiv:2408.14837](https://arxiv.org/html/2408.14837v1)
- **贡献**：首个完全由神经模型驱动的实时游戏引擎 (DOOM)。单 TPU 上 20fps，人类评估者几乎无法区分真实与模拟。

---

## 七、机器人世界模型

### 23. Robotic World Model (RWM, 2025)
- **作者**：ETH Zurich
- **链接**：[arXiv:2501.10100](https://arxiv.org/abs/2501.10100)
- **贡献**：双自回归机制，自监督训练，长周期预测。NeurIPS 2025 Workshop。

### 24. MoWM: Mixture-of-World-Models (2025)
- **链接**：[arXiv:2509.21797](https://arxiv.org/html/2509.21797v2)
- **贡献**：基于视频的世界模型，用于具身规划的潜在到像素特征调制。

### 25. GWM: Gaussian World Models for Robotic Manipulation (2025)
- **发表**：ICCV 2025
- **贡献**：基于高斯的可扩展世界模型，专用于机器人操作。

### 26. Humanoid World Models (2025)
- **链接**：[arXiv:2506.01182](https://arxiv.org/pdf/2506.01182)
- **贡献**：面向人形机器人的开源世界基础模型。

---

## 八、LLM 与世界模型

### 27. Reasoning with Language Model is Planning with World Model (RAP, 2023)
- **作者**：Hao et al.
- **发表**：EMNLP 2023
- **链接**：[arXiv:2305.14992](https://arxiv.org/abs/2305.14992)
- **贡献**：将 LLM 同时用作世界模型和推理代理，使用蒙特卡洛树搜索。LLaMA-33B 上的 RAP 超越 GPT-4 的 Chain-of-Thought，规划生成改进 33%。

---

## 九、综合综述论文

### 28. Understanding World or Predicting Future? A Comprehensive Survey of World Models (2024/2025)
- **作者**：丁靖涛等 (清华大学)
- **发表**：ACM Computing Surveys (2025)
- **链接**：[arXiv:2411.14499](https://arxiv.org/abs/2411.14499) | [GitHub](https://github.com/tsinghua-fib-lab/World-Model)
- **贡献**：最系统的世界模型综述。两大功能：理解当前状态 + 预测未来动态。

### 29. A Comprehensive Survey on World Models for Embodied AI (2025)
- **链接**：[arXiv:2510.16732](https://arxiv.org/abs/2510.16732)
- **贡献**：三轴分类法：功能性、时间建模、空间表征。

### 30. World Models in AI: Sensing, Learning, and Reasoning Like a Child (2025)
- **链接**：[arXiv:2503.15168](https://arxiv.org/abs/2503.15168)
- **贡献**：皮亚杰启发的方法，六大研究方向。

### 31. Beyond World Models: Rethinking Understanding in AI Models (2025)
- **链接**：[arXiv:2511.12239](https://arxiv.org/pdf/2511.12239)
- **贡献**：哲学批评——世界模型是否是表征真正理解的充分理论框架。

### 32. RLVR-World (NeurIPS 2025)
- **作者**：清华大学
- **链接**：[arXiv:2505.13934](https://arxiv.org/abs/2505.13934)
- **贡献**：使用可验证奖励的强化学习优化世界模型。

### 33. PWM: Policy Learning with Multi-Task World Models (2024)
- **链接**：[arXiv:2407.02466](https://arxiv.org/abs/2407.02466)
- **贡献**：正则化世界模型生成更平滑的优化景观，每个任务不到10分钟提取策略。
