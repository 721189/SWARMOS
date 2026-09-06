import unittest
import copy
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task, TaskType
from swarmos.swarm_engine.cbba import CBBAEngine
from swarmos.reference_cbba.cbba_oracle import ReferenceCBBAOracle

class TestCBBAOracleValidation(unittest.TestCase):
    def setUp(self):
        self.tasks = {
            "T1": Task("T1", TaskType.RECON, (10, 10), 100.0),
            "T2": Task("T2", TaskType.SURVEIL, (20, 20), 150.0),
            "T3": Task("T3", TaskType.NEUTRALIZE, (50, 50), 200.0)
        }
        self.agents = {
            "A1": Agent("A1", (0, 0), speed=10.0, max_bundle_size=3),
            "A2": Agent("A2", (100, 100), speed=10.0, max_bundle_size=3)
        }
        
        # Fully connected graph for simplicity
        self.comm_links = [
            ("A1", "A2"),
            ("A2", "A1")
        ]

    def test_oracle_matches_optimized_engine(self):
        # Setup copies of agents for both engines
        agents_oracle = copy.deepcopy(self.agents)
        agents_optimized = copy.deepcopy(self.agents)

        # Run Reference Oracle
        oracle = ReferenceCBBAOracle(lambda_decay=0.95)
        oracle_converged = oracle.solve(agents_oracle, self.tasks, self.comm_links)
        self.assertTrue(oracle_converged, "Oracle should converge")

        # Run Optimized Engine
        engine = CBBAEngine(lambda_decay=0.95)
        # Optimized engine loop
        for _ in range(100):
            engine.phase1_bundle_construction(agents_optimized, self.tasks)
            changed = engine.phase2_consensus_conflict_resolution(agents_optimized, self.tasks, self.comm_links)
            if not changed:
                break
                
        for aid in self.agents.keys():
            oracle_agent = agents_oracle[aid]
            opt_agent = agents_optimized[aid]
            
            # Print for debug if they differ
            if oracle_agent.bundle != opt_agent.bundle:
                print(f"Agent {aid} Bundle Mismatch! Oracle: {oracle_agent.bundle}, Opt: {opt_agent.bundle}")
            
            self.assertEqual(oracle_agent.bundle, opt_agent.bundle, f"Bundles mismatch for agent {aid}")
            self.assertEqual(oracle_agent.path, opt_agent.path, f"Paths mismatch for agent {aid}")
            self.assertEqual(oracle_agent.winning_agents, opt_agent.winning_agents, f"Winning agents mismatch for agent {aid}")

if __name__ == '__main__':
    unittest.main()
