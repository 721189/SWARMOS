/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SWARMOS Consensus Step-Debugger & Choi 2009 Rule Inspector
 * Displays the 18-rule Choi et al. (2009) CBBA decision matrix,
 * live Y-matrix (bids), Z-matrix (winners), and packet loss injection.
 */

import React, { useState } from 'react';
import { 
  AgentEntity, 
  TaskEntity, 
  CbbaStepState, 
  ChoiRuleLog 
} from '../types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Table, 
  HelpCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { agentCallsignMap } from '../hooks/useSwarmSimulation';

interface CbbaDebuggerPanelProps {
  agents: AgentEntity[];
  tasks: TaskEntity[];
  cbbaStepState: CbbaStepState;
  onToggleStepMode: () => void;
  onStepAuction: (phase: 'PHASE_1_BUNDLE' | 'PHASE_2_CONSENSUS') => void;
  onResetAuction: () => void;
  onSetDropRate: (ratePct: number) => void;
}

export const CbbaDebuggerPanel: React.FC<CbbaDebuggerPanelProps> = ({
  agents,
  tasks,
  cbbaStepState,
  onToggleStepMode,
  onStepAuction,
  onResetAuction,
  onSetDropRate,
}) => {
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = cbbaStepState.recentDecisions.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  return (
    <div className="space-y-6">
      {/* Header & Control Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  CBBA Consensus Packet-by-Packet Inspector
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Choi et al. (2009) IEEE T-RO
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Deterministic tick-by-tick micro-auction debugger &amp; 18-rule conflict resolution matrix
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onToggleStepMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                cbbaStepState.isStepMode
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {cbbaStepState.isStepMode ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Step Mode: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Continuous Mode</span>
                </>
              )}
            </button>

            <button
              disabled={!cbbaStepState.isStepMode}
              onClick={() => onStepAuction('PHASE_1_BUNDLE')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Step 1: Greedy Bundle</span>
            </button>

            <button
              disabled={!cbbaStepState.isStepMode}
              onClick={() => onStepAuction('PHASE_2_CONSENSUS')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Step 2: Gossip Consensus</span>
            </button>

            <button
              onClick={onResetAuction}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-Auction</span>
            </button>

            <button
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>18 Rules</span>
            </button>
          </div>
        </div>

        {/* State Banner & Packet Drop Slider */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">
              Iteration: <strong className="text-white">{cbbaStepState.currentIteration}</strong>
            </span>
            <span className="text-slate-400">
              Phase:{' '}
              <strong className={cbbaStepState.isConverged ? 'text-emerald-400' : 'text-sky-400'}>
                {cbbaStepState.currentPhase}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              Status:{' '}
              {cbbaStepState.isConverged ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CONVERGED
                </span>
              ) : (
                <span className="text-amber-400 font-bold animate-pulse">SOLVING CONFLICTS...</span>
              )}
            </span>
          </div>

          {/* Lossy Radio Drop Rate */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <WifiOff className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-mono whitespace-nowrap">
              Gossip Packet Loss: <strong>{cbbaStepState.packetDropRatePct}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={cbbaStepState.packetDropRatePct}
              onChange={(e) => onSetDropRate(Number(e.target.value))}
              className="w-32 accent-sky-500 cursor-pointer"
            />
            {cbbaStepState.droppedPacketsCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                {cbbaStepState.droppedPacketsCount} dropped
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Choi 2009 Rule Reference Card */}
      {showCheatSheet && (
        <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/30 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Choi et al. (2009) IEEE T-RO CBBA Decision Table Summary
            </h3>
            <span className="text-[11px] text-slate-400">Receiver $i$, Sender $k$, Task $j$</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-sky-400 font-bold">Rule 1 - 8 (Agreement & Third-Party)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                If receiver had null winner, adopt sender. If both agree on winner m, compare timestamps: update if sender is fresher (s_km &gt; s_im), else leave.
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-emerald-400 font-bold">Rule 9 - 13 (Direct Bid Competition)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Receiver $i$ won vs sender $k$. If sender bid $y_k &gt; y_i$, concede ownership (<strong>UPDATE</strong>). If $y_i \ge y_k$, defend claim (<strong>LEAVE</strong>).
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-rose-400 font-bold">Rule 14 - 18 (Vacation & Outdated Resets)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                If sender abandoned task or newer timestamp proves local state is invalid, release task (<strong>RESET</strong>) to trigger immediate re-auction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Live Y-Matrix & Z-Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Y-Matrix: Winning Bids */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Y-Matrix: Winning Bids ($y_i(j)$)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Higher bid wins</span>
          </div>
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-1.5 px-2">Agent</th>
                {tasks.map((t) => (
                  <th key={t.id} className="py-1.5 px-2 text-center text-sky-400">
                    {t.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((ag) => (
                <tr key={ag.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <td className="py-1.5 px-2 font-bold text-slate-200">
                    {ag.id} <span className="text-[10px] text-slate-500 font-normal">({ag.domain.split('_')[1] || ag.domain})</span>
                  </td>
                  {tasks.map((t) => {
                    const bid = ag.winningBids[t.id] || 0;
                    const isWinner = ag.winningAgents[t.id] === ag.id;
                    return (
                      <td
                        key={t.id}
                        className={`py-1.5 px-2 text-center ${
                          isWinner ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {bid > 0 ? bid.toFixed(1) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Z-Matrix: Winning Agents */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Z-Matrix: Winning Agents ($z_i(j)$)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Consensus on owner</span>
          </div>
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-1.5 px-2">Agent</th>
                {tasks.map((t) => (
                  <th key={t.id} className="py-1.5 px-2 text-center text-emerald-400">
                    {t.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((ag) => (
                <tr key={ag.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <td className="py-1.5 px-2 font-bold text-slate-200">{ag.id}</td>
                  {tasks.map((t) => {
                    const winner = ag.winningAgents[t.id];
                    const isSelf = winner === ag.id;
                    return (
                      <td
                        key={t.id}
                        className={`py-1.5 px-2 text-center ${
                          isSelf
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : winner
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {winner || '∅'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Log: Choi 2009 Execution Trace */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Consensus Conflict Resolution Audit Trail ({filteredLogs.length} events)
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono">
            {['ALL', 'UPDATE', 'LEAVE', 'RESET'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filterAction === act
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No conflict events recorded in current window. Click &quot;Step 2: Gossip Consensus&quot; or trigger a re-auction.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const isUpdate = log.action === 'UPDATE';
              const isReset = log.action === 'RESET';
              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isUpdate
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : isReset
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Rule #{log.ruleNumber}
                    </span>
                    <span className="text-white font-bold">{log.taskId}</span>
                    <span className="text-slate-400 text-[11px]">
                      Rx: <strong className="text-slate-200">{log.receiverId}</strong> ← Tx:{' '}
                      <strong className="text-slate-200">{log.senderId}</strong>
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex-1 md:text-right">
                    {log.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
