import React from 'react';
import { ExplainTaskData } from '../types';
import { X, CheckCircle2, AlertTriangle, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';

interface ExplainModalProps {
  data: ExplainTaskData | null;
  onClose: () => void;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        id="explain-modal-card"
        className="bg-slate-900 border border-sky-500/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">
                  CBBA CONSENSUS AUDIT
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Task ID: <strong className="text-amber-400">{data.taskId}</strong> ({data.taskType})
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Why was this task awarded to {data.winnerAgentId ? `Drone ${data.winnerAgentId}` : 'No Agent'}?
              </h2>
            </div>
          </div>
          <button 
            id="close-explain-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Natural Language Narrative */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Algorithmic Justification
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {data.explanation}
            </p>
          </div>

          {/* Mathematical Formulation Reference */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
              CBBA Marginal Score Objective Function:
            </div>
            <div className="bg-slate-900 px-3 py-2 rounded text-emerald-400 font-bold overflow-x-auto">
              c_ij = BaseReward * (λ ^ (arrival_time * urgency_weight)) - path_insertion_cost
            </div>
            <div className="text-slate-400 text-[11px] leading-relaxed">
              Where λ = 0.95 (temporal discounting), arrival_time = distance / (speed * propulsion_health),
              and winning agent is chosen by highest bid c_ij over 1-hop wireless mesh consensus.
            </div>
          </div>

          {/* Bidding Matrix Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Multi-Agent Bid Ranking Matrix
              </h3>
              <span className="text-[11px] text-slate-400">
                Sorted by highest marginal bid score
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                    <th className="py-2.5 px-3">Agent</th>
                    <th className="py-2.5 px-3">Distance (m)</th>
                    <th className="py-2.5 px-3">Est. Arrival</th>
                    <th className="py-2.5 px-3">Marginal Bid</th>
                    <th className="py-2.5 px-3">Capacity</th>
                    <th className="py-2.5 px-3">Consensus Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.biddingMatrix.map((bid, idx) => (
                    <tr 
                      key={bid.agentId}
                      className={bid.isWinner ? 'bg-sky-500/10 font-semibold' : 'hover:bg-slate-800/30 text-slate-300'}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${bid.isWinner ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span className={bid.isWinner ? 'text-sky-300 font-bold' : ''}>{bid.agentId}</span>
                      </td>
                      <td className="py-2.5 px-3">{bid.distanceM}m</td>
                      <td className="py-2.5 px-3">{bid.estArrivalSec}s</td>
                      <td className="py-2.5 px-3 text-amber-300 font-bold">{bid.marginalBid.toFixed(1)} pts</td>
                      <td className="py-2.5 px-3 text-slate-400">{bid.capacityLeft} slots</td>
                      <td className="py-2.5 px-3">
                        {bid.isWinner ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            AWARDED
                          </span>
                        ) : bid.reason ? (
                          <span className="text-red-400/80 text-[11px]">{bid.reason}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">OUTBID (-{(data.biddingMatrix[0].marginalBid - bid.marginalBid).toFixed(1)})</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Decentralized consensus convergence in polynomial rounds
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
