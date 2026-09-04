"""
SWARMOS Monte Carlo Experiment Matrix Runner.
Executes batch trials across fleet scales, communications degradation,
and hostile pop-up threats to quantify CBBA resilience.
"""

import json
import os
import random
import time
from typing import Dict, List, Any

from utils.config import SwarmConfig
from utils.logger import logger
from ai_layer.orchestrator import SwarmOrchestrator
from swarm_engine.tasks import TaskStatus

def run_single_trial(fleet_size: int, task_count: int, failure_mode: str, comm_range: float) -> Dict[str, Any]:
    """Execute an end-to-end simulated mission trial with telemetry logging."""
    cfg = SwarmConfig(
        NUM_AGENTS=fleet_size,
        COMM_RANGE=comm_range,
        MAX_TASKS_PER_AGENT=max(3, task_count // fleet_size + 2)
    )
    orch = SwarmOrchestrator(config=cfg)

    # Generate synthetic mission
    mission_prompt = f"Conduct multi-sector sweep with {task_count} priority objectives across theater."
    orch.load_mission(mission_prompt)

    # Simulate physical mission timeline
    total_sim_time = 0.0
    dt = 0.2
    max_duration = 60.0 # 60 virtual seconds

    injected = False
    replan_latencies = []

    while total_sim_time < max_duration:
        total_sim_time += dt

        # Mid-mission failure injection at t = 10s
        if not injected and total_sim_time > 10.0:
            injected = True
            if failure_mode == "mild_attrition":
                # Drop 1 drone
                orch.failure_injector.inject_motor_failure("A1", "Injected motor failure")
            elif failure_mode == "electronic_warfare_dense":
                # Drop 1 drone and add Jammer
                orch.failure_injector.inject_motor_failure("A2", "Injected kinetic casualty")
                orch.failure_injector.inject_rf_jamming((500.0, 400.0), radius=220.0)
            elif failure_mode == "catastrophic_stress":
                # Drop 40% of fleet
                num_to_fail = max(1, int(fleet_size * 0.4))
                for i in range(num_to_fail):
                    orch.failure_injector.inject_motor_failure(f"A{i+1}", "Catastrophic loss")
                orch.failure_injector.inject_rf_jamming((600.0, 350.0), radius=250.0)

        step_res = orch.step(dt)
        if step_res.get("replanned"):
            replan_latencies.append(orch.replanner.replan_events[-1]["convergence_time_ms"])

        # Check if all completed
        all_done = all(t.status == TaskStatus.COMPLETED for t in orch.env.tasks.values())
        if all_done:
            break

    kpis = orch.metrics.compute_summary_kpis(orch.env.agents, orch.env.tasks)
    return {
        "fleet_size": fleet_size,
        "task_count": task_count,
        "failure_mode": failure_mode,
        "sim_time_sec": round(total_sim_time, 1),
        "completion_rate_pct": kpis["task_completion_pct"],
        "avg_consensus_ms": kpis["avg_consensus_ms"],
        "replan_avg_latency_ms": round(float(sum(replan_latencies) / len(replan_latencies)) if replan_latencies else 0.0, 2),
        "resilience_factor_pct": kpis["resilience_factor_pct"],
        "fleet_survival_pct": kpis["operational_fleet_pct"],
        "total_packets": kpis["total_mesh_packets"]
    }

def run_experiment_matrix(matrix_path: str = "swarmos/nebius_jobs/matrix.json") -> Dict[str, Any]:
    """Runs systematic experiments defined in matrix.json."""
    if not os.path.exists(matrix_path):
        matrix_path = "nebius_jobs/matrix.json"
    if not os.path.exists(matrix_path):
        matrix_path = "matrix.json"

    with open(matrix_path, "r") as f:
        spec = json.load(f)

    logger.info(f"Starting SWARMOS Experiment Suite: {spec.get('project')}")
    results = []

    fleet_sizes = spec["parameter_sweep"]["fleet_size"][:3] # Sample 4, 6, 8 for demo
    scenarios = spec["parameter_sweep"]["failure_scenarios"]

    for fs in fleet_sizes:
        for scen in scenarios:
            logger.info(f"Running scenario: Fleet={fs}, Scenario={scen['name']}...")
            trial_res = run_single_trial(
                fleet_size=fs,
                task_count=10,
                failure_mode=scen["name"],
                comm_range=350.0
            )
            results.append(trial_res)

    output_summary = {
        "timestamp": time.time(),
        "total_trials": len(results),
        "summary_table": results
    }

    out_file = "nebius_experiment_results.json"
    with open(out_file, "w") as f:
        json.dump(output_summary, f, indent=2)

    logger.info(f"Matrix sweep complete! Results saved to {out_file}")
    return output_summary

if __name__ == "__main__":
    run_experiment_matrix()
