"""
Consensus-Based Bundle Algorithm (CBBA) Engine.
Implements the distributed multi-assignment auction protocol developed by
Choi, Brunet, and How (IEEE Transactions on Robotics, 2009).

Consists of two alternating phases:
1. Bundle Construction (Greedy marginal utility maximization with temporal path insertion)
2. Consensus Conflict Resolution (Discrete action rules: UPDATE, RESET, LEAVE via 1-hop wireless mesh)
"""

import copy
import math
import time
from typing import Dict, List, Tuple, Optional, Any
from .agents import Agent, AgentStatus
from .tasks import Task, TaskStatus

class CBBAEngine:
    def __init__(self, lambda_decay: float = 0.95, bid_epsilon: float = 1e-4):
        self.lambda_decay = lambda_decay
        self.bid_epsilon = bid_epsilon
        self.consensus_iterations = 0
        self.has_converged = False
        self.decision_logs: List[Dict[str, Any]] = []

    def compute_path_cost_and_arrival(
        self,
        agent: Agent,
        test_path: List[str],
        all_tasks: Dict[str, Task]
    ) -> Tuple[float, Dict[str, float]]:
        """
        Computes total travel distance, estimated arrival times, and completion times
        for each task along the candidate execution sequence test_path.
        """
        current_pos = tuple(agent.position)
        current_time = 0.0
        arrival_times: Dict[str, float] = {}

        for tid in test_path:
            task = all_tasks[tid]
            dist = math.hypot(task.position[0] - current_pos[0], task.position[1] - current_pos[1])
            travel_time = dist / max(10.0, agent.speed * agent.health.propulsion)
            arrival_time = current_time + travel_time
            arrival_times[tid] = arrival_time
            # Service duration at task site
            current_time = arrival_time + task.duration
            current_pos = task.position

        return current_time, arrival_times

    def compute_total_score(
        self,
        agent: Agent,
        test_path: List[str],
        all_tasks: Dict[str, Task]
    ) -> float:
        """Sum of time-discounted rewards for the path."""
        _, arrival_times = self.compute_path_cost_and_arrival(agent, test_path, all_tasks)
        total_score = 0.0
        for tid in test_path:
            task = all_tasks[tid]
            arr = arrival_times[tid]
            total_score += task.evaluate_marginal_reward(arr, self.lambda_decay)
        return total_score

    def phase1_bundle_construction(
        self,
        agents: Dict[str, Agent],
        tasks: Dict[str, Task]
    ) -> None:
        """
        Phase 1: Each agent builds or extends its task bundle (b_i) and optimal path (p_i)
        by greedily evaluating the marginal gain c_ij of inserting unallocated tasks.
        """
        for agent in agents.values():
            if not agent.health.is_operational() or agent.status == AgentStatus.JAMMED:
                continue

            # Keep adding tasks while bundle size < max capacity
            while len(agent.bundle) < agent.max_bundle_size:
                best_task_id: Optional[str] = None
                best_insertion_idx: int = -1
                best_marginal_score: float = -1.0

                current_score = self.compute_total_score(agent, agent.path, tasks)

                for task_id, task in tasks.items():
                    # Skip if task is already in bundle or completed
                    if task_id in agent.bundle or task.status == TaskStatus.COMPLETED:
                        continue

                    # Try inserting task_id at every possible position in path p_i
                    for idx in range(len(agent.path) + 1):
                        candidate_path = list(agent.path)
                        candidate_path.insert(idx, task_id)
                        candidate_score = self.compute_total_score(agent, candidate_path, tasks)
                        marginal_gain = candidate_score - current_score

                        # Check if marginal gain beats the current known highest bid for this task
                        current_winning_bid = agent.winning_bids.get(task_id, 0.0)
                        if marginal_gain > (current_winning_bid + self.bid_epsilon):
                            if marginal_gain > best_marginal_score:
                                best_marginal_score = marginal_gain
                                best_task_id = task_id
                                best_insertion_idx = idx

                # If a qualifying task was found, insert into bundle & path
                if best_task_id is not None and best_marginal_score > 0.0:
                    agent.bundle.append(best_task_id)
                    agent.path.insert(best_insertion_idx, best_task_id)
                    agent.winning_bids[best_task_id] = best_marginal_score
                    agent.winning_agents[best_task_id] = agent.id
                    agent.timestamps[agent.id] = time.time()
                else:
                    break  # No further task provides positive marginal gain over existing bids

    def phase2_consensus_conflict_resolution(
        self,
        agents: Dict[str, Agent],
        tasks: Dict[str, Task],
        communication_links: List[Tuple[str, str]]
    ) -> bool:
        """
        Phase 2: Local 1-hop peer communication and conflict resolution.
        Applies standard CBBA rules table between agent i and neighbor k.
        Returns True if assignments changed (consensus still ongoing), False if converged.
        """
        changes_occurred = False
        current_time = time.time()

        # Build adjacency neighbor map
        neighbors_map: Dict[str, List[str]] = {aid: [] for aid in agents.keys()}
        for a1, a2 in communication_links:
            if a1 in neighbors_map and a2 in neighbors_map:
                neighbors_map[a1].append(a2)
                neighbors_map[a2].append(a1)

        # Each agent exchanges state with immediate neighbors
        for i_id, agent_i in agents.items():
            if not agent_i.health.is_operational():
                continue

            for k_id in neighbors_map[i_id]:
                agent_k = agents[k_id]
                if not agent_k.health.is_operational():
                    continue

                # Process every known task j in the universe
                for task_id in tasks.keys():
                    y_i = agent_i.winning_bids.get(task_id, 0.0)
                    z_i = agent_i.winning_agents.get(task_id, None)

                    y_k = agent_k.winning_bids.get(task_id, 0.0)
                    z_k = agent_k.winning_agents.get(task_id, None)

                    s_ik = agent_i.timestamps.get(k_id, 0.0)
                    s_kk = agent_k.timestamps.get(k_id, current_time)

                    # Determine action for task_id based on CBBA Rule Matrix:
                    action = "LEAVE" # "UPDATE", "RESET", or "LEAVE"

                    if z_k == k_id:
                        if z_i == i_id:
                            if y_k > (y_i + self.bid_epsilon):
                                action = "UPDATE"
                            elif abs(y_k - y_i) <= self.bid_epsilon and k_id < i_id:
                                # Tie breaker based on unique agent ID
                                action = "UPDATE"
                            else:
                                action = "LEAVE"
                        elif z_i == k_id:
                            action = "UPDATE"
                        elif z_i is None:
                            action = "UPDATE"
                        else:
                            # z_i is some third agent m
                            s_im = agent_i.timestamps.get(z_i, 0.0)
                            if s_kk > s_im:
                                action = "UPDATE"
                            elif y_k > y_i:
                                action = "UPDATE"
                    elif z_k == i_id:
                        if z_i == i_id:
                            action = "LEAVE"
                        elif z_i == k_id:
                            action = "RESET"
                        elif z_i is None:
                            action = "LEAVE"
                        else:
                            action = "RESET"
                    elif z_k is None:
                        if z_i == i_id:
                            action = "LEAVE"
                        elif z_i == k_id:
                            action = "UPDATE"
                        elif z_i is None:
                            action = "LEAVE"
                        else:
                            s_im = agent_i.timestamps.get(z_i, 0.0)
                            if s_kk > s_im:
                                action = "UPDATE"
                    else:
                        # z_k is a 3rd agent m
                        m_id = z_k
                        s_km = agent_k.timestamps.get(m_id, 0.0)
                        s_im = agent_i.timestamps.get(m_id, 0.0)

                        if z_i == i_id:
                            if s_km > s_im and y_k > y_i:
                                action = "UPDATE"
                            elif s_km > s_im and abs(y_k - y_i) <= self.bid_epsilon and m_id < i_id:
                                action = "UPDATE"
                            elif s_kk > s_im and abs(y_k - y_i) > self.bid_epsilon:
                                action = "UPDATE"
                        elif z_i == k_id:
                            action = "UPDATE"
                        elif z_i == m_id:
                            if s_km > s_im:
                                action = "UPDATE"
                        elif z_i is None:
                            action = "UPDATE"
                        else:
                            # z_i is 4th agent p
                            p_id = z_i
                            s_ip = agent_i.timestamps.get(p_id, 0.0)
                            if s_km > s_ip and y_k > y_i:
                                action = "UPDATE"
                            elif s_kk > s_ip:
                                action = "RESET"

                    # Execute resolved rule action
                    if action == "UPDATE":
                        if agent_i.winning_agents.get(task_id) != z_k or abs(agent_i.winning_bids.get(task_id, 0.0) - y_k) > self.bid_epsilon:
                            agent_i.winning_agents[task_id] = z_k
                            agent_i.winning_bids[task_id] = y_k
                            changes_occurred = True
                            self._record_decision(i_id, task_id, "UPDATE", f"Adopted bid {y_k:.2f} from {z_k}")
                    elif action == "RESET":
                        if agent_i.winning_agents.get(task_id) is not None:
                            agent_i.winning_agents[task_id] = None
                            agent_i.winning_bids[task_id] = 0.0
                            changes_occurred = True
                            self._record_decision(i_id, task_id, "RESET", f"Reset bid on outbid/expired assignment")

            # Post-consensus pruning:
            # If agent_i was outbid on a task in its bundle, it must drop that task
            # AND all subsequent tasks in its bundle (CBBA cascade release rule)
            dropped_idx = -1
            for b_idx, tid in enumerate(agent_i.bundle):
                if agent_i.winning_agents.get(tid) != agent_i.id:
                    dropped_idx = b_idx
                    break

            if dropped_idx != -1:
                # Truncate bundle and path from dropped_idx onwards
                for drop_tid in agent_i.bundle[dropped_idx:]:
                    if drop_tid in agent_i.path:
                        agent_i.path.remove(drop_tid)
                    if agent_i.winning_agents.get(drop_tid) == agent_i.id:
                        agent_i.winning_agents[drop_tid] = None
                        agent_i.winning_bids[drop_tid] = 0.0
                agent_i.bundle = agent_i.bundle[:dropped_idx]
                changes_occurred = True

        return changes_occurred

    def _record_decision(self, agent_id: str, task_id: str, action: str, reason: str) -> None:
        self.decision_logs.append({
            "timestamp": round(time.time(), 3),
            "agent_id": agent_id,
            "task_id": task_id,
            "action": action,
            "reason": reason
        })
        if len(self.decision_logs) > 100:
            self.decision_logs.pop(0)

    def run_auction_round(
        self,
        agents: Dict[str, Agent],
        tasks: Dict[str, Task],
        communication_links: List[Tuple[str, str]],
        max_iterations: int = 12
    ) -> bool:
        """
        Runs full alternating Bundle Construction & Consensus Resolution iterations
        until fleet convergence or max_iterations reached.
        """
        for it in range(max_iterations):
            self.consensus_iterations += 1
            # Phase 1: Construction
            self.phase1_bundle_construction(agents, tasks)
            # Phase 2: Consensus
            changed = self.phase2_consensus_conflict_resolution(agents, tasks, communication_links)
            if not changed and it > 0:
                self.has_converged = True
                return True

        self.has_converged = True
        return True
