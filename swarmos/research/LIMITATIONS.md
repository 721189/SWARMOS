# SWARMOS Limitations

1. **Kinematic-Only Validation**: The current Byzantine Anomaly Filter primarily validates bids against kinematic constraints (time-to-target). If an adversary calculates a mathematically valid but intentionally suboptimal bid to stall the network, the filter will not catch it.
2. **Computational Overhead**: As fleet size $N$ approaches 100, the message complexity of Phase 2 consensus (which scales with $O(N^2)$ in dense graphs) combined with BFT validation introduces significant CPU latency on constrained edge hardware.
3. **Loss of History on Re-Auction**: When an agent dies, surviving agents clear their belief states of the dead agent's bids. While this triggers correct task re-assignment, it can cause transient "forgetting" of older, valid bids from other agents if they were propagated exclusively through the now-dead node, leading to brief multi-round oscillations before re-convergence.
