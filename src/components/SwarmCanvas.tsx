import React, { useRef, useEffect } from 'react';
import { AgentEntity, TaskEntity, ObstacleEntity, ThreatZoneEntity } from '../types';

interface SwarmCanvasProps {
  agents: AgentEntity[];
  tasks: TaskEntity[];
  obstacles: ObstacleEntity[];
  threatZones: ThreatZoneEntity[];
  commLinks: [string, string][];
  selectedAgentId: string | null;
  selectedTaskId: string | null;
  onSelectAgent: (id: string | null) => void;
  onSelectTask: (id: string | null) => void;
}

export const SwarmCanvas: React.FC<SwarmCanvasProps> = ({
  agents,
  tasks,
  obstacles,
  threatZones,
  commLinks,
  selectedAgentId,
  selectedTaskId,
  onSelectAgent,
  onSelectTask,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // 1. Draw subtle tactical grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Obstacles
    obstacles.forEach((obs) => {
      ctx.fillStyle = '#334155'; // slate-700
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${obs.type} [${obs.id}]`, obs.x + 8, obs.y + 16);
    });

    // 3. Draw Threat Zones (Jamming Bubbles & SAMs)
    const now = Date.now() / 1000;
    threatZones.forEach((tz) => {
      const [cx, cy] = tz.center;
      const isJammer = tz.type === 'RF_JAMMER';
      const pulse = Math.sin(now * 3) * 4;

      // Outer radial aura
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, tz.radius + pulse);
      if (isJammer) {
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.25)'); // purple
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.02)');
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.28)'); // red
        grad.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, tz.radius + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = isJammer ? '#c084fc' : '#f87171';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, tz.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Threat Label
      ctx.fillStyle = isJammer ? '#e9d5ff' : '#fecaca';
      ctx.font = 'bold 11px monospace';
      const label = isJammer ? `EW JAMMER [${tz.id}]` : `SAM RADAR [${tz.id}]`;
      ctx.fillText(label, cx - 40, cy - tz.radius + 18);
    });

    // 4. Draw Ad-hoc Peer-to-Peer Mesh Links
    const agentMap = new Map<string, AgentEntity>(agents.map((a) => [a.id, a]));
    commLinks.forEach(([a1Id, a2Id]) => {
      const a1 = agentMap.get(a1Id);
      const a2 = agentMap.get(a2Id);
      if (a1 && a2 && a1.health.propulsion > 0.1 && a2.health.propulsion > 0.1) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'; // Sky 400
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(a1.position[0], a1.position[1]);
        ctx.lineTo(a2.position[0], a2.position[1]);
        ctx.stroke();

        // Animated data packet particle
        const t = (now * 0.8 + (a1.position[0] % 5)) % 1;
        const px = a1.position[0] + (a2.position[0] - a1.position[0]) * t;
        const py = a1.position[1] + (a2.position[1] - a1.position[1]) * t;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Draw Tasks
    tasks.forEach((task) => {
      const [tx, ty] = task.position;
      const isSelected = selectedTaskId === task.id;

      // Color based on status
      let color = '#94a3b8'; // gray unassigned
      if (task.status === 'COMPLETED') color = '#22c55e'; // emerald
      else if (task.status === 'IN_PROGRESS') color = '#facc15'; // yellow
      else if (task.status === 'ASSIGNED') color = '#38bdf8'; // sky

      // Highlight circle if selected
      if (isSelected) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Progress arc if in progress
      if (task.status === 'IN_PROGRESS' && task.progress > 0) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tx, ty, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * task.progress);
        ctx.stroke();
      }

      // Outer ring
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${task.id}:${task.type}`, tx + 18, ty - 2);

      // Assigned Drone
      if (task.assignedAgentId) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(`→ ${task.assignedAgentId}`, tx + 18, ty + 12);
      }
    });

    // 6. Draw Agents (Drones)
    agents.forEach((agent) => {
      const [ax, ay] = agent.position;
      const isSelected = selectedAgentId === agent.id;
      const isFailed = agent.status === 'FAILED' || agent.health.propulsion <= 0.1;
      const isJammed = agent.status === 'JAMMED' || agent.health.comms < 0.3;

      // Breadcrumb trails
      if (agent.breadcrumbs.length > 1) {
        ctx.strokeStyle = isFailed
          ? 'rgba(239, 68, 68, 0.15)'
          : 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        agent.breadcrumbs.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.stroke();
      }

      // Path line to current target
      if (agent.targetPosition && !isFailed) {
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(agent.targetPosition[0], agent.targetPosition[1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Agent selection halo
      if (isSelected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ax, ay, 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Drone Quadcopter Arms
      let bodyColor = '#38bdf8';
      if (isFailed) bodyColor = '#ef4444';
      else if (isJammed) bodyColor = '#a855f7';
      else if (agent.status === 'EXECUTING') bodyColor = '#4ade80';

      ctx.strokeStyle = isFailed ? '#ef4444' : '#ffffff';
      ctx.lineWidth = 1.8;
      // Cross frame
      ctx.beginPath();
      ctx.moveTo(ax - 12, ay - 12);
      ctx.lineTo(ax + 12, ay + 12);
      ctx.moveTo(ax - 12, ay + 12);
      ctx.lineTo(ax + 12, ay - 12);
      ctx.stroke();

      // Rotors
      const rotorAngle = isFailed ? 0 : now * 25;
      const armOff = 12;
      const rotorRadius = 4;
      [
        [-armOff, -armOff],
        [armOff, -armOff],
        [-armOff, armOff],
        [armOff, armOff],
      ].forEach(([dx, dy]) => {
        ctx.fillStyle = isFailed ? '#7f1d1d' : 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(ax + dx, ay + dy, rotorRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Drone Central Core
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(ax, ay, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Agent ID & Battery
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${agent.id} [${agent.health.battery.toFixed(0)}%]`, ax - 24, ay - 18);

      // Status pill badge
      ctx.fillStyle = isFailed ? '#ef4444' : isJammed ? '#c084fc' : '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText(agent.status, ax - 16, ay + 24);
    });
  }, [agents, tasks, obstacles, threatZones, commLinks, selectedAgentId, selectedTaskId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check click on drone
    for (const agent of agents) {
      const d = Math.hypot(agent.position[0] - clickX, agent.position[1] - clickY);
      if (d <= 20) {
        onSelectAgent(agent.id);
        return;
      }
    }

    // Check click on task
    for (const task of tasks) {
      const d = Math.hypot(task.position[0] - clickX, task.position[1] - clickY);
      if (d <= 20) {
        onSelectTask(task.id);
        return;
      }
    }

    // Deselect if clicked in empty space
    onSelectAgent(null);
    onSelectTask(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center">
      <canvas
        id="swarm-simulation-canvas"
        ref={canvasRef}
        width={1000}
        height={650}
        onClick={handleCanvasClick}
        className="w-full h-full object-contain cursor-crosshair"
      />
      {/* Legend overlay in canvas corner */}
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-300 flex items-center gap-4 shadow-lg pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Active Drone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Failed Drone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Jammer Zone
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-sky-400/60 inline-block" /> 1-Hop Mesh Link
        </span>
      </div>
    </div>
  );
};
