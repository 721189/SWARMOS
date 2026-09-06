
from swarmos.nebius_jobs.experiments import run_experiment_matrix
import sys

if __name__ == "__main__":
    matrix_path = "swarmos/nebius_jobs/matrix_high_rigor.json"
    print(f"Starting High Rigor Benchmark using {matrix_path}...")
    run_experiment_matrix(matrix_path=matrix_path)
    print("Benchmark complete. Generating report...")
    # Trigger report generation
    import os
    os.system("python3 swarmos/scripts/high_rigor_report.py")
