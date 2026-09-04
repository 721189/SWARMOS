/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SWARMOS Terrain Elevation & 3D Line-of-Sight (LOS) Relay Manager
 * Displays Digital Elevation Model (DEM) mountain ridges, Fresnel zone clearances,
 * knife-edge diffraction occlusions, and autonomous aerial relay anchor repositioning.
 */

import React from 'react';
import { 
  Mountain, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Layers, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  Signal
} from 'lucide-react';
import { 
  TerrainRidgeEntity, 
  RelayLinkStatus, 
  AgentEntity 
} from '../types';
import { agentCallsignMap } from '../hooks/useSwarmSimulation';

interface TerrainRelayPanelProps {
  ridges: TerrainRidgeEntity[];
  relayLinks: RelayLinkStatus[];
  agents: AgentEntity[];
  isAutonomousRelayActive: boolean;
  onToggleAutonomousRelay: () => void;
  frequencyMhz: number;
}

export const TerrainRelayPanel: React.FC<TerrainRelayPanelProps> = ({
  ridges,
  relayLinks,
  agents,
  isAutonomousRelayActive,
  onToggleAutonomousRelay,
  frequencyMhz,
}) => {
  const blockedCount = relayLinks.filter((l) => l.isDirectLosBlocked).length;
  const relayedCount = relayLinks.filter((l) => l.relayedViaAgentId).length;
  const relayNode = agents.find((a) => a.domain === 'AIR_FIXED_WING');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  3D Terrain Elevation &amp; RF Line-of-Sight (LOS) Bridge
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {frequencyMhz} MHz S-Band
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fresnel zone diffraction modeling &amp; autonomous high-altitude airborne relay orchestration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleAutonomousRelay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isAutonomousRelayActive
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {isAutonomousRelayActive ? 'Autonomous Relay: ACTIVE' : 'Enable Autonomous Relay'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Active Mountain Ridges</span>
            <span className="text-base font-bold text-white mt-0.5 block">{ridges.length} Ridges</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Terrain Occluded Links</span>
            <span className="text-base font-bold text-rose-400 mt-0.5 block">{blockedCount} Links</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Active Relay Bridges</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">{relayedCount} Restored</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400 text-[11px] block">Primary Relay Anchor</span>
            <span className="text-base font-bold text-sky-400 mt-0.5 block">
              {relayNode ? `${relayNode.callsign.split(' ')[0]} (${relayNode.altitudeM}m)` : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Mountain Ridges & Link Clearances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Terrain Ridges */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Digital Elevation Model (DEM) Ridges
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">WGS-84 Elevation</span>
          </div>

          <div className="space-y-2.5">
            {ridges.map((ridge) => (
              <div
                key={ridge.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-amber-500" />
                    {ridge.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Alt: {ridge.elevationM}m MSL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    Dimensions: {ridge.width}m × {ridge.height}m
                  </div>
                  <div>
                    Grid: ({ridge.x}, {ridge.y})
                  </div>
                </div>

                <p className="text-[10px] text-slate-500">
                  Blocks direct RF between ground and low-altitude multirotors below {ridge.elevationM}m. Requires high-altitude relay bridge.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: RF Links & Relay Path Audit */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
              <Signal className="w-4 h-4 text-sky-400" />
              Inter-Node Link Status &amp; Fresnel Clearances
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">60% F1 Zone Criterion</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {relayLinks.map((link) => {
              const src = agents.find((a) => a.id === link.sourceAgentId);
              const tgt = agents.find((a) => a.id === link.targetAgentId);
              const relay = link.relayedViaAgentId
                ? agents.find((a) => a.id === link.relayedViaAgentId)
                : null;

              return (
                <div
                  key={link.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {src?.callsign.split(' ')[0] || link.sourceAgentId} ↔{' '}
                        {tgt?.callsign.split(' ')[0] || link.targetAgentId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({src?.altitudeM}m ↔ {tgt?.altitudeM}m)
                      </span>
                    </div>

                    {link.isDirectLosBlocked ? (
                      link.relayedViaAgentId ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          RELAY ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          LOS OCCLUDED
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        DIRECT LOS OK
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Fresnel Radius: {link.fresnelZoneM}m</span>
                    <span>SNR: <strong className={link.snrDb >= 15 ? 'text-emerald-400' : 'text-rose-400'}>{link.snrDb.toFixed(1)} dB</strong></span>
                    <span>Throughput: {link.throughputMbps.toFixed(1)} Mbps</span>
                  </div>

                  {link.isDirectLosBlocked && link.relayedViaAgentId && relay && (
                    <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1.5">
                      <ArrowUpRight className="w-3 h-3" />
                      Routed via {relay.callsign.split(' ')[0]} high-altitude relay orbit ({relay.altitudeM}m MSL). Full mesh bandwidth restored.
                    </div>
                  )}

                  {link.isDirectLosBlocked && !link.relayedViaAgentId && (
                    <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300">
                      Terrain Ridge {link.blockingRidgeId || 'Sierra'} intercepts line of sight. Link degraded (0.5 Mbps). Enable Autonomous Relay to dispatch airborne bridge.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
