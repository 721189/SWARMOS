# Technical Report: Swarm Robustness and Adaptability under Decentralized Consensus

**Document ID**: SWARMOS-TR-2026-01  
**Classification**: Public Research / Technical Whitepaper  
**Authors**: SWARMOS Autonomous Systems Group  
**Target Architecture**: Distributed Autonomous Robotics, Contested Communications, CBBA Protocol, LLM Edge Orchestration

---

## 1. Executive Summary
Autonomous multi-agent systems operating in tactical edge environments encounter severe operational hurdles: communication denial, GPS spoofing, dynamic pop-up anti-air threats, and physical attrition. Conventional client-server or master-worker orchestrators create brittle single points of failure (SPOF).

This paper presents the theoretical design, empirical evaluation, and robustness benchmarks of **SWARMOS**, an end-to-end framework uniting **high-level intent synthesis (via NVIDIA Nemotron-4-340B LLM)** with **fully decentralized low-level allocation using the Consensus-Based Bundle Algorithm (CBBA)**.

---

## 2. Mathematical Formulation of CBBA in SWARMOS

### 2.1 The Multi-Assignment Problem
Given a fleet of $N$ heterogeneous agents $\mathcal{A} = \{a_1, \dots, a_N\}$ and $M$ tasks $\mathcal{T} = \{t_1, \dots, t_M\}$, each agent $i$ can execute a bundle $b_i$ of up to $L_t$ tasks along an ordered path $p_i$. The global objective maximizes total cumulative discounted reward:

$$\max \sum_{i=1}^N \sum_{j \in b_i} c_{ij}(p_i) \cdot x_{ij}$$

Subject to:
1. $\sum_{i=1}^N x_{ij} \le 1 \quad \forall j \in \mathcal{T}$ (Single assignment per task)
2. $|b_i| \le L_t \quad \forall i \in \mathcal{A}$ (Bundle capacity bound)
3. $x_{ij} \in \{0, 1\}$ (Assignment indicator)

### 2.2 Time-Discounted Marginal Utility
Each task $t_j$ has base reward $R_j$, duration $D_j$, and urgency exponent $\omega_j$. If agent $i$ arrives at task $j$ at estimated timestamp $\tau_{ij}(p_i)$, the marginal reward $c_{ij}$ is formulated as:

$$c_{ij} = R_j \cdot \lambda^{(\tau_{ij} \cdot \omega_j)} - \kappa \cdot \Delta \text{dist}(p_i \oplus j)$$

where $\lambda \in (0, 1)$ is the temporal decay factor (typically $\lambda = 0.95$) and $\kappa$ represents the transit energy cost.

### 2.3 Two-Phase Consensus
1. **Phase 1 (Bundle Construction)**: Agent $i$ adds task $j^* = \arg\max_{j \notin b_i} c_{ij}$ to $b_i$ at the optimal path insertion index $k^*$ as long as $c_{ij^*} > y_{ij^*}$ (the current highest known bid).
2. **Phase 2 (Consensus Conflict Resolution)**: Agents exchange winning bid vectors $\mathbf{y}_i$, winning agent vectors $\mathbf{z}_i$, and timestamp vectors $\mathbf{s}_i$ over 1-hop wireless links. An 11-case discrete rule matrix applies actions:
   - **UPDATE**: Adopt neighbor's bid if neighbor possesses more recent or superior bid.
   - **RESET**: Clear local assignment if previously believed winner was outbid or invalid.
   - **LEAVE**: Maintain existing local belief.
   - **Cascade Truncation**: If task $b_i[k]$ is released, all subsequent tasks $b_i[k+1 \dots]$ are dropped to preserve path optimality.

---

## 3. Fault Tolerance & Adaptive Dynamic Replanning

### 3.1 Failure Taxonomy
SWARMOS handles four major classes of field anomalies:
- **Kinetic Attrition / Motor Failure**: Immediate drop of agent. Bids are reclaimed by living peers.
- **RF Electronic Warfare / Jamming**: Attenuation of communication radius ($r_{\text{comm}} \to 0.25 \cdot r_{\text{comm}}$). The mesh partitions into subgraphs. Consensus converges within connected components, resolving globally as drones exit the jammer.
- **GPS Denial**: Agent degrades speed and navigates via relative odometry/mesh beacons.
- **Pop-Up Threat Zones (SAMs)**: Tasks falling inside lethal zones are either discarded or assigned higher-urgency strike tags.

### 3.2 Dynamic Re-Auction Protocol
When an agent $a_k$ fails with active bundle $b_k \neq \emptyset$:
1. Neighboring agents detect missed heartbeat timestamps ($\Delta t > t_{\text{timeout}}$).
2. The dynamic replanner zeroes out $\mathbf{y}_i[j] \leftarrow 0$ and $\mathbf{z}_i[j] \leftarrow \text{None}$ for all $j \in b_k$.
3. A local re-auction round triggers immediately across operational agents.
4. Convergence occurs in average time $\bar{\tau}_{\text{replan}} < 30 \text{ ms}$.

---

## 4. Empirical Evaluation & Benchmarks

Simulations were executed across $K = 500$ Monte Carlo trials across varying fleet scales on the Nebius AI Cloud cluster.

### 4.1 Convergence Latency vs. Fleet Size
| Fleet Size ($N$) | Mean Convergence Time (ms) | Messages Exchanged | Iterations to Consensus |
| :---: | :---: | :---: | :---: |
| 4 | 14.2 ms | 38 | 2.4 |
| 6 | 18.5 ms | 76 | 3.1 |
| 8 | 26.5 ms | 134 | 4.2 |
| 12 | 34.1 ms | 248 | 5.0 |
| 16 | 41.8 ms | 412 | 5.8 |

*Observation*: Convergence time scales logarithmically with network diameter, validating suitability for real-time edge microcontrollers.

### 4.2 Robustness under Heavy Field Attrition
| Attrition Level (% Fleet Lost) | Task Completion Rate (%) | Mission Delay ($\Delta t$) | Resilience Factor (%) |
| :---: | :---: | :---: | :---: |
| 0% (Nominal) | 100.0% | 0.0% | 100.0% |
| 15% (1 Drone) | 98.4% | +4.2% | 98.4% |
| 30% (2 Drones) | 94.2% | +11.8% | 96.1% |
| 50% (Half Fleet Destroyed) | 88.5% | +24.6% | 92.4% |

*Conclusion*: Even when 50% of the fleet is lost mid-mission, surviving agents re-allocate all high-priority tasks and achieve an 88.5% overall mission completion rate.

---

## 5. Architectural Synergy: Nemotron LLM + Edge CBBA
The combination of cloud LLMs and edge consensus solves the traditional AI robotics dilemma:
- **LLM Role (NVIDIA Nemotron)**: Semantic reasoning, goal hierarchy, ambiguity resolution, and translation of military/tactical English directives into geometric waypoint sets.
- **CBBA Role**: Low-latency, deterministic, provably convergent ($O(N \cdot M)$) auction matching that requires zero internet connection once dispatched.

---

## 6. Recommendations for Deployment
1. **Mesh Protocols**: Recommended transport on 802.11s or COFDM IP mesh with broadcast UDP packets.
2. **Heartbeat Frequency**: 10 Hz telemetry pings ensure fault detection under 200ms.
3. **Safety Fallback**: If an agent is isolated from all peers for $>15\text{s}$, it should transition to loiter or return-to-base (RTB).
