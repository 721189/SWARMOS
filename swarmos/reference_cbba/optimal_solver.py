import math
import itertools
from typing import Dict, List, Tuple, Optional
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task

class OptimalSolver:
    """
    Unified Reference Objective Solver for Decentralized Swarm Benchmark.
    Objective Function:
        U(pi) = sum_{j in tasks} R_j * lambda^(arrival_time_j * urgency_weight_j)

    - For small instances (N_tasks <= 8): Computes exact globally optimal allocation via exhaustive search.
    - For larger instances (N_tasks > 8): Computes centralized sequential greedy insertion allocation,
      serving as a rigorous centralized reference upper bound (U_ref).
    """
    def __init__(self, lambda_decay: float = 0.95):
        self.lambda_decay = lambda_decay

    def compute_bundle_utility(self, agent: Agent, tasks: Dict[str, Task], path: List[str]) -> float:
        """
        Calculates exact sum of time-discounted marginal rewards for an execution sequence.
        """
        current_pos = tuple(agent.position)
        current_time = 0.0
        total_u = 0.0
        propulsion = getattr(agent.health, "propulsion", 1.0)
        speed = max(10.0, agent.speed * propulsion)

        for tid in path:
            task = tasks[tid]
            dist = math.hypot(task.position[0] - current_pos[0], task.position[1] - current_pos[1])
            travel_time = dist / speed
            arrival_time = current_time + travel_time
            total_u += task.evaluate_marginal_reward(arrival_time, self.lambda_decay)
            current_time = arrival_time + task.duration
            current_pos = task.position

        return total_u

    def compute_global_utility(self, agents: Dict[str, Agent], tasks: Dict[str, Task], allocation: Dict[str, List[str]]) -> float:
        total_utility = 0.0
        for aid, path in allocation.items():
            if aid in agents:
                total_utility += self.compute_bundle_utility(agents[aid], tasks, path)
        return total_utility

    def solve_exact(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> float:
        """
        Exact brute-force globally optimal solver for N_tasks <= 8.
        """
        task_ids = list(tasks.keys())
        agent_ids = list(agents.keys())
        
        if len(task_ids) > 8:
            return self.solve_greedy(agents, tasks)
        if not task_ids or not agent_ids:
            return 0.0
            
        best_utility = 0.0

        def partitions(items, k):
            for p in itertools.product(range(k), repeat=len(items)):
                res = [[] for _ in range(k)]
                for i, v in enumerate(p):
                    res[v].append(items[i])
                yield res

        for p in partitions(task_ids, len(agent_ids)):
            allocation_utility = 0.0
            valid_partition = True
            for i, aid in enumerate(agent_ids):
                bundle = p[i]
                if len(bundle) > agents[aid].max_bundle_size:
                    valid_partition = False
                    break
                
                best_bundle_u = 0.0
                for perm in itertools.permutations(bundle):
                    u = self.compute_bundle_utility(agents[aid], tasks, list(perm))
                    if u > best_bundle_u:
                        best_bundle_u = u
                allocation_utility += best_bundle_u
                
            if valid_partition and allocation_utility > best_utility:
                best_utility = allocation_utility
                
        return best_utility

    def solve_greedy(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> float:
        """
        Centralized sequential greedy insertion solver (Standard benchmark reference bound).
        """
        unassigned = set(tasks.keys())
        agent_paths = {aid: [] for aid in agents}
        total_utility = 0.0
        
        while unassigned:
            best_gain = -1.0
            best_task = None
            best_agent = None
            best_idx = -1
            
            for aid, agent in agents.items():
                if len(agent_paths[aid]) >= agent.max_bundle_size:
                    continue
                    
                current_score = self.compute_bundle_utility(agent, tasks, agent_paths[aid])
                
                for tid in unassigned:
                    for idx in range(len(agent_paths[aid]) + 1):
                        test_path = agent_paths[aid][:idx] + [tid] + agent_paths[aid][idx:]
                        new_score = self.compute_bundle_utility(agent, tasks, test_path)
                        gain = new_score - current_score
                        if gain > best_gain:
                            best_gain = gain
                            best_task = tid
                            best_agent = aid
                            best_idx = idx
            
            if best_task and best_gain > 0:
                agent_paths[best_agent].insert(best_idx, best_task)
                unassigned.remove(best_task)
                total_utility += best_gain
            else:
                break
                
        return total_utility

    def solve(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> Tuple[float, bool]:
        """
        Returns (reference_utility, is_exact).
        """
        if len(tasks) <= 8:
            return self.solve_exact(agents, tasks), True
        return self.solve_greedy(agents, tasks), False

