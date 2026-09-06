"""
SWARMOS UI Main Entry Point.
Launches the interactive Pygame simulation workbench, mission executive,
dynamic failure injection triggers, and explainability overlays.

Usage:
    python ui/main.py
    python ui/main.py --mission "Search sector alpha and neutralize radar jammers"
    python ui/main.py --headless
"""

import argparse
import os
import sys
import time

# Ensure swarmos root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from swarmos.utils.config import DEFAULT_CONFIG
from swarmos.utils.logger import logger
from swarmos.ai_layer.orchestrator import SwarmOrchestrator
from swarmos.swarm_engine.failures import FailureType

def run_headless_simulation(orchestrator: SwarmOrchestrator, duration: float = 20.0):
    """Headless simulation runner for servers and CI pipelines."""
    logger.info(f"Running SWARMOS in headless batch mode for {duration} virtual seconds...")
    sim_time = 0.0
    dt = 0.1
    while sim_time < duration:
        sim_time += dt
        res = orchestrator.step(dt)
        if int(sim_time * 10) % 30 == 0:
            kpis = res["kpis"]
            logger.info(f"[t={sim_time:.1f}s] Completed: {kpis['task_completion_pct']}% | Active Drones: {kpis['operational_fleet_pct']}% | Packets: {kpis['total_mesh_packets']}")
    logger.info("Headless simulation complete.")

def main():
    parser = argparse.ArgumentParser(description="SWARMOS Desktop Interactive Simulator")
    parser.add_argument("--mission", type=str, default="Search sector alpha and rescue stranded personnel, neutralize radar jammer", help="Natural language directive")
    parser.add_argument("--headless", action="store_true", help="Run without graphical display")
    parser.add_argument("--scale", type=int, default=6, help="Fleet size")
    args = parser.parse_args()

    config = DEFAULT_CONFIG
    config.NUM_AGENTS = args.scale
    orchestrator = SwarmOrchestrator(config=config)
    orchestrator.load_mission(args.mission)

    if args.headless:
        run_headless_simulation(orchestrator)
        return

    try:
        import pygame
        from ui.visualization import SwarmVisualizer
        from ui.dashboard import SwarmDashboard
        from ui.explain import ExplainWhyDialog
    except ImportError:
        logger.error("Pygame not found. Run 'pip install pygame' or execute with '--headless'.")
        sys.exit(1)

    # Initialize Pygame
    pygame.init()
    pygame.font.init()
    pygame.display.set_caption("SWARMOS - Decentralized CBBA Swarm Workbench")

    screen_w = 1280
    screen_h = 760
    screen = pygame.display.set_mode((screen_w, screen_h))
    clock = pygame.time.Clock()

    font_small = pygame.font.SysFont("Courier", 13)
    font_large = pygame.font.SysFont("Arial", 18, bold=True)

    visualizer = SwarmVisualizer(screen, font_small, font_large)
    dashboard = SwarmDashboard(screen, font_small, font_large, width=360)
    explain_dialog = ExplainWhyDialog(screen, font_small, font_large)

    event_logs = [
        "SWARMOS kernel booted.",
        "CBBA protocol consensus initialized.",
        f"Fleet spawned: {config.NUM_AGENTS} autonomous drones.",
        f"Mission loaded: {orchestrator.current_mission_manifest.get('mission_name', 'Default')}"
    ]

    running = True
    last_tick = time.time()

    while running:
        dt_real = clock.tick(60) / 1000.0
        # Simulation step
        step_result = orchestrator.step(dt_real)
        if step_result.get("replanned"):
            event_logs.append("EMERGENCY: Swarm consensus re-auction triggered!")

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                m_pos = pygame.mouse.get_pos()

                # Check if dialog intercepted click
                if explain_dialog.handle_click(m_pos):
                    continue

                # Check dashboard buttons
                btn_clicked = dashboard.handle_click(m_pos)
                if btn_clicked == "btn_inject_failure":
                    # Disable Agent 1
                    target_id = "A1"
                    orchestrator.failure_injector.inject_motor_failure(target_id, "Injected rotor failure")
                    event_logs.append(f"FAILURE INJECTED: Agent {target_id} lost propulsion.")
                elif btn_clicked == "btn_inject_jammer":
                    # Spawn jammer at map center
                    threat_id = orchestrator.failure_injector.inject_rf_jamming((540.0, 360.0), radius=190.0)
                    event_logs.append(f"EW ALERT: Hostile RF Jammer {threat_id} active.")
                elif btn_clicked == "btn_trigger_replan":
                    orchestrator.execute_full_consensus()
                    event_logs.append("MANUAL OVERRIDE: Global CBBA re-auction converged.")
                elif btn_clicked == "btn_explain_why":
                    # Open explain dialog on first active task
                    first_task = next((t for t in orchestrator.env.tasks.values()), None)
                    if first_task:
                        explanation = orchestrator.explainer.explain_task_allocation(first_task.id)
                        explain_dialog.show(explanation)

        # Rendering phase
        screen.fill(config.COLOR_BG)

        # 1. World grid, obstacles, threat zones
        sim_area_w = screen_w - dashboard.width
        visualizer.draw_grid(sim_area_w, screen_h)
        visualizer.draw_obstacles(orchestrator.env.obstacles)
        visualizer.draw_threat_zones(orchestrator.env.threat_zones)

        # 2. Dynamic mesh and entities
        comm_links = list(orchestrator.env.communication_links)
        visualizer.draw_communication_mesh(comm_links, orchestrator.env.agents)
        visualizer.draw_tasks(orchestrator.env.tasks)
        visualizer.draw_agents(orchestrator.env.agents)

        # 3. HUD Sidebar Dashboard
        m_name = orchestrator.current_mission_manifest.get("mission_name", "Autonomous Fleet Ops")
        dashboard.render(step_result["kpis"], m_name, event_logs)

        # 4. Explain Dialog overlay
        explain_dialog.render()

        pygame.display.flip()

    pygame.quit()
    sys.exit(0)

if __name__ == "__main__":
    main()
