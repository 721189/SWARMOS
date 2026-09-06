import unittest
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task, TaskType
from swarmos.swarm_engine.environment import SwarmEnvironment
from swarmos.swarm_engine.cbba import CBBAEngine, AuctionTermination

class TestCBBADisconnected(unittest.TestCase):
    def test_partitioned_network(self):
        # Comm range is small, agents are far apart
        env = SwarmEnvironment(width=2000, height=2000, comm_range=200.0)
        cbba = CBBAEngine()
        
        a1 = Agent("A1", (100.0, 100.0), speed=50.0)
        a2 = Agent("A2", (1000.0, 1000.0), speed=50.0) # Out of range of A1
        env.add_agent(a1)
        env.add_agent(a2)
        
        t1 = Task("T1", TaskType.RECON, (500.0, 500.0), base_reward=100.0)
        env.add_task(t1)
        
        comm_links = list(env.update_mesh_network())
        self.assertEqual(len(comm_links), 0) # No links
        
        res = cbba.run_auction_round(env.agents, env.tasks, comm_links, env=env)
        
        # Because they are disconnected, they both might claim T1 in their own isolated state
        # But wait, CBBAEngine will converge locally.
        self.assertEqual(res["status"], AuctionTermination.CONVERGED)
        self.assertIn("T1", a1.bundle)
        self.assertIn("T1", a2.bundle)

if __name__ == '__main__':
    unittest.main()
