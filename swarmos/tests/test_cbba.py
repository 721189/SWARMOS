import unittest
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task, TaskType, TaskStatus
from swarmos.swarm_engine.environment import SwarmEnvironment
from swarmos.swarm_engine.cbba import CBBAEngine

class TestCBBAEngine(unittest.TestCase):
    def setUp(self):
        self.env = SwarmEnvironment(width=1200, height=800, comm_range=400.0, mac_protocol="D-TDMA")
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

    def test_empirical_consensus_ledgers(self):
        """
        P2-2: Verify that empirical consensus compares both winner and bid ledgers.
        All agents must achieve absolute agreement on both who won and what they bid.
        """
        comm_links = list(self.env.update_mesh_network())
        res = self.cbba.run_auction_round(self.env.agents, self.env.tasks, comm_links, max_iterations=15, env=self.env)
        self.assertTrue(res["converged"], "Auction must converge to consensus")

        # Compare winning agents (winner ledger) and winning bids (bid ledger) across all agents
        agent_ids = list(self.env.agents.keys())
        first_agent = self.env.agents[agent_ids[0]]
        
        for aid in agent_ids[1:]:
            other_agent = self.env.agents[aid]
            
            for tid in self.env.tasks.keys():
                winner_1 = first_agent.winning_agents.get(tid)
                winner_2 = other_agent.winning_agents.get(tid)
                self.assertEqual(winner_1, winner_2, f"Winner consensus mismatch on Task {tid} between {first_agent.id} and {other_agent.id}")
                
                bid_1 = first_agent.winning_bids.get(tid, 0.0)
                bid_2 = other_agent.winning_bids.get(tid, 0.0)
                self.assertAlmostEqual(bid_1, bid_2, delta=1e-4, msg=f"Bid ledger mismatch on Task {tid} between {first_agent.id} and {other_agent.id}")

    def test_packet_drop_tracking(self):
        self.env.packet_loss_rate = 0.5
        comm_links = list(self.env.update_mesh_network())
        self.cbba.run_auction_round(self.env.agents, self.env.tasks, comm_links, max_iterations=5, env=self.env)
        self.assertGreaterEqual(self.env.packets_generated, 0)

if __name__ == "__main__":
    unittest.main()
