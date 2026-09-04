"""
Agent implementation for autonomous decentralized swarm robotics.
Manages physical kinematics, subsystem diagnostics, CBBA task bundle & path,
and inter-agent message exchanges.
"""

import enum
import math
import time
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any

class AgentStatus(enum.Enum):
    IDLE = "IDLE"
    BIDDING = "BIDDING"
    TRAVERSING = "TRAVERSING"
    EXECUTING = "EXECUTING"
    RETURNING = "RETURNING"
    JAMMED = "JAMMED"
    FAILED = "FAILED"

@dataclass
class SubsystemHealth:
    propulsion: float = 1.0   # 0.0 to 1.0
    comms_transceiver: float = 1.0
    gps_module: float = 1.0
    sensor_suite: float = 1.0
    battery: float = 100.0    # 0 to 100%

    def is_operational(self) -> bool:
        return self.propulsion > 0.2 and self.battery > 5.0 and self.gps_module > 0.1

class Agent:
    def __init__(
        self,
        agent_id: str,
        initial_position: Tuple[float, float],
        speed: float = 65.0,
        max_bundle_size: int = 4,
        capabilities: Optional[Dict[str, float]] = None
    ):
        self.id = agent_id
        self.position = list(initial_position)
        self.target_position: Optional[Tuple[float, float]] = None
        self.home_base = initial_position
        self.speed = speed
        self.max_bundle_size = max_bundle_size
        self.status = AgentStatus.IDLE
        self.capabilities = capabilities or {"optical": 1.0, "compute": 1.0, "payload": 1.0}
        self.health = SubsystemHealth()
        
        # CBBA State Vectors
        # bundle (b_i): ordered list of tasks won by this agent
        self.bundle: List[str] = []
        # path (p_i): ordered visit sequence optimizing marginal score
        self.path: List[str] = []
        # winning bids vector y_i: task_id -> highest bid known
        self.winning_bids: Dict[str, float] = {}
        # winning agents vector z_i: task_id -> agent_id who holds winning bid
        self.winning_agents: Dict[str, Optional[str]] = {}
        # timestamp vector s_i: agent_k -> last time agent_i received info from agent_k
        self.timestamps: Dict[str, float] = {}
        
        # Telemetry & execution
        self.current_task_id: Optional[str] = None
        self.task_execution_timer: float = 0.0
        self.distance_traveled: float = 0.0
        self.messages_sent: int = 0
        self.messages_received: int = 0
        self.breadcrumbs: List[Tuple[float, float]] = [initial_position]

    def update_kinematics(self, dt: float) -> None:
        """Move agent towards its current target position if operational."""
        if not self.health.is_operational():
            self.status = AgentStatus.FAILED
            return

        if self.health.comms_transceiver < 0.3:
            self.status = AgentStatus.JAMMED

        # Battery consumption
        if self.status in [AgentStatus.TRAVERSING, AgentStatus.EXECUTING]:
            self.health.battery = max(0.0, self.health.battery - (0.08 * dt))

        if self.target_position is None:
            return

        dx = self.target_position[0] - self.position[0]
        dy = self.target_position[1] - self.position[1]
        dist = math.hypot(dx, dy)

        effective_speed = self.speed * self.health.propulsion
        step = effective_speed * dt

        if dist <= step or dist < 2.0:
            self.position[0] = self.target_position[0]
            self.position[1] = self.target_position[1]
            self.distance_traveled += dist
        else:
            self.position[0] += (dx / dist) * step
            self.position[1] += (dy / dist) * step
            self.distance_traveled += step

        # Save breadcrumb trail periodically
        if len(self.breadcrumbs) == 0 or math.hypot(
            self.position[0] - self.breadcrumbs[-1][0],
            self.position[1] - self.breadcrumbs[-1][1]
        ) > 20.0:
            self.breadcrumbs.append((self.position[0], self.position[1]))
            if len(self.breadcrumbs) > 40:
                self.breadcrumbs.pop(0)

    def prepare_outbound_consensus_packet(self) -> Dict[str, Any]:
        """Generate CBBA communication message for 1-hop wireless broadcast."""
        self.messages_sent += 1
        return {
            "sender_id": self.id,
            "timestamp": time.time(),
            "winning_bids": dict(self.winning_bids),
            "winning_agents": dict(self.winning_agents),
            "timestamps": dict(self.timestamps),
            "battery": self.health.battery,
            "status": self.status.value,
            "position": tuple(self.position),
        }

    def receive_consensus_packet(self, packet: Dict[str, Any]) -> None:
        """Record received packet and increment diagnostic counter."""
        self.messages_received += 1
        sender_id = packet["sender_id"]
        self.timestamps[sender_id] = packet["timestamp"]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "position": self.position,
            "status": self.status.value,
            "battery": round(self.health.battery, 1),
            "bundle": list(self.bundle),
            "path": list(self.path),
            "health": {
                "propulsion": round(self.health.propulsion, 2),
                "comms": round(self.health.comms_transceiver, 2),
                "gps": round(self.health.gps_module, 2),
            },
            "distance_traveled": round(self.distance_traveled, 1),
            "messages": {"sent": self.messages_sent, "rcv": self.messages_received}
        }
