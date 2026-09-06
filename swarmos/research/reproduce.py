#!/usr/bin/env python3
import argparse
import json
import uuid
import sys
import os

from nebius_jobs.experiments import run_single_baseline_trial, run_experiment_matrix

def main():
    parser = argparse.ArgumentParser(description="SWARMOS Experiment Reproduction CLI")
    parser.add_argument("--matrix", action="store_true", help="Run full experimental matrix")
    parser.add_argument("--reduced", action="store_true", help="Run reduced matrix for fast verification")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for single trial")
    parser.add_argument("--fleet", type=int, default=8, help="Fleet size")
    parser.add_argument("--tasks", type=int, default=15, help="Task count")
    parser.add_argument("--algo", type=str, default="SWARMOS", help="Algorithm to test")
    parser.add_argument("--failure", type=str, default="nominal", help="Failure scenario")
    
    args = parser.parse_args()
    
    experiment_id = str(uuid.uuid4())
    print(f"Starting SWARMOS Research Experiment. ID: {experiment_id}")
    
    if args.matrix or args.reduced:
        results = run_experiment_matrix(reduced_benchmark=args.reduced)
        out_path = f"swarmos/research/raw_results/matrix_{experiment_id}.json"
        with open(out_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"Matrix complete. Results saved to {out_path}")
    else:
        res = run_single_baseline_trial(
            fleet_size=args.fleet,
            task_count=args.tasks,
            failure_mode=args.failure,
            comm_range=500.0,
            packet_loss_rate=0.0,
            seed=args.seed,
            algorithm=args.algo
        )
        print(json.dumps(res, indent=2))
        out_path = f"swarmos/research/raw_results/single_{experiment_id}.json"
        with open(out_path, "w") as f:
            json.dump(res, f, indent=2)
        print(f"Single trial complete. Results saved to {out_path}")

if __name__ == "__main__":
    main()
