"""
SWARMOS Swarm Engine Package.
Decentralized multi-agent consensus, execution, environment, and fault-tolerance modules.
"""

from .tasks import Task, TaskType, TaskStatus
from .agents import Agent, AgentStatus, SubsystemHealth
from .environment import SwarmEnvironment, Obstacle, ThreatZone
from .cbba import CBBAEngine
from .metrics import SwarmMetricsTracker
from .failures import FailureInjector, FailureType

__all__ = [
    "Task",
    "TaskType",
    "TaskStatus",
    "Agent",
    "AgentStatus",
    "SubsystemHealth",
    "SwarmEnvironment",
    "Obstacle",
    "ThreatZone",
    "CBBAEngine",
    "SwarmMetricsTracker",
    "FailureInjector",
    "FailureType",
]
