"""
Explain-Why Visual Inspector Dialog for SWARMOS.
Renders an interactive modal breakdown showing CBBA auction calculations,
marginal bid scores, and why specific agents were selected over competitors.
"""

from typing import Dict, Any, Optional
import pygame

class ExplainWhyDialog:
    def __init__(self, surface: pygame.Surface, font_small: pygame.font.Font, font_large: pygame.font.Font):
        self.surface = surface
        self.font_small = font_small
        self.font_large = font_large
        self.is_open = False
        self.explanation_data: Optional[Dict[str, Any]] = None
        self.close_button_rect: Optional[pygame.Rect] = None

    def show(self, data: Dict[str, Any]) -> None:
        self.explanation_data = data
        self.is_open = True

    def hide(self) -> None:
        self.is_open = False
        self.explanation_data = None

    def render(self) -> None:
        if not self.is_open or not self.explanation_data:
            return

        w, h = self.surface.get_width(), self.surface.get_height()
        modal_w, modal_h = 680, 480
        x = (w - modal_w) // 2
        y = (h - modal_h) // 2

        # Dim background
        overlay = pygame.Surface((w, h), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 160))
        self.surface.blit(overlay, (0, 0))

        # Modal Window Card
        modal_rect = pygame.Rect(x, y, modal_w, modal_h)
        pygame.draw.rect(self.surface, (15, 23, 42), modal_rect, border_radius=12)
        pygame.draw.rect(self.surface, (56, 189, 248), modal_rect, 2, border_radius=12)

        # Header Title
        title_text = f"X-SWARM FORENSIC EXPLANATION: Task {self.explanation_data.get('task_id', 'T?')}"
        title = self.font_large.render(title_text, True, (56, 189, 248))
        self.surface.blit(title, (x + 24, y + 20))

        # Close button [X]
        self.close_button_rect = pygame.Rect(x + modal_w - 40, y + 18, 26, 26)
        pygame.draw.rect(self.surface, (30, 41, 59), self.close_button_rect, border_radius=4)
        x_txt = self.font_small.render("X", True, (241, 245, 249))
        self.surface.blit(x_txt, (self.close_button_rect.x + 8, self.close_button_rect.y + 4))

        # Natural Language Reason Narrative
        narrative_box = pygame.Rect(x + 24, y + 60, modal_w - 48, 70)
        pygame.draw.rect(self.surface, (30, 41, 59), narrative_box, border_radius=8)
        expl_text = self.explanation_data.get("explanation", "No details available.")

        # Multi-line word wrap
        words = expl_text.split()
        lines = []
        cur_line = []
        for word in words:
            cur_line.append(word)
            test_line = " ".join(cur_line)
            if self.font_small.size(test_line)[0] > (modal_w - 70):
                cur_line.pop()
                lines.append(" ".join(cur_line))
                cur_line = [word]
        if cur_line:
            lines.append(" ".join(cur_line))

        line_y = y + 70
        for l in lines[:3]:
            txt = self.font_small.render(l, True, (241, 245, 249))
            self.surface.blit(txt, (x + 36, line_y))
            line_y += 18

        # Consensus Bidding Table
        tbl_header = self.font_small.render("CBBA MARGINAL UTILITY BID MATRIX", True, (250, 204, 21))
        self.surface.blit(tbl_header, (x + 24, y + 145))

        # Table Column Headers
        col_y = y + 170
        pygame.draw.line(self.surface, (51, 65, 85), (x + 24, col_y + 20), (x + modal_w - 24, col_y + 20), 1)
        self.surface.blit(self.font_small.render("AGENT", True, (148, 163, 184)), (x + 36, col_y))
        self.surface.blit(self.font_small.render("DIST (m)", True, (148, 163, 184)), (x + 130, col_y))
        self.surface.blit(self.font_small.render("EST ARRIVAL", True, (148, 163, 184)), (x + 230, col_y))
        self.surface.blit(self.font_small.render("BID SCORE", True, (148, 163, 184)), (x + 350, col_y))
        self.surface.blit(self.font_small.render("CONSENSUS STATUS", True, (148, 163, 184)), (x + 480, col_y))

        row_y = col_y + 26
        matrix = self.explanation_data.get("bidding_matrix", [])
        for row in matrix[:6]:
            aid = row.get("agent_id", "A?")
            is_win = row.get("is_winner", False)
            status_text = "WINNER [AWARDED]" if is_win else "OUTBID"
            status_color = (34, 197, 94) if is_win else (148, 163, 184)
            row_color = (255, 255, 255) if is_win else (203, 213, 225)

            self.surface.blit(self.font_small.render(aid, True, (56, 189, 248) if is_win else row_color), (x + 36, row_y))
            self.surface.blit(self.font_small.render(f"{row.get('distance_to_task_m', 0.0)}m", True, row_color), (x + 130, row_y))
            self.surface.blit(self.font_small.render(f"{row.get('est_arrival_sec', 0.0)}s", True, row_color), (x + 230, row_y))
            self.surface.blit(self.font_small.render(f"{row.get('marginal_reward_bid', 0.0):.2f}", True, (250, 204, 21) if is_win else row_color), (x + 350, row_y))
            self.surface.blit(self.font_small.render(status_text, True, status_color), (x + 480, row_y))

            row_y += 24

        # Footer Formula Note
        footer_y = y + modal_h - 40
        formula_note = "CBBA Reward Formula: S_ij = BaseReward * (0.95 ^ (ArrivalTime * UrgencyWeight)) - PathDeltaCost"
        f_txt = self.font_small.render(formula_note, True, (100, 116, 139))
        self.surface.blit(f_txt, (x + 24, footer_y))

    def handle_click(self, pos: Tuple[int, int]) -> bool:
        if not self.is_open:
            return False
        if self.close_button_rect and self.close_button_rect.collidepoint(pos):
            self.hide()
            return True
        return False
