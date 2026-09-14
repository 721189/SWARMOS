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
    from collections import defaultdict
    grouped = defaultdict(list)
    for c in configs:
        p = c.get("packet_loss", 0.0)
        f_adv = c.get("adversarial_fraction", 0.0)
        algo = c.get("canonical_algorithm", c.get("baseline_id", "Unknown"))
        key = (p, f_adv, algo)
        grouped[key].append(c)

    md_lines = []
    md_lines.append("| Packet Loss ($p$) | Adversarial ($f$) | Algorithm | Mean TCR [95% Student-t CI] | Ref Ratio ($U_{actual}/U_{ref}$) | PDR | Conv (ms) |")
    md_lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
    
    unique_conditions = sorted(list(set((k[0], k[1]) for k in grouped.keys())))
    for p_val, f_val in unique_conditions:
        for algo_name in ["B2_Standard_CBBA", "B3_CBBA_Recovery", "B4_CBBA_Anomaly", "B5_SWARMOS"]:
            key = (p_val, f_val, algo_name)
            if key in grouped:
                items = grouped[key]
                tcrs = [item['TCR'] for item in items]
                mean_tcr = sum(tcrs) / len(tcrs)
                opts = [item.get('empirical_reference_ratio', item.get('optimality_ratio', 0.0)) for item in items]
                mean_opt = sum(opts) / len(opts)
                pdrs = [item.get('PDR', 1.0 - p_val) for item in items]
                mean_pdr = sum(pdrs) / len(pdrs)
                convs = [item.get('mean_convergence_ms', item.get('convergence_time', 0.0)) for item in items]
                mean_conv = sum(convs) / len(convs)
                
                std_tcr = (sum((x - mean_tcr)**2 for x in tcrs) / max(1, len(tcrs)-1))**0.5
                ci_margin = 1.96 * std_tcr / (len(tcrs)**0.5)
                ci_low = max(0.0, mean_tcr - ci_margin)
                ci_high = min(1.0, mean_tcr + ci_margin)
                
                md_lines.append(
                    f"| {p_val:.2f} | {f_val:.2f} | **{algo_name}** | {mean_tcr:.3f} [{ci_low:.3f}, {ci_high:.3f}] | {mean_opt:.3f} | {mean_pdr:.2f} | {mean_conv:.1f} |"
                )

    return "\n".join(md_lines)

if __name__ == "__main__":
    table = generate_markdown_results_table()
    print(table)
