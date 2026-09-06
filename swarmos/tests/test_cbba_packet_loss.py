import unittest
from swarm_engine.agents import Agent
from swarm_engine.tasks import Task, TaskType
from swarm_engine.environment import SwarmEnvironment
from swarm_engine.cbba import CBBAEngine, AuctionTermination

class TestCBBAPacketLoss(unittest.TestCase):
    def test_degradation(self):
        results = []
        for loss_rate in [0.0, 0.95]:
            env = SwarmEnvironment(width=1200, height=800, comm_range=1500.0)
            env.packet_loss_rate = loss_rate
            cbba = CBBAEngine()
            
            for i in range(3):
                env.add_agent(Agent(f"A{i}", (100.0, 100.0*i), speed=50.0))
            for i in range(5):
                env.add_task(Task(f"T{i}", TaskType.RECON, (500.0, 100.0*i), base_reward=100.0))
                
            comm_links = list(env.update_mesh_network())
            res = cbba.run_auction_round(env.agents, env.tasks, comm_links, max_iterations=30, env=env)
            
            # Count conflicts (multiple agents claiming the same task)
            global_claims = []
            for a in env.agents.values():
                global_claims.extend(a.bundle)
            unique_claims = set(global_claims)
            conflicts = len(global_claims) - len(unique_claims)
            
            results.append((loss_rate, conflicts))
            
        # Extreme packet loss should result in conflicts because they can't resolve them
        self.assertGreater(results[1][1], results[0][1])

if __name__ == '__main__':
    unittest.main()
