[![SWARMOS CI Pipeline](https://github.com/your-org/swarmos/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/swarmos/actions/workflows/ci.yml)

# SWARMOS: A Reproducible Framework for Resilient Decentralized Multi-Agent Task Allocation under Communication Degradation and Agent Anomalies

**SWARMOS** (Secure & Resilient Swarm Orchestration System) is an experimental research framework designed to evaluate and harden decentralized task allocation algorithms for autonomous multi-agent fleets.

While traditional decentralized orchestration—specifically the Consensus-Based Bundle Algorithm (CBBA)—provides mathematically guaranteed convergence under connected topologies for cooperative agents, its standard formulation diverges catastrophically under adversarial conditions. This repository implements **Anomaly-Aware CBBA**, an extension engineered to operate within contested environments subject to stochastic communication degradation, kinetic attrition, and Byzantine-like anomalous behaviors.

## 1. Theoretical Foundation & Architecture

SWARMOS bridges the gap between robotic kinematics and distributed systems security. Rather than relying on computationally heavy cryptographic voting rounds, which fail in highly partitioned, asynchronous mesh networks, SWARMOS implements a **Byzantine-Aware Anomaly Filter**.

### Core Contributions
*   **Kinematic Byzantine-Aware Filtering:** Agents independently validate the physical feasibility of incoming bids. Bids that violate maximum velocity constraints or path-loss limits are rejected, and the offending transmitter is penalized.
*   **Dynamic Phase-2 Consensus:** Extends the standard 18-rule conflict resolution matrix (Choi et al., 2009) to quarantine nodes whose trust metric drops below the anomaly threshold.
*   **Continuous Re-Auctioning for Kinetic Attrition:** When an agent is destroyed (detected via telemetry heartbeat failure), its assigned subgraph of tasks is purged from the collective belief state and re-auctioned seamlessly by the surviving fleet.

## 2. Experimental Framework & Reproducibility

This repository contains both a high-fidelity Python simulation engine and a TypeScript/React visualization dashboard for empirical analysis.

### Repository Structure
*   `swarmos/swarm_engine/`: Core simulation physics, bid generation, and the Anomaly-Aware CBBA consensus loop.
*   `swarmos/research/`: Monte Carlo matrix generation, cartesian benchmarking scripts, and ablation study runners.
*   `src/` & `server.ts`: A Vite + Express visualization dashboard that plots convergence graphs, packet loss heatmaps, and spatial node allocations.
*   `docs/`: Contains the formalized `THREAT_MODEL.md`, `METRICS.md`, and the full `RESEARCH_REPORT.md`.

### Running the Evaluation Suite
We provide a comprehensive Cartesian matrix benchmarking tool to reproduce our empirical baseline comparisons (Static, Greedy, Standard CBBA, CBBA+Recovery, CBBA+Anomaly Filtering, SWARMOS).

To run the accelerated ablation matrix locally:
```bash
PYTHONPATH=. python3 swarmos/research/reproduce.py --reduced
```

To run a single deterministic scenario (e.g., 50% catastrophic packet loss with 16 nodes, seed=42):
```bash
PYTHONPATH=. python3 swarmos/research/reproduce.py --algo SWARMOS --fleet 16 --tasks 25 --failure loss_50_catastrophic --seed 42
```

### Launching the Dashboard
To visualize the generated empirical data in real-time:
```bash
npm install
npm run build
npm start
```
The dashboard will be available at `http://localhost:3000`.

## 3. Threat Model & Known Limitations

We evaluate SWARMOS honestly against a formalized threat model (see [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md)). The system is built to mitigate catastrophic failure, but it is not immune to all vectors.

### Mitigated Threats
*   **Sybil / Bid Poisoning:** Mitigated physically. An anomalous agent cannot bid arbitrarily high without violating kinematic constraints.
*   **Network Partitioning:** Mitigated algorithmically. CBBA mathematically guarantees sub-graph convergence in partitioned networks; fleets resolve conflicts upon reconnection.

### Accepted / Unmitigated Vulnerabilities
*   **Stealth Suboptimal Bidding:** If an anomalous agent submits mathematically valid but intentionally inefficient bids (e.g., moving exactly at minimum allowable speeds), the filter will not isolate them. This degrades global fleet efficiency.
*   **Cascading Re-allocations:** Dynamic re-auctioning upon node death clears the entire bundle of the failed node. In highly saturated task environments, this can trigger a global cascade of re-allocations rather than a localized topological patch, temporarily spiking communication overhead.
*   **Total Communication Blackout:** If the jamming-to-signal ratio forces $100\%$ packet loss across all frequencies, SWARMOS fundamentally degrades to a localized `Greedy` heuristic, fully abandoning cooperative synergy.

## 4. Citations & Literature

This research builds upon foundational work in consensus algorithms and robotics.

- Choi, H. L., Brunet, L., & How, J. P. (2009). Consensus-based decentralized auctions for robust task allocation. *IEEE Transactions on Robotics*, 25(4), 912-926.
- Lamport, L., Shostak, R., & Pease, M. (1982). The Byzantine Generals Problem. *ACM Transactions on Programming Languages and Systems*.
- Castro, M., & Liskov, B. (1999). Practical Byzantine Fault Tolerance. *OSDI*.

---
*Developed as an experimental research platform for decentralized systems resiliency.*
