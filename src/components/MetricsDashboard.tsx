import React from 'react';
import { TelemetryKpis, AgentEntity } from '../types';
import { Activity, ShieldCheck, Zap, Radio, CheckCircle, Terminal, AlertOctagon } from 'lucide-react';

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
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Task Completion</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {kpis.taskCompletionPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({kpis.completedTasks}/{kpis.totalTasks} Done)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Consensus Time</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-sky-400">
              {kpis.avgConsensusMs.toFixed(1)} <span className="text-xs font-normal">ms</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Fast Convergence</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fleet Survival</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono ${
              kpis.operationalFleetPct < 80 ? 'text-red-400' : 'text-amber-400'
            }`}>
              {kpis.operationalFleetPct.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {agents.filter(a => a.health.propulsion > 0.1).length}/{agents.length} Operational
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Resilience Factor</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-purple-400">
              {kpis.resilienceFactorPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Fault Recovery</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Mesh Data Packets</span>
            <Radio className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-200">
              {kpis.totalMeshPackets}
            </span>
            <span className="text-[10px] text-sky-400 font-mono">1-Hop P2P</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Fleet Battery</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-300">
              {kpis.avgBatteryPct.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Nominal</span>
          </div>
        </div>
      </div>

      {/* Fleet Roster Status Cards */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Tactical Fleet Roster &amp; Subsystems
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {agents.map((agent) => {
            const isFailed = agent.status === 'FAILED' || agent.health.propulsion <= 0.1;
            const isJammed = agent.status === 'JAMMED' || agent.health.comms < 0.3;
            return (
              <div
                key={agent.id}
                className={`p-2 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                  isFailed
                    ? 'bg-red-950/30 border-red-500/40 text-red-300'
                    : isJammed
                    ? 'bg-purple-950/30 border-purple-500/40 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{agent.id}</span>
                  <span className={`text-[10px] px-1 rounded ${
                    isFailed ? 'bg-red-500/20 text-red-400' : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {agent.health.battery.toFixed(0)}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Tasks: {agent.bundle.length > 0 ? agent.bundle.join(',') : 'None'}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase">
                  {isFailed ? 'DESTROYED' : isJammed ? 'JAMMED' : agent.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Telemetry Console Log */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            Live Tactical Telemetry Stream
          </span>
          <span className="text-[10px] font-mono text-slate-500">Auto-scrolling</span>
        </div>
        <div className="h-28 overflow-y-auto rounded-lg bg-slate-950 border border-slate-800/80 p-2.5 font-mono text-[11px] space-y-1">
          {eventLogs.map((log, idx) => {
            const isAlert = log.includes('FAILURE') || log.includes('DESTROYED') || log.includes('lost');
            const isSuccess = log.includes('completed') || log.includes('converged') || log.includes('re-auction');
            return (
              <div
                key={idx}
                className={`leading-relaxed ${
                  isAlert ? 'text-red-400' : isSuccess ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                <span className="text-slate-600 mr-2">[{idx + 1}]</span>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
