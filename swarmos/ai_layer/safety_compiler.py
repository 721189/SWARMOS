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

class SafetyViolationError(Exception):
    """Raised when a mission manifest violates critical physical or operational constraints."""
    pass

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
        Fail-closed: Raises SafetyViolationError if critical constraints are breached.
        """
        violations: List[str] = []
        validated_tasks: List[Dict[str, Any]] = []

        constraints = raw_manifest.get("constraints")
        if constraints is None:
            raise SafetyViolationError("Manifest Error: Missing 'constraints' block.")
        if not isinstance(constraints, dict):
            raise SafetyViolationError("Manifest Error: 'constraints' must be a dictionary.")

        # 1. Enforce max range constraint ceiling
        if "max_range_meters" not in constraints:
            raise SafetyViolationError("Manifest Error: Missing 'max_range_meters' in constraints.")
            
        requested_range = float(constraints["max_range_meters"])
        if not math.isfinite(requested_range) or requested_range < 0:
             raise SafetyViolationError(f"Constraint violation: 'max_range_meters' must be a positive finite number (got {requested_range}).")

        if requested_range > self.max_range_meters:
            raise SafetyViolationError(
                f"Constraint violation: requested max_range {requested_range}m exceeds hardware ceiling ({self.max_range_meters}m)."
            )

        # 2. Enforce minimum fleet redundancy
        if "minimum_active_agents" not in constraints:
            raise SafetyViolationError("Manifest Error: Missing 'minimum_active_agents' in constraints.")
            
        requested_min_agents = int(constraints["minimum_active_agents"])
        if requested_min_agents < self.min_agents:
            raise SafetyViolationError(
                f"Fleet safety violation: requested minimum active agents {requested_min_agents} is below redundancy floor ({self.min_agents})."
            )
        if requested_min_agents <= 0:
             raise SafetyViolationError(f"Fleet safety violation: 'minimum_active_agents' must be positive (got {requested_min_agents}).")

        # 3. Validate each task in manifest
        raw_tasks = raw_manifest.get("tasks")
        if not isinstance(raw_tasks, list) or len(raw_tasks) == 0:
            raise SafetyViolationError("Manifest error: No tasks supplied in mission directive.")

        for idx, task in enumerate(raw_tasks):
            if "id" not in task:
                raise SafetyViolationError(f"Task Error: Task at index {idx} is missing 'id'.")
            
            task_id = str(task["id"])
            task_type = str(task.get("type", "RECON")).upper()

            # Strict position validation
            pos = task.get("position")
            if pos is None or not isinstance(pos, (list, tuple)) or len(pos) < 2:
                raise SafetyViolationError(f"Task {task_id} Error: Missing or malformed 'position' coordinates.")
            
            try:
                pos = [float(pos[0]), float(pos[1])]
            except (ValueError, TypeError):
                 raise SafetyViolationError(f"Task {task_id} Error: Coordinates must be numerical values.")

            if not all(math.isfinite(c) for c in pos):
                raise SafetyViolationError(f"Task {task_id} Error: Coordinates must be finite numbers (got {pos}).")

            # Spatial boundary check
            if not (0.0 <= pos[0] <= 1200.0 and 0.0 <= pos[1] <= 800.0):
                raise SafetyViolationError(f"Task {task_id} position {pos} is out of operational theater bounds ([0,1200], [0,800]).")

            # Operating radius from base deployment origin check
            dist_origin = math.hypot(pos[0] - self.base_origin[0], pos[1] - self.base_origin[1])
            if dist_origin > self.max_range_meters:
                raise SafetyViolationError(
                    f"Task {task_id} at {pos} exceeds max operational radius ({dist_origin:.1f}m > {self.max_range_meters}m)."
                )

            # Payload weight check
            if "payload_kg" not in task:
                raise SafetyViolationError(f"Task {task_id} Error: Missing 'payload_kg'.")
                
            payload = float(task["payload_kg"])
            if not math.isfinite(payload) or payload < 0:
                 raise SafetyViolationError(f"Task {task_id} Error: 'payload_kg' must be a positive finite number (got {payload}).")

            if payload > self.max_payload_kg:
                raise SafetyViolationError(
                    f"Task {task_id} payload {payload}kg exceeds drone capacity limit ({self.max_payload_kg}kg)."
                )

            # Duration & Reward checks
            if "base_reward" not in task:
                raise SafetyViolationError(f"Task {task_id} Error: Missing 'base_reward'.")
            if "duration" not in task:
                raise SafetyViolationError(f"Task {task_id} Error: Missing 'duration'.")
                
            base_reward = float(task["base_reward"])
            duration = float(task["duration"])
            urgency_weight = float(task.get("urgency_weight", 1.0))

            if not math.isfinite(base_reward) or base_reward < 0:
                 raise SafetyViolationError(f"Task {task_id} Error: 'base_reward' must be a positive finite number (got {base_reward}).")
            if not math.isfinite(duration) or duration <= 0:
                 raise SafetyViolationError(f"Task {task_id} Error: 'duration' must be a strictly positive finite number (got {duration}).")
            if not math.isfinite(urgency_weight) or urgency_weight <= 0:
                 raise SafetyViolationError(f"Task {task_id} Error: 'urgency_weight' must be a strictly positive finite number (got {urgency_weight}).")

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

        return {
            "mission_name": str(raw_manifest.get("mission_name", "Tactical Swarm Mission")),
            "tactical_intent": str(raw_manifest.get("tactical_intent", "Autonomous coordinated mission")),
            "tasks": validated_tasks,
            "constraints": dict(constraints),
            "safety_verdict": "APPROVED",
            "compiled_at_logical": 0 # Deterministic place holder, remove wall-clock
        }
