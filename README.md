# SWARMOS™: Strategic Autonomous Multi-Domain Swarm Operating System

[![Enterprise Grade](https://img.shields.io/badge/Architecture-Enterprise_Distributed-blue.svg)]()
[![Python Core](https://img.shields.io/badge/Core-Python_3.10+-yellow.svg)]()
[![TypeScript Frontend](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-cyan.svg)]()
[![AI Integration](https://img.shields.io/badge/AI-NVIDIA_Nemotron_4_340B-green.svg)]()
[![Test Suite](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen.svg)]()

**Live demo** [Deployed on vercel](swarmos-32ip3agh7-721189s-projects.vercel.app)
SWARMOS is an enterprise-grade, decentralized, fault-resilient multi-agent coordination and mission operating system designed for **Denied, Degraded, Intermittent, and Limited (DDIL)** tactical environments. It unifies distributed consensus auction protocols with deterministic safety compilation, physical stochastic RF mesh networking, and dynamic fault tolerance.

---

## 1. Mathematical & Protocol Foundations

### 1.1 Consensus-Based Bundle Algorithm (CBBA)
SWARMOS implements the distributed multi-assignment auction protocol developed by Choi, Brunet, and How (*IEEE Transactions on Robotics*, 2009). The auction iterates through two alternating phases until fleet-wide convergence:

1. **Phase 1: Greedy Bundle Construction**  
   Each agent $i \in \mathcal{A}$ iteratively inserts unassigned tasks $j \in \mathcal{T}$ into its ordered path $p_i$ to maximize marginal time-discounted score:
   $$c_{ij} = \sum_{\tau \in p_i \oplus j} \lambda^{t_\tau} \cdot R_\tau - \sum_{\tau \in p_i} \lambda^{t_\tau} \cdot R_\tau$$
   where $\lambda \in (0, 1]$ is the temporal decay factor and $t_\tau$ is the predicted arrival timestamp.

2. **Phase 2: Decentralized Consensus & Conflict Resolution**  
   Agents broadcast winning bids $y_i$ and winning agent identities $z_i$ across 1-hop ad-hoc wireless links. Conflicts are resolved via deterministic discrete rule matrices (`UPDATE`, `RESET`, `LEAVE`), designed for polynomial-time convergence without a centralized coordinator.

3. **Consensus Sanity & Node Isolation Validator (Byzantine Mitigation)**  
   Integrated directly into the Phase 2 consensus loop to validate incoming winning bids against physical ceiling bounds ($y_k \le 1.25 \times R_0$), verify kinematic displacement rates ($\Delta x / \Delta t \le v_{max}$), and quarantine untrusted or anomalous nodes from the consensus pool.

---

## 2. Hardened Architecture & Security Verification

| Hardening Focus | Technical Implementation |
| :--- | :--- |
| **Full Matrix & Reduced Benchmark Modes** | Explicit CLI (`--reduced` or default full matrix) and API modes without hidden matrix slicing or synthetic truncations. |
| **Network Packet Metrics** | Real stochastic RF channel drop in `SwarmEnvironment.transmit_packet` with physical distance attenuation and jamming degradation. Aggregates `packets_generated`, `packets_delivered`, `packets_dropped`, and `observed_packet_loss_pct`. |
| **Baseline Differentiation Suite** | 5 genuinely distinct baselines (`Static`, `Greedy`, `CBBA_Standard`, `CBBA_Recovery`, `SWARMOS`) evaluated across multi-trial seeds. |
| **Sanity & Isolation Validator** | `BftConsensusValidator` wired into `CBBAEngine` for bid sanity verification, kinematic telemetry validation, and automated node isolation. |
| **Safe Subprocess Execution** | Zero shell string interpolation; all CLI bridges use positional argument vectors (`execFileSync`) with full standard error propagation. |
| **Strict Error Handling** | API endpoints return HTTP 500 status codes with real failure payloads when simulator processes fail. |
| **Empirical Frontend Consumption** | UI dynamically loads measured simulation output from `nebius_experiment_results.json` without hardcoded mockup constants. |

---

## 3. Evaluated Coordination Baselines

1. **Static Partitioning (`Static`)**: Fixed spatial assignment at $t=0$. Zero runtime mesh overhead, but zero dynamic recovery when an agent is lost.
2. **Greedy Heuristic (`Greedy`)**: Uncoordinated local selection. High conflict rate where multiple agents attempt the same waypoint.
3. **Standard CBBA (`CBBA_Standard`)**: Choi et al. (2009) decentralized bundle auction. Conflict-free initial allocation, but lacks dynamic reallocation for orphaned tasks on lost nodes.
4. **CBBA with Dynamic Recovery (`CBBA_Recovery`)**: Detects node failure and immediately initiates a distributed re-auction for surviving operational nodes.
5. **SWARMOS Full Stack (`SWARMOS`)**: Complete stack integrating deterministic safety compilation, dynamic CBBA re-auctioning, and consensus sanity validation.

---

## 4. Verification & Testing

### Running the Test Suite
Execute the unit test suite covering safety compilation, CBBA consensus convergence, BFT consensus validation, RF packet loss, and baseline differentiation:
```bash
PYTHONPATH=swarmos python3 -m unittest discover -s swarmos/tests -t swarmos
```

### Running the Empirical Monte Carlo Matrix
Execute the full matrix sweep:
```bash
python3 swarmos/run_matrix_cli.py
```
Or run the fast verification benchmark:
```bash
python3 swarmos/run_matrix_cli.py --reduced
```

### Running the Web Application
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the real-time simulation stage, launch natural language mission briefings, and inspect empirical benchmark analytics.
