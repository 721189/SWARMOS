"""
Real-time Pygame Swarm Renderer for SWARMOS.
Visualizes multi-agent kinematics, dynamic ad-hoc communication mesh,
threat fields, RF jamming bubbles, obstacles, and task objectives.
"""

import math
from typing import Dict, List, Tuple, Optional
import pygame
from swarmos.swarm_engine.agents import Agent, AgentStatus
from swarmos.swarm_engine.tasks import Task, TaskStatus
from swarmos.swarm_engine.environment import SwarmEnvironment, Obstacle, ThreatZone
from swarmos.utils.config import DEFAULT_CONFIG

class SwarmVisualizer:
    def __init__(self, surface: pygame.Surface, font_small: pygame.font.Font, font_large: pygame.font.Font):
        self.surface = surface
        self.font_small = font_small
        self.font_large = font_large
        self.selected_agent_id: Optional[str] = None
        self.selected_task_id: Optional[str] = None

    def draw_grid(self, width: int, height: int, grid_size: int = 40) -> None:
        grid_color = (25, 33, 50)
        for x in range(0, width, grid_size):
            pygame.draw.line(self.surface, grid_color, (x, 0), (x, height), 1)
        for y in range(0, height, grid_size):
            pygame.draw.line(self.surface, grid_color, (0, y), (width, y), 1)

    def draw_threat_zones(self, threat_zones: List[ThreatZone]) -> None:
        for tz in threat_zones:
            cx, cy = int(tz.center[0]), int(tz.center[1])
            rad = int(tz.radius)

            # Create transparent overlay for glowing radius
            overlay = pygame.Surface((rad * 2, rad * 2), pygame.SRCALPHA)
            if tz.threat_type == "RF_JAMMER":
                color_fill = (168, 85, 247, 45)  # Purple
                color_border = (192, 132, 252)
                label = f"EW JAMMER [{tz.id}]"
            else:
                color_fill = (239, 68, 68, 45)   # Crimson SAM
                color_border = (248, 113, 113)
                label = f"SAM RADAR [{tz.id}]"

            pygame.draw.circle(overlay, color_fill, (rad, rad), rad)
            self.surface.blit(overlay, (cx - rad, cy - rad))
            pygame.draw.circle(self.surface, color_border, (cx, cy), rad, 2)

            # Label
            txt = self.font_small.render(label, True, color_border)
            self.surface.blit(txt, (cx - txt.get_width() // 2, cy - rad + 10))

    def draw_obstacles(self, obstacles: List[Obstacle]) -> None:
        for obs in obstacles:
            rect = pygame.Rect(int(obs.x), int(obs.y), int(obs.width), int(obs.height))
            pygame.draw.rect(self.surface, (51, 65, 85), rect, border_radius=6)
            pygame.draw.rect(self.surface, (100, 116, 139), rect, 2, border_radius=6)
            txt = self.font_small.render(obs.obstacle_type, True, (148, 163, 184))
            self.surface.blit(txt, (obs.x + 8, obs.y + 8))

    def draw_communication_mesh(self, comm_links: List[Tuple[str, str]], agents: Dict[str, Agent]) -> None:
        for a1_id, a2_id in comm_links:
            a1 = agents.get(a1_id)
            a2 = agents.get(a2_id)
            if a1 and a2:
                p1 = (int(a1.position[0]), int(a1.position[1]))
                p2 = (int(a2.position[0]), int(a2.position[1]))
                pygame.draw.line(self.surface, (59, 130, 246, 120), p1, p2, 1)

    def draw_tasks(self, tasks: Dict[str, Task]) -> None:
        for tid, task in tasks.items():
            tx, ty = int(task.position[0]), int(task.position[1])

            if task.status == TaskStatus.COMPLETED:
                color = (34, 197, 94) # Green
            elif task.status == TaskStatus.IN_PROGRESS:
                color = (250, 204, 21) # Yellow
            elif task.status == TaskStatus.ASSIGNED:
                color = (56, 189, 248) # Cyan
            else:
                color = (148, 163, 184) # Gray

            # Outer ring & marker
            pygame.draw.circle(self.surface, color, (tx, ty), 14, 2)
            pygame.draw.circle(self.surface, color, (tx, ty), 4)

            # Label
            label_text = f"{task.id}:{task.task_type.value[:3]}"
            txt = self.font_small.render(label_text, True, (241, 245, 249))
            self.surface.blit(txt, (tx + 16, ty - 8))

            if task.assigned_agent_id:
                asgn_txt = self.font_small.render(f"-> {task.assigned_agent_id}", True, (56, 189, 248))
                self.surface.blit(asgn_txt, (tx + 16, ty + 6))

    def draw_agents(self, agents: Dict[str, Agent]) -> None:
        for aid, agent in agents.items():
            ax, ay = int(agent.position[0]), int(agent.position[1])

            # Draw breadcrumbs trail
            if len(agent.breadcrumbs) > 1:
                pts = [(int(p[0]), int(p[1])) for p in agent.breadcrumbs]
                pygame.draw.lines(self.surface, (56, 189, 248, 60), False, pts, 1)

            # Path line to target
            if agent.target_position and agent.status in [AgentStatus.TRAVERSING, AgentStatus.EXECUTING]:
                tpos = (int(agent.target_position[0]), int(agent.target_position[1]))
                pygame.draw.line(self.surface, (250, 204, 21, 140), (ax, ay), tpos, 1)

            # Agent body color by status
            if agent.status == AgentStatus.FAILED:
                color = (239, 68, 68) # Red
            elif agent.status == AgentStatus.JAMMED:
                color = (168, 85, 247) # Purple
            elif agent.status == AgentStatus.EXECUTING:
                color = (74, 222, 128) # Lime
            elif agent.status == AgentStatus.TRAVERSING:
                color = (56, 189, 248) # Sky
            else:
                color = (148, 163, 184) # Idle

            # Draw drone quadcopter icon / shape
            pygame.draw.circle(self.surface, color, (ax, ay), 10)
            pygame.draw.circle(self.surface, (255, 255, 255), (ax, ay), 10, 2)

            # Rotor bars
            pygame.draw.line(self.surface, (255, 255, 255), (ax - 12, ay - 12), (ax + 12, ay + 12), 1)
            pygame.draw.line(self.surface, (255, 255, 255), (ax - 12, ay + 12), (ax + 12, ay - 12), 1)

            # Agent callsign and battery
            txt = self.font_small.render(f"{agent.id} [{agent.health.battery:.0f}%]", True, (241, 245, 249))
            self.surface.blit(txt, (ax - 18, ay - 24))
