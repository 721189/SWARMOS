import unittest
import random
import copy
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task, TaskType
from swarmos.swarm_engine.cbba import CBBAEngine

class TestCBBAInvariants(unittest.TestCase):
    def generate_random_scenario(self, seed: int):
        rng = random.Random(seed)
        
        num_agents = rng.randint(4, 10)
        num_tasks = rng.randint(5, 15)
        
        agents = {}
        for i in range(num_agents):
            aid = f"A{i}"
            agents[aid] = Agent(
                aid, 
                initial_position=(rng.uniform(0, 100), rng.uniform(0, 100)),
                speed=rng.uniform(5.0, 15.0),
                max_bundle_size=rng.randint(2, 5)
            )
            
        tasks = {}
        for i in range(num_tasks):
            tid = f"T{i}"
            tasks[tid] = Task(
                tid,
                task_type=rng.choice(list(TaskType)),
                position=(rng.uniform(0, 100), rng.uniform(0, 100)),
                base_reward=rng.uniform(10.0, 100.0)
            )
            
        # Fully connected communication mesh for invariant testing
        comm_links = []
        for i in range(num_agents):
            for j in range(i + 1, num_agents):
                comm_links.append((f"A{i}", f"A{j}"))
                    
        return agents, tasks, comm_links

    def assert_invariants(self, agents, tasks):
        # Invariant 1: No task is assigned to multiple agents in their final bundle
        assigned_tasks = {}
        for aid, agent in agents.items():
            for tid in agent.bundle:
                if tid in assigned_tasks:
                    self.fail(f"Task {tid} duplicated in bundles of {assigned_tasks[tid]} and {aid}")
                assigned_tasks[tid] = aid
                
        # Invariant 2: The path and bundle contain the exact same elements
        for aid, agent in agents.items():
            self.assertEqual(set(agent.bundle), set(agent.path), f"Agent {aid} bundle and path mismatch")
            self.assertEqual(len(agent.bundle), len(agent.path), f"Agent {aid} bundle and path length mismatch")
            
        # Invariant 3: For every task in bundle, the winning agent according to the agent's belief is itself
        for aid, agent in agents.items():
            for tid in agent.bundle:
                self.assertEqual(agent.winning_agents.get(tid), aid, f"Agent {aid} does not believe it won its own task {tid}")

    def test_random_scenarios_maintain_invariants(self):
        engine = CBBAEngine(lambda_decay=0.95)
        
        for seed in range(50):
            agents, tasks, comm_links = self.generate_random_scenario(seed)
            
            # Run to convergence
            for _ in range(100):
                c1 = engine.phase1_bundle_construction(agents, tasks)
                c2 = engine.phase2_consensus_conflict_resolution(agents, tasks, comm_links)
                if not (c1 or c2):
                    break
                    
            self.assert_invariants(agents, tasks)

if __name__ == '__main__':
    unittest.main()
