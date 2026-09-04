import React, { useRef, useEffect } from 'react';
import { 
  AgentEntity, 
  TaskEntity, 
  ObstacleEntity, 
  ThreatZoneEntity, 
  ByzantineState,
  TerrainRidgeEntity,
  RelayLinkStatus,
  WindVector,
  RedTeamThreatEntity,
  SandboxTool
} from '../types';
import { agentCallsignMap } from '../hooks/useSwarmSimulation';
import { Radio, Compass, Eye, ShieldAlert, Layers, BatteryCharging, Wind, Mountain, Crosshair } from 'lucide-react';

interface SwarmCanvasProps {
  agents: AgentEntity[];
  tasks: TaskEntity[];
  obstacles: ObstacleEntity[];
  threatZones: ThreatZoneEntity[];
  commLinks: [string, string][];
  selectedAgentId: string | null;
  selectedTaskId: string | null;
  byzantineState?: ByzantineState;
  terrainRidges?: TerrainRidgeEntity[];
  relayLinks?: RelayLinkStatus[];
  windVector?: WindVector;
  redTeamThreats?: RedTeamThreatEntity[];
  activeSandboxTool?: SandboxTool;
  tacticalMode?: {
    showMilStdSymbology: boolean;
    showUwbRangingMesh: boolean;
    showCotCallsigns: boolean;
  };
  onToggleTacticalMode?: (key: 'showMilStdSymbology' | 'showUwbRangingMesh' | 'showCotCallsigns') => void;
  onSelectAgent: (id: string | null) => void;
  onSelectTask: (id: string | null) => void;
  onCanvasClickWithTool?: (pos: [number, number], tool: SandboxTool) => void;
}

