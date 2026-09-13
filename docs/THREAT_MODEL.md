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

## 3. Attack Classes & Algorithmic Defenses

### Class A: Impossible Bid (Physical Violation)
- **Attack**: A compromised node broadcasts bids that violate kinematic reality (e.g., arrival times faster than $v_{\max}$ or reward scores exceeding the theoretical maximum $b_{\max}^{physical}$).
- **Defense (Kinematic Anomaly Filter)**: SWARMOS rejects any bid that fails a bounds-check against known agent velocity and current distance. This is the primary "Byzantine-lite" defense.

### Class B: Strategic Malice (Mathematically Valid)
- **Attack**: The attacker submits bids that are physically plausible but strategically disastrous. For example, monopolizing high-priority tasks with marginally winning bids to prevent more efficient agents from claiming them.
- **Defense**: Partially mitigated by global utility tracking, but remains a known limitation of the current anomaly filter.

### Class C: Stale Replay
- **Attack**: Re-broadcasting an old, valid belief state to force other agents to reset their current, more optimal bundles (thrashes consensus).
- **Defense (Temporal Consistency Check)**: Bids are timestamped and synchronized; messages with inconsistent or ancient timestamps are ignored.

### Class D: Intermittent Poisoning
- **Attack**: A node behaves honestly for 90% of the mission to build trust, then injects Class A/B attacks during critical mission windows.
- **Defense (Trust-Score Decay)**: Trust is gained slowly but lost rapidly. A single Class A violation triggers a heavy penalty, potentially leading to immediate quarantine.

### Class E: Coordinated Attack (Collusion)
- **Attack**: Multiple compromised agents synchronize their bidding to bypass individual trust checks or force specific global allocations.
- **Defense**: Current defense assumes non-colluding anomalies; this is a target for future research.

---

## 4. Residual Risks & Out-of-Scope Threats
While SWARMOS mitigates catastrophic mission failure, certain sophisticated attacks remain unmitigated (Accepted Risks):

1.  **Stealth Suboptimal Bidding:** If an adversary controls a node and submits mathematically valid but intentionally *suboptimal* bids (e.g., claiming a task but moving exactly at the minimum allowable speed), the anomaly filter will not flag it. This degrades efficiency but does not break consensus.
2.  **Jamming-Induced Infinite Oscillation:** Rapidly fluctuating jamming bubbles (on/off at high frequency matching the CBBA communication epoch) could theoretically trap the network in a continuous state of re-auctioning, preventing physical execution. SWARMOS currently mitigates this using a `changed_last_iteration` timeout, but mission latency will spike.
3.  **Complete Global Denial:** If $100\%$ of communication links are jammed (total RF blackout), SWARMOS degrades to the `Greedy` baseline where nodes execute whatever tasks are physically closest to them, abandoning cooperative synergy.
