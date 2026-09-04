# SWARMOS Experiment Protocol & Reproducibility Guide

## Protocol Parameters
- **Random Seed**: `42` (deterministic pseudo-random number generation)
- **Environment**: Nebius AI Cloud (`k8s-gpu-nemotron-west1`) / Local Container Emulation
- **Fleet Sizes**: `[4, 6, 8, 12, 16]`
- **Task Densities**: `[5, 10, 15, 25]`
- **Communication Range**: `[25m, 50m, 100m]`
- **Packet Loss Rates**: `[0.0, 0.1, 0.2, 0.3, 0.5]`
- **Agent Failure Rates**: `[0.0, 0.1, 0.2]`
- **Monte Carlo Trials**: `20 trials per configuration`
- **Statistical Confidence**: Mean, Standard Deviation, and 95% Confidence Interval ($\pm 1.96 \frac{\sigma}{\sqrt{N}}$)
