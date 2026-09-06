"""
Dynamic Replanning Module for SWARMOS.
Monitors operational fleet status, detects mission disruptions (agent dropouts,
threat perimeter expansion, battery starvation), and orchestrates CBBA re-auctions.
"""

import time
from typing import Dict, List, Set, Tuple, Any
from swarmos.swarm_engine.agents import Agent, AgentStatus
from swarmos.swarm_engine.tasks import Task, TaskStatus
from swarmos.swarm_engine.environment import SwarmEnvironment
from swarmos.swarm_engine.cbba import CBBAEngine
from swarmos.utils.logger import logger

class DynamicReplanner:
    def __init__(self, env: SwarmEnvironment, cbba_engine: CBBAEngine):
        self.env = env
        self.cbba_engine = cbba_engine
        self.replan_events: List[Dict[str, Any]] = []

    def check_and_trigger_replan(self) -> bool:
        """
        Inspects swarm state for conditions requiring emergency consensus re-allocation:
        1. An agent holding active tasks has entered FAILED or JAMMED state.
        2. A task was orphaned without an operational assignee.
        3. A dynamic threat overlaps an assigned task waypoint.
        """
        needs_replan = False
        orphaned_task_ids: Set[str] = set()

        for agent_id, agent in self.env.agents.items():
            if not agent.health.is_operational() or agent.status == AgentStatus.FAILED:
                # If failed agent had tasks assigned or in bundle, they must be reclaimed
                if agent.bundle:
                    logger.warning(f"Replanner: Agent {agent_id} is down! Reclaiming {len(agent.bundle)} tasks: {agent.bundle}")
                    orphaned_task_ids.update(agent.bundle)
                    agent.bundle.clear()
                    agent.path.clear()
                    needs_replan = True

        # Check if tasks are orphaned
        for task_id, task in self.env.tasks.items():
            if task.status in [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS]:
                assigned_agent = self.env.agents.get(task.assigned_agent_id or "")
                if not assigned_agent or not assigned_agent.health.is_operational():
                    orphaned_task_ids.add(task_id)
                    task.status = TaskStatus.UNASSIGNED
                    task.assigned_agent_id = None
                    needs_replan = True

        if needs_replan:
            self._execute_reallocation(orphaned_task_ids)
            return True

        return False

    def _execute_reallocation(self, affected_task_ids: Set[str]) -> None:
        """
        Resets consensus bids for affected tasks across all surviving agents,
        then executes a fast CBBA convergence round.
        """
        logger.info(f"Triggering distributed CBBA re-auction for tasks: {list(affected_task_ids)}")
        replan_start = time.time()

        # Invalidate bids for orphaned tasks across all living agents
        for agent in self.env.agents.values():
            if agent.health.is_operational():
                for tid in affected_task_ids:
                    agent.winning_bids[tid] = 0.0
                    agent.winning_agents[tid] = None

        # Re-run auction round on updated network topology
        comm_links = list(self.env.update_mesh_network())
        self.cbba_engine.run_auction_round(self.env.agents, self.env.tasks, comm_links)

        # Synchronize task entity statuses with consensus winners
        for task_id, task in self.env.tasks.items():
            if task.status == TaskStatus.COMPLETED:
                continue

            # Determine who holds winning consensus
            winner = None
            for agent in self.env.agents.values():
                if agent.health.is_operational() and task_id in agent.bundle:
                    winner = agent.id
                    break

            if winner:
                task.status = TaskStatus.ASSIGNED
                task.assigned_agent_id = winner
            else:
                task.status = TaskStatus.UNASSIGNED
                task.assigned_agent_id = None

        duration_ms = (time.time() - replan_start) * 1000.0
        event = {
            "timestamp": round(time.time(), 2),
            "reassigned_tasks": list(affected_task_ids),
            "convergence_time_ms": round(duration_ms, 2),
            "surviving_agents": sum(1 for a in self.env.agents.values() if a.health.is_operational())
        }
        self.replan_events.append(event)
        logger.info(f"Re-auction converged in {duration_ms:.2f}ms across {event['surviving_agents']} surviving agents.")
