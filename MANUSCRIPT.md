# SWARMOS: Physically-Grounded Byzantine Fault Tolerance in Decentralized Swarms

## Abstract
Decentralized task allocation via Consensus-Based Bundle Auctions (CBBA) is highly efficient but vulnerable to malicious agents and environmental degradation. This paper presents SWARMOS, a framework that provides resilience against Byzantine anomalies by leveraging the kinematic constraints of the physical environment as an implicit source of truth. We demonstrate that rejecting bids that violate physical possibility (arrival times, velocity limits) provides a sufficient resilience boundary without the O(N^2) overhead of conventional BFT protocols.

## 1. Introduction
Modern drone swarms must operate in contested environments where communication is intermittent and agents may be compromised. Standard CBBA assumes honest participation, making it trivial for a single adversarial node to sabotage the entire swarm.

## 2. The SWARMOS Architecture
SWARMOS introduces three primary resilience layers:
1. **Kinematic Anomaly Filtering**: Real-time verification of bid-histories against agent velocity limits ($V_{max}$).
2. **Dynamic Heartbeat Recovery**: Immediate re-auctioning of tasks assigned to failed or isolated nodes.
3. **Hardware Abstraction Layer (HAL)**: A standardized interface for porting simulation logic to ROS 2 and PX4 platforms.

## 3. Experimental Methodology
We evaluated SWARMOS across a Cartesian matrix of **4,860 configurations**, varying fleet size ($N \in \{4..128\}$), packet loss ($L \in \{0..0.7\}$), and attack classes (A-E).

### Attack Classes
- **Class A (Impossible Bid)**: Bids that exceed hardware physical limits.
- **Class B (Strategic Malice)**: Low but valid bids designed to claim and starve task clusters.
- **Class C (Stale Replay)**: Injecting expired high bids from ghost agents.

## 4. Key Findings
- **Resilience**: SWARMOS preserves >90% mission utility under Class A attacks, whereas standard CBBA performance collapses to <30%.
- **Optimality**: SWARMOS adheres to the 50% greedy optimality guarantee even under severe network degradation.
- **Complexity**: Communication overhead scales linearly ($O(N)$), significantly outperforming PBFT and other consensus-heavy alternatives.

## 5. Conclusion
By grounding decentralized auctions in physical reality, SWARMOS proves that high-resilience autonomy does not require high-bandwidth consensus.
