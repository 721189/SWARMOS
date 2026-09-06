# SWARMOS Canonical Metrics

This document formalizes the canonical metrics used to evaluate SWARMOS against standard baselines. These metrics provide quantitative analysis of mission effectiveness, coordination overhead, resilience, network conditions, and security.

## 1. Mission Effectiveness

*   **Task Completion Rate (TCR)**
    *   *Definition*: The percentage of total dynamically generated tasks that are successfully claimed and physically executed by the fleet.
    *   *Equation*: $TCR = (N_{completed} / N_{total}) \times 100$
    *   *Interpretation*: Higher is better. Reflects the ultimate success of the mission.
*   **Mission Completion Latency (MCL)**
    *   *Definition*: The total elapsed simulated time until all feasible tasks are completed.
    *   *Units*: Simulation ticks (or seconds).
    *   *Interpretation*: Lower is better. Indicates the temporal efficiency of the fleet.
*   **Unassigned Tasks**
    *   *Definition*: Number of tasks remaining in the `UNASSIGNED` state at the end of the simulation.
    *   *Interpretation*: Lower is better. Corresponds inversely to TCR.

## 2. Coordination & Consensus

*   **Consensus Time (CT)**
    *   *Definition*: Time taken for the fleet to reach a globally conflict-free task allocation state after a new task appears or an assignment is disrupted.
    *   *Units*: Iterations / Simulation ticks.
    *   *Interpretation*: Lower is better. Indicates rapid agreement.
*   **Conflict Count**
    *   *Definition*: The total number of bidding conflicts resolved via the conflict resolution matrix.
    *   *Interpretation*: Measures contention. High values might indicate dense task environments or partitioned subgraphs merging.
*   **Replanning Latency**
    *   *Definition*: Time required for a healthy agent to detect a task orphan and successfully out-bid other agents to claim it.

## 3. Resilience

*   **Recovery Time (RT)**
    *   *Definition*: Time from an agent's failure to the moment all of its previously assigned (incomplete) tasks are claimed by healthy agents.
    *   *Units*: Simulation ticks.
    *   *Interpretation*: Lower is better. Indicates dynamic healing speed.
*   **Performance Degradation (PD)**
    *   *Definition*: The relative drop in TCR when comparing a baseline (0% failure) to a degraded state (e.g., 50% packet loss).
    *   *Equation*: $PD = TCR_{ideal} - TCR_{degraded}$
    *   *Interpretation*: Lower degradation demonstrates robustness.

## 4. Network Model (Stochastic Abstraction)

*   **Packet Delivery Ratio (PDR)**
    *   *Definition*: The percentage of consensus bid vectors successfully received by neighbors.
    *   *Equation*: $PDR = (Packets_{received} / Packets_{transmitted}) \times 100$
*   **Communication Overhead**
    *   *Definition*: The total number of bytes transmitted during the consensus phase.
    *   *Interpretation*: Lower is better. High overhead may exceed available bandwidth in degraded RF environments.
*   **Mean Latency**
    *   *Definition*: The average propagation delay for consensus packets.

## 5. Security & Anomaly Detection

*   **Detection Rate (True Positive Rate)**
    *   *Definition*: The percentage of malicious/anomalous bids successfully flagged and rejected by the Byzantine-aware anomaly filter.
*   **False Positive Rate (FPR)**
    *   *Definition*: The percentage of legitimate, honest bids incorrectly flagged as anomalous due to aggressive kinematic bounds checking or stale state.
*   **Quarantine Latency**
    *   *Definition*: Time elapsed from an anomalous node's first malicious action to the moment its trust score drops below the quarantine threshold, isolating it.
