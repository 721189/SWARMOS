import unittest
from swarmos.ai_layer.safety_compiler import SafetyCompiler

class TestSafetyCompiler(unittest.TestCase):
    def setUp(self):
        self.compiler = SafetyCompiler()

    def test_nominal_manifest_approval(self):
        manifest = {
            "mission_name": "Test Recon",
            "tactical_intent": "Sector sweep",
            "tasks": [
                {"id": "T1", "type": "RECON", "position": [300.0, 400.0], "base_reward": 100.0, "duration": 5.0, "urgency_weight": 1.0}
            ],
            "constraints": {"max_range_meters": 800.0, "minimum_active_agents": 3}
        }
        validated = self.compiler.compile_and_validate(manifest)
        self.assertEqual(validated["safety_verdict"], "APPROVED")
        self.assertEqual(len(validated["tasks"]), 1)
        self.assertEqual(len(validated["violations_logged"]), 0)

    def test_out_of_bounds_rejection(self):
        manifest = {
            "mission_name": "Out of Range Mission",
            "tasks": [
                {"id": "T_FAR", "type": "RECON", "position": [3000.0, 3000.0], "base_reward": 100.0, "duration": 5.0, "urgency_weight": 1.0}
            ]
        }
        validated = self.compiler.compile_and_validate(manifest)
        self.assertEqual(validated["safety_verdict"], "REJECTED")
        self.assertEqual(len(validated["tasks"]), 0)
        self.assertTrue(any("out of operational theater bounds" in v or "exceeds max operational radius" in v for v in validated["violations_logged"]))

    def test_excessive_payload_clamp(self):
        manifest = {
            "mission_name": "Heavy Payload Mission",
            "tasks": [
                {"id": "T_HEAVY", "type": "RESCUE", "position": [200.0, 500.0], "payload_kg": 25.0, "base_reward": 100.0, "duration": 5.0, "urgency_weight": 1.0}
            ]
        }
        validated = self.compiler.compile_and_validate(manifest)
        self.assertEqual(validated["safety_verdict"], "REJECTED")
        self.assertTrue(any("exceeds drone capacity limit" in v for v in validated["violations_logged"]))

    def test_fleet_redundancy_clamp(self):
        manifest = {
            "mission_name": "Single Agent Request",
            "tasks": [{"id": "T1", "type": "RECON", "position": [200.0, 500.0]}],
            "constraints": {"minimum_active_agents": 1}
        }
        validated = self.compiler.compile_and_validate(manifest)
        self.assertEqual(validated["constraints"]["minimum_active_agents"], 2)
        self.assertTrue(any("Fleet safety clamp" in v for v in validated["violations_logged"]))

if __name__ == "__main__":
    unittest.main()
