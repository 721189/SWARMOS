import os
import sys
import json
import time
from datetime import datetime

# Ensure swarmos module root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
sys.path.insert(0, os.getcwd())

from swarmos.utils.logger import logger
from swarmos.nebius_jobs.experiments import run_authoritative_pipeline
from swarmos.paper.verify_claims import verify_paper_claims

def generate_heatmap(data, p_rates, f_rates):
    print("\n[Figure 1] Failure Envelope Heatmap: P(TCR >= 0.9)")
    print("      f | " + " | ".join(f"{f:.2f}" for f in f_rates))
    print("  p     |" + "-" * (len(f_rates) * 10))
    
    for p in p_rates:
        row = f"  {p:.2f}  |"
        for f in f_rates:
            val = data.get((p, f), 0.0)
            char = "█" if val >= 0.9 else "▓" if val >= 0.7 else "▒" if val >= 0.4 else "░" if val >= 0.1 else " "
            row += f" {char} {val:.2f} |"
        print(row)
    print("\nLegend: █ >=0.9, ▓ >=0.7, ▒ >=0.4, ░ >=0.1\n")

def generate_line_plot(data, p_rates):
    print("[Figure 2] Performance Degradation: TCR vs Packet Loss (f=0.1)")
    print("  TCR |")
    for i in range(10, -1, -1):
        y = i / 10.0
        row = f"  {y:.1f} |"
        for p in p_rates:
            val = data.get(p, 0.0)
            if abs(val - y) < 0.05:
                row += "  *  "
            else:
                row += "     "
        print(row)
    print("      +" + "-----" * len(p_rates))
    print("        " + " ".join(f"{p:.2f}" for p in p_rates))
    print("              Packet Loss (p)\n")

def run_canonical_pipeline():
    print("====================================================")
    print("   SWARMOS AUTHORITATIVE RESEARCH PIPELINE v4.0     ")
    print("====================================================")
    print(f"[*] Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    spec_path = "PAPER_EXPERIMENT_SPEC.json"
    if not os.path.exists(spec_path):
        print(f"[!] Error: {spec_path} not found.")
        return

    with open(spec_path, "r") as f:
        spec = json.load(f)
    
    # 1. Clear Old Results (P0)
    out_dir = spec["output_dir"]
    if os.path.exists(out_dir):
        import shutil
        shutil.rmtree(out_dir)
        print(f"[*] Cleaned output directory: {out_dir}")
    os.makedirs(out_dir, exist_ok=True)

    # 2. Execute Experiments (P0)
    print(f"[*] Executing Experiment Matrix...")
    start_t = time.time()
    run_authoritative_pipeline(spec_path)
    end_t = time.time()
    print(f"[*] Simulation Batch Complete. Duration: {end_t - start_t:.1f}s")

    # 3. Verification & Claims (P1)
    print("\n[*] Auditing Scientific Claims...")
    results_path = os.path.join(out_dir, "results.json")
    verify_paper_claims(results_path)

    # 4. Generate Figures (P1)
    print("\n[*] Generating Scientific Figures...")
    if os.path.exists(results_path):
        with open(results_path, "r") as f:
            full_data = json.load(f)
        swarmos_runs = [r for r in full_data["configs"] if r["algorithm"] == "B5_SWARMOS"]
        p_rates = sorted(list(set(r["packet_loss"] for r in swarmos_runs)))
        f_rates = sorted(list(set(r["adversarial_fraction"] for r in swarmos_runs)))
        heatmap_data = {(r["packet_loss"], r["adversarial_fraction"]): r["prob_success_09"] for r in swarmos_runs}
        generate_heatmap(heatmap_data, p_rates, f_rates)
        line_data = {r["packet_loss"]: r["TCR"] for r in swarmos_runs if r["adversarial_fraction"] == 0.1}
        generate_line_plot(line_data, p_rates)

    print("\n[✓] CANONICAL PIPELINE EXECUTION COMPLETE.")
    print("====================================================")

if __name__ == "__main__":
    # Ensure current directory is in PYTHONPATH
    import sys
    sys.path.append(os.getcwd())
    run_canonical_pipeline()
