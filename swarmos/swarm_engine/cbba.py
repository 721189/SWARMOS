"""
Consensus-Based Bundle Algorithm (CBBA) Engine.
Implements the distributed multi-assignment auction protocol developed by
Choi, Brunet, and How (IEEE Transactions on Robotics, 2009).

Consists of two alternating phases:
1. Bundle Construction (Greedy marginal utility maximization with temporal path insertion)
2. Consensus Conflict Resolution (Discrete action rules: UPDATE, RESET, LEAVE via 1-hop wireless mesh)
   with real stochastic packet drop evaluation.
"""

import copy
import math
import time
from typing import Dict, List, Tuple, Optional, Any, Set
from enum import Enum
from .agents import Agent, AgentStatus
from .tasks import Task, TaskStatus
from .anomaly_cbba import ByzantineAnomalyFilter, BftAgentStatus


class AuctionTermination(Enum):
    CONVERGED = "converged"
    MAX_ITERATIONS = "max_iterations"
    FAILED = "failed"

class CBBAEngine:
    def __init__(
        self,
        lambda_decay: float = 0.95,
        bid_epsilon: float = 1e-4,
        bft_validator: Optional[ByzantineAnomalyFilter] = None
    ):
        self.lambda_decay = lambda_decay
        self.bid_epsilon = bid_epsilon
        self.bft_validator = bft_validator
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
    ) -> bool:
        """
        Phase 1: Each agent builds or extends its task bundle (b_i) and optimal path (p_i)
        by greedily evaluating the marginal gain c_ij of inserting unallocated tasks.
        """
        changes_occurred = False
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

        return changes_occurred


    def phase2_consensus_conflict_resolution(
        self,
        agents: Dict[str, Agent],
        tasks: Dict[str, Task],
        communication_links: Any,
        env: Optional[Any] = None
    ) -> bool:
        changes_occurred = False
        current_time = time.time()
        if isinstance(communication_links, list):
            neighbors_map = {a_id: [] for a_id in agents.keys()}
            for link in communication_links:
                neighbors_map[link[0]].append(link[1])
                neighbors_map[link[1]].append(link[0])
        else:
            neighbors_map = communication_links
            
        for i_id, agent_i in agents.items():
            if not agent_i.health.is_operational(): continue
            for k_id in set(neighbors_map.get(i_id, [])):
                agent_k = agents[k_id]
                if not agent_k.health.is_operational(): continue
                if self.bft_validator is not None:
                    k_status = self.bft_validator.agent_statuses.get(k_id, BftAgentStatus.TRUSTED)
                    if k_status in (BftAgentStatus.QUARANTINED, BftAgentStatus.EJECTED): continue
                if env is not None and hasattr(env, "transmit_packet"):
                    delivered = env.transmit_packet(k_id, i_id, payload_bytes=128)
                    if not delivered: continue
                    
                s_kk = agent_k.timestamps.get(k_id, current_time)
                agent_i.timestamps[k_id] = max(agent_i.timestamps.get(k_id, 0.0), s_kk)
                for m_id in agents.keys():
                    if m_id not in (i_id, k_id):
                        s_im = agent_i.timestamps.get(m_id, 0.0)
                        s_km = agent_k.timestamps.get(m_id, 0.0)
                        agent_i.timestamps[m_id] = max(s_im, s_km)
                
                for task_id in tasks.keys():
                    y_i = agent_i.winning_bids.get(task_id, 0.0)
                    z_i = agent_i.winning_agents.get(task_id, None)
                    y_k = agent_k.winning_bids.get(task_id, 0.0)
                    z_k = agent_k.winning_agents.get(task_id, None)
                    if self.bft_validator is not None and z_k is not None and y_k > 0:
                        task_obj = tasks.get(task_id)
                        base_r = task_obj.base_reward if task_obj else 100.0
                        valid_bid, reason = self.bft_validator.validate_bid(z_k, task_id, y_k, base_r)
                        if not valid_bid:
                            self._record_decision(i_id, task_id, "REJECT_BFT", reason or "Poisoned BFT bid")
                            continue
                            

                    action = "LEAVE"
                    if z_k == k_id:
                        if z_i == i_id:
                            if y_k > y_i: action = "UPDATE"
                            elif abs(y_k - y_i) <= self.bid_epsilon and k_id < i_id: action = "UPDATE"
                            else: action = "LEAVE"
                        elif z_i == k_id:
                            action = "UPDATE"
                        elif z_i not in (i_id, k_id, None):
                            m_id = z_i
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0):
                                action = "UPDATE"
                            elif y_k > y_i:
                                action = "UPDATE"
                            else:
                                action = "LEAVE"
                        else: # z_i is None
                            action = "UPDATE"
                    elif z_k == i_id:
                        if z_i == i_id: action = "LEAVE"
                        elif z_i == k_id: action = "RESET"
                        elif z_i not in (i_id, k_id, None): action = "LEAVE"
                        else: action = "LEAVE"
                    elif z_k not in (i_id, k_id, None):
                        m_id = z_k
                        if z_i == i_id:
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            elif y_k > y_i: action = "UPDATE"
                            elif abs(y_k - y_i) <= self.bid_epsilon and m_id < i_id: action = "UPDATE"
                            else: action = "LEAVE"
                        elif z_i == k_id:
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            else: action = "RESET"
                        elif z_i == m_id:
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            else: action = "LEAVE"
                        elif z_i not in (i_id, k_id, m_id, None):
                            n_id = z_i
                            t_k_m = agent_k.timestamps.get(m_id, 0.0)
                            t_i_m = agent_i.timestamps.get(m_id, 0.0)
                            t_k_n = agent_k.timestamps.get(n_id, 0.0)
                            t_i_n = agent_i.timestamps.get(n_id, 0.0)
                            
                            if t_k_m > t_i_m and t_k_n > t_i_n: action = "UPDATE"
                            elif t_k_m > t_i_m and t_k_n <= t_i_n:
                                if y_k > y_i: action = "UPDATE"
                                elif abs(y_k - y_i) <= self.bid_epsilon and m_id < n_id: action = "UPDATE"
                                else: action = "LEAVE"
                            elif t_k_m <= t_i_m and t_k_n > t_i_n: action = "UPDATE"
                            elif t_k_m <= t_i_m and t_k_n <= t_i_n:
                                if y_k > y_i: action = "UPDATE"
                                else: action = "LEAVE"
                        else: # z_i is None
                            action = "UPDATE"
                    else: # z_k is None
                        if z_i == i_id: action = "LEAVE"
                        elif z_i == k_id: action = "UPDATE"
                        elif z_i not in (i_id, k_id, None):
                            m_id = z_i
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            else: action = "LEAVE"
                        else: action = "LEAVE"
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
                            self._record_decision(i_id, task_id, "RESET", "Reset bid")
                            
            dropped_idx = -1
            for b_idx, tid in enumerate(agent_i.bundle):
                if agent_i.winning_agents.get(tid) != agent_i.id:
                    dropped_idx = b_idx
                    break
            if dropped_idx != -1:
                for drop_tid in agent_i.bundle[dropped_idx:]:
                    if drop_tid in agent_i.path: agent_i.path.remove(drop_tid)
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


    def check_invariants(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> None:
        """
        Verifies algorithmic guarantees during the auction phase.
        Must fail loudly if any invariant is violated.
        """
        for a_id, agent in agents.items():
            if len(agent.bundle) != len(agent.path):
                raise RuntimeError(f"Invariant Violation: Agent {a_id} bundle length ({len(agent.bundle)}) does not match path length ({len(agent.path)})")
            for t_id in agent.bundle:
                if t_id not in agent.path:
                    raise RuntimeError(f"Invariant Violation: Task {t_id} is in Agent {a_id}'s bundle but missing from its path")
            for t_id, z_agent in agent.winning_agents.items():
                y_bid = agent.winning_bids.get(t_id, 0.0)
                if z_agent is not None:
                    if y_bid < 0.0:
                        raise RuntimeError(f"Invariant Violation: Agent {a_id} recorded negative bid {y_bid} for task {t_id}")
                else:
                    if y_bid > 0.0:
                        raise RuntimeError(f"Invariant Violation: Agent {a_id} has positive bid for task {t_id} with no winning agent")

    def run_auction_round(
        self,
        agents: Dict[str, Agent],
        tasks: Dict[str, Task],
        communication_links: Any,
        max_iterations: int = 15,
        env: Optional[Any] = None
    ) -> dict:
        """
        Runs full alternating Bundle Construction & Consensus Resolution iterations
        until fleet convergence or max_iterations reached.
        """
        changed = False
        for it in range(max_iterations):
            self.consensus_iterations += 1
            c1 = self.phase1_bundle_construction(agents, tasks)
            c2 = self.phase2_consensus_conflict_resolution(agents, tasks, communication_links, env=env)
            changed = c1 or c2
            self.check_invariants(agents, tasks)

            if not changed and it > 0:
                self.has_converged = True
                return {
                    "status": AuctionTermination.CONVERGED,
                    "iterations": it + 1,
                    "changes_last_iteration": False
                }
        self.has_converged = False
        return {
            "status": AuctionTermination.MAX_ITERATIONS,
            "iterations": max_iterations,
            "changes_last_iteration": changed
        }
