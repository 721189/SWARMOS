import unittest
from nebius_jobs.experiments import run_single_baseline_trial

class TestBaselines(unittest.TestCase):
    def test_five_baselines_execution(self):
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
            self.assertIn("fleet_survival_pct", result)
            self.assertGreaterEqual(result["mission_completion"], 0.0)
            self.assertLessEqual(result["mission_completion"], 100.0)

if __name__ == "__main__":
    unittest.main()
