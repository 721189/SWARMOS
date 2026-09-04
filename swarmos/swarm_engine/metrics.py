"""
Telemetry and Performance Metrics Tracker for SWARMOS.
Calculates empirical performance metrics: Time-to-Consensus, Global Reward,
Fleet Survival, Energy Efficiency, Real Packets Delivered/Dropped, and Resilience Factor.
Zero fabricated fallback constants or synthetic packet inflation.
"""

import time
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from .agents import Agent, AgentStatus
from .tasks import Task, TaskStatus

@dataclass
class SwarmSnapshot:
    timestamp: float
    converged: bool
    completion_rate: float
    active_agents: int
    failed_agents: int
    total_messages: int
    global_reward_earned: float
    average_battery: float

class SwarmMetricsTracker:
    def __init__(self):
        self.start_time = time.time()
        self.consensus_start_time: Optional[float] = None
        self.consensus_durations: List[float] = []
        self.replan_latencies: List[float] = []
        self.snapshots: List[SwarmSnapshot] = []
        self.injected_failure_count = 0
        self.recovered_task_count = 0

    def start_consensus_timer(self) -> None:
        self.consensus_start_time = time.time()

    def stop_consensus_timer(self) -> float:
        if self.consensus_start_time is not None:
            duration = (time.time() - self.consensus_start_time) * 1000.0 # milliseconds
            self.consensus_durations.append(duration)
            self.consensus_start_time = None
            return duration
        return 0.0

    def record_replan_latency(self, latency_ms: float) -> None:
        self.replan_latencies.append(latency_ms)

    def record_snapshot(
        self,
        agents: Dict[str, Agent],
        tasks: Dict[str, Task],
        converged: bool,
        env: Optional[Any] = None
    ) -> SwarmSnapshot:
        total_tasks = max(1, len(tasks))
        completed_tasks = sum(1 for t in tasks.values() if t.status == TaskStatus.COMPLETED)
        completion_rate = (completed_tasks / total_tasks) * 100.0

        active_count = sum(1 for a in agents.values() if a.health.is_operational())
        failed_count = sum(1 for a in agents.values() if not a.health.is_operational())

        total_msgs = env.packets_delivered if env is not None and hasattr(env, "packets_delivered") else sum(a.messages_sent for a in agents.values())
        total_batt = sum(a.health.battery for a in agents.values()) / max(1, len(agents))
        reward_earned = sum(t.base_reward for t in tasks.values() if t.status == TaskStatus.COMPLETED)

        snap = SwarmSnapshot(
            timestamp=round(time.time() - self.start_time, 2),
            converged=converged,
            completion_rate=round(completion_rate, 1),
            active_agents=active_count,
            failed_agents=failed_count,
            total_messages=total_msgs,
            global_reward_earned=round(reward_earned, 1),
            average_battery=round(total_batt, 1)
        )
        self.snapshots.append(snap)
        if len(self.snapshots) > 200:
            self.snapshots.pop(0)
        return snap

    def compute_summary_kpis(
        self,
        agents: Dict[str, Agent],
        tasks: Dict[str, Task],
        env: Optional[Any] = None
    ) -> Dict[str, Any]:
        total_tasks = len(tasks)
        completed = sum(1 for t in tasks.values() if t.status == TaskStatus.COMPLETED)
        failed = sum(1 for t in tasks.values() if t.status == TaskStatus.FAILED)
        unassigned = sum(1 for t in tasks.values() if t.status == TaskStatus.UNASSIGNED)

        avg_consensus_ms = (
            sum(self.consensus_durations) / len(self.consensus_durations)
            if len(self.consensus_durations) > 0 else 0.0
        )

        avg_replan_ms = (
            sum(self.replan_latencies) / len(self.replan_latencies)
            if len(self.replan_latencies) > 0 else 0.0
        )

        total_dist = sum(a.distance_traveled for a in agents.values())
        total_energy_consumed = sum(100.0 - a.health.battery for a in agents.values())
        reward_earned = sum(t.base_reward for t in tasks.values() if t.status == TaskStatus.COMPLETED)

        energy_eff = reward_earned / max(1.0, total_energy_consumed)

        operational_fleet_pct = (sum(1 for a in agents.values() if a.health.is_operational()) / max(1, len(agents))) * 100.0
        resilience_factor = (completed / max(1, total_tasks - failed)) * 100.0

        packets_gen = env.packets_generated if env is not None and hasattr(env, "packets_generated") else 0
        packets_deliv = env.packets_delivered if env is not None and hasattr(env, "packets_delivered") else sum(a.messages_sent for a in agents.values())
        packets_drop = env.packets_dropped if env is not None and hasattr(env, "packets_dropped") else 0
        observed_drop_rate = (packets_drop / max(1, packets_gen)) * 100.0 if packets_gen > 0 else 0.0

        return {
            "completed_tasks": completed,
            "total_tasks": total_tasks,
            "task_completion_pct": round((completed / max(1, total_tasks)) * 100.0, 1),
            "unassigned_tasks": unassigned,
            "avg_consensus_ms": round(avg_consensus_ms, 2),
            "avg_replan_ms": round(avg_replan_ms, 2),
            "total_distance_m": round(total_dist, 1),
            "energy_efficiency": round(energy_eff, 2),
            "resilience_factor_pct": round(resilience_factor, 1),
            "operational_fleet_pct": round(operational_fleet_pct, 1),
            "total_mesh_packets": packets_deliv,
            "packets_generated": packets_gen,
            "packets_delivered": packets_deliv,
            "packets_dropped": packets_drop,
            "observed_packet_loss_pct": round(observed_drop_rate, 1),
        }
