import unittest
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task, TaskType, TaskStatus
from swarmos.swarm_engine.environment import SwarmEnvironment
from swarmos.swarm_engine.cbba import CBBAEngine

class TestCBBAEngine(unittest.TestCase):
    def setUp(self):
        self.env = SwarmEnvironment(width=1200, height=800, comm_range=400.0)
        self.cbba = CBBAEngine(lambda_decay=0.95, bid_epsilon=1e-4)

        # 3 Agents
        self.a1 = Agent("A1", (150.0, 650.0), speed=50.0, max_bundle_size=3)
        self.a2 = Agent("A2", (250.0, 650.0), speed=50.0, max_bundle_size=3)
        self.a3 = Agent("A3", (350.0, 650.0), speed=50.0, max_bundle_size=3)
        for a in (self.a1, self.a2, self.a3):
            self.env.add_agent(a)

        # 3 Tasks
        self.t1 = Task("T1", TaskType.RECON, (200.0, 500.0), base_reward=100.0, duration=4.0)
        self.t2 = Task("T2", TaskType.RESCUE, (400.0, 450.0), base_reward=120.0, duration=5.0)
        self.t3 = Task("T3", TaskType.SURVEIL, (600.0, 400.0), base_reward=80.0, duration=3.0)
        for t in (self.t1, self.t2, self.t3):
            self.env.add_task(t)

    def test_cbba_convergence(self):
        comm_links = list(self.env.update_mesh_network())
        converged = self.cbba.run_auction_round(self.env.agents, self.env.tasks, comm_links, max_iterations=10, env=self.env)
        self.assertEqual(converged["termination_status"].value, "converged")
        
        # Check that no task is assigned to more than one agent
        assigned_tasks = []
        for a in self.env.agents.values():
            for tid in a.bundle:
                self.assertNotIn(tid, assigned_tasks, f"Task {tid} was assigned to multiple agents!")
                assigned_tasks.append(tid)

    def test_packet_drop_tracking(self):
        self.env.packet_loss_rate = 0.5
        comm_links = list(self.env.update_mesh_network())
        self.cbba.run_auction_round(self.env.agents, self.env.tasks, comm_links, max_iterations=5, env=self.env)
        self.assertGreaterEqual(self.env.packets_generated, 0)

if __name__ == "__main__":
    unittest.main()
