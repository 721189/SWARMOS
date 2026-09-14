"""
SWARMOS Automated Paper Table Generator (P2-03).
Reads authoritative results from results/canonical/results.json
and generates formatted Markdown and LaTeX tables for MANUSCRIPT.md.
"""

import os
import sys
import json
from typing import Dict, List, Any

def generate_markdown_results_table(results_path: str = "results/canonical/results.json") -> str:
    if not os.path.exists(results_path):
        return "No canonical results found at " + results_path
        
    with open(results_path, "r") as f:
        data = json.load(f)
        
    configs = data.get("configs", [])
    if not configs:
        return "Empty configuration results."
        
    # Group by (packet_loss, adversarial_fraction, algorithm)
    grouped: Dict[str, Dict[str, Any]] = {}
    for c in configs:
        p = c.get("packet_loss", 0.0)
        f_adv = c.get("adversarial_fraction", 0.0)
        algo = c.get("canonical_algorithm", c.get("baseline_id", "Unknown"))
        key = f"p={p:.2f}_f={f_adv:.2f}"
        
        if key not in grouped:
            grouped[key] = {}
        grouped[key][algo] = c

    md_lines = []
    md_lines.append("| Packet Loss ($p$) | Adversarial ($f$) | Algorithm | Mean TCR [95% CI] | Ref Ratio ($U/U_{ref}$) | PDR | Conv (ms) |")
    md_lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
    
    for key, algos in sorted(grouped.items()):
        parts = key.split("_")
        p_val = parts[0].split("=")[1]
        f_val = parts[1].split("=")[1]
        
        for algo_name in ["B2_Standard_CBBA", "B3_CBBA_Recovery", "B4_CBBA_Anomaly", "B5_SWARMOS"]:
            if algo_name in algos:
                c = algos[algo_name]
                tcr = c.get("TCR", 0.0)
                tcr_ci = c.get("TCR_ci_95", [tcr, tcr])
                opt = c.get("optimality_ratio", 0.0)
                pdr = c.get("PDR", 1.0)
                conv = c.get("convergence_time", 120.0)
                
                md_lines.append(
                    f"| {p_val} | {f_val} | **{algo_name}** | {tcr:.3f} [{tcr_ci[0]:.3f}, {tcr_ci[1]:.3f}] | {opt:.3f} | {pdr:.2f} | {conv:.1f} |"
                )

    return "\n".join(md_lines)

if __name__ == "__main__":
    table = generate_markdown_results_table()
    print(table)
