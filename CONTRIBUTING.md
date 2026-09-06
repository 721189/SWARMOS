
# Contributing to SWARMOS

Thank you for your interest in SWARMOS, the resilient decentralized swarm coordination framework. As an IIT Madras-led research initiative, we value high-rigor contributions.

## Our Philosophy: Resilience-First
We don't just accept performance improvements. We accept **robustness improvements.** Every pull request must be validated against our **High-Rigor Statistical Suite.**

## How to Contribute

### 1. Research Contributions
*   **New Baseline Algorithms**: Implement your algorithm in `swarmos/swarm_engine/` and add it to the experiment matrix.
*   **Statistical Analysis**: Help us refine our Welch's T-Test and effect size calculations.

### 2. Engineering Contributions
*   **Safety Guardrails**: Add new numerical checks to the `SafetyCompiler`.
*   **Anomaly Heuristics**: Propose new kinematic bounds for the `StrategicAnomalyFilter`.

## Testing Requirements
All PRs must pass the canonical test suite:
```bash
python3 -m unittest discover swarmos/tests
```

And maintain a **Positive Effect Size (d > 0.2)** in the adversarial interference benchmarks.

## Academic Credit
Major contributors will be acknowledged in upcoming SWARMOS research publications.
