# SWARMOS™: Strategic Autonomous Multi-Domain Swarm Operating System

SWARMOS is a decentralized, fault-resilient multi-agent coordination framework designed for denied, degraded, intermittent, and limited (DDIL) tactical environments. 

---

## Capability Status Matrix

Every capability in SWARMOS is strictly categorized to maintain scientific and operational rigor:

### 1. Implemented (Production Code in Repository)
- **Choi et al. (2009) CBBA Engine**: Decentralized multi-assignment auction protocol with bundle construction and 1-hop consensus conflict resolution.
- **Deterministic Safety Compiler**: Sits between generative AI mission planners (Nemotron/Gemini) and CBBA consensus, enforcing strict range ($<1000\text{m}$), payload, and fleet redundancy constraints.
- **Dynamic Fault Recovery & Replanner**: Real-time detection of agent node drops, electronic jamming, and automatic task re-auctioning.
- **Physical Environment Simulation**: 2D kinematics, obstacle collision detection, dynamic threat zones, and RF signal propagation/jamming attenuation.
- **REST & WebSocket API Backend**: Express + TypeScript server proxying AI mission generation, ablation studies, and real-time state streaming.

### 2. Validated (Empirically Tested via Monte Carlo Suites)
- **Multi-Scenario Experiment Matrix**: Automated Cartesian sweep across fleet sizes (`[4, 6, 8]`), task densities, packet loss rates (`0.0 - 0.5`), and failure modes (`nominal`, `mild_attrition`, `electronic_warfare_dense`, `catastrophic_stress`).
- **Baseline Comparisons**: Empirical benchmarking of Static Allocation vs. Greedy Heuristic vs. Normal CBBA vs. CBBA + Recovery vs. Full SWARMOS.
- **Consensus Convergence Latency**: Verified sub-20ms convergence times across decentralized nodes.

### 3. Experimental (Prototype / Emulated)
- **NVIDIA Nemotron-4-340B SLM Integration**: Cloud-hosted LLM/SLM integration for natural language directive decomposition (with local keyword fallback parser).
- **Stochastic Packet Loss & Jamming**: Probabilistic message dropping and RF attenuation modeling.
- **ATAK / WinTAK Cursor-on-Target (CoT)**: XML message generation schemas (UDP multicast transmission tested in simulation loops only).

### 4. Planned (Roadmap / Not Yet Implemented)
- **Post-Quantum Cryptography**: Crystals-Kyber-768 key encapsulation and ChaCha20-Poly1305 wire encryption (currently specified in architecture design documents).
- **Hardware-in-the-Loop Jetson Orin Deployment**: Physical deployment on NVIDIA Jetson AGX Orin edge hardware (currently evaluated via software simulation/emulation).
- **Physical SDR Waveform Integration**: Direct hardware driver integration with Silvus StreamCaster 4400 / TrellisWare TW-950 physical radios.

---

## Quickstart & Local Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Run Python Experiment Matrix CLI**:
   ```bash
   python3 swarmos/run_matrix_cli.py
   ```
