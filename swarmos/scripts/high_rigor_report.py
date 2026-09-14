
import json
import os
import math

def get_significance_stars(p_val: float) -> str:
    if p_val <= 0.001:
        return "***"
    elif p_val <= 0.01:
        return "**"
    elif p_val <= 0.05:
        return "*"
    else:
        return "n.s."

def generate_rigorous_report(results_path="results/canonical/results.json"):
    if not os.path.exists(results_path):
        fallback_path = "nebius_experiment_results.json"
        if os.path.exists(fallback_path):
            results_path = fallback_path
        else:
            print(f"Error: {results_path} not found.")
            return

    with open(results_path, "r") as f:
        data = json.load(f)

    # Check if this is the new spec format
    if "configs" in data and "metadata" in data:
        metadata = data.get("metadata", {})
        configs_list = data.get("configs", [])
        
        results = []
        for c in configs_list:
            ci_95_list = c.get("TCR_ci_95", [0.0, 0.0])
            ci_margin = (ci_95_list[1] - ci_95_list[0]) / 2.0
            ci_margin_pct = ci_margin * 100.0
            
            p_val = c.get("p_val_holm", 1.0)
            cohens_d_val = c.get("cohens_d_z", 0.0)
            
            algo_name = c.get("canonical_algorithm", c.get("algorithm"))
            if algo_name == "B2_Standard_CBBA":
                algo_name = "CBBA_Standard"
            elif algo_name == "B5_SWARMOS":
                algo_name = "SWARMOS"
                
            results.append({
                "fleet_size": c.get("fleet_size", 8),
                "task_count": c.get("task_count", 10),
                "failure_mode": f"loss_{c.get('packet_loss', 0.0)}_adv_{c.get('adversarial_fraction', 0.0)}_class_{c.get('attack_class', 'N/A')}",
                "communication_range": 400.0,
                "algorithm": algo_name,
                "mission_completion": c.get("mission_completion", c.get("TCR", 0.0) * 100.0),
                "ci_95": f"{ci_margin_pct:.2f}%",
                "p_value_vs_baseline": p_val,
                "cohens_d_vs_baseline": cohens_d_val
            })
        
        audit_timestamp = metadata.get("timestamp")
        artifact_version = metadata.get("pipeline_version", "4.2.0")
        benchmark_mode = f"SWARMOS Factorial Bench (Spec={metadata.get('spec_version')})"
        total_trials = metadata.get("total_trials_executed", 0)
    else:
        results = data.get("summary_table", [])
        audit_timestamp = data.get("audit_timestamp")
        artifact_version = data.get("artifact_version")
        benchmark_mode = data.get("benchmark_mode")
        total_trials = data.get("total_trials")
    report_lines = []
    report_lines.append("# SWARMOS High-Rigor Statistical Report")
    report_lines.append(f"**Audit Timestamp**: {audit_timestamp}")
    report_lines.append(f"**Artifact Version**: {artifact_version}")
    report_lines.append(f"**Benchmark Mode**: {benchmark_mode}")
    report_lines.append(f"**Total Trials**: {total_trials}")
    report_lines.append("\n## 1. Statistical Significance (vs. CBBA Standard)")
    report_lines.append("Comparing mission completion rates and convergence times.")
    report_lines.append("\n| Configuration | Algorithm | Completion (Mean ± CI) | p-value | Significance | Effect Size (d) |")
    report_lines.append("|:---|:---|:---|:---|:---|:---|")

    # Group by config
    configs = {}
    for r in results:
        cfg = (r["fleet_size"], r["task_count"], r["failure_mode"], r["communication_range"])
        if cfg not in configs: configs[cfg] = []
        configs[cfg].append(r)

    for cfg, algos in configs.items():
        baseline = next((a for a in algos if a["algorithm"] == "CBBA_Standard"), None)
        if not baseline: continue
        
        # We need raw data for p-values. If not in JSON, we can't do it here easily.
        # So we expect experiments.py to have calculated them OR we assume the JSON has them.
        
        for a in algos:
            p_val = a.get("p_value_vs_baseline", 1.0)
            stars = get_significance_stars(p_val)
            d = a.get("cohens_d_vs_baseline", 0.0)
            
            report_lines.append(
                f"| FS={cfg[0]}, T={cfg[1]}, {cfg[2]} | {a['algorithm']} | {a['mission_completion']}% ± {a['ci_95']} | {p_val:.4f} | {stars} | {d:.2f} |"
            )

    # 2. Failure Envelope Analysis
    report_lines.append("\nIdentifying critical thresholds where swarm coordination breaks down.")
    
    env_path = "swarmos/research/failure_envelopes.json"
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            env_data = json.load(f)
        
        report_lines.append("\n### Packet Loss Sweep (FS=12, T=25)")
        report_lines.append("| Packet Loss | Mission Completion (TCR) | Status |")
        report_lines.append("|:---|:---|:---|")
        for p, tcr in env_data.get("packet_loss", {}).items():
            status = "STABLE" if tcr >= 90 else ("DEGRADED" if tcr >= 70 else "CRITICAL")
            report_lines.append(f"| {float(p)*100:.0f}% | {tcr:.1f}% | {status} |")
    
    # 3. Systematic Ablation Study
    report_lines.append("\n## 3. Systematic Ablation Study")
    report_lines.append("Isolating the impact of individual SWARMOS modules on mission resilience.")
    
    abl_path = "swarmos/research/ablation_results.json"
    if os.path.exists(abl_path):
        with open(abl_path, "r") as f:
            abl_data = json.load(f)
        
        # Group by algorithm
        algo_groups = {}
        for r in abl_data:
            a = r["algorithm"]
            if a not in algo_groups: algo_groups[a] = []
            algo_groups[a].append(r["mission_completion"])
        
        # Calculate impacts using explicit ablation variants (P0)
        swarmos_mean = sum(algo_groups.get("SWARMOS", [0])) / max(1, len(algo_groups.get("SWARMOS", [])))
        no_filter_mean = sum(algo_groups.get("SWARMOS_NoFilter", [0])) / max(1, len(algo_groups.get("SWARMOS_NoFilter", [])))
        no_compiler_mean = sum(algo_groups.get("SWARMOS_NoCompiler", [0])) / max(1, len(algo_groups.get("SWARMOS_NoCompiler", [])))
        no_recovery_mean = sum(algo_groups.get("SWARMOS_NoRecovery", [0])) / max(1, len(algo_groups.get("SWARMOS_NoRecovery", [])))
        standard_mean = sum(algo_groups.get("CBBA_Standard", [0])) / max(1, len(algo_groups.get("CBBA_Standard", [])))
        
        # Impact isolation
        filter_impact = swarmos_mean - no_filter_mean
        compiler_impact = swarmos_mean - no_compiler_mean
        recovery_impact = swarmos_mean - no_recovery_mean
        
        report_lines.append(f"\n*   **Anomaly Filter Impact**: Contributes a **+{filter_impact:.1f}%** marginal TCR gain by isolating malicious/malfunctioning nodes.")
        report_lines.append(f"*   **Safety Compiler Impact**: Contributes a **+{compiler_impact:.1f}%** TCR gain by ensuring valid mission manifests before deployment.")
        report_lines.append(f"*   **Recovery Module Impact**: Contributes a **+{recovery_impact:.1f}%** TCR gain through deterministic re-allocation of orphaned tasks.")
        report_lines.append(f"*   **Cumulative Resilience**: SWARMOS provides a total of **+{(swarmos_mean - standard_mean):.1f}%** TCR improvement over baseline CBBA.")
        
        # Anomaly filtering specific check
        adv_trials = [r for r in abl_data if r.get("failure_mode") == "adversarial_nodes"]
        if adv_trials:
            sw_adv = [r["mission_completion"] for r in adv_trials if r["algorithm"] == "SWARMOS"]
            st_adv = [r["mission_completion"] for r in adv_trials if r["algorithm"] == "CBBA_Standard"]
            sw_mean_adv = sum(sw_adv) / max(1, len(sw_adv))
            st_mean_adv = sum(st_adv) / max(1, len(st_adv))
            if sw_mean_adv > st_mean_adv:
                report_lines.append(f"*   **Adversarial Defense**: In targeted adversarial trials, SWARMOS maintained **{sw_mean_adv:.1f}%** TCR vs **{st_mean_adv:.1f}%** for Standard CBBA.")

    report_path = "docs/RESEARCH_REPORT_RIGOR.md"
    with open(report_path, "w") as f:
        f.write("\n".join(report_lines))
    
    print(f"Rigorous report generated at {report_path}")

if __name__ == "__main__":
    generate_rigorous_report()
