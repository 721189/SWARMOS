[![SWARMOS CI Pipeline](https://github.com/your-org/swarmos/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/swarmos/actions/workflows/ci.yml)

# SWARMOS: Secure & Resilient Swarm Orchestration

SWARMOS is a distributed swarm intelligence framework extending standard CBBA (Consensus-Based Bundle Algorithm) with Byzantine Anomaly Filtering and dynamic mesh recovery. It is designed to orchestrate fleets of autonomous agents operating under extreme environmental degradation (RF jamming, kinetic loss, adversarial infiltration).

## Key Features
- **Formalized Threat Model**: Deep adversarial modeling of RF jamming, kinetic attrition, and Byzantine vectors. See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).
- **Byzantine Anomaly Filter**: Quarantines poisoned bids and limits adversarial influence on the decentralized auction.
- **Dynamic Phase 2 Consensus**: Strictly adheres to the 18-rule conflict resolution matrix (Choi et al., 2009) to guarantee conflict-free convergence.
- **Continuous Re-Auctioning**: Surviving agents dynamically clear and re-bid orphaned tasks when peers drop from the mesh network.

## Experimental Science & Reproducibility
We provide a comprehensive Cartesian matrix benchmarking tool.
To run the evaluation suite locally:
```bash
PYTHONPATH=swarmos python3 swarmos/research/reproduce.py --reduced
```

To run a single deterministic scenario:
```bash
PYTHONPATH=swarmos python3 swarmos/research/reproduce.py --algo SWARMOS --fleet 16 --tasks 25 --failure loss_50_catastrophic
```

## Limitations & Future Work
- The Byzantine filter relies on kinematic boundaries; sophisticated adversaries faking valid but suboptimal bids may still degrade efficiency.
- Re-auctioning clears the entire bundle of a failed node, which may trigger cascading global re-allocations rather than localized patching.

## Citations
- Choi, H. L., Brunet, L., & How, J. P. (2009). Consensus-based decentralized auctions for robust task allocation. *IEEE Transactions on Robotics*, 25(4), 912-926.
