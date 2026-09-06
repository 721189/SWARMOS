import math
from typing import Dict, List, Tuple
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task

class ReferenceCBBAOracle:
    """
    A minimal, obviously correct reference implementation of CBBA.
    Used purely as an oracle for verifying the optimized SWARMOS CBBA engine.
    """
    def __init__(self, lambda_decay: float = 0.95):
        self.lambda_decay = lambda_decay

    def compute_path_score(self, agent: Agent, path: List[str], tasks: Dict[str, Task]) -> float:
        score = 0.0
        current_time = 0.0
        current_pos = tuple(agent.position)
        
        for tid in path:
            task = tasks[tid]
            dist = math.hypot(task.position[0] - current_pos[0], task.position[1] - current_pos[1])
            travel_time = dist / max(10.0, agent.speed * agent.health.propulsion)
            arrival_time = current_time + travel_time
            score += task.evaluate_marginal_reward(arrival_time, self.lambda_decay)
            current_time = arrival_time + task.duration
            current_pos = task.position
            
        return score

    def phase1_build_bundle(self, agent: Agent, tasks: Dict[str, Task]):
        # Greedily add tasks until max_bundle_size is reached
        while len(agent.bundle) < agent.max_bundle_size:
            best_task = None
            best_idx = -1
            best_gain = 0.0
            
            # Find the best task to insert
            for tid, task in tasks.items():
                if tid in agent.bundle:
                    continue
                # Skip if we already think someone else has a winning bid we can't beat (outbid check)
                # Wait, standard CBBA phase 1: compute maximum marginal gain.
                # If marginal gain > current winning bid, we can bid.
                current_score = self.compute_path_score(agent, agent.path, tasks)
                
                # Find best insertion index for tid
                task_best_idx = -1
                task_best_gain = 0.0
                
                for idx in range(len(agent.path) + 1):
                    test_path = agent.path[:idx] + [tid] + agent.path[idx:]
                    new_score = self.compute_path_score(agent, test_path, tasks)
                    gain = new_score - current_score
                    if gain > task_best_gain:
                        task_best_gain = gain
                        task_best_idx = idx
                        
                # Ensure epsilon
                if task_best_gain > (agent.winning_bids.get(tid, 0.0) + 1e-4):
                    if task_best_gain > best_gain:
                        best_gain = task_best_gain
                        best_task = tid
                        best_idx = task_best_idx
                        
            if best_task is not None:
                agent.bundle.append(best_task)
                agent.path.insert(best_idx, best_task)
                agent.winning_bids[best_task] = best_gain
                agent.winning_agents[best_task] = agent.id
                agent.timestamps[agent.id] = agent.timestamps.get(agent.id, 0.0) + 1.0 # Logical clock tick
            else:
                break

    def phase2_conflict_resolution(self, agents: Dict[str, Agent], comm_links: List[Tuple[str, str]]):
        """
        Implements the Choi 2009 18-rule conflict resolution matrix.
        Returns True if state changed.
        """
        changed = False
        
        # Prepare outgoing messages (snapshot of current state)
        messages = {}
        for a_id, a in agents.items():
            messages[a_id] = {
                "winning_bids": a.winning_bids.copy(),
                "winning_agents": a.winning_agents.copy(),
                "timestamps": a.timestamps.copy()
            }
            
        # Process received messages
        for i_id, k_id in comm_links:
            agent_i = agents.get(i_id)
            msg_k = messages.get(k_id)
            if not agent_i or not msg_k:
                continue
                
            # Update timestamps based on rule: t_i[j] = max(t_i[j], t_k[j]) if j != i
            for other_id, k_time in msg_k["timestamps"].items():
                if other_id != i_id:
                    if k_time > agent_i.timestamps.get(other_id, 0.0):
                        agent_i.timestamps[other_id] = k_time
                        changed = True

            for tid in agent_i.winning_agents.keys() | msg_k["winning_agents"].keys():
                z_ij = agent_i.winning_agents.get(tid)
                y_ij = agent_i.winning_bids.get(tid, 0.0)
                z_kj = msg_k["winning_agents"].get(tid)
                y_kj = msg_k["winning_bids"].get(tid, 0.0)
                
                # Standard Choi 2009 conflict resolution rules
                action = None
                
                if z_kj == k_id:
                    if z_ij == i_id:
                        if y_kj > y_ij: action = "UPDATE"
                        elif y_kj == y_ij and k_id < i_id: action = "UPDATE"
                        else: action = "LEAVE"
                    elif z_ij == k_id:
                        action = "UPDATE"
                    elif z_ij not in (i_id, k_id, None):
                        # m = z_ij
                        m_id = z_ij
                        t_k_m = msg_k["timestamps"].get(m_id, 0.0)
                        t_i_m = agent_i.timestamps.get(m_id, 0.0)
                        if t_k_m > t_i_m:
                            action = "UPDATE"
                        elif y_kj > y_ij:
                            action = "UPDATE"
                        else:
                            action = "LEAVE"
                    else: # z_ij is None
                        action = "UPDATE"
                elif z_kj == i_id:
                    if z_ij == i_id: action = "LEAVE"
                    elif z_ij == k_id: action = "RESET"
                    elif z_ij not in (i_id, k_id, None): action = "LEAVE"
                    else: action = "LEAVE"
                elif z_kj not in (i_id, k_id, None):
                    m_id = z_kj
                    if z_ij == i_id:
                        t_k_m = msg_k["timestamps"].get(m_id, 0.0)
                        t_i_m = agent_i.timestamps.get(m_id, 0.0)
                        if t_k_m > t_i_m: action = "UPDATE"
                        elif y_kj > y_ij: action = "UPDATE"
                        elif y_kj == y_ij and m_id < i_id: action = "UPDATE"
                        else: action = "LEAVE"
                    elif z_ij == k_id:
                        t_k_m = msg_k["timestamps"].get(m_id, 0.0)
                        t_i_m = agent_i.timestamps.get(m_id, 0.0)
                        if t_k_m > t_i_m: action = "UPDATE"
                        else: action = "RESET"
                    elif z_ij == m_id:
                        t_k_m = msg_k["timestamps"].get(m_id, 0.0)
                        t_i_m = agent_i.timestamps.get(m_id, 0.0)
                        if t_k_m > t_i_m: action = "UPDATE"
                        else: action = "LEAVE"
                    elif z_ij not in (i_id, k_id, m_id, None):
                        n_id = z_ij
                        t_k_m = msg_k["timestamps"].get(m_id, 0.0)
                        t_i_m = agent_i.timestamps.get(m_id, 0.0)
                        t_k_n = msg_k["timestamps"].get(n_id, 0.0)
                        t_i_n = agent_i.timestamps.get(n_id, 0.0)
                        
                        if t_k_m > t_i_m and t_k_n > t_i_n: action = "UPDATE"
                        elif t_k_m > t_i_m and t_k_n <= t_i_n:
                            if y_kj > y_ij: action = "UPDATE"
                            elif y_kj == y_ij and m_id < n_id: action = "UPDATE"
                            else: action = "LEAVE"
                        elif t_k_m <= t_i_m and t_k_n > t_i_n: action = "UPDATE"
                        elif t_k_m <= t_i_m and t_k_n <= t_i_n:
                            if y_kj > y_ij: action = "UPDATE"
                            else: action = "LEAVE"
                    else: # z_ij is None
                        action = "UPDATE"
                else: # z_kj is None
                    if z_ij == i_id: action = "LEAVE"
                    elif z_ij == k_id: action = "UPDATE"
                    elif z_ij not in (i_id, k_id, None):
                        m_id = z_ij
                        t_k_m = msg_k["timestamps"].get(m_id, 0.0)
                        t_i_m = agent_i.timestamps.get(m_id, 0.0)
                        if t_k_m > t_i_m: action = "UPDATE"
                        else: action = "LEAVE"
                    else: action = "LEAVE"

                if action == "UPDATE":
                    if agent_i.winning_agents.get(tid) != z_kj or agent_i.winning_bids.get(tid) != y_kj:
                        agent_i.winning_agents[tid] = z_kj
                        agent_i.winning_bids[tid] = y_kj
                        changed = True
                elif action == "RESET":
                    if agent_i.winning_agents.get(tid) is not None:
                        agent_i.winning_agents[tid] = None
                        agent_i.winning_bids[tid] = 0.0
                        changed = True

        return changed

    def release_tasks_after_reset(self, agent: Agent):
        """
        If a task in the bundle has z_ij != i_id, release it and all subsequent tasks.
        """
        cut_idx = -1
        for idx, tid in enumerate(agent.bundle):
            if agent.winning_agents.get(tid) != agent.id:
                cut_idx = idx
                break
                
        if cut_idx != -1:
            dropped_tasks = agent.bundle[cut_idx:]
            agent.bundle = agent.bundle[:cut_idx]
            agent.path = [t for t in agent.path if t not in dropped_tasks]

    def solve(self, agents: Dict[str, Agent], tasks: Dict[str, Task], comm_links: List[Tuple[str, str]], max_iter=100) -> bool:
        for _ in range(max_iter):
            for agent in agents.values():
                self.phase1_build_bundle(agent, tasks)
                
            changed = self.phase2_conflict_resolution(agents, comm_links)
            
            for agent in agents.values():
                self.release_tasks_after_reset(agent)
                
            if not changed:
                return True
        return False
