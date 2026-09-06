"""
SwarmOrchestrator: The central executive pipeline for SWARMOS.
Integrates natural language mission parsing, physical environment stepping,
distributed CBBA auction cycles, fault monitoring, and explainability telemetry.
"""

import math
import time
from typing import Dict, List, Optional, Any
from utils.config import SwarmConfig, DEFAULT_CONFIG
from utils.logger import logger
from swarm_engine.agents import Agent, AgentStatus
from swarm_engine.tasks import Task, TaskStatus
from swarm_engine.environment import SwarmEnvironment, Obstacle, ThreatZone
from swarm_engine.cbba import CBBAEngine
from swarm_engine.failures import FailureInjector
from swarm_engine.metrics import SwarmMetricsTracker
from .mission_parser import MissionParser
from .replanner import DynamicReplanner
from .explainer import SwarmExplainer
from .safety_compiler import SafetyCompiler

class SwarmOrchestrator:
    def __init__(self, config: Optional[SwarmConfig] = None):
        self.config = config or DEFAULT_CONFIG
        self.env = SwarmEnvironment(
            width=self.config.ENV_WIDTH,
            height=self.config.ENV_HEIGHT,
            comm_range=self.config.COMM_RANGE
        )
        self.cbba = CBBAEngine(
            lambda_decay=self.config.LAMBDA_TIME_DECAY,
            bid_epsilon=self.config.BID_TOLERANCE
        )
        self.metrics = SwarmMetricsTracker()
        self.failure_injector = FailureInjector(self.env)
        self.replanner = DynamicReplanner(self.env, self.cbba)
        self.explainer = SwarmExplainer(self.env, self.cbba)
        self.mission_parser = MissionParser()
        self.safety_compiler = SafetyCompiler()

        self.current_mission_manifest: Optional[Dict[str, Any]] = None
        self._initialize_default_world()

    def _initialize_default_world(self) -> None:
        """Seed default agents and geographic obstacle features."""
        for i in range(self.config.NUM_AGENTS):
            agent_id = f"A{i+1}"
            spawn_x = 120.0 + (i * 90.0)
            spawn_y = 680.0 - (i % 2 * 60.0)
            agent = Agent(
                agent_id=agent_id,
                initial_position=(spawn_x, spawn_y),
                speed=self.config.CRUISE_SPEED,
                max_bundle_size=self.config.MAX_TASKS_PER_AGENT
            )
            self.env.add_agent(agent)

        self.env.add_obstacle(Obstacle("OBS_1", 380, 240, 110, 160, "BUILDING"))
        self.env.add_obstacle(Obstacle("OBS_2", 690, 380, 130, 130, "BUILDING"))
        self.env.add_obstacle(Obstacle("OBS_3", 520, 110, 140, 90, "NO_FLY"))

    def load_mission(self, prompt: str, raw_manifest: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Parses natural language mission, compiles safety constraints, and generates initial task allocation."""
        logger.info(f"Loading mission: '{prompt}'")
        if raw_manifest is None:
            raw_manifest = self.mission_parser.parse_directive(prompt)
        
        # Enforce deterministic safety compiler validation
        manifest = self.safety_compiler.compile_and_validate(raw_manifest)
        self.current_mission_manifest = manifest

        # Clear existing uncompleted tasks
        self.env.tasks.clear()
        for agent in self.env.agents.values():
            agent.bundle.clear()
            agent.path.clear()
            agent.winning_bids.clear()
            agent.winning_agents.clear()
            agent.current_task_id = None
            agent.target_position = None
            if agent.health.is_operational():
                agent.status = AgentStatus.IDLE

        # Ingest new tasks from compiled manifest
        tasks = self.mission_parser.convert_to_tasks(manifest)
        for t in tasks:
            self.env.add_task(t)

        logger.info(f"Loaded {len(tasks)} tasks for mission '{manifest.get('mission_name')}'. Safety verdict: {manifest.get('safety_verdict')}. Starting CBBA auction...")
        self.execute_full_consensus()
        return manifest

    def execute_full_consensus(self) -> bool:
        """Runs multi-round CBBA until convergence."""
        self.metrics.start_consensus_timer()
        comm_links = list(self.env.update_mesh_network())
        res = self.cbba.run_auction_round(
            agents=self.env.agents,
            tasks=self.env.tasks,
            communication_links=comm_links,
            max_iterations=self.config.CONSENSUS_ROUNDS,
            env=self.env
        )
        duration_ms = self.metrics.stop_consensus_timer()
        logger.info(f"Consensus reached: {converged} in {duration_ms:.2f}ms")

        # Assign targets to agents from their path sequence
        self._sync_agent_task_execution()
        self.metrics.record_snapshot(self.env.agents, self.env.tasks, converged, env=self.env)
        return converged

    def _sync_agent_task_execution(self) -> None:
        """Coordinates agent navigation targets with their assigned CBBA path."""
        for agent in self.env.agents.values():
            if not agent.health.is_operational():
                continue

            if agent.path and agent.current_task_id is None:
                next_tid = agent.path[0]
                target_task = self.env.tasks.get(next_tid)
                if target_task:
                    agent.current_task_id = next_tid
                    agent.target_position = target_task.position
                    agent.status = AgentStatus.TRAVERSING
                    target_task.status = TaskStatus.IN_PROGRESS
                    target_task.assigned_agent_id = agent.id

    def step(self, dt: float) -> Dict[str, Any]:
        """Advance the entire simulation loop by dt seconds."""
        # 1. Physical environment step
        self.env.step(dt)

        # 2. Check task completions at waypoints
        for agent in self.env.agents.values():
            if not agent.health.is_operational() or agent.current_task_id is None:
                continue

            target_task = self.env.tasks.get(agent.current_task_id)
            if not target_task:
                agent.current_task_id = None
                continue

            dist_to_task = math.hypot(
                agent.position[0] - target_task.position[0],
                agent.position[1] - target_task.position[1]
            )

            # Reached task site
            if dist_to_task < 12.0:
                agent.status = AgentStatus.EXECUTING
                agent.task_execution_timer += dt

                if agent.task_execution_timer >= target_task.duration:
                    # Task completed!
                    target_task.status = TaskStatus.COMPLETED
                    target_task.completed_at = time.time()
                    logger.info(f"Agent {agent.id} completed task {target_task.id} ({target_task.task_type.value})")

                    # Pop from bundle & path
                    if agent.current_task_id in agent.bundle:
                        agent.bundle.remove(agent.current_task_id)
                    if agent.current_task_id in agent.path:
                        agent.path.remove(agent.current_task_id)

                    agent.current_task_id = None
                    agent.task_execution_timer = 0.0
                    agent.status = AgentStatus.IDLE

                    # Pick next task in path if available
                    if agent.path:
                        next_tid = agent.path[0]
                        nxt = self.env.tasks.get(next_tid)
                        if nxt:
                            agent.current_task_id = next_tid
                            agent.target_position = nxt.position
                            agent.status = AgentStatus.TRAVERSING
                            nxt.status = TaskStatus.IN_PROGRESS

        # 3. Dynamic replanning check (handles unexpected agent failure or jamming)
        replanned = self.replanner.check_and_trigger_replan()
        if replanned:
            self._sync_agent_task_execution()

        # 4. Periodic telemetry recording
        converged = self.cbba.has_converged
        snapshot = self.metrics.record_snapshot(self.env.agents, self.env.tasks, converged, env=self.env)
        kpis = self.metrics.compute_summary_kpis(self.env.agents, self.env.tasks, env=self.env)

        return {
            "snapshot": snapshot,
            "kpis": kpis,
            "replanned": replanned
        }
