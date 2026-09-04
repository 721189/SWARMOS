import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  XCircle,
  Clock,
  Wifi,
  Radio,
  Layers,
  Send
} from 'lucide-react';

interface BaselineVariant {
  variant: string;
  configurations?: number;
  trials: number;
  metrics: {
    mission_completion: { mean: number; std: number; ci_95: number };
    replan_latency_seconds: number;
    consensus_time_ms: number;
    fleet_survival_pct: number;
    packets_generated_mean?: number;
    packets_delivered_mean?: number;
    packets_dropped_mean?: number;
    observed_packet_loss_pct?: number;
  };
}

export const BenchmarkSuite: React.FC = () => {
  const [testScenario, setTestScenario] = useState<'nominal' | 'mild_attrition' | 'electronic_warfare_dense' | 'catastrophic_stress'>('electronic_warfare_dense');
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [variants, setVariants] = useState<BaselineVariant[]>([]);
  const [benchmarkMode, setBenchmarkMode] = useState<string>('empirical_matrix');

  const fetchAblationResults = async () => {
    setIsRunningTest(true);
    try {
      const res = await fetch('/api/experiments/ablation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: testScenario })
      });
      const data = await res.json();
      if (data && data.variants) {
        setVariants(data.variants);
        if (data.benchmark_mode) setBenchmarkMode(data.benchmark_mode);
      }
    } catch (err) {
      console.error("Experiment ablation fetch error:", err);
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    fetchAblationResults();
  }, [testScenario]);

  const handleRunStressTest = async () => {
    setIsRunningTest(true);
    try {
      await fetch('/api/experiments/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reduced: true })
      });
      await fetchAblationResults();
    } catch (err) {
      console.error("Experiment matrix run error:", err);
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleExportBenchmarkCSV = () => {
    let csv = 'Algorithm,Scenario,Configurations,TotalTrials,MeanCompletionPct,StdCompletion,CI95,ConsensusMs,ReplanLatencySec,FleetSurvivalPct,PacketsGen,PacketsDeliv,PacketsDropped,ObservedLossPct\n';
    variants.forEach((v) => {
      csv += `"${v.variant}","${testScenario}",${v.configurations || 0},${v.trials},${(v.metrics.mission_completion.mean * 100).toFixed(1)},${(v.metrics.mission_completion.std * 100).toFixed(2)},${(v.metrics.mission_completion.ci_95 * 100).toFixed(2)},${v.metrics.consensus_time_ms},${v.metrics.replan_latency_seconds},${v.metrics.fleet_survival_pct},${v.metrics.packets_generated_mean || 0},${v.metrics.packets_delivered_mean || 0},${v.metrics.packets_dropped_mean || 0},${v.metrics.observed_packet_loss_pct || 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swarmos_empirical_5_baselines_${testScenario}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const baselineDescriptions: Record<string, { role: string; pros: string[]; cons: string[] }> = {
    'Static': {
      role: 'Rigid Spatial Partitioning',
      pros: ['Zero mesh message exchange', 'Instant assignment at t=0'],
      cons: ['Zero dynamic recovery (tasks on failed UAVs abandoned)', 'High uncompleted task ratio under attrition']
    },
    'Greedy': {
      role: 'Uncoordinated Local Heuristic',
      pros: ['No inter-agent communication overhead', 'Fast local target selection'],
      cons: ['Severe target conflict (multiple drones navigate to same task)', 'Wasted battery & duplicate pathing']
    },
    'CBBA_Standard': {
      role: 'Choi et al. (IEEE Trans. Robotics 2009)',
      pros: ['Decentralized bundle auction architecture', 'Conflict-free bundle consensus under nominal state'],
      cons: ['No dynamic re-auction trigger upon node attrition', 'Orphaned tasks remain unserviced after failure']
    },
    'CBBA_Recovery': {
      role: 'Dynamic CBBA with Fault Re-Auction',
      pros: ['Autonomous node loss detection & dynamic re-auction', 'High task recovery across surviving nodes'],
      cons: ['No kinematic or bid ceiling validation filters']
    },
    'SWARMOS': {
      role: 'Safety-Compiled CBBA + Sanity & Isolation Validator',
      pros: ['Deterministic safety compiler bounds (range/payload/rate)', 'Consensus bid sanity & kinematic isolation validator', 'Fast distributed re-auction across dynamic mesh'],
      cons: ['Requires connected RF mesh delivery']
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stress Test Suite */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900/80 to-slate-950/80 p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Empirical 5-Baseline Comparative Benchmark Suite
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  LIVE EMPIRICAL BENCHMARK • SCENARIO-FILTERED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Head-to-head empirical validation across 5 distinct coordination paradigms under physical RF packet loss, jamming, and kinetic node loss.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBenchmarkCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV Matrix</span>
            </button>
            <button
              onClick={handleRunStressTest}
              disabled={isRunningTest}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
                isRunningTest
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
              <span>{isRunningTest ? 'Running Python Matrix Trials...' : 'Execute Matrix Sweep'}</span>
            </button>
          </div>
        </div>

        {/* Stress Scenarios Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 mr-2">Evaluation Scenarios:</span>
          {[
            { id: 'nominal', label: 'Nominal Clear Airspace (0% Drop)' },
            { id: 'mild_attrition', label: 'Mild Attrition (1 Node Down, 5% Drop)' },
            { id: 'electronic_warfare_dense', label: 'Dense EW Jamming (30% Packet Loss)' },
            { id: 'catastrophic_stress', label: 'Catastrophic Stress (40% Loss, 50% Drop)' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setTestScenario(sc.id as any)}
              className={`px-3 py-1 rounded-lg border transition-colors ${
                testScenario === sc.id
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Baselines Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {variants.map((v) => {
          const isSWARMOS = v.variant === 'SWARMOS';
          const completionPct = (v.metrics.mission_completion.mean * 100);
          const meta = baselineDescriptions[v.variant] || {
            role: 'Baseline Architecture',
            pros: ['Evaluated paradigm'],
            cons: ['Standard operational limits']
          };

          return (
            <div
              key={v.variant}
              className={`rounded-2xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
                isSWARMOS 
                  ? 'bg-gradient-to-b from-sky-950/50 via-slate-900/95 to-slate-950 border-sky-500/60 shadow-lg shadow-sky-500/10' 
                  : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      isSWARMOS ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSWARMOS ? 'EVALUATED STACK' : 'BASELINE'}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1">{v.variant}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{meta.role}</p>
                  </div>
                  {isSWARMOS ? (
                    <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
                  ) : (
                    <Activity className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </div>

                {/* Numerical Metrics */}
                <div className="space-y-2.5 font-mono text-xs mt-3">
                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span>Completion Rate</span>
                      <strong className={completionPct > 70 ? 'text-emerald-400' : completionPct > 40 ? 'text-amber-400' : 'text-red-400'}>
                        {completionPct.toFixed(1)}% <span className="text-[9px] text-slate-500">±{(v.metrics.mission_completion.ci_95 * 100).toFixed(1)}%</span>
                      </strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          completionPct > 70 ? 'bg-emerald-500' : completionPct > 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, completionPct))}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800/60 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consensus Time:</span>
                      <span className="text-white font-bold">{v.metrics.consensus_time_ms.toFixed(1)} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Replan Latency:</span>
                      <span className="text-white font-bold">{v.metrics.replan_latency_seconds > 0 ? `${(v.metrics.replan_latency_seconds * 1000).toFixed(1)} ms` : 'N/A (No Replan)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fleet Survival:</span>
                      <span className="text-sky-400 font-bold">{v.metrics.fleet_survival_pct.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500">Packets (Deliv / Loss):</span>
                      <span className="text-purple-300 font-bold">
                        {v.metrics.packets_delivered_mean !== undefined 
                          ? `${v.metrics.packets_delivered_mean.toFixed(0)} (${v.metrics.observed_packet_loss_pct?.toFixed(0)}% loss)` 
                          : 'Recorded'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Evaluated Runs:</span>
                      <span className="text-slate-400">{v.trials} trials ({v.configurations || 0} configs)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[10px]">
                <div className="font-mono font-bold text-emerald-400">Pros:</div>
                <ul className="space-y-0.5 text-slate-300">
                  {meta.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="font-mono font-bold text-red-400 pt-1">Vulnerabilities:</div>
                <ul className="space-y-0.5 text-slate-400">
                  {meta.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synthesis Takeaway */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 font-mono text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-white font-bold text-sm mb-1">
            Empirical Takeaway across 5 Coordination Architectures:
          </div>
          <p className="leading-relaxed text-slate-300">
            Static spatial allocation and uncoordinated greedy heuristics suffer under attrition due to either unrecovered orphaned tasks or spatial collision overlap. Standard CBBA provides distributed convergence at initialization, while adding <strong>Dynamic Recovery + Deterministic Safety Bounds</strong> enables the swarm to re-allocate mission workload when node attrition or jamming occurs across the mesh.
          </p>
        </div>
      </div>
    </div>
  );
};
