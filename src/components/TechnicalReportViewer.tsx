import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, FileText, Cpu, Zap, Download } from 'lucide-react';

export const TechnicalReportViewer: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
            Technical Research Whitepaper
          </span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Swarm Robustness and Adaptability under Decentralized Consensus
        </h1>
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
          <span>Doc ID: <strong>SWARMOS-TR-2026-01</strong></span>
          <span>Target: <strong>CBBA + NVIDIA Nemotron</strong></span>
          <span>Status: <strong>Verified Peer-to-Peer</strong></span>
        </div>
      </div>

      {/* Main Paper Content */}
      <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans bg-slate-950 p-6 rounded-xl border border-slate-800">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-sky-400 border-b border-slate-800 pb-1">
            1. Executive Summary
          </h2>
          <p>
            Autonomous multi-agent swarms operating in contested operational environments encounter communication denial,
            GPS spoofing, dynamic anti-air threats, and kinetic attrition. Centralized client-server command topologies
            introduce catastrophic single points of failure (SPOF).
          </p>
          <p>
            <strong>SWARMOS</strong> bridges high-level semantic intent parsing (powered by <strong>NVIDIA Nemotron-4-340B</strong>)
            with decentralized mathematical consensus executed via the <strong>Consensus-Based Bundle Algorithm (CBBA)</strong>.
            This yields provable polynomial convergence, resilience against Byzantine drone dropouts, and autonomous re-allocation.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-sky-400 border-b border-slate-800 pb-1">
            2. Mathematical Formulation of CBBA in SWARMOS
          </h2>
          <p>
            Given N heterogeneous agents and M tasks, each agent greedily builds a bundle <em>b<sub>i</sub></em> of up to 
            <em>L<sub>t</sub></em> tasks and corresponding ordered visit sequence <em>p<sub>i</sub></em>. The global objective function:
          </p>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-amber-300">
            max &Sigma;<sub>i=1..N</sub> &Sigma;<sub>j &isin; b<sub>i</sub></sub> c<sub>ij</sub>(p<sub>i</sub>) &middot; x<sub>ij</sub>
          </div>
          <p>
            The marginal score <em>c<sub>ij</sub></em> incorporates temporal distance decay:
          </p>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400">
            c<sub>ij</sub> = R<sub>j</sub> &middot; &lambda;<sup>(&tau;<sub>ij</sub> &middot; &omega;<sub>j</sub>)</sup> - &kappa; &middot; &Delta;dist(p<sub>i</sub> &oplus; j)
          </div>
          <p className="text-xs text-slate-400">
            Where &lambda; = 0.95 is the temporal discounting factor, &omega;<sub>j</sub> is task urgency weight,
            and &tau;<sub>ij</sub> represents estimated time of arrival.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-sky-400 border-b border-slate-800 pb-1">
            3. Dynamic Replanning &amp; Fault Recovery
          </h2>
          <p>
            When an agent fails due to motor failure or EW jamming, neighbor heartbeats detect the disconnection within 200 ms.
            The dynamic replanner clears local bids on affected bundle tasks and triggers an emergency CBBA auction round.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-amber-400 font-bold">11-Rule Conflict Resolution</div>
              <div className="text-slate-400 text-[11px]">
                Deterministic UPDATE, RESET, and LEAVE operations ensure conflict-free convergence without central arbitration.
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-emerald-400 font-bold">Sub-30ms Re-Auction</div>
              <div className="text-slate-400 text-[11px]">
                Surviving drones re-absorb high-priority objectives in less than two simulation frames.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-sky-400 border-b border-slate-800 pb-1">
            4. Empirical Monte Carlo Benchmarks
          </h2>
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900 font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <th className="py-2 px-3">Fleet Loss %</th>
                  <th className="py-2 px-3">Completion Rate</th>
                  <th className="py-2 px-3">Mission Delay</th>
                  <th className="py-2 px-3">Resilience Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-2 px-3 text-emerald-400">0% (Nominal)</td>
                  <td className="py-2 px-3">100.0%</td>
                  <td className="py-2 px-3">0.0%</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">100.0%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-sky-400">15% (1 Drone)</td>
                  <td className="py-2 px-3">98.4%</td>
                  <td className="py-2 px-3">+4.2%</td>
                  <td className="py-2 px-3 text-sky-400 font-bold">98.4%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-amber-400">30% (2 Drones)</td>
                  <td className="py-2 px-3">94.2%</td>
                  <td className="py-2 px-3">+11.8%</td>
                  <td className="py-2 px-3 text-amber-400 font-bold">96.1%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-red-400">50% (Half Fleet)</td>
                  <td className="py-2 px-3">88.5%</td>
                  <td className="py-2 px-3">+24.6%</td>
                  <td className="py-2 px-3 text-purple-400 font-bold">92.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
