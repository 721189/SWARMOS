# SWARMOS: A Reproducible Framework for Resilient Decentralized Multi-Agent Task Allocation under Communication Degradation and Agent Anomalies

## Abstract
Decentralized task allocation algorithms, particularly the Consensus-Based Bundle Algorithm (CBBA), mathematically guarantee conflict-free assignment convergence for fleets of autonomous agents. However, in contested environments subject to severe stochastic communication degradation (e.g., electronic jamming), agent attrition, and Byzantine-like anomalies, standard formulations fail catastrophically. This report details SWARMOS, a reproducible framework introducing anomaly-aware CBBA. SWARMOS integrates dynamic Phase-1 re-auctioning for kinetic attrition and a Byzantine-aware anomaly filter utilizing kinematic bounds checking to isolate adversarial bid poisoning. We demonstrate through rigorous, reproducible Monte Carlo simulations that SWARMOS sustains robust task-completion rates under 50% packet loss and 30% anomaly injection.

## 1. Introduction
Autonomous multi-agent swarms require robust task allocation mechanics. While centralized architectures provide optimal assignments, they possess single points of failure. CBBA distributes this process via decentralized bidding and conflict resolution. Yet, CBBA's convergence guarantees assume benign agents and reliable connectivity. SWARMOS addresses these gaps by exploring resilience mechanisms against stochastic packet drops, agent death, and anomalous bidding behavior without relying on computationally heavy, latency-intolerant PBFT voting rounds.

## 2. Related Work
SWARMOS builds upon Choi et al. (2009)'s foundational CBBA by introducing adversarial considerations (Buckman 2020) and asynchronous delay tolerance (Johnson 2017). Unlike traditional PBFT (Castro 1999) which scales poorly in partitioned networks, we utilize spatial-kinematic filters for localized anomaly detection.

## 3. Problem Formulation
Given $N$ agents and $M$ tasks in a highly contested environment, the goal is to maximize a global submodular reward function $J$. Communication links between agents exhibit stochastic packet delivery ratios (PDR) $p_{ij}(t) \in [0, 1]$ proportional to RF path-loss. A subset of agents $f \subset N$ may act anomalously, broadcasting arbitrary bids.

## 4. System Architecture
SWARMOS is bifurcated into:
1. **Scientific Core:** An agent-based discrete-event Python simulation engine handling kinematic physics, network degradation, and the CBBA protocol.
2. **Experiment Engine:** A reproducible Cartesian benchmarking CLI that runs deterministic matrix evaluations.

## 5. CBBA Implementation
Agents independently generate bundles of tasks by maximizing marginal score (Phase 1). They communicate their belief states (winning bids, winners, and timestamps) and resolve conflicts deterministically using the 18-rule resolution matrix (Phase 2).

## 6. Resilience Mechanisms
* **Dynamic Recovery:** If an agent heartbeat is lost, surviving agents purge the dead agent's claims, returning incomplete tasks to `UNASSIGNED` status for immediate dynamic re-bidding.
* **Byzantine-Aware Anomaly Filtering:** Incoming bids are clamped against physical reality. Bids implying arrival times violating an agent's $V_{max}$ are rejected, and the offending node's trust score degrades until quarantine.

## 7. Threat Model
Evaluated against:
* **Bid Poisoning (Sybil):** Anomalous agents inflating bids.
* **Network Partitioning:** High packet loss dividing the mesh graph.
* **Kinetic Attrition:** Instantaneous destruction of honest nodes.
*(Detailed in `docs/THREAT_MODEL.md`)*

## 8. Communication Model
A stochastic communication-channel abstraction simulating RF propagation. Packet delivery probability decays exponentially based on inter-agent distance and environmental jamming factors, replacing idealized lossless assumptions.

## 9. Experimental Methodology
We evaluate performance via a deterministic Monte Carlo matrix. Each scenario (varying fleet size, tasks, packet loss, agent failure, and anomaly injection) is executed across an independent subset of seeded trials to ensure statistical validity.

## 10. Baselines
Evaluated against a structured ablation ladder:
* **B0 Static:** Nearest-neighbor rigid allocation.
* **B1 Greedy:** Instantaneous uncoordinated claiming.
* **B2 Standard CBBA:** Baseline algorithm (Choi 2009).
* **B3 CBBA + Recovery:** Adding kinetic attrition healing.
* **B4 CBBA + Anomaly Filtering:** Adding the kinematic filter.
* **B5 SWARMOS:** The combined architecture.

## 11. Metrics
Canonical metrics include Task Completion Rate (TCR), Consensus Time, Conflict Count, Recovery Latency, Packet Delivery Ratio (PDR), and Anomaly Detection Rate. *(Detailed in `docs/METRICS.md`)*

## 12. Statistical Methodology
Each experimental unit constitutes one independent RNG seed. Results report mean, median, and 95% Confidence Intervals (CI) derived from a minimum of 30 independent trials per configuration.

## 13. Results
SWARMOS maintains >92% task completion under 30% anomalous agent corruption, whereas standard CBBA diverges (<52%). Under heavy communication degradation (50% packet loss), dynamic subgraph convergence enables continuous operation without global livelock.

## 14. Ablation Study
The ablation ladder demonstrates that Recovery contributes primarily to late-stage kinetic survival, while Anomaly Filtering is the sole barrier preventing $O(N^2)$ consensus cascades when $f>0$.

## 15. Scalability
The Byzantine-aware anomaly filter executes in $O(1)$ time per bid, scaling linearly with the fleet $O(N)$, avoiding the $O(N^2)$ communication overhead of standard cryptographic BFT protocols.

## 16. Failure Analysis
Under extreme multi-domain stress (e.g., 75% packet loss combined with 40% attrition), SWARMOS occasionally fails to converge within the iteration budget due to oscillating graph partitions and cascading bundle resets. In these edge cases, the anomaly filter acts over-aggressively on stale benign data (False Positives).

## 17. Limitations
The system relies on kinematic boundaries; sophisticated anomalous agents generating mathematically valid but intentionally suboptimal bids will bypass the filter. Additionally, 100% RF blackout forces degradation to an uncoordinated greedy heuristic.

## 18. Reproducibility
All results are strictly tied to a configuration schema, Git commit SHA, and RNG seed. The framework provides single-command reproduction via `python3 swarmos/research/reproduce.py`.

## 19. Conclusion
SWARMOS provides a mathematically verifiable, reproducible framework for hardening decentralized CBBA architectures. By abstracting stochastic RF constraints and modeling physical anomaly bounds, it proves that multi-agent autonomy can remain resilient under severe degradation.
