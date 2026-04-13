# 世界模型 (World Models) 综合调研

> AI 领域最前沿的研究方向之一：让机器像人类一样构建对世界的内部表征，从而实现预测、推理和规划。

## 目录

- [概述](#概述)
- [核心科学家与领军人物](./01-scientists.md)
- [关键实验室与机构](./02-labs.md)
- [里程碑论文](./03-papers.md)
- [重要演讲、视频与文章](./04-talks-and-articles.md)
- [应用领域](./05-applications.md)
- [五大技术路线](./06-five-approaches.md)
- [参考文献](./07-references.md)

## 概述

**世界模型 (World Model)** 是一种 AI 系统内部对环境的神经网络表征，使智能体能够预测"接下来会发生什么"。正式定义：将当前世界状态和动作映射为对下一状态预测的函数——让 AI 能够在内部"想象"或模拟世界，类似人类的心智模型。

### 历史起源

- **1943年**：苏格兰心理学家 **Kenneth Craik** 在《The Nature of Explanation》中首次提出"心智模型"概念
- **1990年**：**Jürgen Schmidhuber** 发表 "Making the World Differentiable"——被广泛认为是使用 RNN 作为世界模型进行规划的**第一篇论文**
- **2018年**：**David Ha & Jürgen Schmidhuber** 发表 "World Models"——奠定现代世界模型研究的标志性论文
- **2022年**：**Yann LeCun** 发表 "A Path Towards Autonomous Machine Intelligence"——提出 JEPA 架构和世界模型路线图
- **2024-2026年**：世界模型进入爆发期，数十亿美元资金涌入

### 为什么世界模型重要？

1. **超越语言模型的局限**：LLM 处理语言 token，但缺乏对物理现实的理解
2. **实现真正的推理与规划**：在行动前通过内部模拟预测后果
3. **更安全高效的学习**：在模拟中训练，减少真实世界的风险
4. **泛化到新场景**：理解世界运作规律，而不仅是模式匹配
