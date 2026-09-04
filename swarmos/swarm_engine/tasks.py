"""
Task definitions and models for SWARMOS.
Supports heterogeneous multi-domain tasks: RECON, NEUTRALIZE, RESCUE, SURVEIL, RELAY.
"""

import enum
import time
from dataclasses import dataclass, field
from typing import Tuple, Dict, Any, Optional

class TaskType(enum.Enum):
    RECON = "RECON"
    NEUTRALIZE = "NEUTRALIZE"
    RESCUE = "RESCUE"
    SURVEIL = "SURVEIL"
    RELAY = "RELAY"

class TaskStatus(enum.Enum):
    UNASSIGNED = "UNASSIGNED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

@dataclass
class Task:
    id: str
    task_type: TaskType
    position: Tuple[float, float]
    base_reward: float
    duration: float = 5.0          # Time needed to service task (seconds)
    urgency_weight: float = 1.0     # Temporal discount factor multiplier
    status: TaskStatus = TaskStatus.UNASSIGNED
    assigned_agent_id: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None
    required_capabilities: Dict[str, float] = field(default_factory=lambda: {"optical": 0.5, "compute": 0.5})
    description: str = ""

    def evaluate_marginal_reward(self, arrival_time: float, lambda_decay: float = 0.95) -> float:
        """
        Calculates time-discounted score according to CBBA formulation:
        S(t) = R * (lambda ^ (arrival_time * urgency_weight))
        """
        decay = (lambda_decay ** (max(0.0, arrival_time) * self.urgency_weight))
        return self.base_reward * decay

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.task_type.value,
            "position": self.position,
            "reward": self.base_reward,
            "duration": self.duration,
            "status": self.status.value,
            "assigned_agent_id": self.assigned_agent_id,
            "description": self.description,
        }
