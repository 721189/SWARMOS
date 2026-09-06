import React, { useState } from 'react';
import { ByzantineState, ByzantineAttackType, AgentEntity } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Satellite, 
  Radio, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Activity,
  Sliders,
  Zap
} from 'lucide-react';
import { agentCallsignMap } from '../hooks/useSwarmSimulation';

interface ByzantineDefensePanelProps {
  byzantineState: ByzantineState;
  agents: AgentEntity[];
  onToggleGpsDenied: () => void;
  onInjectAttack: (agentId: string, attack: ByzantineAttackType) => void;
  onRemediate: (agentId: string) => void;
}

export const ByzantineDefensePanel: React.FC<ByzantineDefensePanelProps> = ({
  byzantineState,
  agents,
  onToggleGpsDenied,
  onInjectAttack,
  onRemediate,
}) => {
  const [selectedDroneId, setSelectedDroneId] = useState<string>('A3');
  const [selectedAttackType, setSelectedAttackType] = useState<ByzantineAttackType>('BID_POISON');

  const activeByzantineAgents = Object.entries(byzantineState.byzantineAgents).filter(
    ([, info]: [string, { attack: ByzantineAttackType; status: string }]) => info.attack !== 'NONE' || info.status !== 'TRUSTED'
  );

  const totalDrones = agents.length;
  const compromisedDrones = Object.values(byzantineState.byzantineAgents).filter(
    (info: { status: string }) => info.status === 'QUARANTINED' || info.status === 'EJECTED'
  ).length;
  const honestQuorumPct = ((totalDrones - compromisedDrones) / totalDrones) * 100;
  const isQuorumHealthy = honestQuorumPct >= byzantineState.anomalyThresholdPct;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                GPS-Denied CRL &amp; Consensus Sanity &amp; Node Isolation Validator
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Dynamic Trust &amp; Quarantine Pool
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Electronic warfare defense and fault mitigation. When GNSS is jammed or adversary drones inject anomalous bids and spoofed telemetry, SWARMOS maintains Cooperative Relative Localization (CRL) and automatically isolates anomalous nodes from the consensus pool.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="toggle-gps-denied-btn"
              onClick={onToggleGpsDenied}
              className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 shadow-md transition-all ${
                byzantineState.isGpsDenied
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Satellite className="w-4 h-4" />
              {byzantineState.isGpsDenied ? 'GPS Constellation Denied (UWB Active)' : 'Simulate GPS Jamming Attack'}
            </button>
          </div>
        </div>
      </div>

      {/* Defense Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* GPS vs CRL Mode */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Positioning Mode</div>
            <div className={`text-lg font-bold mt-1 ${byzantineState.isGpsDenied ? 'text-amber-400' : 'text-emerald-400'}`}>
              {byzantineState.isGpsDenied ? 'UWB-CRL Mesh' : 'GNSS Absolute'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              {byzantineState.isGpsDenied ? 'Rel. accuracy: ±0.14m' : 'Standard L1/L2 GPS'}
            </div>
          </div>
          <Radio className={`w-8 h-8 ${byzantineState.isGpsDenied ? 'text-amber-500/30' : 'text-emerald-500/30'}`} />
        </div>

        {/* Byzantine Anomaly Filter */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Anomaly Filter Health</div>
            <div className={`text-lg font-bold font-mono mt-1 ${isQuorumHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
              {honestQuorumPct.toFixed(1)}% Honest
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              Threshold: &gt; {byzantineState.anomalyThresholdPct.toFixed(1)}% (2f+1)
            </div>
          </div>
          <ShieldCheck className="w-8 h-8 text-indigo-500/30" />
        </div>

        {/* Blocked Poison Bids */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Poison Bids Intercepted</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              {byzantineState.blockedPoisonBids} Bids Blocked
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">Physical bound enforcement</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/30" />
        </div>

        {/* Spoofed Vectors Mitigated */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Spoofs Neutralized</div>
            <div className="text-lg font-bold font-mono text-sky-400 mt-1">
              {byzantineState.spoofedVectorsMitigated} Outliers
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">UWB peer trilateration</div>
          </div>
          <Activity className="w-8 h-8 text-sky-500/30" />
        </div>
      </div>

      {/* Main Interaction Split: Adversary Injector & Fleet Trust Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Adversary Attack Injector */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Byzantine Adversary Simulator
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target UAV Platform:</label>
              <select
                id="byzantine-drone-select"
                value={selectedDroneId}
                onChange={(e) => setSelectedDroneId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.id} ({agentCallsignMap[ag.id] || 'DRONE'}) — Trust: {byzantineState.byzantineAgents[ag.id]?.trustScore ?? 100}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Hostile Vector / Attack Vector:</label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 cursor-pointer">
                  <input
                    type="radio"
                    name="attackType"
                    checked={selectedAttackType === 'BID_POISON'}
                    onChange={() => setSelectedAttackType('BID_POISON')}
                    className="mt-0.5 text-sky-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Consensus Bid Poisoning (Sybil Attack)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Rogue drone submits astronomical $9999 bids on all tasks without executing, attempting to starve the fleet.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 cursor-pointer">
                  <input
                    type="radio"
                    name="attackType"
                    checked={selectedAttackType === 'TELEMETRY_SPOOF'}
                    onChange={() => setSelectedAttackType('TELEMETRY_SPOOF')}
                    className="mt-0.5 text-sky-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Kinematic Telemetry Spoofing</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Rogue drone broadcasts false position coordinates violating physical kinematics and UWB peer trilateration.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                id="inject-byzantine-btn"
                onClick={() => onInjectAttack(selectedDroneId, selectedAttackType)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Inject Attack into {selectedDroneId}
              </button>

              <button
                onClick={() => onRemediate(selectedDroneId)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scrub
              </button>
            </div>
          </div>

          {/* Theoretical Validation Box */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 font-mono text-xs flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Consensus Sanity &amp; Isolation Principles:
            </div>
            <p className="leading-relaxed">
              In an ad-hoc swarm mesh, the Consensus Sanity &amp; Isolation Validator enforces strict bid bounds (<span className="text-slate-200 font-mono">y_k ≤ 1.25 · R_0</span>) and kinematic consistency (<span className="text-slate-200 font-mono">Δx/Δt ≤ v_max</span>). Nodes violating physical constraints are automatically penalized and quarantined from consensus voting.
            </p>
          </div>
        </div>

        {/* Right: Fleet Trust Scores & Quorum Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Decentralized Node Trust Matrix
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Active Nodes: <span className="text-emerald-400 font-bold">{totalDrones - compromisedDrones}</span> / {totalDrones}
              </span>
            </div>

            <div className="space-y-3">
              {agents.map((ag) => {
                const info = byzantineState.byzantineAgents[ag.id] || {
                  attack: 'NONE',
                  trustScore: 100,
                  status: 'TRUSTED',
                  violations: [],
                };
                const callsign = agentCallsignMap[ag.id] || ag.id;
                const isCompromised = info.status === 'QUARANTINED' || info.status === 'EJECTED';
                const isSuspect = info.status === 'SUSPECT';

                return (
                  <div
                    key={ag.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCompromised
                        ? 'bg-red-950/20 border-red-500/40'
                        : isSuspect
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {isCompromised ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : isSuspect ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        <div>
                          <span className="font-mono font-bold text-xs text-slate-200">{ag.id}</span>
                          <span className="text-[11px] font-mono text-slate-400 ml-2">({callsign})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            isCompromised
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : isSuspect
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {info.status}
                        </span>

                        {isCompromised && (
                          <button
                            onClick={() => onRemediate(ag.id)}
                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded"
                          >
                            Scrub
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Trust Score Bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            info.trustScore > 70
                              ? 'bg-emerald-500'
                              : info.trustScore > 35
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${info.trustScore}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 w-12 text-right">
                        {info.trustScore}%
                      </span>
                    </div>

                    {/* Violations Log if any */}
                    {info.violations.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] font-mono text-red-300/80">
                        Violation: {info.violations[info.violations.length - 1]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Security Info */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Byzantine Mode: Real-time Auction Validator Active</span>
            <span className="text-indigo-400">anomaly-aware Ephemeral Mesh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
