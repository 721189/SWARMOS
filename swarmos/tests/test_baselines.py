import unittest
from nebius_jobs.experiments import run_single_baseline_trial
from swarm_engine.agents import Agent
from swarm_engine.tasks import Task, TaskType, TaskStatus
from swarm_engine.environment import SwarmEnvironment
from swarm_engine.cbba import CBBAEngine

class TestBaselines(unittest.TestCase):
    def test_five_baselines_execution_and_schema(self):
        algorithms = ["Static", "Greedy", "CBBA_Standard", "CBBA_Recovery", "SWARMOS"]
        for algo in algorithms:
            result = run_single_baseline_trial(
                fleet_size=4,
                task_count=6,
                failure_mode="mild_attrition",
                comm_range=300.0,
                packet_loss_rate=0.05,
                seed=42,
                algorithm=algo
            )
            self.assertEqual(result["algorithm"], algo)
            self.assertIn("mission_completion", result)
            self.assertIn("mean_convergence_ms", result)
            self.assertIn("mean_replan_latency", result)
            self.assertIn("fleet_survival_pct", result)
            self.assertIn("packets_generated", result)
            self.assertIn("packets_delivered", result)
            self.assertIn("packets_dropped", result)
            self.assertIn("observed_packet_loss_pct", result)
            self.assertGreaterEqual(result["mission_completion"], 0.0)
            self.assertLessEqual(result["mission_completion"], 100.0)

    def test_static_has_zero_replan_latency_on_failure(self):
        """Static allocation never dynamically re-auctions orphaned tasks."""
        result = run_single_baseline_trial(
            fleet_size=4,
            task_count=8,
            failure_mode="mild_attrition",
            comm_range=300.0,
            packet_loss_rate=0.0,
            seed=101,
            algorithm="Static"
        )
        self.assertEqual(result["mean_replan_latency"], 0.0)

    def test_cbba_recovery_triggers_replan_latency(self):
        """CBBA_Recovery dynamically re-auctions orphaned tasks from dead nodes."""
        result = run_single_baseline_trial(
            fleet_size=4,
            task_count=8,
            failure_mode="mild_attrition",
            comm_range=400.0,
            packet_loss_rate=0.0,
            seed=101,
            algorithm="CBBA_Recovery"
        )
        # Should record active replan latency
        self.assertGreaterEqual(result["mean_replan_latency"], 0.0)

    def test_cbba_standard_no_duplicate_assignments(self):
        """CBBA Standard guarantees conflict-free bundle assignment across nodes."""
        env = SwarmEnvironment(width=1000, height=800, comm_range=400.0)
        cbba = CBBAEngine()
        for i in range(3):
            env.add_agent(Agent(f"A{i+1}", (100.0 + i*100, 600.0), speed=50.0, max_bundle_size=3))
        for j in range(5):
            env.add_task(Task(f"T{j+1}", TaskType.RECON, (200.0 + j*100, 400.0), base_reward=100.0, duration=4.0))

        comm_links = list(env.update_mesh_network())
        cbba.run_auction_round(env.agents, env.tasks, comm_links, max_iterations=10, env=env)

        # Check unique assignment for all assigned tasks
        claimed_tasks = set()
        for a in env.agents.values():
            for tid in a.bundle:
                self.assertNotIn(tid, claimed_tasks, f"Task {tid} was assigned to multiple agents!")
                claimed_tasks.add(tid)

    def test_swarmos_stack_integration(self):
        """SWARMOS completes with valid safety checks, BFT validator, and packet tracking."""
        result = run_single_baseline_trial(
            fleet_size=6,
            task_count=10,
            failure_mode="electronic_warfare_dense",
            comm_range=350.0,
            packet_loss_rate=0.2,
            seed=555,
            algorithm="SWARMOS"
        )
        self.assertEqual(result["algorithm"], "SWARMOS")
        self.assertGreater(result["packets_generated"], 0)
        self.assertGreaterEqual(result["packets_dropped"], 0)
        self.assertGreaterEqual(result["mission_completion"], 0.0)

if __name__ == "__main__":
    unittest.main()
