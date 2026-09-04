/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SWARMOS Red-Team Adversarial Sandbox & Live Mission Builder
 * Interactive tactical mission design, dynamic moving convoys,
 * SAM threat domes, custom task injection, and wind vector controls.
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Wind, 
  Compass, 
  Crosshair, 
  PlusCircle, 
  Truck, 
  Radio, 
  Target, 
  Trash2, 
  Play, 
  Pause,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { 
  SandboxTool, 
  WindVector, 
  RedTeamThreatEntity, 
  TaskType, 
  PayloadCapability,
  TaskEntity
} from '../types';

interface RedTeamSandboxPanelProps {
  activeTool: SandboxTool;
  onSelectTool: (tool: SandboxTool) => void;
  windVector: WindVector;
  onUpdateWind: (wind: Partial<WindVector>) => void;
  redTeamThreats: RedTeamThreatEntity[];
  onAddThreat: (threat: Omit<RedTeamThreatEntity, 'id'>) => void;
  onRemoveThreat: (id: string) => void;
  onToggleThreat: (id: string) => void;
  onAddCustomTask: (task: Omit<TaskEntity, 'id' | 'status' | 'assignedAgentId' | 'progress'>) => void;
}

export const RedTeamSandboxPanel: React.FC<RedTeamSandboxPanelProps> = ({
  activeTool,
  onSelectTool,
  windVector,
  onUpdateWind,
  redTeamThreats,
  onAddThreat,
  onRemoveThreat,
  onToggleThreat,
  onAddCustomTask,
}) => {
  // Custom Task State
  const [taskType, setTaskType] = useState<TaskType>('RECON');
  const [taskPayload, setTaskPayload] = useState<PayloadCapability>('FLIR_THERMAL');
  const [taskReward, setTaskReward] = useState<number>(130);
  const [taskUrgency, setTaskUrgency] = useState<number>(1.4);
  const [taskDesc, setTaskDesc] = useState<string>('Tactical priority strike on hostile corridor');

  const tools: { id: SandboxTool; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'INSPECT', label: 'Inspect', icon: <Crosshair className="w-4 h-4" />, desc: 'Standard selection & telemetry inspection' },
    { id: 'ADD_CONVOY', label: 'Hostile Convoy', icon: <Truck className="w-4 h-4" />, desc: 'Click map to place moving adversarial vehicle' },
    { id: 'ADD_SAM', label: 'SAM Radar', icon: <ShieldAlert className="w-4 h-4" />, desc: 'Click map to place 100m kinetic denial zone' },
    { id: 'ADD_JAMMER', label: 'RF Jammer', icon: <Radio className="w-4 h-4" />, desc: 'Click map to place electronic warfare bubble' },
    { id: 'ADD_TASK', label: 'Drop Task', icon: <Target className="w-4 h-4" />, desc: 'Click map to drop new mission task' },
  ];

  const handleQuickAddThreat = (type: 'MOBILE_CONVOY' | 'RADAR_SAM' | 'RF_JAMMER') => {
    const rx = 400 + Math.floor(Math.random() * 400);
    const ry = 150 + Math.floor(Math.random() * 300);

    if (type === 'MOBILE_CONVOY') {
      onAddThreat({
        name: `CONVOY-OPFOR-${Math.floor(Math.random() * 90 + 10)}`,
        type: 'MOBILE_CONVOY',
        position: [rx, ry],
        radius: 40,
        waypoints: [[rx, ry], [rx + 150, ry], [rx + 150, ry + 120], [rx, ry + 120]],
        waypointIndex: 0,
        speed: 18,
        headingDeg: 90,
        intensity: 0.9,
        active: true,
      });
    } else if (type === 'RADAR_SAM') {
      onAddThreat({
        name: `SAM-BATTERY-${Math.floor(Math.random() * 90 + 10)}`,
        type: 'RADAR_SAM',
        position: [rx, ry],
        radius: 95,
        speed: 0,
        headingDeg: 0,
        intensity: 0.95,
        active: true,
      });
    } else {
      onAddThreat({
        name: `EW-JAMMER-${Math.floor(Math.random() * 90 + 10)}`,
        type: 'RF_JAMMER',
        position: [rx, ry],
        radius: 85,
        speed: 0,
        headingDeg: 0,
        intensity: 0.85,
        active: true,
      });
    }
  };

  const handleCreateTask = () => {
    const rx = 350 + Math.floor(Math.random() * 450);
    const ry = 120 + Math.floor(Math.random() * 320);

    onAddCustomTask({
      type: taskType,
      position: [rx, ry],
      baseReward: taskReward,
      duration: 6,
      urgencyWeight: taskUrgency,
      description: taskDesc,
      requiredPayload: taskPayload,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Tool Selector */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Adversarial Red-Team Sandbox &amp; Live Mission Builder
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                  DYNAMIC OPFOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inject moving hostile convoys, SAM batteries, atmospheric wind shear, and custom tasks into live swarm
              </p>
            </div>
          </div>

          {/* Interactive Tool Selector */}
          <div className="flex items-center flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTool(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTool === t.id
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Atmospheric Wind Shear & Vector Controller */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-400" />
            Atmospheric Modeling &amp; Wind Vector Injection
          </h3>
          <span className="text-xs text-sky-400 font-mono font-bold">
            {windVector.speedMps} m/s @ {windVector.directionDeg}°
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          {/* Wind Speed */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Wind Speed</span>
              <strong className="text-white">{windVector.speedMps} m/s ({(windVector.speedMps * 1.94).toFixed(0)} kts)</strong>
            </div>
            <input
              type="range"
              min="0"
              max="28"
              step="1"
              value={windVector.speedMps}
              onChange={(e) => onUpdateWind({ speedMps: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              High winds cause multirotor crab angle drift and increase hover power draw up to +40%.
            </span>
          </div>

          {/* Wind Direction */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Wind Origin Direction</span>
              <strong className="text-white">{windVector.directionDeg}°</strong>
            </div>
            <input
              type="range"
              min="0"
              max="355"
              step="15"
              value={windVector.directionDeg}
              onChange={(e) => onUpdateWind({ directionDeg: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <button onClick={() => onUpdateWind({ directionDeg: 0 })} className="hover:text-white">N (0°)</button>
              <button onClick={() => onUpdateWind({ directionDeg: 90 })} className="hover:text-white">E (90°)</button>
              <button onClick={() => onUpdateWind({ directionDeg: 180 })} className="hover:text-white">S (180°)</button>
              <button onClick={() => onUpdateWind({ directionDeg: 270 })} className="hover:text-white">W (270°)</button>
            </div>
          </div>

          {/* Turbulence & Gusts */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Turbulence / Gust Intensity</span>
              <strong className="text-white">{windVector.turbulencePct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={windVector.turbulencePct}
              onChange={(e) => onUpdateWind({ turbulencePct: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Stochastic wind gusts induce roll-rate disturbance and test flight controller stabilization.
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Red-Team OPFOR Threat Manager & Custom Task Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Red-Team Threats */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              Active OPFOR Threats ({redTeamThreats.length})
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleQuickAddThreat('MOBILE_CONVOY')}
                className="px-2 py-1 rounded text-[11px] font-mono bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-bold transition-all"
              >
                + Convoy
              </button>
              <button
                onClick={() => handleQuickAddThreat('RADAR_SAM')}
                className="px-2 py-1 rounded text-[11px] font-mono bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30 font-bold transition-all"
              >
                + SAM
              </button>
            </div>
          </div>

          {redTeamThreats.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No active red-team threats. Click &quot;+ Convoy&quot; or &quot;+ SAM&quot; to test swarm perimeter response.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {redTeamThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white flex items-center gap-1">
                        {threat.type === 'MOBILE_CONVOY' ? (
                          <Truck className="w-3.5 h-3.5 text-red-400" />
                        ) : threat.type === 'RADAR_SAM' ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                        ) : (
                          <Radio className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        {threat.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                        {threat.type}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Pos: ({Math.round(threat.position[0])}, {Math.round(threat.position[1])}) | Radius: {threat.radius}m | Speed: {threat.speed} m/s
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleThreat(threat.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        threat.active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {threat.active ? 'ACTIVE' : 'PAUSED'}
                    </button>
                    <button
                      onClick={() => onRemoveThreat(threat.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Custom Task Builder */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Live Task Creator (Inject into CBBA Auction)
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as TaskType)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="RECON">RECON</option>
                  <option value="RESCUE">RESCUE</option>
                  <option value="NEUTRALIZE">NEUTRALIZE</option>
                  <option value="SURVEIL">SURVEIL</option>
                  <option value="RELAY">RELAY</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Required Payload</label>
                <select
                  value={taskPayload}
                  onChange={(e) => setTaskPayload(e.target.value as PayloadCapability)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="FLIR_THERMAL">FLIR_THERMAL (VIPER-01/02)</option>
                  <option value="HEAVY_CARGO">HEAVY_CARGO (VIPER-03)</option>
                  <option value="LIDAR_3D">LIDAR_3D (VIPER-04)</option>
                  <option value="SIGINT_DIRECTION_FINDER">SIGINT_DF (VIPER-01/NAUTILUS)</option>
                  <option value="HIGH_POWER_RELAY">HIGH_POWER_RELAY (TITAN/NAUTILUS)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Base Reward: {taskReward}</label>
                <input
                  type="range"
                  min="80"
                  max="250"
                  step="10"
                  value={taskReward}
                  onChange={(e) => setTaskReward(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Urgency Weight: {taskUrgency}</label>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={taskUrgency}
                  onChange={(e) => setTaskUrgency(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Task Description</label>
              <input
                type="text"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                placeholder="Operational description..."
              />
            </div>

            <button
              onClick={handleCreateTask}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deploy Task &amp; Trigger Decentralized Auction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
