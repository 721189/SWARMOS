import unittest
from swarmos.ai_layer.safety_compiler import SafetyCompiler, SafetyViolationError

class TestSafetyCompiler(unittest.TestCase):
    def setUp(self):
        self.compiler = SafetyCompiler()

    def test_nominal_manifest_approval(self):
        manifest = {
            "mission_name": "Test Recon",
            "tactical_intent": "Sector sweep",
            "tasks": [
                {
                    "id": "T1", 
                    "type": "RECON", 
                    "position": [300.0, 400.0], 
                    "base_reward": 100.0, 
                    "duration": 5.0, 
                    "urgency_weight": 1.0,
                    "payload_kg": 1.0
                }
            ],
            "constraints": {"max_range_meters": 800.0, "minimum_active_agents": 3}
        }
        validated = self.compiler.compile_and_validate(manifest)
        self.assertEqual(validated["safety_verdict"], "APPROVED")
        self.assertEqual(len(validated["tasks"]), 1)

    def test_out_of_bounds_rejection(self):
        manifest = {
            "mission_name": "Out of Range Mission",
            "tasks": [
                {"id": "T_FAR", "type": "RECON", "position": [3000.0, 3000.0], "base_reward": 100.0, "duration": 5.0, "payload_kg": 1.0}
            ],
            "constraints": {"max_range_meters": 800.0, "minimum_active_agents": 2}
        }
        with self.assertRaises(SafetyViolationError):
            self.compiler.compile_and_validate(manifest)

    def test_excessive_payload_rejection(self):
        manifest = {
            "mission_name": "Heavy Payload Mission",
            "tasks": [
                {"id": "T_HEAVY", "type": "RESCUE", "position": [200.0, 500.0], "payload_kg": 25.0, "base_reward": 100.0, "duration": 5.0}
            ],
            "constraints": {"max_range_meters": 800.0, "minimum_active_agents": 2}
        }
        with self.assertRaises(SafetyViolationError):
            self.compiler.compile_and_validate(manifest)

    def test_fleet_redundancy_rejection(self):
        manifest = {
            "mission_name": "Single Agent Request",
            "tasks": [{"id": "T1", "type": "RECON", "position": [200.0, 500.0], "payload_kg": 1.0, "base_reward": 100.0, "duration": 5.0}],
            "constraints": {"max_range_meters": 800.0, "minimum_active_agents": 1}
        }
        with self.assertRaises(SafetyViolationError):
            self.compiler.compile_and_validate(manifest)

if __name__ == "__main__":
    unittest.main()
