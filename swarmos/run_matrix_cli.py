import json
import os
import sys

# Ensure swarmos package root and parent are in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, 'swarmos'))

from nebius_jobs.experiments import run_experiment_matrix

def execute_cli_matrix():
    reduced = "--reduced" in sys.argv or "-r" in sys.argv
    mode_str = "Reduced Benchmark" if reduced else "Full Matrix Sweep"
    print(f"Executing SWARMOS Python Experiment Matrix ({mode_str})...")
    res = run_experiment_matrix(reduced_benchmark=reduced)
    print(json.dumps({
        "status": "completed",
        "benchmark_mode": res.get("benchmark_mode"),
        "total_trials": res.get("total_trials"),
        "algorithms_evaluated": res.get("algorithms_evaluated")
    }, indent=2))

if __name__ == "__main__":
    execute_cli_matrix()
