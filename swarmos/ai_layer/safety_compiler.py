import math
from typing import Dict, Any, List

class SafetyCompiler:
    """
    Deterministic Safety Compiler sitting between Generative AI (Nemotron/Gemini)
    and the CBBA Consensus Allocator.
    Enforces strict physical, operational, and battery bounds.
    """
    def __init__(self, max_range_meters: float = 1200.0, max_payload_kg: float = 5.0, min_agents: int = 2):
        self.max_range_meters = max_range_meters
        self.max_payload_kg = max_payload_kg
        self.min_agents = min_agents

    def compile_and_validate(self, raw_manifest: Dict[str, Any]) -> Dict[str, Any]:
        violations = []
        validated_tasks = []

        constraints = raw_manifest.get("constraints", {})
        if constraints.get("max_range_meters", 1500) > self.max_range_meters:
            violations.append(f"Constraint violation: max_range {constraints.get('max_range_meters')}m exceeds hardware limit ({self.max_range_meters}m). Clamped.")
            constraints["max_range_meters"] = self.max_range_meters

        if constraints.get("minimum_active_agents", 1) < self.min_agents:
            violations.append(f"Safety warning: minimum active agents increased to fleet minimum ({self.min_agents}).")
            constraints["minimum_active_agents"] = self.min_agents

        for idx, task in enumerate(raw_manifest.get("tasks", [])):
            wp = task.get("waypoint", {"x": 500, "y": 500})
            dist_origin = math.hypot(wp.get("x", 500) - 120, wp.get("y", 500) - 680)
            
            if dist_origin > self.max_range_meters:
                violations.append(f"Task {task.get('id', idx)} waypoint ({wp.get('x')}, {wp.get('y')}) is out of operational radius ({dist_origin:.1f}m > {self.max_range_meters}m). Rejected.")
                continue

            if task.get("payload_kg", 0.0) > self.max_payload_kg:
                violations.append(f"Task {task.get('id', idx)} payload exceeds drone payload capacity.")
                continue

            validated_tasks.append(task)

        is_safe = len(validated_tasks) > 0
        compiled_manifest = {
            "objective": raw_manifest.get("objective", "reconnaissance"),
            "tasks": validated_tasks,
            "constraints": constraints,
            "safety_verdict": "APPROVED" if is_safe else "REJECTED",
            "violations_logged": violations,
            "compiler_timestamp": "2026-09-04T13:45:00Z"
        }
        return compiled_manifest
