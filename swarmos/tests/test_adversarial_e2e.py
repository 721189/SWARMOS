
import unittest
import math
from swarmos.swarm_engine.agents import Agent, AgentStatus
from swarmos.swarm_engine.tasks import Task, TaskType, TaskStatus
from swarmos.swarm_engine.environment import SwarmEnvironment
from swarmos.swarm_engine.cbba import CBBAEngine
from swarmos.swarm_engine.anomaly_cbba import StrategicAnomalyFilter, StrategicAnomalyStatus
from swarmos.swarm_engine.failures import FailureInjector

class TestAdversarialEndToEnd(unittest.TestCase):
    def setUp(self):
        self.env = SwarmEnvironment(seed=42)
        self.anomaly_filter = StrategicAnomalyFilter(total_agents=4, max_velocity_mps=80.0)
        self.engine = CBBAEngine(anomaly_filter=self.anomaly_filter)
        self.injector = FailureInjector(self.env)
        
        # 4 Agents
        self.agents = {}
        for i in range(4):
            aid = f"A{i+1}"
            a = Agent(aid, (100 + i*100, 100))
            self.env.add_agent(a)
            self.agents[aid] = a
            self.anomaly_filter.register_agent(aid)
            
        # 4 Tasks
        self.tasks = {}
        for i in range(4):
            tid = f"T{i+1}"
            t = Task(tid, TaskType.RECON, (500, 500), base_reward=100.0)
            self.env.add_task(t)
            self.tasks[tid] = t

    def test_poisoned_bid_chain(self):
        """
        poisoned bid
        → detected
        → trust decreases
        → node quarantined
        → node excluded from consensus
        → task recovered/reallocated
        """
        # 1. Initial convergence
        links = self.env.update_mesh_network()
        res = self.engine.run_auction_round(self.agents, self.tasks, links, env=self.env)
        self.assertTrue(res["converged"])
        
        # Capture which agent won T1
        original_winner_t1 = self.agents["A1"].winning_agents.get("T1")
        self.assertIsNotNone(original_winner_t1)
        
        # 2. Inject Poisoned Bid from A1
        # We manually corrupt A1's belief to simulate a malicious bid injection
        malicious_bid = 5000.0 # Way above base_reward * 1.25
        self.agents["A1"].winning_bids["T1"] = malicious_bid
        self.agents["A1"].winning_agents["T1"] = "A1"
        self.agents["A1"].logical_clock += 1
        self.agents["A1"].timestamps["A1"] = self.agents["A1"].logical_clock
        
        # 3. Run consensus - A1 should be detected by neighbors
        # A1 is neighbor of A2
        self.engine.run_auction_round(self.agents, self.tasks, links, env=self.env, max_iterations=2)
        
        # 4. Verify detection & quarantine
        trust_a1 = self.anomaly_filter.trust_scores["A1"]
        self.assertLess(trust_a1, 100.0)
        
        # Continue consensus until A1 is quarantined (threshold <= 35)
        # One bid is -35 penalty. 100 -> 65 -> 30 (quarantined)
        self.agents["A1"].winning_bids["T2"] = malicious_bid
        self.agents["A1"].winning_agents["T2"] = "A1"
        self.agents["A1"].logical_clock += 1
        self.agents["A1"].timestamps["A1"] = self.agents["A1"].logical_clock
        
        self.engine.run_auction_round(self.agents, self.tasks, links, env=self.env, max_iterations=2)
        
        status_a1 = self.anomaly_filter.agent_statuses["A1"]
        self.assertEqual(status_a1, StrategicAnomalyStatus.QUARANTINED)
        
        # 5. Verify exclusion & reallocation
        # A1 is quarantined. In next round, neighbors should ignore A1's bids.
        # T1 which A1 "claimed" should be reset or won by others.
        
        # Run to full convergence
        res = self.engine.run_auction_round(self.agents, self.tasks, links, env=self.env, max_iterations=20)
        self.assertTrue(res["converged"])
        
        # Check T1 winner in healthy nodes (A2, A3, A4)
        for aid in ["A2", "A3", "A4"]:
            winner = self.agents[aid].winning_agents.get("T1")
            self.assertNotEqual(winner, "A1", f"Agent {aid} still believes quarantined A1 won T1")
            self.assertIsNotNone(winner)

if __name__ == "__main__":
    unittest.main()
