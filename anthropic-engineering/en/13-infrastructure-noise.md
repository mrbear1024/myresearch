# Infrastructure Noise in Agentic Coding Benchmarks

> Source: https://www.anthropic.com/engineering/infrastructure-noise
> Published: 2025

Infrastructure configuration can swing agentic coding benchmarks by several percentage points—sometimes more than the leaderboard gap between top models. In this post, we share what we've learned about how infrastructure affects benchmark scores and what the community can do about it.

## The problem

Public benchmarks are typically meant to measure pure model capabilities, but in practice they risk conflating them with infrastructure quirks. A 2-point lead on a leaderboard might reflect a genuine capability difference, or it might reflect that one eval ran on beefier hardware, or even at a luckier time of day.

Agentic evals are end-to-end system tests by construction, and any component of that system can act as a confounder. Every element of the evaluation setup can influence the final score: cluster health, hardware specs, concurrency level, and even egress bandwidth.

## Terminal-Bench 2.0 case study

We run Terminal-Bench 2.0 on a Google Kubernetes Engine (GKE) cluster. While calibrating the setup, we noticed scores didn't match the benchmark's official leaderboard, and infra error rates were surprisingly high: as many as **6% of tasks were failing because of pod errors**, most of which were unrelated to the model's ability to solve the tasks.

### Time-of-day effects

We observed anecdotally that pass rates fluctuate with time of day, likely because API latency varies with traffic patterns and incidents. This illustrates that the boundary between "model capability" and "infrastructure behavior" is blurrier than a single benchmark score suggests.

## Resource allocation experiments

We systematically varied resource allocation to measure its impact:

### 1x to 3x resources
Between baseline (1x) and 3x resources, we saw infrastructure errors drop significantly. The additional resources primarily fixed reliability problems—pods that would crash or timeout at lower resource levels ran successfully with more headroom.

### 3x to uncapped resources
Between 3x and uncapped resources, infra errors dropped an additional **1.6 percentage points**, while success jumped almost **4 percentage points**. The extra resources enabled the agent to try approaches that only work with generous allocations.

### Total impact
At uncapped resources, the total lift over 1x is **+6 percentage points** (p < 0.01). This is a significant effect—larger than the gap between many models on agentic coding leaderboards.

### Two distinct effects

Up to roughly 3x Terminal-Bench specs, the additional resources fix infrastructure reliability problems. The sandboxing provider used by the Terminal-Bench maintainers is implicitly doing this behind the scenes. Above the 3x mark, however, additional resources start actively helping the agent solve problems it couldn't solve before.

## Implications

### For benchmark consumers
Without published or standardized setup configurations, it's hard to tell from the outside whether a score difference reflects a genuine capability difference or just an infrastructure difference. Benchmark scores should be interpreted with this uncertainty in mind.

### For benchmark creators
Infrastructure configuration should be treated as a first-class experimental variable, documented and controlled with the same rigor as prompt format or sampling temperature.

### For labs
Resource configuration for agentic evals should be treated as a first-class experimental variable, documented and controlled with the same rigor as prompt format or sampling temperature.

## Recommendations

1. **Document infrastructure**: Publish hardware specs, resource limits, and cluster configuration alongside benchmark results
2. **Run multiple trials**: Report confidence intervals, not single-point estimates
3. **Control for time effects**: Run evaluations at consistent times or randomize across time periods
4. **Separate infrastructure failures from model failures**: Track and report pod errors, timeouts, and other infrastructure issues separately
5. **Standardize resource allocation**: Agree on baseline resource configurations for popular benchmarks
