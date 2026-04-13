# A Postmortem of Three Recent Issues

> Source: https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues
> Published: 2024

In this post, we share details about three recent issues that affected the Claude API, what caused them, how we fixed them, and what we're doing to prevent similar issues in the future.

## Incident 1: Token generation misconfiguration (August 25)

On August 25, a misconfiguration was deployed to the Claude API TPU servers that caused an error during token generation. A runtime performance optimization occasionally assigned a high probability to tokens that should rarely be produced.

### Impact
Users experienced degraded output quality, including unexpected characters, garbled text, and nonsensical responses. The issue was intermittent and difficult to detect through standard monitoring.

### Root cause
A performance optimization in the token generation pipeline introduced a subtle bug that shifted probability distributions. Under specific conditions, low-probability tokens received disproportionately high sampling weights.

### Resolution
We rolled back the optimization and added detection tests for unexpected character outputs to our deployment process.

## Incident 2: Output quality degradation

A separate issue caused users to report that Claude's outputs felt "different" or lower quality. The change was subtle enough that automated benchmarks didn't flag it, but users noticed differences in tone, helpfulness, and reasoning quality.

### Root cause
Changes to the serving infrastructure inadvertently affected model behavior. Our validation process ordinarily relies on benchmarks alongside safety evaluations and performance metrics, with engineering teams performing spot checks and deploying to small "canary" groups first.

However, these issues exposed critical gaps—the evaluations we ran didn't capture the degradation users were reporting.

### Lessons learned
- Automated benchmarks don't always catch real-world quality changes
- User feedback is a critical signal that should be systematically incorporated
- Canary deployments need to run longer and with more diverse workloads

## Incident 3: Elevated error rates

A third incident caused elevated error rates for a subset of API users, resulting in failed requests and degraded reliability.

### Root cause
Infrastructure scaling changes did not account for traffic distribution patterns, causing some server groups to become overloaded during peak usage.

### Resolution
We rebalanced traffic distribution and improved our capacity planning to account for these patterns.

## What we're doing about it

In response to these incidents, we're making several changes:

### Faster debugging tooling
We're developing infrastructure and tooling to better debug community-sourced feedback without sacrificing user privacy. Some bespoke tools developed during these incidents will be used to reduce remediation time in future incidents.

### Improved evaluation coverage
We've expanded our evaluation suites to include more nuanced quality metrics that better match user-perceived quality. This includes:
- Conversational quality assessments
- Long-form output evaluations
- Side-by-side comparisons against baseline models

### Enhanced deployment safeguards
- Detection tests for unexpected character outputs
- Longer canary deployment periods
- More diverse evaluation workloads during rollout
- Improved monitoring for subtle quality changes

### Community feedback integration
We're building better systems for incorporating user feedback into our deployment validation process, ensuring that real-world quality signals supplement automated benchmarks.

## Conclusion

These incidents reinforced that serving large language models reliably requires more than just model quality—it requires robust infrastructure, comprehensive evaluation, and close attention to user feedback. We're committed to improving on all three fronts.