export const SwarmCanvas: React.FC<SwarmCanvasProps> = ({
  agents,
  tasks,
  obstacles,
  threatZones,
  commLinks,
  selectedAgentId,
  selectedTaskId,
  byzantineState,
  terrainRidges = [],
  relayLinks = [],
  windVector,
  redTeamThreats = [],
  activeSandboxTool = 'INSPECT',
  tacticalMode = { showMilStdSymbology: false, showUwbRangingMesh: false, showCotCallsigns: true },
  onToggleTacticalMode,
  onSelectAgent,
  onSelectTask,
  onCanvasClickWithTool,
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
    ctx.fillStyle = '#0a0f1d'; // deep tactical slate
    ctx.fillRect(0, 0, width, height);

    // 1. Draw subtle tactical grid
    ctx.strokeStyle = '#152238';
    ctx.lineWidth = 1;
    const gridSize = 50;
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

    // Grid coordinates
    ctx.fillStyle = '#263852';
    ctx.font = '9px monospace';
    for (let x = 100; x < width; x += 200) {
      ctx.fillText(`X:${x}m`, x + 3, 14);
    }
    for (let y = 100; y < height; y += 200) {
      ctx.fillText(`Y:${y}m`, 4, y - 4);
    }

    // 2. Draw Obstacles
    obstacles.forEach((obs) => {
      ctx.fillStyle = obs.type === 'NO_FLY' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(51, 65, 85, 0.7)';
      ctx.strokeStyle = obs.type === 'NO_FLY' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(100, 116, 139, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${obs.id} [${obs.type}]`, obs.x + 6, obs.y + 16);
    });

    // 2b. Draw Terrain Elevation Ridges (3D DEM)
    terrainRidges.forEach((ridge) => {
      const grad = ctx.createLinearGradient(ridge.x, ridge.y, ridge.x + ridge.width, ridge.y + ridge.height);
      grad.addColorStop(0, 'rgba(180, 83, 9, 0.28)');
      grad.addColorStop(1, 'rgba(120, 53, 15, 0.45)');
      ctx.fillStyle = grad;
      ctx.fillRect(ridge.x, ridge.y, ridge.width, ridge.height);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ridge.x, ridge.y, ridge.width, ridge.height);

      // Hatched topographic slope lines
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 1;
      for (let i = 12; i < ridge.height; i += 18) {
        ctx.beginPath();
        ctx.moveTo(ridge.x, ridge.y + i);
        ctx.lineTo(ridge.x + ridge.width, ridge.y + i - 6);
        ctx.stroke();
      }

      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`▲ ${ridge.name.toUpperCase()}`, ridge.x + 6, ridge.y + 14);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '8px monospace';
      ctx.fillText(`${ridge.elevationM}m MSL • RF SHADOW`, ridge.x + 6, ridge.y + 26);
    });

    // 3. Draw Threat Zones
    threatZones.forEach((threat) => {
      const [cx, cy] = threat.center;
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, threat.radius);
      if (threat.type === 'RF_JAMMER') {
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.02)');
      } else {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, threat.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = threat.type === 'RF_JAMMER' ? 'rgba(168, 85, 247, 0.6)' : 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, threat.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = threat.type === 'RF_JAMMER' ? '#d8b4fe' : '#fca5a5';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${threat.id} [${threat.type}]`, cx - 35, cy - threat.radius - 6);
    });

    // 3b. Draw Red-Team Threats (Dynamic Hostile Convoys & SAM Radars)
    redTeamThreats.forEach((th) => {
      if (!th.active) return;
      const [tx, ty] = th.position;

      if (th.type === 'MOBILE_CONVOY') {
        // Waypoint breadcrumb track
        if (th.waypoints && th.waypoints.length > 1) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(th.waypoints[0][0], th.waypoints[0][1]);
          for (let i = 1; i < th.waypoints.length; i++) {
            ctx.lineTo(th.waypoints[i][0], th.waypoints[i][1]);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Diamond Hostile OPFOR Marker
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(((th.headingDeg || 0) * Math.PI) / 180);

        ctx.fillStyle = '#e11d48';
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, -16);
        ctx.stroke();

        ctx.restore();

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`OPFOR: ${th.name}`, tx - 32, ty - 14);
        ctx.fillStyle = '#f43f5e';
        ctx.font = '8px monospace';
        ctx.fillText(`SPD: ${th.speed} kts • HDG: ${th.headingDeg}°`, tx - 32, ty + 20);
      } else {
        // SAM Battery Dome
        const pulse = 1 + 0.12 * Math.sin(Date.now() / 300);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(tx, ty, th.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.beginPath();
        ctx.arc(tx, ty, th.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`SAM DOME: ${th.name}`, tx - 35, ty - 10);
      }
    });

    // 4. Draw Mesh / UWB Links / Directional Beamforming
    const isCrlMode = byzantineState?.isGpsDenied || tacticalMode.showUwbRangingMesh;
    commLinks.forEach(([id1, id2]) => {
      const a1 = agents.find((a) => a.id === id1);
      const a2 = agents.find((a) => a.id === id2);
      if (!a1 || !a2) return;

      const dist = Math.hypot(a1.position[0] - a2.position[0], a1.position[1] - a2.position[1]);
      const hasRelay = a1.payloads.includes('HIGH_POWER_RELAY') || a2.payloads.includes('HIGH_POWER_RELAY');

      if (isCrlMode) {
        // UWB Cooperative Relative Localization ranging vector
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(a1.position[0], a1.position[1]);
        ctx.lineTo(a2.position[0], a2.position[1]);
        ctx.stroke();
        ctx.setLineDash([]);

        const midX = (a1.position[0] + a2.position[0]) / 2;
        const midY = (a1.position[1] + a2.position[1]) / 2;
        ctx.fillStyle = '#34d399';
        ctx.font = '8px monospace';
        ctx.fillText(`${(dist * 0.25).toFixed(1)}m`, midX - 12, midY - 3);
      } else if (hasRelay) {
        // Directional Beamforming Link (+6.5 dBi)
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a1.position[0], a1.position[1]);
        ctx.lineTo(a2.position[0], a2.position[1]);
        ctx.stroke();

        const midX = (a1.position[0] + a2.position[0]) / 2;
        const midY = (a1.position[1] + a2.position[1]) / 2;
        ctx.fillStyle = '#38bdf8';
        ctx.font = '7px monospace';
        ctx.fillText('📡 BEAMFORMING +6.5dBi', midX - 35, midY - 4);
      } else {
        // Standard RF MANET mesh link
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a1.position[0], a1.position[1]);
        ctx.lineTo(a2.position[0], a2.position[1]);
        ctx.stroke();
      }
    });

    // 4b. Draw 3D Terrain Occlusions & Autonomous Airborne Relay Links
    relayLinks.forEach((rl) => {
      const a1 = agents.find((a) => a.id === rl.agentAId);
      const a2 = agents.find((a) => a.id === rl.agentBId);
      if (!a1 || !a2) return;

      if (rl.status === 'OCCLUDED') {
        // Red dashed line with blocked marker
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(a1.position[0], a1.position[1]);
        ctx.lineTo(a2.position[0], a2.position[1]);
        ctx.stroke();
        ctx.setLineDash([]);

        const midX = (a1.position[0] + a2.position[0]) / 2;
        const midY = (a1.position[1] + a2.position[1]) / 2;
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`❌ LOS BLOCKED (${rl.occludingRidgeId || 'DEM'})`, midX - 45, midY - 6);
      } else if (rl.status === 'RELAYED' && rl.relayAgentId) {
        // Cyan double line through relay
        const relayAgent = agents.find((a) => a.id === rl.relayAgentId);
        if (relayAgent) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(a1.position[0], a1.position[1]);
          ctx.lineTo(relayAgent.position[0], relayAgent.position[1]);
          ctx.lineTo(a2.position[0], a2.position[1]);
          ctx.stroke();

          const rX = relayAgent.position[0];
          const rY = relayAgent.position[1];
          ctx.fillStyle = '#22d3ee';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('⚡ AIR RELAY (+21dB SNR)', rX - 35, rY - 26);
        }
      }
    });

    // 5. Draw Tasks with Precedence DAG & Required Payloads
    tasks.forEach((task) => {
      if (task.prerequisites && task.prerequisites.length > 0) {
        task.prerequisites.forEach((prereqId) => {
          const prereqTask = tasks.find((t) => t.id === prereqId);
          if (prereqTask) {
            const isPrereqDone = prereqTask.status === 'COMPLETED';
            ctx.strokeStyle = isPrereqDone ? 'rgba(74, 222, 128, 0.4)' : 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(prereqTask.position[0], prereqTask.position[1]);
            ctx.lineTo(task.position[0], task.position[1]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }
    });

    tasks.forEach((task) => {
      const [tx, ty] = task.position;
      const isSelected = selectedTaskId === task.id;

      let color = '#94a3b8';
      if (task.status === 'COMPLETED') color = '#22c55e';
      else if (task.status === 'IN_PROGRESS') color = '#38bdf8';
      else if (task.status === 'ASSIGNED') color = '#fbbf24';

      const hasUnmetPrereqs = task.prerequisites?.some((pId) => {
        const pt = tasks.find((t) => t.id === pId);
        return pt && pt.status !== 'COMPLETED';
      });

      if (hasUnmetPrereqs && task.status !== 'COMPLETED') {
        color = '#64748b';
      }

      if (isSelected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (tacticalMode.showMilStdSymbology) {
        // Target Diamond
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tx, ty - 12);
        ctx.lineTo(tx + 12, ty);
        ctx.lineTo(tx, ty + 12);
        ctx.lineTo(tx - 12, ty);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`${task.id}:${task.type}`, tx + 16, ty - 2);

      if (hasUnmetPrereqs && task.status !== 'COMPLETED') {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '9px monospace';
        ctx.fillText(`🔒 REQ: ${task.prerequisites?.join(', ')}`, tx + 16, ty + 10);
      } else if (task.assignedAgentId) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        const cSign = agentCallsignMap[task.assignedAgentId] || task.assignedAgentId;
        ctx.fillText(`→ ${cSign.split(' ')[0]}`, tx + 16, ty + 10);
      }

      // Required Payload Tag
      if (task.requiredPayload) {
        ctx.fillStyle = '#f472b6';
        ctx.font = '8px monospace';
        ctx.fillText(`REQ: ${task.requiredPayload}`, tx + 16, ty + 20);
      }
    });

    // 6. Draw Agents with Domain-Specific Geometry & MUM-T Recharging
    const ugvHub = agents.find((a) => a.domain === 'GROUND_UGV' && a.isRechargeHub);

    agents.forEach((agent) => {
      const [ax, ay] = agent.position;
      const isSelected = selectedAgentId === agent.id;
      const isFailed = agent.status === 'FAILED' || agent.health.propulsion <= 0.1;
      const isJammed = agent.status === 'JAMMED' || agent.health.comms < 0.3;
      const isRecharging = agent.status === 'RECHARGING';
      const callsign = agentCallsignMap[agent.id] || agent.id;

      // Byzantine State Check
      const byzInfo = byzantineState?.byzantineAgents[agent.id];
      const isQuarantined = byzInfo && (byzInfo.status === 'QUARANTINED' || byzInfo.status === 'EJECTED');
      const isSuspect = byzInfo && byzInfo.status === 'SUSPECT';

      // Recharging Energy Tether
      if (isRecharging && ugvHub) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(ugvHub.position[0], ugvHub.position[1]);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('⚡ 500W WIRELESS DOCK', (ax + ugvHub.position[0]) / 2 - 30, (ay + ugvHub.position[1]) / 2 - 4);
      }

      // Breadcrumbs
      if (agent.breadcrumbs.length > 1) {
        ctx.strokeStyle = isQuarantined
          ? 'rgba(239, 68, 68, 0.2)'
          : isFailed
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
      if (agent.targetPosition && !isFailed && !isQuarantined) {
        ctx.strokeStyle = isRecharging ? 'rgba(16, 185, 129, 0.5)' : 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(agent.targetPosition[0], agent.targetPosition[1]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Byzantine Quarantine Halo
      if (isQuarantined) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.arc(ax, ay, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('⚠ BFT EJECTED', ax - 32, ay + 38);
      } else if (isSuspect) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(ax, ay, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '9px monospace';
        ctx.fillText('SUSPECT 60%', ax - 24, ay + 34);
      }

      // Selection Halo
      if (isSelected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ax, ay, 24, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Domain-Specific Vehicle Rendering
      ctx.save();
      ctx.translate(ax, ay);
      const rad = ((agent.headingDeg || 0) * Math.PI) / 180;
      ctx.rotate(rad);

      const themeColor = isQuarantined ? '#ef4444' : isFailed ? '#ef4444' : isJammed ? '#a855f7' : '#38bdf8';

      if (agent.domain === 'AIR_FIXED_WING') {
        // Delta Swept-Wing Geometry
        ctx.fillStyle = themeColor;
        ctx.beginPath();
        ctx.moveTo(0, -16);  // Nose
        ctx.lineTo(14, 12);  // Right wingtip
        ctx.lineTo(0, 6);    // Center notch
        ctx.lineTo(-14, 12); // Left wingtip
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (agent.domain === 'GROUND_UGV') {
        // Tracked Armored Ground Vehicle with Induction Recharge Bay
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-10, -12, 20, 24); // chassis
        // Left & Right tracks
        ctx.fillStyle = '#475569';
        ctx.fillRect(-14, -14, 4, 28);
        ctx.fillRect(10, -14, 4, 28);
        // Center illuminated wireless induction dock
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (agent.domain === 'SURFACE_USV') {
        // Surface Boat Hull with Wake Line
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.moveTo(0, -14); // Bow
        ctx.lineTo(8, 6);
        ctx.lineTo(6, 14);  // Stern right
        ctx.lineTo(-6, 14); // Stern left
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Rotary Multirotor (Quadcopter)
        ctx.strokeStyle = isQuarantined ? '#ef4444' : isFailed ? '#ef4444' : '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-11, -11);
        ctx.lineTo(11, 11);
        ctx.moveTo(-11, 11);
        ctx.lineTo(11, -11);
        ctx.stroke();

        // 4 Rotors
        [[-11, -11], [11, -11], [-11, 11], [11, 11]].forEach(([dx, dy]) => {
          ctx.fillStyle = isFailed || isQuarantined ? '#7f1d1d' : 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Fuselage
        ctx.fillStyle = isRecharging ? '#10b981' : themeColor;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Callsign or Agent ID Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px monospace';
      const labelText = tacticalMode.showCotCallsigns 
        ? `${callsign.split(' ')[0]} [${agent.health.battery.toFixed(0)}%]`
        : `${agent.id} [${agent.health.battery.toFixed(0)}%]`;
      ctx.fillText(labelText, ax - 24, ay - 18);

      // Status text
      ctx.fillStyle = isRecharging 
        ? '#34d399' 
        : isQuarantined ? '#ef4444' : isFailed ? '#ef4444' : isJammed ? '#c084fc' : '#38bdf8';
      ctx.font = '8px monospace';
      ctx.fillText(agent.status, ax - 16, ay + 24);

      // Dubins & Kinematic flight telemetry
      if (agent.domain === 'AIR_FIXED_WING') {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '8px monospace';
        ctx.fillText(`BANK: ${agent.bankAngleDeg || 0}° | ${(agent.groundSpeedMps || agent.speed).toFixed(1)} m/s`, ax - 30, ay + 34);
        if (agent.powerDrawWatts) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`PWR: ${Math.round(agent.powerDrawWatts)}W`, ax - 30, ay + 44);
        }
      }
    });

    // 7. Tactical METOC Wind Compass HUD
    if (windVector) {
      const hudX = width - 65;
      const hudY = 55;
      const r = 22;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hudX, hudY, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('N', hudX - 3, hudY - r + 8);

      ctx.save();
      ctx.translate(hudX, hudY);
      const windRad = (windVector.directionDeg * Math.PI) / 180;
      ctx.rotate(windRad);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, r - 6);
      ctx.lineTo(0, -r + 8);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, r - 4);
      ctx.lineTo(-3.5, r - 10);
      ctx.lineTo(3.5, r - 10);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${windVector.speedMps} m/s`, hudX - 16, hudY + r + 13);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px monospace';
      ctx.fillText(`${windVector.directionDeg}° • T:${windVector.turbulencePct}%`, hudX - 22, hudY + r + 23);
    }
  }, [agents, tasks, obstacles, threatZones, commLinks, selectedAgentId, selectedTaskId, byzantineState, tacticalMode, terrainRidges, relayLinks, windVector, redTeamThreats]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (activeSandboxTool && activeSandboxTool !== 'INSPECT' && onCanvasClickWithTool) {
      onCanvasClickWithTool([clickX, clickY], activeSandboxTool);
      return;
    }

    for (const agent of agents) {
      const d = Math.hypot(agent.position[0] - clickX, agent.position[1] - clickY);
      if (d <= 22) {
        onSelectAgent(agent.id);
        return;
      }
    }

    for (const task of tasks) {
      const d = Math.hypot(task.position[0] - clickX, task.position[1] - clickY);
      if (d <= 18) {
        onSelectTask(task.id);
        return;
      }
    }

    onSelectAgent(null);
    onSelectTask(null);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0f1d] shadow-2xl">
      {/* Top Overlay Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-900/90 text-sky-400 border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            THEATER MAP (WGS-84)
          </span>

          {onToggleTacticalMode && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-md p-0.5 backdrop-blur-md">
              <button
                onClick={() => onToggleTacticalMode('showMilStdSymbology')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  tacticalMode.showMilStdSymbology ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                MIL-STD
              </button>
              <button
                onClick={() => onToggleTacticalMode('showUwbRangingMesh')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  tacticalMode.showUwbRangingMesh ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                UWB CRL
              </button>
              <button
                onClick={() => onToggleTacticalMode('showCotCallsigns')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  tacticalMode.showCotCallsigns ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                CALLSIGNS
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {byzantineState?.isGpsDenied && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse flex items-center gap-1">
              <Radio className="w-3 h-3" />
              GPS-DENIED (UWB-CRL ACTIVE)
            </span>
          )}
          {Object.values(byzantineState?.byzantineAgents || {}).some(
            (b: { status: string }) => b.status === 'QUARANTINED' || b.status === 'EJECTED'
          ) && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              BYZANTINE EJECTION ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={560}
        onClick={handleCanvasClick}
        className="w-full h-auto cursor-crosshair block"
      />

      {/* Bottom Legend */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 pointer-events-none font-mono">
        <div className="flex items-center gap-3 bg-slate-900/80 px-2 py-1 rounded backdrop-blur border border-slate-800">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Air (Fixed/Quad)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Ground UGV Hub
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Surface USV
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-700" /> Ridge DEM
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> OPFOR Hostile
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Jammer
          </span>
        </div>
        <span className="bg-slate-900/80 px-2 py-1 rounded backdrop-blur border border-slate-800">
          Coordinate Projection: MCAS Miramar Tactical Grid (32.8812°N, 117.2345°W)
        </span>
      </div>
    </div>
  );
};
