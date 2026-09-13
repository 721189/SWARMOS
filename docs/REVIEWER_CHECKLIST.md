# SWARMOS: Reviewer Attack Checklist (Phase 26)

This document anticipates and provides pre-emptive rebuttals for critical reviewer attacks.

## 1. "Novelty is incremental over CBBA (Choi 2009)"
- **Defense**: CBBA assumes a benign environment. SWARMOS introduces the **Strategic Anomaly Filter**, which detects physically implausible bid-histories without the overhead of full BFT. We provide the first characterization of "Failure Envelopes" for CBBA under Class A-E attacks.
- **Evidence**: See Figure 4 (TCR collapse of Standard CBBA vs. Resilience of SWARMOS).

## 2. "Why not just use conventional BFT (PBFT/Raft)?"
- **Defense**: Conventional BFT requires $O(N^2)$ communication and multiple consensus rounds. SWARMOS achieves "Physically Grounded Byzantine Tolerance" with $O(N)$ communication by leveraging the kinematic constraints of the agents as a source of truth.
- **Evidence**: See Table 2 (Communication Overhead Comparison).

## 3. "The simulation is too simple (no ROS/Gazebo)"
- **Defense**: We utilize a **Hardware Abstraction Layer (HAL)** that standardizes the interface between our engine and real-world flight controllers. The "Isolation Mode" separates algorithmic effects from kinematics, ensuring the mathematical core is valid before physical deployment.
- **Evidence**: See `swarmos/swarm_engine/hal.py`.

## 4. "Adversarial nodes could just spoof GPS"
- **Defense**: Explicitly conceded in **Limitations (Section VI-B)**. SWARMOS targets "Logically Inconsistent" bidding rather than "Sensory Spoofing." We define the scope as resilient *task allocation*, not resilient *localization*.

## 5. "Sample size is too small"
- **Defense**: We use a Cartesian matrix of **4,860 unique configurations** with 50+ Monte Carlo trials each, yielding $p < 0.001$ significance across all primary claims.
- **Evidence**: See `verify_claims.py` output.
