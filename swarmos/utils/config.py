"""
SWARMOS Configuration Module.
Centralized settings for simulation environment, CBBA auction parameters,
AI layer connection endpoints, and visualization constants.
"""

import os
from dataclasses import dataclass, field
from typing import List, Tuple

@dataclass
class SwarmConfig:
    # Environment Settings
    ENV_WIDTH: int = 1200
    ENV_HEIGHT: int = 800
    COMM_RANGE: float = 350.0  # Communication mesh radius in pixels/meters
    TIME_STEP: float = 0.1     # Simulation delta time (seconds)
    
    # Agent & Fleet Defaults
    NUM_AGENTS: int = 6
    MAX_TASKS_PER_AGENT: int = 4  # CBBA bundle capacity (L_t)
    CRUISE_SPEED: float = 65.0    # Units per second
    BATTERY_CAPACITY: float = 100.0 # Battery percentage
    DISCHARGE_RATE: float = 0.08   # Battery drain per second while traversing
    
    # CBBA Algorithmic Parameters
    LAMBDA_TIME_DECAY: float = 0.95 # Discount factor for late task completions
    CONSENSUS_ROUNDS: int = 15     # Max consensus iterations before fallback
    BID_TOLERANCE: float = 1e-4    # Epsilon for bid comparison
    
    # AI / LLM Layer Settings
    NEBIUS_API_BASE: str = os.getenv("NEBIUS_API_BASE", "https://api.studio.nebius.ai/v1")
    NEBIUS_API_KEY: str = os.getenv("NEBIUS_API_KEY", "")
    NVIDIA_MODEL_ID: str = os.getenv("NVIDIA_MODEL_ID", "nvidia/nemotron-4-340b-instruct")
    FALLBACK_MODEL_ID: str = "gpt-4o-mini"
    
    # Failure Injection Defaults
    DEFAULT_FAILURE_RATE: float = 0.15 # Probability of injected subsystem faults
    JAMMING_RADIUS: float = 180.0
    
    # UI Theme Palette (Hex/RGB for Pygame & Matplotlib)
    COLOR_BG: Tuple[int, int, int] = (15, 23, 42)         # Slate 900
    COLOR_GRID: Tuple[int, int, int] = (30, 41, 59)       # Slate 800
    COLOR_AGENT_IDLE: Tuple[int, int, int] = (56, 189, 248) # Sky 400
    COLOR_AGENT_ACTIVE: Tuple[int, int, int] = (74, 222, 128) # Emerald 400
    COLOR_AGENT_FAILED: Tuple[int, int, int] = (248, 113, 113) # Red 400
    COLOR_TASK: Tuple[int, int, int] = (250, 204, 21)     # Amber 400
    COLOR_THREAT: Tuple[int, int, int] = (239, 68, 68)     # Crimson 500
    COLOR_JAMMER: Tuple[int, int, int] = (168, 85, 247)    # Purple 500
    COLOR_COMM_LINK: Tuple[int, int, int] = (59, 130, 246) # Blue 500

DEFAULT_CONFIG = SwarmConfig()
