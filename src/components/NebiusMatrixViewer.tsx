import React, { useState, useEffect } from 'react';
import { Box, Play, CheckCircle, Clock, Cpu, BarChart2, Zap, Server, ShieldCheck, FileText, RefreshCw, AlertCircle } from 'lucide-react';

interface SweepRow {
  fleet_size: number;
  task_count: number;
  algorithm: string;
  failure_mode: string;
  communication_range: number;
  packet_loss: number;
  mission_completion: number;
  completion_std?: number;
  ci_95?: number;
  mean_convergence_ms: number;
  mean_replan_latency: number;
  fleet_survival_pct: number;
  packets_generated_mean?: number;
  packets_delivered_mean?: number;
  packets_dropped_mean?: number;
  observed_packet_loss_pct?: number;
  trials: number;
}

export const NebiusMatrixViewer: React.FC = () => {
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [sweepData, setSweepData] = useState<{
    experiment_id?: string;
    timestamp?: string;
    total_trials?: number;
    benchmark_mode?: string;
    matrix_results?: SweepRow[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterAlgorithm, setFilterAlgorithm] = useState<string>('ALL');

  const fetchInitialResults = async () => {
    try {
      const res = await fetch('/api/experiments/ablation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        // Now trigger run to get full table if available
        const runRes = await fetch('/api/experiments/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reduced: true })
        });
        if (runRes.ok) {
          const runData = await runRes.json();
          setSweepData(runData);
        }
      }
    } catch (err) {
      console.warn("Initial sweep fetch not yet ready:", err);
    }
  };

  useEffect(() => {
    fetchInitialResults();
  }, []);

  const handleRunSweep = async (reduced: boolean = true) => {
    setIsRunningSweep(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/experiments/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reduced })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      setSweepData(data);
    } catch (err: any) {
      console.error("Experiment sweep failed:", err);
      setErrorMessage(err.message || "Failed to execute experiment matrix on simulation cluster.");
    } finally {
      setIsRunningSweep(false);
    }
  };

  const displayedRows = (sweepData?.matrix_results || []).filter((r: SweepRow) => 
    filterAlgorithm === 'ALL' || r.algorithm === filterAlgorithm
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Box className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
              Autonomous Swarm Evaluation Suite &amp; Empirical Matrix Sweep
            </span>
          </div>
          <h2 className="text-base font-bold text-white">
            Distributed Swarm Monte Carlo Evaluation Cluster
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Programmatic Cartesian product sweeps across fleet scales, jamming intensities, packet drop rates, and multi-trial statistical confidence bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="run-reduced-sweep-btn"
            onClick={() => handleRunSweep(true)}
            disabled={isRunningSweep}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunningSweep ? 'Executing Sweep...' : 'Run Reduced Benchmark'}
          </button>
          <button
            id="run-full-sweep-btn"
            onClick={() => handleRunSweep(false)}
            disabled={isRunningSweep}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningSweep ? 'animate-spin' : ''}`} />
            Run Full Matrix Sweep
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {sweepData && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Experiment Completed! ID: <strong className="text-white">{sweepData.experiment_id}</strong></span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span>Mode: <strong className="text-purple-300 uppercase">{sweepData.benchmark_mode || 'Empirical Sweep'}</strong></span>
            <span>Total Measured Rows: <strong className="text-sky-400">{sweepData.matrix_results?.length || 0}</strong></span>
            <span>Trials Aggregated: <strong className="text-emerald-400">{sweepData.total_trials}</strong></span>
          </div>
        </div>
      )}

      {/* Cluster Node Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-slate-500 text-[10px] uppercase">Engine Profile</div>
          <div className="text-slate-200 font-bold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-400" />
            Canonical Python Swarm Simulator
          </div>
          <div className="text-slate-400 text-[11px]">Kinematic Integration &amp; RF Mesh Accounting</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-slate-500 text-[10px] uppercase">Execution Protocol</div>
          <div className="text-slate-200 font-bold flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-400" />
            POST /api/experiments/run
          </div>
          <div className="text-slate-400 text-[11px]">Subprocess positional arguments (safe exec)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-slate-500 text-[10px] uppercase">Statistical Rigor</div>
          <div className="text-slate-200 font-bold flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-400" />
            Measured Confidence Intervals
          </div>
          <div className="text-slate-400 text-[11px]">Mean, StdDev &amp; 95% CI on completion rates</div>
        </div>
      </div>

      {/* Results Benchmark Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            Empirical Measured Results Table
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Algorithm:</span>
            <select
              value={filterAlgorithm}
              onChange={(e) => setFilterAlgorithm(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-sky-300 text-xs rounded px-2.5 py-1 font-mono outline-none"
            >
              <option value="ALL">All Algorithms</option>
              <option value="Static">Static</option>
              <option value="Greedy">Greedy</option>
              <option value="CBBA_Standard">CBBA_Standard</option>
              <option value="CBBA_Recovery">CBBA_Recovery</option>
              <option value="SWARMOS">SWARMOS</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950 font-mono text-xs">
          {displayedRows.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-slate-600" />
              <span>No benchmark data loaded yet. Click "Run Reduced Benchmark" or "Run Full Matrix Sweep" above.</span>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Fleet / Tasks</th>
                  <th className="py-2.5 px-3">Scenario</th>
                  <th className="py-2.5 px-3">Comm / Loss</th>
                  <th className="py-2.5 px-3">Convergence</th>
                  <th className="py-2.5 px-3">Replan Latency</th>
                  <th className="py-2.5 px-3">Completion (Mean ± Std)</th>
                  <th className="py-2.5 px-3">Packets (Deliv / Gen)</th>
                  <th className="py-2.5 px-3">Survival</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {displayedRows.map((row: SweepRow, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        row.algorithm === 'SWARMOS' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                        row.algorithm === 'CBBA_Recovery' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        row.algorithm === 'CBBA_Standard' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        row.algorithm === 'Greedy' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {row.algorithm}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-sky-300">{row.fleet_size} UAVs / {row.task_count} Tasks</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.failure_mode}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row.communication_range}m | {(row.packet_loss * 100).toFixed(0)}% loss</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{row.mean_convergence_ms.toFixed(1)} ms</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.mean_replan_latency.toFixed(1)} ms</td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">
                      {row.mission_completion.toFixed(1)}% {row.completion_std !== undefined ? `(±${row.completion_std.toFixed(1)}%)` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {row.packets_delivered_mean !== undefined ? `${row.packets_delivered_mean} / ${row.packets_generated_mean}` : 'Recorded'}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300 font-semibold">{row.fleet_survival_pct.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
