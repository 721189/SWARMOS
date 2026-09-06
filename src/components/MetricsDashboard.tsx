import React from 'react';
import { TelemetryKpis, AgentEntity } from '../types';
import { Activity, ShieldCheck, Radio, CheckCircle, Terminal, Zap, Skull, Flame, RefreshCw } from 'lucide-react';

interface MetricsDashboardProps {
  kpis: TelemetryKpis;
  agents: AgentEntity[];
  eventLogs: string[];
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  kpis,
  agents,
  eventLogs,
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
            <span>Mission Readiness</span>
            <CheckCircle className="w-4 h-4 text-emerald-500/40" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-emerald-400">
              {kpis.taskCompletionPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider">
            {kpis.completedTasks} / {kpis.totalTasks} Operational Tasks Completed
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
            <span>Consensus Latency</span>
            <Activity className="w-4 h-4 text-sky-500/40" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-sky-400">
              {kpis.avgConsensusMs.toFixed(1)} <span className="text-sm font-bold opacity-60">ms</span>
            </span>
          </div>
          <div className="mt-1 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider">
            Deterministic Convergent Matrix
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
            <span>Fleet Survivability</span>
            <ShieldCheck className="w-4 h-4 text-amber-500/40" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-display ${
              kpis.operationalFleetPct < 80 ? 'text-red-400' : 'text-amber-400'
            }`}>
              {kpis.operationalFleetPct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider">
            {agents.filter(a => a.health.propulsion > 0.1).length} / {agents.length} Healthy Nodes
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
            <span>Resilience Factor</span>
            <Zap className="w-4 h-4 text-purple-500/40" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-purple-400">
              {kpis.resilienceFactorPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider">
            Fault Recovery Index
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
            <span>Mesh Throughput</span>
            <Radio className="w-4 h-4 text-sky-500/40" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-slate-200">
              {kpis.totalMeshPackets}
            </span>
          </div>
          <div className="mt-1 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider">
            P2P Packets / SDR-Mesh
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
            <span>Aggregate Battery</span>
            <Zap className="w-4 h-4 text-emerald-500/40" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-emerald-400">
              {kpis.avgBatteryPct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider">
            Fleet Power Reserve
          </div>
        </div>
      </div>

      {/* Fleet Roster Status Cards */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-sm">
        <h3 className="text-[10px] font-extrabold text-white uppercase tracking-[0.2em] mb-5 font-display">
          Strategic Asset Status Matrix
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {agents.map((agent) => {
            const isFailed = agent.status === 'FAILED' || agent.health.propulsion <= 0.1;
            const isJammed = agent.status === 'JAMMED' || (agent.health.comms_transceiver ?? agent.health.comms ?? 1.0) < 0.3;
            return (
              <div
                key={agent.id}
                className={`p-3 rounded-xl border text-[10px] font-mono flex flex-col justify-between transition-all ${
                  isFailed
                    ? 'bg-red-950/20 border-red-500/30 text-red-400'
                    : isJammed
                    ? 'bg-purple-950/20 border-purple-500/30 text-purple-400'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-200 tracking-wider font-display">{agent.id}</span>
                  <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                    isFailed ? 'bg-red-500/10 text-red-500' : 'bg-sky-500/10 text-sky-500'
                  }`}>
                    {agent.health.battery.toFixed(0)}%
                  </span>
                </div>
                <div className="text-[9px] text-slate-500 truncate font-bold mb-1">
                  SYS: {agent.bundle.length > 0 ? agent.bundle.join(',') : 'IDLE'}
                </div>
                <div className={`mt-1 font-extrabold uppercase tracking-widest ${
                  isFailed ? 'text-red-500' : isJammed ? 'text-purple-500' : 'text-emerald-500/60'
                }`}>
                  {isFailed ? 'KINETIC_FAIL' : isJammed ? 'RF_JAM' : agent.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Telemetry Console Log */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-[10px] font-extrabold text-white uppercase tracking-[0.2em] font-display">
          <span className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-sky-500/60" />
            Tactical Telemetry Stream
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Live Buffer</span>
        </div>
        <div className="h-32 overflow-y-auto rounded-xl bg-slate-950/40 border border-slate-800/40 p-4 font-mono text-[10px] space-y-2 custom-scrollbar">
          {eventLogs.map((log, idx) => {
            const isAlert = log.includes('FAILURE') || log.includes('DESTROYED') || log.includes('lost');
            const isSuccess = log.includes('completed') || log.includes('converged') || log.includes('re-auction');
            return (
              <div
                key={idx}
                className={`leading-relaxed flex gap-3 ${
                  isAlert ? 'text-red-400' : isSuccess ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                <span className="text-slate-800 font-bold shrink-0">[{idx + 1}]</span>
                <span className="font-medium">{log}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
