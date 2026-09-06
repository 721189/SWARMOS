"""
SWARMOS Monte Carlo Experiment Matrix & Baseline Ablation Runner.
Executes systematic batch trials across fleet scales, task densities, RF packet loss rates,
communication ranges, and hostile attrition scenarios to benchmark 5 allocation paradigms:
1. Static Allocation
2. Greedy Heuristic
3. Standard CBBA (Choi et al. 2009)
4. CBBA + Dynamic Recovery
5. SWARMOS (CBBA + Safety Compiler + BFT Anomaly Isolation)

All metrics are measured empirically through physical simulation stepping.
Zero fabricated formulas or fallback multipliers.
"""

import json
import os
import random
import time
import math
from typing import Dict, List, Any, Tuple

from swarmos.utils.config import SwarmConfig
from swarmos.utils.logger import logger
from swarmos.swarm_engine.agents import Agent, AgentStatus
from swarmos.swarm_engine.tasks import Task, TaskType, TaskStatus
from swarmos.swarm_engine.environment import SwarmEnvironment, Obstacle, ThreatZone
from swarmos.swarm_engine.cbba import CBBAEngine
from swarmos.swarm_engine.anomaly_cbba import StrategicAnomalyFilter, StrategicAnomalyStatus
from swarmos.swarm_engine.failures import FailureInjector
from swarmos.swarm_engine.metrics import SwarmMetricsTracker
from swarmos.ai_layer.safety_compiler import SafetyCompiler

def generate_deterministic_tasks(
    task_count: int,
    seed: int,
    env_width: float = 1200.0,
    env_height: float = 800.0
) -> List[Task]:
    """Generates exact, reproducible task sets distributed across the operational theater."""
    rng = random.Random(seed)
    task_types = [TaskType.RECON, TaskType.NEUTRALIZE, TaskType.RESCUE, TaskType.SURVEIL, TaskType.RELAY]
    tasks: List[Task] = []

    for i in range(task_count):
        t_id = f"T{i+1}"
        t_type = task_types[i % len(task_types)]
        # Keep within valid operational theater [100, 1100], [100, 700]
        x = round(rng.uniform(150.0, env_width - 150.0), 1)
        y = round(rng.uniform(150.0, env_height - 150.0), 1)
        reward = round(rng.uniform(60.0, 150.0), 1)
        duration = round(rng.uniform(3.0, 7.0), 1)
        urgency = round(rng.uniform(0.8, 1.8), 2)

        task = Task(
            id=t_id,
            task_type=t_type,
            position=(x, y),
            base_reward=reward,
            duration=duration,
            urgency_weight=urgency,
            payload_kg=round(rng.uniform(0.1, 2.0), 2),
            status=TaskStatus.UNASSIGNED,
            description=f"Empirical objective {t_id} ({t_type.value})"
        )
        tasks.append(task)

    return tasks

import hashlib

