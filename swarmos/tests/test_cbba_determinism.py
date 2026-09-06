import unittest
import copy
import random
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task, TaskType
from swarmos.swarm_engine.environment import SwarmEnvironment
from swarmos.swarm_engine.cbba import CBBAEngine

class TestCBBADeterminism(unittest.TestCase):
    def test_run_determinism(self):
        def run_sim(seed):
            random.seed(seed)
            env = SwarmEnvironment(width=1200, height=800, comm_range=600.0)
            env.packet_loss_rate = 0.2
            
            a1 = Agent("A1", (150.0, 650.0), speed=50.0, max_bundle_size=3)
            a2 = Agent("A2", (500.0, 300.0), speed=50.0, max_bundle_size=3)
            env.add_agent(a1)
            env.add_agent(a2)
            
            t1 = Task("T1", TaskType.RECON, (200.0, 500.0), base_reward=100.0)
            t2 = Task("T2", TaskType.RESCUE, (400.0, 450.0), base_reward=120.0)
            env.add_task(t1)
            env.add_task(t2)
            
            cbba = CBBAEngine()
            comm_links = list(env.update_mesh_network())
            res = cbba.run_auction_round(env.agents, env.tasks, comm_links, env=env)
            
            return {
                "a1_bundle": list(env.agents["A1"].bundle),
                "a2_bundle": list(env.agents["A2"].bundle),
                "termination_status": res["termination_status"].value
            }

        res1 = run_sim(42)
        res2 = run_sim(42)
        
        self.assertEqual(res1, res2, "Identical seeds must produce identical allocations")
        
        res3 = run_sim(99)
        # It may or may not match res1, but res3 should be deterministic if run again
        res4 = run_sim(99)
        self.assertEqual(res3, res4)

if __name__ == '__main__':
    unittest.main()
