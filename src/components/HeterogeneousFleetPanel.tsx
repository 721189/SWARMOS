import React, { useState } from 'react';
import { AgentEntity, TaskEntity, PayloadCapability, AgentDomain } from '../types';
import { 
  Plane, 
  Car, 
  Ship, 
  Crosshair, 
  BatteryCharging, 
  Radio, 
  Eye, 
  Boxes, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Compass, 
  ArrowUpRight,
  Gauge,
  Sparkles
} from 'lucide-react';

interface HeterogeneousFleetPanelProps {
  agents: AgentEntity[];
  tasks: TaskEntity[];
  onDockAgentToUgv: (agentId: string, ugvId: string) => void;
  onSelectAgent?: (id: string) => void;
}

const payloadDefinitions: Record<PayloadCapability, { name: string; desc: string; icon: React.ReactNode; color: string }> = {
  FLIR_THERMAL: {
    name: 'FLIR LWIR Thermal',
    desc: 'Long-wave infrared sensor for optical/night thermal signatures',
    icon: <Eye className="w-3.5 h-3.5 text-rose-400" />,
    color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  },
  SIGINT_DIRECTION_FINDER: {
    name: 'SIGINT RF Direction Finder',
    desc: 'RF spectrum sensor for hostile emitter & radar localization',
    icon: <Radio className="w-3.5 h-3.5 text-purple-400" />,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  },
  LIDAR_3D: {
    name: '3D Point-Cloud Lidar',
    desc: 'High-density laser scanner for topographic choke-point mapping',
    icon: <Compass className="w-3.5 h-3.5 text-cyan-400" />,
    color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  },
  HEAVY_CARGO: {
    name: 'Heavy Drop Munition / Cargo',
    desc: 'Pneumatic 15kg tactical cargo release bay',
    icon: <Boxes className="w-3.5 h-3.5 text-amber-400" />,
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  MOBILE_RECHARGE_BAY: {
    name: 'Mobile Inductive Recharge Bay',
    desc: 'Dual landing pads providing 500W wireless DC charging to UAVs',
    icon: <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  HIGH_POWER_RELAY: {
    name: 'High-Power SDR Relay',
    desc: 'Directional beamforming RF amplifier (+6.5 dBi antenna array)',
    icon: <Zap className="w-3.5 h-3.5 text-sky-400" />,
    color: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  },
};

const domainIcons: Record<AgentDomain, { icon: React.ReactNode; label: string; color: string }> = {
  AIR_FIXED_WING: {
    icon: <Plane className="w-4 h-4 text-sky-400" />,
    label: 'Air Fixed-Wing (High-Endurance Scout)',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  },
  AIR_MULTIROTOR: {
    icon: <Crosshair className="w-4 h-4 text-emerald-400" />,
    label: 'Air Multirotor (Loiter / Precision Hover)',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  GROUND_UGV: {
    icon: <Car className="w-4 h-4 text-amber-400" />,
    label: 'Ground UGV (Mobile Hub & Heavy Cell)',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  SURFACE_USV: {
    icon: <Ship className="w-4 h-4 text-indigo-400" />,
    label: 'Surface USV (Maritime Relay & SIGINT)',
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  },
};

export const HeterogeneousFleetPanel: React.FC<HeterogeneousFleetPanelProps> = ({
  agents,
  tasks,
  onDockAgentToUgv,
  onSelectAgent,
}) => {
  const [selectedDroneToDock, setSelectedDroneToDock] = useState<string>('A2');

  const ugvHub = agents.find((a) => a.domain === 'GROUND_UGV' && a.isRechargeHub) || agents.find((a) => a.id === 'A5');
  const multirotors = agents.filter((a) => a.domain === 'AIR_MULTIROTOR');

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                MUM-T Heterogeneous Multi-Domain Fleet
              </h2>
              <p className="text-xs text-slate-400">
                Air Fixed-Wing + Multirotor Loiterers + Ground UGV Mobile Hub + Maritime Surface USV
              </p>
            </div>
          </div>
        </div>

        {/* Quick Fleet Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400">Air Vehicles:</span>{' '}
            <strong className="text-sky-400">
              {agents.filter((a) => a.domain === 'AIR_FIXED_WING' || a.domain === 'AIR_MULTIROTOR').length}
            </strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400">Ground UGVs:</span>{' '}
            <strong className="text-amber-400">
              {agents.filter((a) => a.domain === 'GROUND_UGV').length}
            </strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400">Surface USVs:</span>{' '}
            <strong className="text-indigo-400">
              {agents.filter((a) => a.domain === 'SURFACE_USV').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Fleet Roster & MUM-T Mobile Recharging */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Heterogeneous Fleet Roster */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-sky-400" />
              Active Heterogeneous Fleet Roster
            </h3>
            <span className="text-[11px] text-slate-400">6 Platforms Configured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const domainMeta = domainIcons[agent.domain];
              const isRecharging = agent.status === 'RECHARGING';

              return (
                <div
                  key={agent.id}
                  onClick={() => onSelectAgent && onSelectAgent(agent.id)}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header: Callsign & Domain Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{agent.callsign}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {agent.id}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${domainMeta.color}`}>
                        {domainMeta.icon}
                        {agent.domain.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Telemetry specs: Altitude, Speed, Energy */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">ALTITUDE</span>
                        <span className="text-slate-200 font-bold">{agent.altitudeM} m</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">CRUISE SPEED</span>
                        <span className="text-slate-200 font-bold">{agent.speed} m/s</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">BATTERY CELL</span>
                        <span className={`font-bold ${agent.health.battery < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {agent.health.battery.toFixed(0)}% ({agent.batteryCapacityWh}Wh)
                        </span>
                      </div>
                    </div>

                    {/* Installed Payload Hardware */}
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider">
                        Installed Payload Matrix:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.payloads.map((pl) => {
                          const meta = payloadDefinitions[pl];
                          return (
                            <span
                              key={pl}
                              className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${meta.color}`}
                            >
                              {meta.icon}
                              <span>{meta.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Task: <strong className="text-sky-300">{agent.currentTaskId || 'IDLE'}</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRecharging
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : agent.status === 'EXECUTING'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: MUM-T Mobile Recharge Commander */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BatteryCharging className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">MUM-T Mobile Recharge Bay</h3>
                <p className="text-[11px] text-slate-400">UGV-to-UAV Autonomous Inductive Docking</p>
              </div>
            </div>

            {ugvHub ? (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mobile Hub:</span>
                  <strong className="text-amber-400 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    {ugvHub.callsign}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hub Battery Capacity:</span>
                  <strong className="text-emerald-400">{ugvHub.batteryCapacityWh} Wh</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Charging Bays:</span>
                  <strong className="text-sky-300">2x Dual 500W Wireless Induction</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-slate-300">
                    X:{ugvHub.position[0].toFixed(0)}m Y:{ugvHub.position[1].toFixed(0)}m
                  </span>
                </div>
              </div>
            ) : null}

            {/* Drone Dispatch to UGV */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block font-medium">
                Dispatch Drone to UGV Dock:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedDroneToDock}
                  onChange={(e) => setSelectedDroneToDock(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {multirotors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.callsign} ({m.health.battery.toFixed(0)}% Battery)
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    if (ugvHub) onDockAgentToUgv(selectedDroneToDock, ugvHub.id);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <BatteryCharging className="w-3.5 h-3.5" />
                  Dock &amp; Recharge
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                When dispatched, multirotor vectors directly to TITAN-01 and enters wireless inductive recharge (+50% / min) until fully replenished.
              </p>
            </div>
          </div>

          {/* Constraint Satisfaction CBBA Explanation */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Constraint-Satisfaction CBBA</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard CBBA calculates bids purely on arrival time. SWARMOS enforces hard constraints: if a task demands <code className="text-rose-300">FLIR_THERMAL</code> or <code className="text-amber-300">HEAVY_CARGO</code>, bids from non-equipped platforms evaluate to <code className="text-red-400 font-mono">-∞</code>, ensuring zero mission failure.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Payload Capability Matrix Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Role-Based Payload Capability Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Hardware sensor &amp; payload compatibility mapped to autonomous task allocation
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">
            IEEE MIL-STD-CBBA Validated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Platform</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3 text-center">FLIR Thermal</th>
                <th className="py-2.5 px-3 text-center">SIGINT RF</th>
                <th className="py-2.5 px-3 text-center">3D Lidar</th>
                <th className="py-2.5 px-3 text-center">Heavy Cargo</th>
                <th className="py-2.5 px-3 text-center">Recharge Bay</th>
                <th className="py-2.5 px-3 text-center">High Relay</th>
                <th className="py-2.5 px-3">Assigned Task</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {agents.map((agent) => {
                const hasFLIR = agent.payloads.includes('FLIR_THERMAL');
                const hasSIGINT = agent.payloads.includes('SIGINT_DIRECTION_FINDER');
                const hasLidar = agent.payloads.includes('LIDAR_3D');
                const hasCargo = agent.payloads.includes('HEAVY_CARGO');
                const hasRecharge = agent.payloads.includes('MOBILE_RECHARGE_BAY');
                const hasRelay = agent.payloads.includes('HIGH_POWER_RELAY');

                return (
                  <tr key={agent.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                      {domainIcons[agent.domain].icon}
                      {agent.callsign}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[10px]">
                      {agent.domain.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {hasFLIR ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {hasSIGINT ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {hasLidar ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {hasCargo ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {hasRecharge ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {hasRelay ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2 px-3">
                      {agent.currentTaskId ? (
                        <span className="text-sky-300 font-bold flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          {agent.currentTaskId}
                        </span>
                      ) : (
                        <span className="text-slate-500">None (Patrol)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
