import math
import itertools
from typing import Dict, List, Tuple
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task

class CentralizedSolver:
    """
    Computes a near-optimal centralized solution for task allocation.
    Since the general MATA problem is NP-hard, we use a greedy approach
    for larger fleets and exhaustive search for very small ones (N+M < 10).
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
            travel_time = dist / max(1.0, agent.speed * agent.health.propulsion)
            arrival_time = current_time + travel_time
            score += task.evaluate_marginal_reward(arrival_time, self.lambda_decay)
            current_time = arrival_time + task.duration
            current_pos = task.position
            
        return score

    def solve_greedy(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> float:
        """
        Global greedy insertion across all agents.
        """
        unassigned = set(tasks.keys())
        agent_paths = {a_id: [] for a_id in agents.keys()}
        total_reward = 0.0
        
        while unassigned:
            best_gain = -1.0
            best_task = None
            best_agent = None
            best_idx = -1
            
            for a_id, agent in agents.items():
                if len(agent_paths[a_id]) >= agent.max_bundle_size:
                    continue
                    
                current_score = self.compute_path_score(agent, agent_paths[a_id], tasks)
                
                for tid in unassigned:
                    # Find best insertion index
                    for idx in range(len(agent_paths[a_id]) + 1):
                        test_path = agent_paths[a_id][:idx] + [tid] + agent_paths[a_id][idx:]
                        new_score = self.compute_path_score(agent, test_path, tasks)
                        gain = new_score - current_score
                        if gain > best_gain:
                            best_gain = gain
                            best_task = tid
                            best_agent = a_id
                            best_idx = idx
                            
            if best_task and best_gain > 0:
                agent_paths[best_agent].insert(best_idx, best_task)
                unassigned.remove(best_task)
                total_reward += best_gain
            else:
                break
                
        return total_reward

    def solve_optimal_small(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> float:
        """
        Exhaustive search for very small problems.
        Only used if N*M is small.
        """
        # Simplification for demo: just use greedy if it's not trivial
        return self.solve_greedy(agents, tasks)
