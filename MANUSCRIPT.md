# SWARMOS: Physically-Grounded Byzantine Fault Tolerance in Decentralized Swarms

## Abstract
Decentralized task allocation via Consensus-Based Bundle Auctions (CBBA) is computationally efficient but fragile against Byzantine adversaries and network degradation. This paper presents SWARMOS, a framework providing resilience against Byzantine anomalies by leveraging the kinematic constraints of the physical environment as an implicit ground truth. By rejecting bids that violate physical bounds (arrival velocities, telemetry continuity, maximum marginal reward ceilings), SWARMOS establishes a rigorous resilience envelope while maintaining localized message passing ($O(k N)$ per round for local neighborhoods of degree $k$) in contrast to global quadratic/cubic consensus overheads in conventional BFT state machines.

## 1. Introduction
Modern autonomous drone swarms must execute coordinated missions in contested environments where communication is lossy and nodes may be compromised. Standard CBBA assumes honest participation, allowing a single adversarial node to cripple swarm efficiency via artificial bid inflation or cluster starvation.

## 2. The SWARMOS Architecture
SWARMOS introduces three primary resilience layers:
1. **Kinematic Anomaly Filtering**: Real-time validation of bid claims and spatial telemetry against physical velocity limits ($V_{\max}$) and maximum feasible marginal utility bounds ($R_{\max}$).
2. **Dynamic Heartbeat Recovery**: Automated detection and rapid re-auctioning of orphaned tasks assigned to failed, jammed, or quarantined nodes.
3. **Hardware Abstraction Layer (HAL)**: A standardized interface decoupling high-level consensus from low-level flight controllers (ROS 2 / PX4).

## 3. Experimental Methodology
Experiments are canonically defined in `PAPER_EXPERIMENT_SPEC.json`, evaluated across a parameterized matrix varying fleet size ($N \in \{4..128\}$), task density, packet loss rates ($p \in [0, 0.7]$), and adversarial fractions ($f \in [0, 0.5]$).

### Attack Taxonomy
- **Class A (Impossible Bid / Sybil Poisoning)**: Injects bids exceeding theoretical physical reward ceilings ($> 1.25 \times R_{\text{base}}$).
- **Class B (Strategic Malice / Cluster Starvation)**: Submits valid high bids to hoard task clusters, then refuses to execute assigned waypoints.
- **Class C (Stale Replay / Clock Desync)**: Replays expired high bids or forges logical timestamps to manipulate consensus tables.
- **Class D (Intermittent Poisoning)**: Toggles between honest participation and bid poisoning in periodic 10-second cycles to evade simple rolling windows.
- **Class E (Kinematic Telemetry Spoofing)**: Transmits falsified GPS/spatial coordinates that violate maximum physical velocity constraints ($V_{\max}$).

## 4. Key Findings
- **Resilience Advantage**: Under Class D intermittent poisoning and stochastic packet loss, SWARMOS maintains a high Task Completion Rate (TCR $\ge 0.95$), compared to standard CBBA degradation (TCR $\le 0.35$).
- **Empirical Reference Optimality**: Normalized utility ($U_{\text{actual}} / U_{\text{ref}}$) is rigorously benchmarked against a centralized reference solver evaluating the time-discounted objective $U(\pi) = \sum_j R_j \lambda^{\tau_j w_j}$.
- **Failure Envelope**: Boundary analysis identifies the operational regime $P(\text{TCR} \ge 0.90) = 1.0$ under operational constraints ($p \le 0.20, f \le 0.10$).
- **Communication Scaling**: Localized 1-hop mesh broadcasts scale with the local network degree ($O(k N)$ per round for $k$ neighbors), significantly reducing bandwidth relative to global Byzantine agreement protocols.

## 5. Conclusion
Grounding decentralized auction consensus in physical kinematics enables provable resilience against adversarial node corruption without requiring expensive global consensus infrastructure.

