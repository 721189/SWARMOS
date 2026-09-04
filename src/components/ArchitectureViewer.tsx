import React from 'react';
import { Layers, Download, CheckCircle, Cpu, Radio, ShieldAlert } from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-sky-300 font-bold uppercase tracking-wider">
              System Architecture &amp; Dataflow
            </span>
          </div>
          <h2 className="text-base font-bold text-white">
            SWARMOS Full-Stack Distributed Consensus Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generated architecture diagram (swarmos/architecture.png &amp; architecture.svg)
          </p>
        </div>

        <a
          href="/swarmos/architecture.svg"
          download="swarmos_architecture.svg"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download SVG Diagram
        </a>
      </div>

      {/* Embedded Vector Diagram Canvas */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-hidden shadow-2xl flex justify-center">
        <div className="w-full max-w-5xl aspect-[14/9] overflow-hidden rounded-lg border border-slate-800/80 bg-[#0b1120]">
          <iframe
            src="/swarmos/architecture.svg"
            title="SWARMOS Architecture Diagram"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Architectural Layer Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Layer 1: Cognitive Ingestion
          </div>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            NVIDIA Nemotron-4-340B receives unstructured operational directives and outputs structured JSON task manifests
            with spatial waypoints, base rewards, urgency decay (&lambda;), and duration constraints.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-amber-400 font-bold flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-amber-400" />
            Layer 2: Swarm Consensus (CBBA)
          </div>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            Decentralized peer-to-peer 1-hop mesh. Drones greedily construct task bundles based on marginal gain c<sub>ij</sub>
            and reach consensus in polynomial rounds using deterministic conflict resolution rules.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-purple-400 font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Layer 3: Resilience &amp; X-AI
          </div>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            Dynamic replanner monitors heartbeat drops, detects orphaned tasks, and initiates autonomous re-auctions.
            The X-Swarm explainer provides mathematical transparency on every bid and allocation.
          </p>
        </div>
      </div>
    </div>
  );
};
