import React from 'react';
import { Video, Clock, Film, Mic, Eye, PlaySquare, CheckCircle2 } from 'lucide-react';

export const DemoScriptViewer: React.FC = () => {
  const acts = [
    {
      act: 'Act 1',
      title: 'The Challenge & Natural Language Directive',
      timecode: '0:00 - 0:30',
      duration: '30s',
      visual: 'Cinematic wide shot of contested urban grid. Red warning glitch: "COMMUNICATIONS DENIED / GPS COMPROMISED". Operator types mission directive into console.',
      voiceover: '"In contested environments, centralized drone orchestration is a single point of failure. If your ground control station is jammed or destroyed, the entire fleet collapses. Welcome to SWARMOS."',
      tags: ['Problem Statement', 'NVIDIA Nemotron', 'Mission Ingestion']
    },
    {
      act: 'Act 2',
      title: 'Decentralized CBBA Auction in Action',
      timecode: '0:30 - 1:05',
      duration: '35s',
      visual: 'Pygame tactical workbench boots. 6 autonomous quadcopters light up in blue. Animated peer-to-peer wireless mesh links flicker as winning bids converge in 18.2 ms.',
      voiceover: '"At the tactical edge, the drones do not query a server. Instead, they execute the Consensus-Based Bundle Algorithm (CBBA). Each agent calculates marginal utility, builds task bundles, and resolves bidding conflicts with immediate neighbors."',
      tags: ['CBBA Consensus', 'Peer-to-Peer Mesh', 'Sub-20ms Convergence']
    },
    {
      act: 'Act 3',
      title: 'Catastrophic Failure & Autonomous Dynamic Replanning',
      timecode: '1:05 - 1:45',
      duration: '40s',
      visual: 'Operator clicks [Inject Motor Failure]. Agent A1 turns bright red, emits smoke sparks and halts. Orphaned tasks pulse red. Surviving drones A2 and A4 immediately exchange packets and reclaim tasks.',
      voiceover: '"Agent 1 suffers complete rotor failure mid-mission. In traditional architectures, this halts the operation. In SWARMOS, the dynamic replanner instantly re-allocates tasks across surviving peers in 14.8 ms with zero human intervention."',
      tags: ['Fault Injection', 'Dynamic Replanning', 'Mission Continuity']
    },
    {
      act: 'Act 4',
      title: 'Explainable Swarm (X-Swarm Forensic Breakdown)',
      timecode: '1:45 - 2:15',
      duration: '30s',
      visual: 'Operator clicks [Explain Allocations (X-AI)] on Task T2. Modal displays the mathematical marginal score formula, distance decay curve, and competing agent ranking matrix.',
      voiceover: '"Autonomous swarms must not be black boxes. With SWARMOS X-Swarm, every decision is forensically transparent. Commanders can inspect exactly why Agent 3 was awarded the neutralization strike over Agent 5 down to the exact marginal score."',
      tags: ['X-AI Forensic Audit', 'Marginal Score c_ij', 'EW Jammer Attenuation']
    },
    {
      act: 'Act 5',
      title: 'Nebius AI Cloud Scaling & Experiment Matrix',
      timecode: '2:15 - 2:45',
      duration: '30s',
      visual: 'Terminal running batch Monte Carlo simulations across 100 trials on Nebius Cloud GPU nodes. Line graphs showing sub-40ms consensus scaling from 4 to 16 drones.',
      voiceover: '"To prove statistical rigor, we scaled SWARMOS on Nebius AI Studio GPU clusters. Running hundreds of Monte Carlo trials across varying fleet scales, communication dropouts, and hostile threats, SWARMOS achieved a 96% resilience factor."',
      tags: ['Nebius Cloud SDK', 'Monte Carlo Sweep', 'Cluster Benchmarks']
    },
    {
      act: 'Act 6',
      title: 'Summary & Call to Action',
      timecode: '2:45 - 3:00',
      duration: '15s',
      visual: 'Montage of simulation HUD, architecture blueprint, GitHub repo badge, and closing title card.',
      voiceover: '"Decentralized consensus. LLM mission parsing. Real-time resilience. This is SWARMOS. Clone the repo, run the demo, and build the future of autonomous swarms today."',
      tags: ['Open Source Scaffold', 'Production Ready']
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Film className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
              3-Minute Demo Video Storyboard
            </span>
          </div>
          <h2 className="text-base font-bold text-white">
            SWARMOS: Decentralized Autonomous Swarm OS with NVIDIA Nemotron &amp; CBBA
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full scene-by-scene timing, on-screen visual directions, voiceover script, and technical annotations.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Total Runtime: <strong>180 Seconds (3:00)</strong></span>
        </div>
      </div>

      {/* Storyboard Cards */}
      <div className="space-y-4">
        {acts.map((item, idx) => (
          <div 
            key={idx}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
          >
            {/* Act Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-xs font-mono font-bold">
                  {item.act}
                </span>
                <h3 className="text-sm font-bold text-slate-100">
                  {item.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                {item.timecode} ({item.duration})
              </div>
            </div>

            {/* Split Visual & Voiceover */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Visual Scene Direction */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  On-Screen Visual Directions
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {item.visual}
                </p>
              </div>

              {/* Spoken Voiceover */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  Spoken Voiceover Script (VO)
                </div>
                <p className="text-slate-200 leading-relaxed font-serif italic">
                  {item.voiceover}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
