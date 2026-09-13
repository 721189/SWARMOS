import itertools
from typing import Dict, List, Tuple
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task

class OptimalSolver:
    """
    Computes the exact globally optimal task allocation (MILP equivalent)
    using exhaustive search for small instances (N_tasks <= 8).
    For larger instances, it uses a high-performance Greedy Centralized baseline.
    """
    
    def compute_global_utility(self, agents: Dict[str, Agent], tasks: Dict[str, Task], allocation: Dict[str, List[str]]) -> float:
        """
        Calculates the sum of marginal utilities for a given global allocation.
        """
        total_utility = 0.0
        for aid, task_ids in allocation.items():
            agent = agents[aid]
            # In a real CBBA, utility depends on sequence. 
            # Here we assume a simplified model where utility = reward - distance
            # For the optimal solver, we should ideally check all permutations of the bundle
            curr_pos = agent.position
            for tid in task_ids:
                task = tasks[tid]
                dist = ((curr_pos[0] - task.position[0])**2 + (curr_pos[1] - task.position[1])**2)**0.5
                utility = max(0, task.base_reward - (dist * 0.1)) # Same discount as in cbba.py
                total_utility += utility
                curr_pos = task.position
        return total_utility

    def solve_exact(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> float:
        """
        Brute-force optimal for small N_tasks.
        """
        task_ids = list(tasks.keys())
        agent_ids = list(agents.keys())
        
        if len(task_ids) > 8:
            return self.solve_greedy(agents, tasks)
            
        best_utility = 0.0
        
        # Partition tasks into agents (including empty sets)
        # Using a generator to avoid memory explosion
        def partitions(set_, k):
            for p in itertools.product(range(k), repeat=len(set_)):
                res = [[] for _ in range(k)]
                for i, v in enumerate(p):
                    res[v].append(set_[i])
                yield res

        for p in partitions(task_ids, len(agent_ids)):
            # For each agent's bundle, find the best visit order (permutation)
            allocation_utility = 0.0
            valid_partition = True
            for i, aid in enumerate(agent_ids):
                bundle = p[i]
                if len(bundle) > agents[aid].max_bundle_size:
                    valid_partition = False
                    break
                
                # Find best permutation for this bundle
                best_bundle_u = 0.0
                for perm in itertools.permutations(bundle):
                    u = self.compute_bundle_utility(agents[aid], tasks, list(perm))
                    best_bundle_u = max(best_bundle_u, u)
                allocation_utility += best_bundle_u
                
            if valid_partition:
                best_utility = max(best_utility, allocation_utility)
                
        return best_utility

    def compute_bundle_utility(self, agent: Agent, tasks: Dict[str, Task], path: List[str]) -> float:
        curr_pos = agent.position
        total_u = 0.0
        for tid in path:
            task = tasks[tid]
            dist = ((curr_pos[0] - task.position[0])**2 + (curr_pos[1] - task.position[1])**2)**0.5
            u = max(0, task.base_reward - (dist * 0.1))
            total_u += u
            curr_pos = task.position
        return total_u

    def solve_greedy(self, agents: Dict[str, Agent], tasks: Dict[str, Task]) -> float:
        """
        Centralized greedy algorithm (Standard upper bound for distributed solvers).
        """
        unassigned = list(tasks.keys())
        allocation = {aid: [] for aid in agents}
        total_utility = 0.0
        
        while unassigned:
            best_bid = -1.0
            best_task = None
            best_agent = None
            
            for tid in unassigned:
                task = tasks[tid]
                for aid in agents:
                    agent = agents[aid]
                    if len(allocation[aid]) >= agent.max_bundle_size:
                        continue
                        
                    # Calculate marginal utility of adding this task to existing bundle
                    # (In centralized greedy, we assume we append to the end)
                    curr_pos = agent.position
                    if allocation[aid]:
                        last_task = tasks[allocation[aid][-1]]
                        curr_pos = last_task.position
                    
                    dist = ((curr_pos[0] - task.position[0])**2 + (curr_pos[1] - task.position[1])**2)**0.5
                    u = max(0, task.base_reward - (dist * 0.1))
                    
                    if u > best_bid:
                        best_bid = u
                        best_task = tid
                        best_agent = aid
            
            if best_task:
                allocation[best_agent].append(best_task)
                unassigned.remove(best_task)
                total_utility += best_bid
            else:
                break
                
        return total_utility
