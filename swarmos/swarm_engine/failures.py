"""
Failure Injector for SWARMOS.
Simulates deterministic and stochastic field anomalies:
- Kinetic kill / Motor failure (total loss of agent)
- RF Electronic Warfare / Jamming bubble activation
- GPS Denial / Spoofing
- Sensor Suite Degradation
- Dynamic Pop-up Threat Zone
"""

import enum
import random
import time
from typing import Dict, List, Optional, Tuple, Any
from .agents import Agent, AgentStatus
from .environment import SwarmEnvironment, ThreatZone

class FailureType(enum.Enum):
    MOTOR_FAILURE = "MOTOR_FAILURE"
    RF_JAMMING = "RF_JAMMING"
    GPS_DENIAL = "GPS_DENIAL"
    SENSOR_BLINDNESS = "SENSOR_BLINDNESS"
    BATTERY_DRAIN = "BATTERY_DRAIN"
    POPUP_THREAT = "POPUP_THREAT"
    ADVERSARIAL_NODE = "ADVERSARIAL_NODE"

class FailureInjector:
    def __init__(self, env: SwarmEnvironment):
        self.env = env
        self.history: List[Dict[str, Any]] = []

    def inject_motor_failure(self, agent_id: str, reason: str = "Rotor shaft shear") -> bool:
        """Completely disables agent propulsion and forces FAILED status."""
        agent = self.env.agents.get(agent_id)
        if not agent:
            return False

        agent.health.propulsion = 0.0
        agent.status = AgentStatus.FAILED
        event = {
            "timestamp": round(time.time(), 2),
            "type": FailureType.MOTOR_FAILURE.value,
            "target": agent_id,
            "reason": reason,
            "position": tuple(agent.position)
        }
        self.history.append(event)
        return True

    def inject_rf_jamming(self, center: Tuple[float, float], radius: float = 200.0, intensity: float = 1.0) -> str:
        """Spawns an active RF electronic warfare countermeasure bubble."""
        threat_id = f"JAMMER_{len(self.env.threat_zones) + 1}"
        jammer = ThreatZone(
            id=threat_id,
            center=center,
            radius=radius,
            threat_type="RF_JAMMER",
            intensity=intensity
        )
        self.env.add_threat(jammer)
        
        event = {
            "timestamp": round(time.time(), 2),
            "type": FailureType.RF_JAMMING.value,
            "threat_id": threat_id,
            "center": center,
            "radius": radius,
            "intensity": intensity
        }
        self.history.append(event)
        return threat_id

    def inject_gps_denial(self, agent_id: str) -> bool:
        """Degrades GPS accuracy causing loss of navigation confidence."""
        agent = self.env.agents.get(agent_id)
        if not agent:
            return False

        agent.health.gps_module = 0.05
        event = {
            "timestamp": round(time.time(), 2),
            "type": FailureType.GPS_DENIAL.value,
            "target": agent_id,
            "reason": "Spoofed pseudo-range signals"
        }
        self.history.append(event)
        return True

    def inject_popup_threat(self, center: Tuple[float, float], radius: float = 160.0) -> str:
        """Spawns a pop-up hostile Surface-to-Air Radar installation."""
        threat_id = f"SAM_{len(self.env.threat_zones) + 1}"
        threat = ThreatZone(
            id=threat_id,
            center=center,
            radius=radius,
            threat_type="RADAR_SAM",
            intensity=0.9
        )
        self.env.add_threat(threat)
        event = {
            "timestamp": round(time.time(), 2),
            "type": FailureType.POPUP_THREAT.value,
            "threat_id": threat_id,
            "center": center,
            "radius": radius
        }
        self.history.append(event)
        return threat_id

    def inject_adversarial_node(self, agent_id: str, behavior: str = "poison"):
        """
        Injects malicious behavior into an agent.
        'poison': Bids excessively high on tasks to deny others.
        'spoof': Reports fake kinematic telemetry.
        """
        agent = self.env.agents.get(agent_id)
        if agent:
            # We add metadata to the agent for the simulation loop to pick up
            if not hasattr(agent, "adversarial_config"):
                agent.adversarial_config = {}
            agent.adversarial_config["behavior"] = behavior
            
            event = {
                "timestamp": round(time.time(), 2),
                "type": FailureType.ADVERSARIAL_NODE.value,
                "target": agent_id,
                "behavior": behavior
            }
            self.history.append(event)
            logger.warning(f"Adversarial behavior '{behavior}' injected into {agent_id}")
            return True
        return False

    def inject_random_anomaly(self) -> Optional[Dict[str, Any]]:
        """Randomly selects an operational agent or map zone to stress test consensus."""
        operational_agents = [a for a in self.env.agents.values() if a.health.is_operational()]
        if not operational_agents:
            return None

        chosen_type = random.choice([
            FailureType.MOTOR_FAILURE,
            FailureType.RF_JAMMING,
            FailureType.POPUP_THREAT
        ])

        if chosen_type == FailureType.MOTOR_FAILURE:
            target = random.choice(operational_agents)
            self.inject_motor_failure(target.id, "Stochastic mechanical failure")
            return self.history[-1]
        elif chosen_type == FailureType.RF_JAMMING:
            target = random.choice(operational_agents)
            self.inject_rf_jamming(tuple(target.position), radius=180.0)
            return self.history[-1]
        elif chosen_type == FailureType.POPUP_THREAT:
            rx = random.uniform(200, self.env.width - 200)
            ry = random.uniform(150, self.env.height - 150)
            self.inject_popup_threat((rx, ry))
            return self.history[-1]

        return None
