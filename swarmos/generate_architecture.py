"""
Generates the architecture diagram for SWARMOS.
Outputs swarmos/architecture.png using Matplotlib.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_architecture():
    fig, ax = plt.subplots(figsize=(14, 9), facecolor="#0b1120")
    ax.set_facecolor("#0b1120")
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis("off")

    # Title
    ax.text(7, 8.5, "SWARMOS ARCHITECTURE & DATAFLOW PIPELINE", 
            fontsize=18, fontweight="bold", color="#38bdf8", ha="center", va="center")
    ax.text(7, 8.1, "Decentralized Multi-Agent CBBA Engine with NVIDIA Nemotron & Nebius Cloud Scale", 
            fontsize=11, color="#94a3b8", ha="center", va="center")

    # 1. Commander Intent (Top Left)
    cmd_box = patches.FancyBboxPatch((0.8, 6.2), 3.4, 1.4, boxstyle="round,pad=0.2", 
                                     edgecolor="#38bdf8", facecolor="#1e293b", linewidth=1.5)
    ax.add_patch(cmd_box)
    ax.text(2.5, 7.1, "COMMANDER / OPERATOR", fontsize=11, fontweight="bold", color="#f8fafc", ha="center")
    ax.text(2.5, 6.6, "Natural Language Tactical Prompt\n('Rescue civilians, disrupt jammer')", 
            fontsize=8.5, color="#cbd5e1", ha="center", style="italic")

    # 2. NVIDIA Nemotron AI Layer (Center Top)
    llm_box = patches.FancyBboxPatch((5.3, 6.0), 3.4, 1.6, boxstyle="round,pad=0.2", 
                                     edgecolor="#76b900", facecolor="#1e293b", linewidth=1.8)
    ax.add_patch(llm_box)
    ax.text(7.0, 7.1, "NVIDIA NEMOTRON-4-340B", fontsize=11, fontweight="bold", color="#76b900", ha="center")
    ax.text(7.0, 6.7, "Nebius AI Studio API", fontsize=9, color="#94a3b8", ha="center")
    ax.text(7.0, 6.3, "• Structured JSON Manifest\n• Waypoints, Tasks & Urgency", fontsize=8.5, color="#f1f5f9", ha="center")

    # Arrow 1 -> 2
    ax.annotate("", xy=(5.3, 6.9), xytext=(4.3, 6.9),
                arrowprops=dict(arrowstyle="->", color="#38bdf8", lw=2))

    # 3. Swarm Orchestrator (Center)
    orch_box = patches.FancyBboxPatch((4.8, 3.8), 4.4, 1.5, boxstyle="round,pad=0.2", 
                                      edgecolor="#f59e0b", facecolor="#1e293b", linewidth=1.8)
    ax.add_patch(orch_box)
    ax.text(7.0, 4.8, "SWARM ORCHESTRATOR", fontsize=12, fontweight="bold", color="#fbbf24", ha="center")
    ax.text(7.0, 4.3, "Dynamic Replanner | Metrics Tracker | Explainability Agent", 
            fontsize=9, color="#cbd5e1", ha="center")
    ax.text(7.0, 4.0, "Consensus State Sync & Failure Ingestion", fontsize=8.5, color="#94a3b8", ha="center")

    # Arrow 2 -> 3
    ax.annotate("", xy=(7.0, 5.4), xytext=(7.0, 5.9),
                arrowprops=dict(arrowstyle="->", color="#76b900", lw=2))
    ax.text(7.1, 5.65, "JSON Tasks", fontsize=8, color="#cbd5e1")

    # 4. Failure Injector (Right)
    fail_box = patches.FancyBboxPatch((10.0, 5.0), 3.2, 1.4, boxstyle="round,pad=0.2", 
                                      edgecolor="#ef4444", facecolor="#1e293b", linewidth=1.5)
    ax.add_patch(fail_box)
    ax.text(11.6, 5.9, "FAILURE INJECTOR", fontsize=10, fontweight="bold", color="#f87171", ha="center")
    ax.text(11.6, 5.4, "• Motor Failure (Drone Drop)\n• RF EW Jammer Zone\n• SAM Radar Battery", 
            fontsize=8, color="#cbd5e1", ha="center")

    # Arrow 4 -> 3
    ax.annotate("", xy=(9.3, 4.6), xytext=(10.0, 5.4),
                arrowprops=dict(arrowstyle="->", color="#ef4444", lw=1.5, linestyle="dashed"))

    # 5. Explainable Swarm X-AI (Left)
    xai_box = patches.FancyBboxPatch((0.8, 3.8), 3.4, 1.4, boxstyle="round,pad=0.2", 
                                     edgecolor="#a855f7", facecolor="#1e293b", linewidth=1.5)
    ax.add_patch(xai_box)
    ax.text(2.5, 4.7, "EXPLAINABLE SWARM (X-AI)", fontsize=10, fontweight="bold", color="#c084fc", ha="center")
    ax.text(2.5, 4.2, "• Marginal Utility Forensic\n• Bidding Matrices & Score Decay\n• Conflict Resolution Audit", 
            fontsize=8, color="#cbd5e1", ha="center")

    # Arrow 3 -> 5
    ax.annotate("", xy=(4.3, 4.5), xytext=(4.8, 4.5),
                arrowprops=dict(arrowstyle="<-", color="#a855f7", lw=1.5))

    # 6. Swarm Physical Agents (Bottom Row)
    agents_group_box = patches.FancyBboxPatch((0.8, 0.6), 12.4, 2.5, boxstyle="round,pad=0.3", 
                                             edgecolor="#38bdf8", facecolor="#0f172a", linewidth=1.5, linestyle="--")
    ax.add_patch(agents_group_box)
    ax.text(7.0, 2.7, "DISTRIBUTED PEER-TO-PEER AD-HOC MESH (CBBA PROTOCOL)", 
            fontsize=11, fontweight="bold", color="#38bdf8", ha="center")

    # Agent Nodes
    agent_x_coords = [2.2, 4.6, 7.0, 9.4, 11.8]
    agent_names = ["DRONE A1", "DRONE A2", "DRONE A3", "DRONE A4", "DRONE A5"]
    for i, (ax_pos, name) in enumerate(zip(agent_x_coords, agent_names)):
        color = "#22c55e" if i != 0 else "#ef4444"
        subtext = "Propulsion Loss" if i == 0 else "CBBA Phase 1 & 2"
        abox = patches.FancyBboxPatch((ax_pos - 1.0, 0.9), 2.0, 1.4, boxstyle="round,pad=0.15", 
                                      edgecolor=color, facecolor="#1e293b", linewidth=1.2)
        ax.add_patch(abox)
        ax.text(ax_pos, 1.8, name, fontsize=9.5, fontweight="bold", color="#f8fafc", ha="center")
        ax.text(ax_pos, 1.4, f"Bundle (b_{i+1})\nPath (p_{i+1})", fontsize=8, color="#94a3b8", ha="center")
        ax.text(ax_pos, 1.05, subtext, fontsize=7.5, color=color, ha="center")

    # Mesh links between agents
    for i in range(len(agent_x_coords) - 1):
        ax.plot([agent_x_coords[i] + 1.0, agent_x_coords[i+1] - 1.0], [1.6, 1.6], 
                color="#60a5fa", linewidth=1.2, linestyle=":")

    # Arrow Orchestrator -> Swarm Mesh
    ax.annotate("", xy=(7.0, 2.9), xytext=(7.0, 3.8),
                arrowprops=dict(arrowstyle="<->", color="#38bdf8", lw=2))

    # Save output
    out_dir = os.path.dirname(__file__)
    out_path = os.path.join(out_dir, "architecture.png")
    plt.tight_layout()
    plt.savefig(out_path, dpi=180, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"Architecture diagram generated: {out_path}")

if __name__ == "__main__":
    draw_architecture()
