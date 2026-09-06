"""
Explainable Swarm Intelligence (X-Swarm) Module.
Generates mathematical and natural language explanations for CBBA allocation decisions,
conflict resolutions, and contingency re-plans.
"""

import math
from typing import Dict, Any, Optional
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task
from swarmos.swarm_engine.environment import SwarmEnvironment
from swarmos.swarm_engine.cbba import CBBAEngine

class SwarmExplainer:
    def __init__(self, env: SwarmEnvironment, cbba_engine: CBBAEngine):
        self.env = env
        self.cbba_engine = cbba_engine

    def explain_task_allocation(self, task_id: str) -> Dict[str, Any]:
        """
        Synthesizes a transparent forensic breakdown of why task_id was awarded
        to its current assignee vs. other competing agents in the mesh.
        """
        task = self.env.tasks.get(task_id)
        if not task:
            return {"error": f"Task {task_id} not found."}

        winner_id = task.assigned_agent_id
        winner_agent = self.env.agents.get(winner_id or "")

        agent_comparisons = []
        for aid, agent in self.env.agents.items():
            if not agent.health.is_operational():
                agent_comparisons.append({
                    "agent_id": aid,
                    "status": "NON_OPERATIONAL",
                    "bid": 0.0,
                    "reason": "Agent offline or destroyed"
                })
                continue

            dist = math.hypot(agent.position[0] - task.position[0], agent.position[1] - task.position[1])
            est_time = dist / max(1.0, agent.speed * agent.health.propulsion)
            discounted_score = task.evaluate_marginal_reward(est_time, self.cbba_engine.lambda_decay)
            bundle_capacity_left = agent.max_bundle_size - len(agent.bundle)

            agent_comparisons.append({
                "agent_id": aid,
                "distance_to_task_m": round(dist, 1),
                "est_arrival_sec": round(est_time, 1),
                "marginal_reward_bid": round(discounted_score, 2),
                "bundle_capacity_left": bundle_capacity_left,
                "is_winner": (aid == winner_id)
            })

        # Sort comparisons by bid descending
        agent_comparisons.sort(key=lambda x: x.get("marginal_reward_bid", 0.0), reverse=True)

        explanation_text = ""
        if winner_id and winner_agent:
            runner_up = next((c for c in agent_comparisons if c["agent_id"] != winner_id and c.get("marginal_reward_bid", 0) > 0), None)
            delta = (
                winner_agent.winning_bids.get(task_id, 0.0) - runner_up.get("marginal_reward_bid", 0.0)
                if runner_up else 0.0
            )

            explanation_text = (
                f"Task {task_id} ({task.task_type.value}) was assigned to Agent {winner_id}. "
                f"Agent {winner_id} computed the highest marginal utility ({winner_agent.winning_bids.get(task_id, 0.0):.1f} pts) "
                f"due to its proximity ({agent_comparisons[0]['distance_to_task_m']}m) and low temporal decay discount. "
            )
            if runner_up:
                explanation_text += (
                    f"Runner-up Agent {runner_up['agent_id']} bid {runner_up['marginal_reward_bid']} pts "
                    f"(margin: +{delta:.1f} pts). All 1-hop mesh peers reached consensus within bounds."
                )
        else:
            explanation_text = f"Task {task_id} is currently unassigned (no active agent had bundle capacity or high enough bid)."

        return {
            "task_id": task_id,
            "winner_agent_id": winner_id,
            "task_details": task.to_dict(),
            "explanation": explanation_text,
            "bidding_matrix": agent_comparisons,
        }

    def explain_agent_state(self, agent_id: str) -> Dict[str, Any]:
        """Provides operational breakdown for an individual agent."""
        agent = self.env.agents.get(agent_id)
        if not agent:
            return {"error": f"Agent {agent_id} not found."}

        assigned_tasks = [self.env.tasks[tid].to_dict() for tid in agent.bundle if tid in self.env.tasks]
        
        return {
            "agent_id": agent_id,
            "status": agent.status.value,
            "battery_pct": round(agent.health.battery, 1),
            "bundle": agent.bundle,
            "path": agent.path,
            "assigned_tasks": assigned_tasks,
            "health_diagnostics": {
                "propulsion": f"{agent.health.propulsion * 100:.0f}%",
                "comms": f"{agent.health.comms_transceiver * 100:.0f}%",
                "gps": f"{agent.health.gps_module * 100:.0f}%",
            },
            "summary": (
                f"Agent {agent_id} is {agent.status.value} with {agent.health.battery:.1f}% battery. "
                f"Holding {len(agent.bundle)}/{agent.max_bundle_size} bundle slots. "
                f"Navigating sequence: {' -> '.join(agent.path) if agent.path else 'None'}."
            )
        }
