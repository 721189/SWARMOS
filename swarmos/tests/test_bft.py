import unittest
from swarm_engine.bft_cbba import BftConsensusValidator, BftAgentStatus
from swarm_engine.cbba import CBBAEngine
from swarm_engine.agents import Agent
from swarm_engine.tasks import Task, TaskType
from swarm_engine.environment import SwarmEnvironment

class TestBftConsensus(unittest.TestCase):
    def setUp(self):
        self.validator = BftConsensusValidator(total_agents=4, max_velocity_mps=60.0)
        for aid in ["A1", "A2", "A3", "A4"]:
            self.validator.register_agent(aid)

    def test_bid_poisoning_detection(self):
        # Base reward = 100.0, max allowed is 125.0
        valid, _ = self.validator.validate_bid("A1", "T1", 110.0, 100.0)
        self.assertTrue(valid)

        # Poisoned bid of 500.0
        invalid, reason = self.validator.validate_bid("A2", "T1", 500.0, 100.0)
        self.assertFalse(invalid)
        self.assertIn("poisoned bid", reason)
        self.assertLess(self.validator.trust_scores["A2"], 100.0)

    def test_telemetry_spoofing_detection(self):
        # Step 1: initial pose at t=0
        v1, _ = self.validator.validate_telemetry_kinematics("A1", 100.0, 100.0, timestamp=0.0)
        self.assertTrue(v1)

        # Step 2: nominal move at t=1 (30m displacement / 1s = 30 m/s <= 60 m/s)
        v2, _ = self.validator.validate_telemetry_kinematics("A1", 130.0, 100.0, timestamp=1.0)
        self.assertTrue(v2)

        # Step 3: spoofed teleportation at t=2 (600m displacement / 1s = 600 m/s > 60 m/s)
        v3, reason = self.validator.validate_telemetry_kinematics("A1", 730.0, 100.0, timestamp=2.0)
        self.assertFalse(v3)
        self.assertIn("Kinematic spoof", reason)

    def test_quarantine_threshold_and_remediation(self):
        # Penalize repeatedly until quarantined
        self.validator._penalize_agent("A3", 40.0, "Violation 1")
        self.assertEqual(self.validator.agent_statuses["A3"], BftAgentStatus.SUSPECT)
        
        self.validator._penalize_agent("A3", 35.0, "Violation 2")
        self.assertEqual(self.validator.agent_statuses["A3"], BftAgentStatus.QUARANTINED)

        # Quarantined agent bids are automatically rejected
        valid, _ = self.validator.validate_bid("A3", "T1", 50.0, 100.0)
        self.assertFalse(valid)

        # Remediate
        self.validator.remediate_agent("A3")
        self.assertEqual(self.validator.agent_statuses["A3"], BftAgentStatus.TRUSTED)
        valid_after, _ = self.validator.validate_bid("A3", "T1", 50.0, 100.0)
        self.assertTrue(valid_after)

    def test_cbba_with_bft_integration_blocks_poisoned_bids(self):
        cbba = CBBAEngine(lambda_decay=0.95, bid_epsilon=1e-4, bft_validator=self.validator)
        env = SwarmEnvironment(width=1000, height=800, comm_range=400.0)
        
        a1 = Agent("A1", (100.0, 500.0), speed=50.0)
        a2 = Agent("A2", (200.0, 500.0), speed=50.0)
        env.add_agent(a1)
        env.add_agent(a2)

        t1 = Task("T1", TaskType.RECON, (150.0, 400.0), base_reward=100.0, duration=4.0)
        env.add_task(t1)

        # Inject poisoned bid into agent A2
        a2.winning_bids["T1"] = 9999.0
        a2.winning_agents["T1"] = "A2"

        # Consensus round between A1 and A2
        comm_links = [("A1", "A2")]
        cbba.phase2_consensus_conflict_resolution(env.agents, env.tasks, comm_links, env=env)

        # A1 must NOT adopt the poisoned 9999.0 bid from A2
        self.assertNotEqual(a1.winning_bids.get("T1", 0.0), 9999.0)

if __name__ == "__main__":
    unittest.main()
