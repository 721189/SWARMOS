
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from swarmos.nebius_jobs.experiments import run_experiment_matrix

if __name__ == "__main__":
    matrix_path = "PAPER_EXPERIMENT_SPEC.json"
    if len(sys.argv) > 1:
        matrix_path = sys.argv[1]
    print(f"Starting High Rigor Benchmark using {matrix_path}...")
    run_experiment_matrix(spec_path=matrix_path)
    print("Benchmark complete. Generating report...")
    # Trigger report generation
    os.system("PYTHONPATH=. python3 swarmos/scripts/high_rigor_report.py")
    os.system("PYTHONPATH=. python3 swarmos/paper/verify_claims.py")
