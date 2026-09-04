"""
Environment and spatial world model for SWARMOS.
Handles 2D physics bounding, obstacle collision detection, dynamic threat zones,
RF electronic warfare / jamming bubbles, and peer-to-peer ad-hoc mesh connectivity
with deterministic stochastic packet drop modeling.
"""

import math
import random
from dataclasses import dataclass
from typing import List, Tuple, Dict, Optional, Set
from .agents import Agent, AgentStatus
from .tasks import Task, TaskStatus

@dataclass
class Obstacle:
    id: str
    x: float
    y: float
    width: float
    height: float
    obstacle_type: str = "BUILDING"  # "BUILDING", "MOUNTAIN", "NO_FLY"

    def collides_with(self, px: float, py: float, radius: float = 12.0) -> bool:
        closest_x = max(self.x, min(px, self.x + self.width))
        closest_y = max(self.y, min(py, self.y + self.height))
        distance = math.hypot(px - closest_x, py - closest_y)
        return distance < radius

@dataclass
class ThreatZone:
    id: str
    center: Tuple[float, float]
    radius: float
    threat_type: str  # "RADAR_SAM", "RF_JAMMER", "TURBULENCE", "FIRE_PERIMETER"
    intensity: float = 1.0  # 0.0 to 1.0 lethality or jamming power

    def is_inside(self, px: float, py: float) -> bool:
        dist = math.hypot(px - self.center[0], py - self.center[1])
        return dist <= self.radius

class SwarmEnvironment:
    def __init__(
        self,
        width: int = 1200,
        height: int = 800,
        comm_range: float = 350.0,
        packet_loss_rate: float = 0.0,
        seed: int = 42
    ):
        self.width = width
        self.height = height
        self.comm_range = comm_range
        self.packet_loss_rate = packet_loss_rate
        self.rng = random.Random(seed)
        
        self.agents: Dict[str, Agent] = {}
        self.tasks: Dict[str, Task] = {}
        self.obstacles: List[Obstacle] = []
        self.threat_zones: List[ThreatZone] = []
        self.elapsed_time: float = 0.0
        self.communication_links: Set[Tuple[str, str]] = set()

        # Real Network Telemetry
        self.packets_generated: int = 0
        self.packets_delivered: int = 0
        self.packets_dropped: int = 0
        self.bytes_transmitted: int = 0

    def set_seed(self, seed: int) -> None:
        self.rng = random.Random(seed)

    def reset_network_telemetry(self) -> None:
        self.packets_generated = 0
        self.packets_delivered = 0
        self.packets_dropped = 0
        self.bytes_transmitted = 0

    def add_agent(self, agent: Agent) -> None:
        self.agents[agent.id] = agent

    def add_task(self, task: Task) -> None:
        self.tasks[task.id] = task

    def add_obstacle(self, obstacle: Obstacle) -> None:
        self.obstacles.append(obstacle)

    def add_threat(self, threat: ThreatZone) -> None:
        self.threat_zones.append(threat)

    def transmit_packet(self, sender_id: str, receiver_id: str, payload_bytes: int = 128) -> bool:
        """
        Simulates physical wireless packet transmission across 1-hop mesh link.
        Calculates loss based on distance attenuation, EW jamming, and stochastic channel drop.
        """
        pair = (min(sender_id, receiver_id), max(sender_id, receiver_id))
        if pair not in self.communication_links:
            # Physical link out of range or blocked
            self.packets_generated += 1
            self.packets_dropped += 1
            self.bytes_transmitted += payload_bytes
            return False

        self.packets_generated += 1
        self.bytes_transmitted += payload_bytes

        # Stochastic RF packet loss
        if self.rng.random() < self.packet_loss_rate:
            self.packets_dropped += 1
            return False

        self.packets_delivered += 1
        return True

    def update_mesh_network(self) -> Set[Tuple[str, str]]:
        """
        Recomputes dynamic line-of-sight & distance-based RF ad-hoc communication links.
        Drones inside jamming bubbles have their comm range severely attenuated.
        """
        self.communication_links.clear()
        agent_list = list(self.agents.values())
        
        for i in range(len(agent_list)):
            for j in range(i + 1, len(agent_list)):
                a1 = agent_list[i]
                a2 = agent_list[j]
                
                # Check if both agents are operational
                if not (a1.health.is_operational() and a2.health.is_operational()):
                    continue
                
                # Distance calculation
                dist = math.hypot(a1.position[0] - a2.position[0], a1.position[1] - a2.position[1])
                
                # Attenuation from jamming zones
                attenuation = 1.0
                for tz in self.threat_zones:
                    if tz.threat_type == "RF_JAMMER":
                        if tz.is_inside(a1.position[0], a1.position[1]) or tz.is_inside(a2.position[0], a2.position[1]):
                            attenuation *= (1.0 - (0.75 * tz.intensity))
                
                effective_comm_range = self.comm_range * attenuation
                if dist <= effective_comm_range:
                    pair = (min(a1.id, a2.id), max(a1.id, a2.id))
                    self.communication_links.add(pair)
                    
        return self.communication_links

    def step(self, dt: float) -> None:
        """Advance physical simulation by dt seconds."""
        self.elapsed_time += dt
        
        # 1. Update dynamic threats impact on agents
        for agent in self.agents.values():
            if not agent.health.is_operational():
                continue
                
            in_jammer = False
            for tz in self.threat_zones:
                if tz.is_inside(agent.position[0], agent.position[1]):
                    if tz.threat_type == "RF_JAMMER":
                        in_jammer = True
                        agent.health.comms_transceiver = max(0.1, agent.health.comms_transceiver - (0.1 * dt * tz.intensity))
                    elif tz.threat_type == "RADAR_SAM":
                        agent.health.propulsion = max(0.0, agent.health.propulsion - (0.15 * dt * tz.intensity))
                        agent.health.sensor_suite = max(0.0, agent.health.sensor_suite - (0.1 * dt * tz.intensity))
            
            if not in_jammer and agent.health.comms_transceiver < 0.9:
                agent.health.comms_transceiver = min(1.0, agent.health.comms_transceiver + (0.2 * dt))

        # 2. Kinematic updates
        for agent in self.agents.values():
            agent.update_kinematics(dt)

        # 3. Refresh network topology
        self.update_mesh_network()

    def get_neighbors_of(self, agent_id: str) -> List[str]:
        neighbors = []
        for pair in self.communication_links:
            if pair[0] == agent_id:
                neighbors.append(pair[1])
            elif pair[1] == agent_id:
                neighbors.append(pair[0])
        return neighbors
