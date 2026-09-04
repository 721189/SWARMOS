"""
HUD Telemetry Dashboard for SWARMOS.
Renders real-time operational status, convergence graphs, health bars,
and interactive control triggers (Failure Injection, Mission Ingest, Explain Why).
"""

from typing import Dict, List, Any, Optional
import pygame

class SwarmDashboard:
    def __init__(self, surface: pygame.Surface, font_small: pygame.font.Font, font_large: pygame.font.Font, width: int = 340):
        self.surface = surface
        self.font_small = font_small
        self.font_large = font_large
        self.width = width
        self.x_offset = surface.get_width() - width

        # Interactive button bounding boxes
        self.buttons: Dict[str, pygame.Rect] = {}

    def render(self, kpis: Dict[str, Any], mission_name: str, logs: List[str]) -> None:
        h = self.surface.get_height()
        panel_rect = pygame.Rect(self.x_offset, 0, self.width, h)

        # Draw panel background & divider
        pygame.draw.rect(self.surface, (15, 23, 42), panel_rect)
        pygame.draw.line(self.surface, (51, 65, 85), (self.x_offset, 0), (self.x_offset, h), 2)

        # Header Title
        title = self.font_large.render("SWARMOS HUD", True, (56, 189, 248))
        self.surface.blit(title, (self.x_offset + 16, 20))
        sub = self.font_small.render("Decentralized CBBA Fleet Control", True, (148, 163, 184))
        self.surface.blit(sub, (self.x_offset + 16, 46))

        # Current Mission Banner
        m_box = pygame.Rect(self.x_offset + 16, 75, self.width - 32, 42)
        pygame.draw.rect(self.surface, (30, 41, 59), m_box, border_radius=6)
        m_lbl = self.font_small.render("ACTIVE DIRECTIVE:", True, (148, 163, 184))
        m_val = self.font_small.render(mission_name[:32], True, (250, 204, 21))
        self.surface.blit(m_lbl, (self.x_offset + 24, 80))
        self.surface.blit(m_val, (self.x_offset + 24, 96))

        # Core Metrics Cards
        y_pos = 135
        metrics_data = [
            ("Task Completion", f"{kpis.get('task_completion_pct', 0.0)}%", (34, 197, 94)),
            ("Avg Consensus Latency", f"{kpis.get('avg_consensus_ms', 0.0)} ms", (56, 189, 248)),
            ("Fleet Survival Rate", f"{kpis.get('operational_fleet_pct', 100.0)}%", (248, 113, 113) if kpis.get('operational_fleet_pct', 100.0) < 80 else (74, 222, 128)),
            ("Resilience Factor", f"{kpis.get('resilience_factor_pct', 100.0)}%", (250, 204, 21)),
            ("Mesh Packets Exchanged", f"{kpis.get('total_mesh_packets', 0)} pkts", (168, 85, 247)),
        ]

        for label, val, color in metrics_data:
            lbl_txt = self.font_small.render(label, True, (148, 163, 184))
            val_txt = self.font_small.render(val, True, color)
            self.surface.blit(lbl_txt, (self.x_offset + 20, y_pos))
            self.surface.blit(val_txt, (self.x_offset + self.width - val_txt.get_width() - 20, y_pos))
            y_pos += 26

        # Interactive Control Buttons
        y_pos += 20
        btn_header = self.font_small.render("TACTICAL COMMANDS", True, (203, 213, 225))
        self.surface.blit(btn_header, (self.x_offset + 16, y_pos))
        y_pos += 22

        btn_list = [
            ("btn_inject_failure", "Inject Motor Failure", (239, 68, 68)),
            ("btn_inject_jammer", "Activate RF Jammer", (168, 85, 247)),
            ("btn_trigger_replan", "Force CBBA Re-Auction", (56, 189, 248)),
            ("btn_explain_why", "Explain Allocations [X-AI]", (250, 204, 21)),
        ]

        for key, text, b_color in btn_list:
            btn_rect = pygame.Rect(self.x_offset + 16, y_pos, self.width - 32, 32)
            self.buttons[key] = btn_rect
            pygame.draw.rect(self.surface, (30, 41, 59), btn_rect, border_radius=6)
            pygame.draw.rect(self.surface, b_color, btn_rect, 1, border_radius=6)
            t_render = self.font_small.render(text, True, (241, 245, 249))
            self.surface.blit(t_render, (btn_rect.centerx - t_render.get_width() // 2, btn_rect.centery - t_render.get_height() // 2))
            y_pos += 40

        # Operational Event Console Log
        y_pos += 15
        log_header = self.font_small.render("LIVE TELEMETRY STREAM", True, (203, 213, 225))
        self.surface.blit(log_header, (self.x_offset + 16, y_pos))
        y_pos += 20

        log_box = pygame.Rect(self.x_offset + 16, y_pos, self.width - 32, h - y_pos - 16)
        pygame.draw.rect(self.surface, (10, 15, 30), log_box, border_radius=6)
        pygame.draw.rect(self.surface, (51, 65, 85), log_box, 1, border_radius=6)

        line_y = y_pos + 8
        for log_line in logs[-8:]:
            c = (56, 189, 248) if "completed" in log_line.lower() else (248, 113, 113) if "failure" in log_line.lower() else (148, 163, 184)
            l_render = self.font_small.render(log_line[:38], True, c)
            self.surface.blit(l_render, (self.x_offset + 24, line_y))
            line_y += 18

    def handle_click(self, pos: Tuple[int, int]) -> Optional[str]:
        for btn_key, rect in self.buttons.items():
            if rect.collidepoint(pos):
                return btn_key
        return None
