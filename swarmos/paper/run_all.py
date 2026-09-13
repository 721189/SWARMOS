import os
import json
import time
from datetime import datetime
from swarmos.utils.logger import logger
from swarmos.nebius_jobs.experiments import run_authoritative_pipeline
from swarmos.paper.verify_claims import verify_paper_claims

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
    from swarmos.paper.generate_figures import main as generate_figs
    generate_figs()

    print("\n[✓] CANONICAL PIPELINE EXECUTION COMPLETE.")
    print("====================================================")

if __name__ == "__main__":
    # Ensure current directory is in PYTHONPATH
    import sys
    sys.path.append(os.getcwd())
    run_canonical_pipeline()
