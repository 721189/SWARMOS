"""
Deterministic Safety Compiler for SWARMOS.
Acts as a verified firewall between Generative AI mission planners (NVIDIA Nemotron)
and the decentralized CBBA consensus auction engine.
Enforces physical operational boundaries, payload limits, coordinate validity,
and fleet redundancy requirements.
"""

import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

class SafetyCompiler:
    def __init__(
        self,
        max_range_meters: float = 1200.0,
        max_payload_kg: float = 5.0,
        min_agents: int = 2,
        base_origin: Tuple[float, float] = (120.0, 680.0)
    ):
        self.max_range_meters = max_range_meters
        self.max_payload_kg = max_payload_kg
        self.min_agents = min_agents
        self.base_origin = base_origin

    def compile_and_validate(self, raw_manifest: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministically compiles and validates mission tasks against hard physical constraints.
        Canonicalizes task schemas to standard coordinate formats.
        """
        violations: List[str] = []
        validated_tasks: List[Dict[str, Any]] = []

        constraints = raw_manifest.get("constraints", {})
        if not isinstance(constraints, dict):
            constraints = {}

        # 1. Enforce max range constraint ceiling
        requested_range = float(constraints.get("max_range_meters", self.max_range_meters))
        if requested_range > self.max_range_meters:
            violations.append(
                f"Constraint violation: max_range {requested_range}m exceeds hardware ceiling ({self.max_range_meters}m). Clamped."
            )
            constraints["max_range_meters"] = self.max_range_meters
        else:
            constraints["max_range_meters"] = requested_range

        # 2. Enforce minimum fleet redundancy
        requested_min_agents = int(constraints.get("minimum_active_agents", self.min_agents))
        if requested_min_agents < self.min_agents:
            violations.append(
                f"Fleet safety clamp: minimum active agents increased to redundancy floor ({self.min_agents})."
            )
            constraints["minimum_active_agents"] = self.min_agents
        else:
            constraints["minimum_active_agents"] = requested_min_agents

        # 3. Validate each task in manifest
        raw_tasks = raw_manifest.get("tasks", [])
        if not isinstance(raw_tasks, list) or len(raw_tasks) == 0:
            violations.append("Manifest error: No tasks supplied in mission directive.")

        for idx, task in enumerate(raw_tasks):
            task_id = str(task.get("id", f"T{idx+1}"))
            task_type = str(task.get("type", "RECON")).upper()

            # Canonicalize position from either [x, y] or {x, y}
            pos = task.get("position")
            if pos is None:
                wp = task.get("waypoint", {})
                if isinstance(wp, dict):
                    pos = [float(wp.get("x", 400.0)), float(wp.get("y", 300.0))]
                elif isinstance(wp, (list, tuple)) and len(wp) >= 2:
                    pos = [float(wp[0]), float(wp[1])]
                else:
                    pos = [400.0, 300.0]
            elif isinstance(pos, (list, tuple)) and len(pos) >= 2:
                pos = [float(pos[0]), float(pos[1])]
            else:
                pos = [400.0, 300.0]

            # Spatial boundary check
            if not (0.0 <= pos[0] <= 1200.0 and 0.0 <= pos[1] <= 800.0):
                violations.append(f"Task {task_id} position {pos} is out of operational theater bounds ([0,1200], [0,800]). Rejected.")
                continue

            # Operating radius from base deployment origin check
            dist_origin = math.hypot(pos[0] - self.base_origin[0], pos[1] - self.base_origin[1])
            if dist_origin > self.max_range_meters:
                violations.append(
                    f"Task {task_id} at {pos} exceeds max operational radius ({dist_origin:.1f}m > {self.max_range_meters}m). Rejected."
                )
                continue

            # Payload weight check
            payload = float(task.get("payload_kg", 0.0))
            if payload > self.max_payload_kg:
                violations.append(
                    f"Task {task_id} payload {payload}kg exceeds drone capacity limit ({self.max_payload_kg}kg). Rejected."
                )
                continue

            # Duration & Reward checks
            base_reward = max(10.0, float(task.get("base_reward", task.get("reward", 100.0))))
            duration = max(1.0, float(task.get("duration", 5.0)))
            urgency_weight = max(0.1, float(task.get("urgency_weight", task.get("priority", 1.0))))

            validated_tasks.append({
                "id": task_id,
                "type": task_type,
                "position": pos,
                "base_reward": round(base_reward, 1),
                "duration": round(duration, 1),
                "urgency_weight": round(urgency_weight, 2),
                "payload_kg": round(payload, 2),
                "description": str(task.get("description", f"Operational objective {task_id}"))
            })

        is_approved = len(validated_tasks) > 0
        verdict = "APPROVED" if is_approved else "REJECTED"

        return {
            "mission_name": raw_manifest.get("mission_name", raw_manifest.get("objective", "Tactical Swarm Mission")),
            "tactical_intent": raw_manifest.get("tactical_intent", "Autonomous coordinated multi-agent mission"),
            "recommended_agents": int(raw_manifest.get("recommended_agents", max(constraints.get("minimum_active_agents", 2), len(validated_tasks)))),
            "tasks": validated_tasks,
            "constraints": constraints,
            "safety_verdict": verdict,
            "violations_logged": violations,
            "compiler_timestamp": datetime.now(timezone.utc).isoformat()
        }
