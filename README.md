# SWARMOS™: Strategic Autonomous Multi-Domain Swarm Operating System

[![Enterprise Grade](https://img.shields.io/badge/Architecture-Enterprise_Distributed-blue.svg)]()
[![Python Core](https://img.shields.io/badge/Core-Python_3.10+-yellow.svg)]()
[![TypeScript Frontend](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-cyan.svg)]()
[![AI Integration](https://img.shields.io/badge/AI-NVIDIA_Nemotron_4_340B-green.svg)]()

SWARMOS is an enterprise-grade, decentralized, fault-resilient multi-agent coordination and mission operating system designed for Denied, Degraded, Intermittent, and Limited (DDIL) tactical environments. It couples state-of-the-art distributed consensus auction protocols with deterministic safety verification and LLM-driven natural language directive parsing.

---

## Architecture & Canonical Design

### 1. Canonical Mission Schema
All mission directives parsed by natural language engines or fallback heuristic processors normalize to an immutable, strongly typed schema:
```json
{
  "mission_name": "Operation Horizon Rescue",
  "tactical_intent": "Rapid casualty location and automated medical package drop",
  "recommended_agents": 6,
  "tasks": [
    {
      "id": "T1",
      "type": "RECON",
      "position": [320.0, 220.0],
      "base_reward": 90.0,
      "duration": 4.0,
      "urgency_weight": 1.2,
      "description": "Sector Alpha thermal sweep"
    }
  ]
}
```

### 2. Canonical Safety Compiler (`SafetyCompiler`)
Sitting strictly between generative AI models and the consensus allocator, the deterministic safety compiler evaluates:
- **Maximum Operational Range**: Enforces spatial boundary limits ($<1200\text{m}$ from base).
- **Payload & Battery Bounds**: Verifies drone payload capacities and energy requirements.
- **Fleet Redundancy**: Enforces minimum operational agent counts prior to mission acceptance.

### 3. Network Packet Delivery & Stochastic Loss
Communication links are modeled via dynamic 1-hop ad-hoc graph topologies with distance attenuation and electronic warfare jamming bubbles. Packet delivery is explicitly validated via deterministic random sampling:
$$\text{delivered} = \text{rng.random}() \ge \text{packet\_loss\_rate}$$
Tracking actual generated versus delivered packets without synthetic inflation.

### 4. Comparative Baselines (5 Paradigms)
SWARMOS evaluates mission performance against 4 comparative baselines under identical stochastic seeds and failure schedules:
1. **Static Allocation**: Pre-assigned fixed sectors with no dynamic re-allocation.
2. **Greedy First-Choice**: Independent greedy bidding with no spatial conflict resolution.
3. **Standard CBBA**: Choi et al. (2009) consensus-based bundle algorithm without dynamic recovery.
4. **CBBA + Dynamic Recovery**: CBBA augmented with real-time node failure detection and task re-auctioning.
5. **SWARMOS**: Full enterprise stack (CBBA + Safety Compiler + BFT Fault Isolation & Anomaly Quarantine).

---

## Capability Status Matrix

| Capability | Status | Description |
| :--- | :--- | :--- |
| **Choi et al. (2009) CBBA Engine** | **Implemented & Validated** | Decentralized multi-assignment auction with bundle construction & 1-hop conflict resolution. |
| **Deterministic Safety Compiler** | **Implemented & Validated** | Pre-allocation validation of range, payload, and minimum fleet size constraints. |
| **Stochastic Packet Loss & Jamming** | **Implemented & Validated** | Explicit channel attenuation and probabilistic message dropping. |
| **5-Way Baseline Ablation Suite** | **Implemented & Validated** | Monte Carlo comparison across Static, Greedy, CBBA, Recovery, and SWARMOS. |
| **NVIDIA Nemotron-4-340B SLM** | **Experimental / Authoritative** | Cloud-hosted LLM directive parsing with local deterministic fallback engine. |
| **Post-Quantum Cryptography** | **Planned (Roadmap)** | Crystals-Kyber-768 key encapsulation and ChaCha20-Poly1305 wire encryption. |

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
