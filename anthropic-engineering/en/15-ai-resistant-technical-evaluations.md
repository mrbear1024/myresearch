# AI-Resistant Technical Evaluations

> Source: https://www.anthropic.com/engineering/AI-resistant-technical-evaluations
> Published: 2025

As AI models become more capable at coding tasks, traditional technical interviews risk becoming exercises in AI-assisted problem solving rather than assessments of engineering skill. In this post, we share how our performance engineering team has iterated on their candidate take-home test as AI models have improved.

## Background

Since early 2024, our performance engineering team has used a take-home test where candidates optimize code for a simulated accelerator. Over 1,000 candidates have completed it, and dozens now work at Anthropic—including engineers who brought up our Trainium cluster and shipped every model since Claude 3 Opus.

Performance engineers at Anthropic work on tough debugging, systems design, performance analysis, figuring out how to verify correctness of systems, and making Claude's code simpler and more elegant.

## The challenge: AI changes the game

When we first designed the test, AI coding assistants were limited enough that using them didn't fundamentally change the nature of the evaluation. But as models improved, we needed to reassess.

When given the same time limit, **Claude Opus 4 outperformed most human applicants**. Claude Opus 4.5 then matched even the strongest candidates. We could no longer distinguish between top candidates and our most capable model under timed conditions.

## What makes a test AI-resistant?

Through experimentation, we identified several properties that make technical evaluations more robust to AI assistance:

### Deep systems understanding
Tasks that require understanding how hardware actually works—cache hierarchies, memory access patterns, instruction pipelines—are harder for AI to brute-force. The model needs to reason about physical constraints, not just apply algorithmic patterns.

### Iterative optimization
Problems where the optimal solution requires profiling, measuring, and iteratively tuning are harder for AI because:
- Each optimization step depends on empirical measurements
- The search space is too large to explore without understanding
- Trade-offs are hardware-specific and non-obvious

### Open-ended exploration
Problems with no single "correct" answer, where the quality of the solution depends on creativity and insight, resist AI assistance because the model doesn't know when it's "done."

## Releasing the test

We are releasing the original take-home as an **open challenge**. With unlimited time, the best human performance still exceeds what Claude can achieve. We invite the community to try it and share their approaches.

The test involves optimizing a matrix computation kernel for a simulated accelerator with specific hardware characteristics. Candidates must:
1. Understand the simulated hardware's constraints
2. Profile the baseline implementation
3. Apply optimizations iteratively
4. Achieve the highest possible throughput

## Humans vs. models with unlimited time

While models match top humans under time pressure, humans can still outperform models when given unlimited time. This suggests that the timed constraint was the real bottleneck—given enough time to reason deeply, humans bring insights that models haven't yet matched.

## Implications for technical hiring

1. **Timed tests are becoming unreliable**: Under time constraints, strong AI models match strong human candidates
2. **Open-ended, iterative problems are more robust**: Tasks requiring empirical measurement and iterative refinement are harder for AI
3. **Systems-level understanding matters**: Deep hardware and systems knowledge remains a differentiator
4. **The evaluation landscape will keep changing**: As models improve, evaluations need to evolve continuously

## Conclusion

The rapid improvement in AI coding capabilities is forcing us to rethink how we evaluate technical talent. Rather than trying to prevent AI usage, we're designing evaluations that test the deeper skills—systems intuition, iterative problem-solving, and creative optimization—that remain distinctly human advantages. We encourage other teams to share their experiences and approaches as we collectively navigate this transition.
