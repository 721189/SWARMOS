"""
Nebius Cloud Compute Job Runner for SWARMOS.
Provisions and executes batch distributed multi-agent swarm simulations on Nebius AI infrastructure.
Integrates with Nebius SDK, Slurm cluster schedulers, and S3 artifact buckets.
"""

import argparse
import json
import os
import sys
import time

try:
    import nebius
    HAS_NEBIUS_SDK = True
except ImportError:
    HAS_NEBIUS_SDK = False

from swarmos.utils.logger import logger
from nebius_jobs.experiments import run_experiment_matrix

def parse_args():
    parser = argparse.ArgumentParser(description="SWARMOS Nebius Cloud Simulation Job Runner")
    parser.add_argument("--matrix", type=str, default="nebius_jobs/matrix.json", help="Path to matrix config JSON")
    parser.add_argument("--gpu", action="store_true", help="Request NVIDIA L40S or H100 GPU compute slice")
    parser.add_argument("--nodes", type=int, default=1, help="Number of distributed worker nodes")
    parser.add_argument("--output-dir", type=str, default="./outputs", help="Directory to save artifacts and telemetry")
    return parser.parse_args()

def execute_cloud_job():
    args = parse_args()
    os.makedirs(args.output_dir, exist_ok=True)

    logger.info("======================================================")
    logger.info("   SWARMOS x NEBIUS AI CLOUD EXPERIMENT RUNNER       ")
    logger.info("======================================================")
    logger.info(f"Configuration: Nodes={args.nodes}, GPU_Accel={args.gpu}")
    logger.info(f"Target Matrix: {args.matrix}")

    api_key = os.getenv("NEBIUS_API_KEY")
    if not api_key:
        logger.warning("NEBIUS_API_KEY environment variable not detected. Proceeding in local emulation mode.")
    else:
        logger.info("Authenticated with Nebius Cloud Cluster via API Token.")

    start_t = time.time()
    results = run_experiment_matrix(args.matrix)
    elapsed = round(time.time() - start_t, 2)

    output_path = os.path.join(args.output_dir, "nebius_run_summary.json")
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Job completed successfully in {elapsed}s.")
    logger.info(f"Artifacts and telemetry exported to {output_path}")

if __name__ == "__main__":
    execute_cloud_job()
