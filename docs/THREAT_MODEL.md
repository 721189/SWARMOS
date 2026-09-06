# SWARMOS Threat Model

## 1. Introduction & Trust Assumptions
SWARMOS operates in highly contested, multi-domain environments (MUM-T) where traditional centralized command-and-control (C2) is unavailable or compromised. The system relies on a decentralized RF mesh network to execute the Consensus-Based Bundle Algorithm (CBBA).

### Trust Boundaries
*   **The Physical Environment:** Untrusted. Assumed to contain obstacles, dynamic kinetic threats, and hostile RF emitting jammers.
*   **The RF Network:** Untrusted. Assumed to be lossy, subject to interception, partitioning, and active denial of service (DoS).
*   **Fleet Nodes (Agents):** Semi-trusted. While provisioned securely, any given node can be kinetically destroyed, captured, or electronically compromised (turning into a Byzantine actor) during the mission.

---

## 2. Adversary Model
We model a highly capable adversary with the following capabilities:
1.  **Electronic Warfare (EW):** Ability to project RF jamming bubbles that attenuate signal-to-noise ratio (SNR) and induce massive packet loss.
2.  **Kinetic Strike:** Ability to physically destroy honest nodes instantly.
3.  **Node Infiltration (Byzantine):** Ability to compromise a fraction $f$ of the total nodes $N$ and alter their internal state, enabling them to broadcast arbitrary, malicious bids into the consensus network.

---

## 3. Attack Vectors & Algorithmic Defenses

### A. Bid Poisoning & Sybil Inflation
*   **Attack:** A compromised node broadcasts artificially high bids (e.g., $9999.0$) for tasks it cannot physically reach, attempting to starve the rest of the fleet and prevent mission completion.
*   **Defense (Byzantine Anomaly Filter):** SWARMOS abandons traditional PBFT (which scales poorly and requires synchronized epochs) in favor of a **Kinematic Anomaly Filter**. The filter clamps incoming bids against the known physical constraints of the claiming agent (e.g., maximum velocity, distance to target). Bids exceeding physical reality ($T_{arrival} < T_{minimum\_kinematic}$) are rejected, and the offending node receives a trust penalty. If trust falls below the quarantine threshold, the node is isolated.

### B. Network Partitioning & RF Jamming
*   **Attack:** The adversary jams the center of the operational theater, severing the mesh graph into two disconnected sub-graphs (Network A and Network B).
*   **Defense (Local Convergence):** SWARMOS does not require global connectivity to function. The CBBA engine guarantees that any connected sub-graph will converge to a locally conflict-free allocation. Tasks in Network A will be allocated among agents in Network A. When the jamming bubble lifts and the graphs merge, the conflict resolution matrix (Choi 2009) deterministically resolves the global state.

### C. Kinetic Attrition (Orphaned Tasks)
*   **Attack:** An honest agent carrying a bundle of 4 critical tasks is kinetically destroyed.
*   **Defense (Dynamic Re-Auctioning):** Surviving nodes detect the loss of telemetry. The `CBBA_Recovery` mechanism purges the dead node's claims from the collective belief state. All incomplete tasks in the dead node's bundle are returned to `UNASSIGNED` status, triggering a dynamic re-auction across the surviving nodes.

---

## 4. Residual Risks & Out-of-Scope Threats
While SWARMOS mitigates catastrophic mission failure, certain sophisticated attacks remain unmitigated (Accepted Risks):

1.  **Stealth Suboptimal Bidding:** If an adversary controls a node and submits mathematically valid but intentionally *suboptimal* bids (e.g., claiming a task but moving exactly at the minimum allowable speed), the anomaly filter will not flag it. This degrades efficiency but does not break consensus.
2.  **Jamming-Induced Infinite Oscillation:** Rapidly fluctuating jamming bubbles (on/off at high frequency matching the CBBA communication epoch) could theoretically trap the network in a continuous state of re-auctioning, preventing physical execution. SWARMOS currently mitigates this using a `changed_last_iteration` timeout, but mission latency will spike.
3.  **Complete Global Denial:** If $100\%$ of communication links are jammed (total RF blackout), SWARMOS degrades to the `Greedy` baseline where nodes execute whatever tasks are physically closest to them, abandoning cooperative synergy.