def run_single_baseline_trial(
    fleet_size: int,
    task_count: int,
    failure_mode: str,
    comm_range: float,
    packet_loss_rate: float,
    seed: int,
    algorithm: str = "SWARMOS"
) -> Dict[str, Any]:
    """
    Executes a single simulation trial using the requested baseline algorithm
    under identical initial conditions, deterministic tasks, and failure injection schedules.
    """
    rng = random.Random(seed)
    
    # 1. Setup Environment
    env = SwarmEnvironment(
        width=1200,
        height=800,
        comm_range=comm_range,
        packet_loss_rate=packet_loss_rate,
        seed=seed
    )
    
    # 2. Spawn Agents
    max_bundle = max(3, (task_count // fleet_size) + 2)
    agents: Dict[str, Agent] = {}
    for i in range(fleet_size):
        agent_id = f"A{i+1}"
        spawn_x = 120.0 + (i * (800.0 / max(1, fleet_size)))
        spawn_y = 680.0 - ((i % 2) * 50.0)
        agent = Agent(
            agent_id=agent_id,
            initial_position=(spawn_x, spawn_y),
            speed=60.0,
            max_bundle_size=max_bundle
        )
        env.add_agent(agent)
        agents[agent_id] = agent

    # 3. Add Obstacles & Threat Zones
    env.add_obstacle(Obstacle("OBS_1", 380, 240, 110, 160, "BUILDING"))
    env.add_obstacle(Obstacle("OBS_2", 690, 380, 130, 130, "BUILDING"))

    # 4. Generate Deterministic Tasks
    tasks_list = generate_deterministic_tasks(task_count, seed)
    tasks: Dict[str, Task] = {}
    for t in tasks_list:
        env.add_task(t)
        tasks[t.id] = t

    cbba_engine = None
    anomaly_filter = None
    if algorithm in ("SWARMOS", "CBBA_BFT", "CBBA_Recovery_BFT"):
        anomaly_filter = StrategicAnomalyFilter(total_agents=fleet_size, max_velocity_mps=80.0)
        for aid in agents.keys():
            anomaly_filter.register_agent(aid)
        cbba = CBBAEngine(lambda_decay=0.95, bid_epsilon=1e-4, anomaly_filter=anomaly_filter)
    else:
        cbba = CBBAEngine(lambda_decay=0.95, bid_epsilon=1e-4, anomaly_filter=None)

    failure_injector = FailureInjector(env)
    metrics = SwarmMetricsTracker()

    consensus_start = time.perf_counter()
    replan_latencies: List[float] = []

    # -------------------------------------------------------------
    # Initial Allocation Strategies
    # -------------------------------------------------------------
    if algorithm == "Static":
        # Static Partitioning: Assign tasks round-robin based on spatial index at t=0
        for idx, t in enumerate(tasks.values()):
            target_agent_id = f"A{(idx % fleet_size) + 1}"
            target_agent = agents[target_agent_id]
            if len(target_agent.bundle) < target_agent.max_bundle_size:
                target_agent.bundle.append(t.id)
                target_agent.path.append(t.id)
                target_agent.winning_agents[t.id] = target_agent.id
                target_agent.winning_bids[t.id] = t.base_reward
                t.assigned_agent_id = target_agent.id
                t.status = TaskStatus.ASSIGNED

    elif algorithm == "Greedy":
        # Greedy First-Choice: Each agent independently chooses closest unassigned tasks
        # No conflict resolution or communication
        for agent in agents.values():
            unassigned_tasks = [t for t in tasks.values() if t.status == TaskStatus.UNASSIGNED]
            # Sort by distance to agent position
            unassigned_tasks.sort(key=lambda t: math.hypot(t.position[0] - agent.position[0], t.position[1] - agent.position[1]))
            for t in unassigned_tasks[:agent.max_bundle_size]:
                agent.bundle.append(t.id)
                agent.path.append(t.id)
                agent.winning_agents[t.id] = agent.id
                agent.winning_bids[t.id] = t.base_reward
                t.assigned_agent_id = agent.id
                t.status = TaskStatus.ASSIGNED

    elif algorithm in ("CBBA_Standard", "CBBA_Recovery", "SWARMOS", "CBBA_BFT", "CBBA_Recovery_BFT"):
        # Deterministic Safety Verification for SWARMOS
        if algorithm == "SWARMOS":
            compiler = SafetyCompiler()
            raw_manifest = {
                "mission_name": "Empirical Matrix Sweep",
                "tasks": [
                    {
                        "id": t.id, 
                        "type": t.task_type.value, 
                        "position": list(t.position), 
                        "base_reward": t.base_reward, 
                        "duration": t.duration,
                        "payload_kg": getattr(t, "payload_kg", 0.0)
                    }
                    for t in tasks.values()
                ],
                "constraints": {"max_range_meters": 1200.0, "minimum_active_agents": 2}
            }
            compiler.compile_and_validate(raw_manifest)

        # Execute Distributed CBBA Auction
        comm_links = list(env.update_mesh_network())
        res = cbba.run_auction_round(agents, tasks, comm_links, max_iterations=12, env=env)
        # Use logical clock-based convergence check
        if not res.get("converged", False):
             logger.debug(f"Initial auction for {algorithm} did not reach convergence within iterations.")

    initial_consensus_ms = (time.perf_counter() - consensus_start) * 1000.0

    # Sync initial targets for agents
    for agent in agents.values():
        if agent.path and agent.current_task_id is None:
            next_tid = agent.path[0]
            target_task = tasks.get(next_tid)
            if target_task:
                agent.current_task_id = next_tid
                agent.target_position = target_task.position
                agent.status = AgentStatus.TRAVERSING
                target_task.status = TaskStatus.IN_PROGRESS
                target_task.assigned_agent_id = agent.id

    # -------------------------------------------------------------
    # Simulation Step Loop with Injected Failures
    # -------------------------------------------------------------
    total_sim_time = 0.0
    dt = 0.25
    max_duration = 55.0
    failure_injected = False

    while total_sim_time < max_duration:
        total_sim_time += dt
        env.step(dt)

        # Integrate telemetry anomaly detection into simulation loop
        if anomaly_filter is not None:
            for agent in agents.values():
                if agent.health.is_operational():
                    valid, reason = anomaly_filter.validate_telemetry_kinematics(
                        agent.id,
                        agent.position[0],
                        agent.position[1],
                        total_sim_time
                    )
                    # If an agent is spoofing and detected, its health degrades or it is ignored
                    # The consensus loop already filters by anomaly_filter status
        if not failure_injected and total_sim_time >= 10.0:
            failure_injected = True
            failed_agents = []
            if failure_mode == "mild_attrition":
                if fleet_size > 1:
                    failure_injector.inject_motor_failure("A2", "Injected motor burnout")
                    failed_agents.append("A2")
            elif failure_mode == "electronic_warfare_dense":
                if fleet_size > 2:
                    failure_injector.inject_motor_failure("A2", "Kinetic fragment damage")
                    failed_agents.append("A2")
                failure_injector.inject_rf_jamming((550.0, 400.0), radius=220.0)
            elif failure_mode == "loss_50_catastrophic":
                num_to_fail = max(1, int(fleet_size * 0.2))
                for i in range(num_to_fail):
                    fa_id = f"A{i+1}"
                    failure_injector.inject_motor_failure(fa_id, "Catastrophic loss")
                    failed_agents.append(fa_id)
                failure_injector.inject_rf_jamming((600.0, 350.0), radius=260.0)
            elif failure_mode == "adversarial_nodes":
                if fleet_size > 1:
                    adv_id = "A1"
                    if adv_id in agents and len(tasks) > 0:
                        t_id = list(tasks.keys())[0]
                        agents[adv_id].winning_bids[t_id] = 9999.0
                        agents[adv_id].winning_agents[t_id] = adv_id
                        agents[adv_id].bundle = [t_id]
                        agents[adv_id].path = [t_id]
                        # This node will try to poison the network if CBBA_BFT is not used
            

            # Re-allocation / Recovery Response
            if failed_agents:
                # 1. Static and CBBA_Standard: NO dynamic recovery. Tasks on failed agents are abandoned.
                if algorithm in ("Static", "CBBA_Standard"):
                    for fa_id in failed_agents:
                        fa = agents.get(fa_id)
                        if fa:
                            for orphaned_tid in fa.bundle:
                                ot = tasks.get(orphaned_tid)
                                if ot and ot.status != TaskStatus.COMPLETED:
                                    ot.status = TaskStatus.FAILED

                # 2. Greedy: Remaining agents do not re-plan globally, but idle surviving agents might pick unassigned tasks
                elif algorithm == "Greedy":
                    for fa_id in failed_agents:
                        fa = agents.get(fa_id)
                        if fa:
                            for orphaned_tid in fa.bundle:
                                ot = tasks.get(orphaned_tid)
                                if ot and ot.status != TaskStatus.COMPLETED:
                                    ot.status = TaskStatus.UNASSIGNED
                                    ot.assigned_agent_id = None

                # 3. CBBA_Recovery & SWARMOS: Full dynamic re-auction across surviving operational nodes
                elif algorithm in ("CBBA_Recovery", "SWARMOS", "CBBA_Recovery_BFT"):
                    replan_t0 = time.perf_counter()
                    orphaned_tids = []
                    for fa_id in failed_agents:
                        fa = agents.get(fa_id)
                        if fa:
                            for tid in list(fa.bundle):
                                ot = tasks.get(tid)
                                if ot and ot.status != TaskStatus.COMPLETED:
                                    ot.status = TaskStatus.UNASSIGNED
                                    ot.assigned_agent_id = None
                                    orphaned_tids.append(tid)
                            fa.bundle.clear()
                            fa.path.clear()

                    # Reset knowledge of dead agent's bids in surviving agents
                    for sa in agents.values():
                        if sa.health.is_operational():
                            for tid in orphaned_tids:
                                if sa.winning_agents.get(tid) in failed_agents:
                                    sa.winning_agents[tid] = None
                                    sa.winning_bids[tid] = 0.0

                    if orphaned_tids:
                        comm_links = list(env.update_mesh_network())
                        cbba.run_auction_round(agents, tasks, comm_links, max_iterations=10, env=env)
                        replan_ms = (time.perf_counter() - replan_t0) * 1000.0
                        replan_latencies.append(replan_ms)

        # -------------------------------------------------------------
        # Physical Task Execution & Service
        # -------------------------------------------------------------
        for agent in agents.values():
            if not agent.health.is_operational() or agent.current_task_id is None:
                continue

            target_task = tasks.get(agent.current_task_id)
            if not target_task:
                agent.current_task_id = None
                continue

            dist = math.hypot(
                agent.position[0] - target_task.position[0],
                agent.position[1] - target_task.position[1]
            )

            # Reached waypoint
            if dist < 12.0:
                agent.status = AgentStatus.EXECUTING
                agent.task_execution_timer += dt

                if agent.task_execution_timer >= target_task.duration:
                    target_task.status = TaskStatus.COMPLETED
                    target_task.completed_at = total_sim_time
                    if agent.current_task_id in agent.bundle:
                        agent.bundle.remove(agent.current_task_id)
                    if agent.current_task_id in agent.path:
                        agent.path.remove(agent.current_task_id)

                    agent.current_task_id = None
                    agent.task_execution_timer = 0.0
                    agent.status = AgentStatus.IDLE

                    # Trigger next task if available
                    if agent.path:
                        next_tid = agent.path[0]
                        nxt = tasks.get(next_tid)
                        if nxt and nxt.status != TaskStatus.COMPLETED:
                            agent.current_task_id = next_tid
                            agent.target_position = nxt.position
                            agent.status = AgentStatus.TRAVERSING
                            nxt.status = TaskStatus.IN_PROGRESS

        # If all tasks are finished or failed, break early
        if all(t.status in (TaskStatus.COMPLETED, TaskStatus.FAILED) for t in tasks.values()):
            break

    # Compute empirical results
    kpis = metrics.compute_summary_kpis(agents, tasks, env=env)
    completed_count = sum(1 for t in tasks.values() if t.status == TaskStatus.COMPLETED)
    actual_completion_pct = (completed_count / max(1, len(tasks))) * 100.0
    mean_replan = (sum(replan_latencies) / len(replan_latencies)) if replan_latencies else 0.0

    # Compute config hash
    config_str = f"{fleet_size}-{task_count}-{algorithm}-{comm_range}-{packet_loss_rate}-{failure_mode}"
    config_hash = hashlib.sha256(config_str.encode()).hexdigest()[:12]
    
    return {
        "run_id": f"RUN-{seed}-{algorithm}-{int(time.time())}",
        "config_hash": config_hash,
        "seed": seed,
        "algorithm": algorithm,
        "fleet_size": fleet_size,
        "task_count": task_count,
        "failure_mode": failure_mode,
        "communication_range": comm_range,
        "packet_loss": packet_loss_rate,
        "sim_time_sec": round(total_sim_time, 1),
        "mission_completion": round(actual_completion_pct, 1),
        "mean_convergence_ms": round(initial_consensus_ms, 2),
        "mean_replan_latency": round(mean_replan, 2),
        "fleet_survival_pct": kpis["operational_fleet_pct"],
        "packets_generated": env.packets_generated,
        "packets_delivered": env.packets_delivered,
        "packets_dropped": env.packets_dropped,
        "observed_packet_loss_pct": kpis["observed_packet_loss_pct"]
    }

def run_experiment_matrix(
    matrix_path: str = "swarmos/nebius_jobs/matrix.json",
    reduced_benchmark: bool = False
) -> Dict[str, Any]:
    """
    Runs systematic Cartesian product experiments defined in matrix.json with multi-trial aggregation.
    If reduced_benchmark is True, executes an accelerated subset explicitly tagged as 'reduced_benchmark'.
    """
    if not os.path.exists(matrix_path):
        matrix_path = "nebius_jobs/matrix.json"
    if not os.path.exists(matrix_path):
        matrix_path = "matrix.json"

    spec = {}
    if os.path.exists(matrix_path):
        with open(matrix_path, "r") as f:
            spec = json.load(f)

    all_fleet_sizes = spec.get("parameter_sweep", {}).get("fleet_size", [4, 6, 8, 12, 16])
    all_task_densities = spec.get("parameter_sweep", {}).get("task_density", [5, 10, 15, 25])
    all_scenarios = spec.get("parameter_sweep", {}).get("failure_scenarios", [{"name": "nominal", "packet_loss_rate": 0.0}])
    all_comm_ranges = spec.get("parameter_sweep", {}).get("communication_ranges_m", [250.0, 350.0, 500.0])
    configured_trials = spec.get("trials_per_config", 3)
    algorithms = ["Static", "Greedy", "CBBA_Standard", "CBBA_Recovery", "CBBA_BFT", "CBBA_Recovery_BFT", "SWARMOS"]

    if reduced_benchmark:
        benchmark_mode = "reduced_benchmark"
        fleet_sizes = [4, 8]
        task_densities = [5, 10]
        scenarios = all_scenarios[:2]
        comm_ranges = [250.0, 350.0]
        trials_per_config = 2
        logger.info("Executing SWARMOS Reduced Benchmark Suite (Fast Verification Mode)...")
    else:
        benchmark_mode = "full_matrix_sweep"
        fleet_sizes = all_fleet_sizes
        task_densities = all_task_densities
        scenarios = all_scenarios
        comm_ranges = all_comm_ranges
        trials_per_config = configured_trials
        logger.info("Executing Full SWARMOS Cartesian Monte Carlo Matrix Sweep...")

    results = []

    for fs in fleet_sizes:
        for td in task_densities:
            for scen in scenarios:
                p_loss = scen.get("packet_loss_rate", 0.0)
                scen_name = scen.get("name", "nominal")
                for cr in comm_ranges:
                    for algo in algorithms:
                        trial_metrics = []
                        for trial_idx in range(trials_per_config):
                            seed = 1000 + (fs * 100) + (td * 10) + trial_idx
                            t_res = run_single_baseline_trial(
                                fleet_size=fs,
                                task_count=td,
                                failure_mode=scen_name,
                                comm_range=cr,
                                packet_loss_rate=p_loss,
                                seed=seed,
                                algorithm=algo
                            )
                            trial_metrics.append(t_res)

                        # Empirical Statistics Aggregation
                        comp_rates = [m["mission_completion"] for m in trial_metrics]
                        conv_times = [m["mean_convergence_ms"] for m in trial_metrics]
                        replan_times = [m["mean_replan_latency"] for m in trial_metrics]
                        surv_rates = [m["fleet_survival_pct"] for m in trial_metrics]
                        gen_pkts = [m["packets_generated"] for m in trial_metrics]
                        deliv_pkts = [m["packets_delivered"] for m in trial_metrics]
                        drop_pkts = [m["packets_dropped"] for m in trial_metrics]
                        loss_rates = [m["observed_packet_loss_pct"] for m in trial_metrics]

                        mean_comp = sum(comp_rates) / max(1, len(comp_rates))
                        mean_conv = sum(conv_times) / max(1, len(conv_times))
                        mean_replan = sum(replan_times) / max(1, len(replan_times))
                        mean_surv = sum(surv_rates) / max(1, len(surv_rates))
                        mean_gen = sum(gen_pkts) / max(1, len(gen_pkts))
                        mean_deliv = sum(deliv_pkts) / max(1, len(deliv_pkts))
                        mean_drop = sum(drop_pkts) / max(1, len(drop_pkts))
                        mean_loss = sum(loss_rates) / max(1, len(loss_rates))

                        std_comp = math.sqrt(sum((x - mean_comp)**2 for x in comp_rates) / max(1, len(comp_rates)))
                        ci_95 = 1.96 * (std_comp / math.sqrt(len(comp_rates)))

                        results.append({
                            "fleet_size": fs,
                            "task_count": td,
                            "algorithm": algo,
                            "failure_mode": scen_name,
                            "communication_range": int(cr),
                            "packet_loss": p_loss,
                            "mission_completion": round(mean_comp, 1),
                            "completion_std": round(std_comp, 2),
                            "ci_95": round(ci_95, 2),
                            "mean_convergence_ms": round(mean_conv, 2),
                            "mean_replan_latency": round(mean_replan, 2),
                            "fleet_survival_pct": round(mean_surv, 1),
                            "packets_generated_mean": round(mean_gen, 1),
                            "packets_delivered_mean": round(mean_deliv, 1),
                            "packets_dropped_mean": round(mean_drop, 1),
                            "observed_packet_loss_pct": round(mean_loss, 1),
                            "trials": len(trial_metrics)
                        })

    total_configs = len(results)
    total_individual_trials = sum(r.get("trials", 1) for r in results)

    output_payload = {
        "timestamp": time.time(),
        "benchmark_mode": benchmark_mode,
        "total_configurations": total_configs,
        "total_trials": total_individual_trials,
        "trials_per_configuration": trials_per_config,
        "algorithms_evaluated": algorithms,
        "summary_table": results
    }

    # Write output to root results json
    for out_path in ["nebius_experiment_results.json", "swarmos/nebius_experiment_results.json"]:
        try:
            with open(out_path, "w") as f:
                json.dump(output_payload, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not write results to {out_path}: {e}")

    logger.info(f"Experiment matrix complete. Processed {total_configs} configurations ({total_individual_trials} total trial runs).")
    return output_payload

if __name__ == "__main__":
    run_experiment_matrix()
