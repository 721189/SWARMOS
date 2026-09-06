import unittest
from swarm_engine.agents import Agent
from swarm_engine.tasks import Task, TaskType
from swarm_engine.environment import SwarmEnvironment
from swarm_engine.cbba import CBBAEngine

class TestCBBAInvariants(unittest.TestCase):
    def test_cbba_invariants(self):
        env = SwarmEnvironment(width=1200, height=800, comm_range=1500.0)
        cbba = CBBAEngine()
        
        # 3 Agents
        for i in range(1, 4):
            env.add_agent(Agent(f"A{i}", (100.0 * i, 100.0 * i), speed=50.0, max_bundle_size=3))
            
        # 5 Tasks
        for i in range(1, 6):
            env.add_task(Task(f"T{i}", TaskType.RECON, (200.0 * i, 500.0), base_reward=100.0))
            
        comm_links = list(env.update_mesh_network())
        res = cbba.run_auction_round(env.agents, env.tasks, comm_links, max_iterations=20, env=env)
        
        self.assertEqual(res["status"].value, "converged")
        
        # Invariant 1: One task -> at most one winner
        global_winners = {}
        for a_id, agent in env.agents.items():
            for t_id in agent.bundle:
                self.assertNotIn(t_id, global_winners, f"Task {t_id} assigned to multiple agents!")
                global_winners[t_id] = a_id
                
        # Invariant 2: Winner bid >= 0
        for a_id, agent in env.agents.items():
            for t_id in agent.bundle:
                self.assertGreaterEqual(agent.winning_bids.get(t_id, 0), 0)
                
        # Invariant 3: Path contains bundle tasks exactly
        for a_id, agent in env.agents.items():
            self.assertEqual(set(agent.bundle), set(agent.path))
            self.assertEqual(len(agent.bundle), len(agent.path))

if __name__ == '__main__':
    unittest.main()
