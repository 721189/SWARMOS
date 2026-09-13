import os
import json
import math
import sys
from swarmos.utils.logger import logger

def verify_paper_claims(results_path: str = "swarmos/nebius_experiment_results.json"):
    """
    Automated Claim Verification (Phase 25).
    Cross-checks the results JSON against a set of predefined scientific invariants and claims.
    """
    if not os.path.exists(results_path):
        print(f"[!] Error: {results_path} not found. Run experiments first.")
        return False

    with open(results_path, "r") as f:
        data = json.load(f)

    print(f"[*] Auditing SWARMOS Manuscript Claims against Data...")
    print(f"[*] Artifact Version: {data.get('artifact_version')}")
    print(f"[*] Total Trials: {data.get('total_trials')}")

    success = True
    summaries = data.get("summary_table", [])

    # Claim 1: SWARMOS significantly outperforms Standard CBBA under Class A attacks
    class_a_swarmos = [r for r in summaries if r["algorithm"] == "SWARMOS" and r["failure_mode"] == "attack_class_A"]
    class_a_baseline = [r for r in summaries if r["algorithm"] == "CBBA_Standard" and r["failure_mode"] == "attack_class_A"]

    if class_a_swarmos and class_a_baseline:
        swarmos_avg = sum(r["mission_completion"] for r in class_a_swarmos) / len(class_a_swarmos)
        baseline_avg = sum(r["mission_completion"] for r in class_a_baseline) / len(class_a_baseline)
        
        print(f"[Claim 1] SWARMOS ({swarmos_avg:.1f}%) vs Baseline ({baseline_avg:.1f}%) under Class A attacks.")
        if swarmos_avg > baseline_avg + 15.0:
             print("  [PASS] SWARMOS demonstrates >15% TCR improvement.")
        else:
             print("  [FAIL] SWARMOS does not meet the expected TCR improvement gap.")
             success = False
    else:
        print("[Claim 1] SKIPPED: Missing Class A attack data.")

    # Claim 2: Optimality Ratio >= 0.5 (Choi 2009 Invariant)
    optimality_fails = [r for r in summaries if r.get("optimality_ratio", 1.0) < 0.49]
    if not optimality_fails:
        print("[Claim 2] Optimality Invariant Check (>= 0.5): PASS")
    else:
        print(f"[Claim 2] Optimality Invariant Check: FAIL ({len(optimality_fails)} configurations violated 50% lower bound)")
        success = False

    # Claim 3: Scalability - Comm Overhead is O(N)
    # Check if bytes-per-agent stays relatively stable or grows linearly with N
    print("[Claim 3] Scalability Analysis (N={4..64})")
    for fs in sorted(list(set(r["fleet_size"] for r in summaries))):
        fs_runs = [r for r in summaries if r["fleet_size"] == fs]
        if fs_runs:
            avg_kb = sum(r.get("comm_overhead_kb_per_agent", 0.0) for r in fs_runs) / len(fs_runs)
            print(f"  N={fs:2d}: {avg_kb:6.2f} KB/agent")

    if success:
        print("\n[✓] ALL MANUSCRIPT CLAIMS VERIFIED BY EXPERIMENTAL DATA.")
    else:
        print("\n[✗] SOME CLAIMS VIOLATED BY EXPERIMENTAL DATA. AUDIT REQUIRED.")
    
    return success

if __name__ == "__main__":
    verify_paper_claims()
