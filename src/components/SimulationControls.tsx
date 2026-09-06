import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Radio, 
  Flame, 
  RefreshCw, 
  Sparkles, 
  HelpCircle,
  Skull,
  Send,
  Sliders
} from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onInjectMotorFailure: () => void;
  onInjectJammer: () => void;
  onInjectSAM: () => void;
  onTriggerReplan: () => void;
  onOpenExplain: () => void;
  onLoadPresetMission: (prompt: string) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  simSpeed,
  onChangeSpeed,
  onInjectMotorFailure,
  onInjectJammer,
  onInjectSAM,
  onTriggerReplan,
  onOpenExplain,
  onLoadPresetMission,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isParsingAI, setIsParsingAI] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setIsParsingAI(true);
    setTimeout(() => {
      onLoadPresetMission(customPrompt);
      setIsParsingAI(false);
      setCustomPrompt('');
    }, 450);
  };

  const presets = [
    { label: 'Urban Search & Rescue', prompt: 'Search sector alpha, locate casualties and deliver medical emergency drops' },
    { label: 'EW Jammer Strike', prompt: 'Infiltrate radar bubble, neutralize hostile electronic jammer node and surveil' },
    { label: 'Perimeter Recon Sweep', prompt: 'High-speed autonomous perimeter sweep with multi-node relay bridge' },
  ];

  return (
    <div className="space-y-6">
      {/* Playback & Speed Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            id="sim-play-pause-btn"
            onClick={onTogglePlay}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all shadow-md font-display ${
              isRunning 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Halt Simulation' : 'Execute Mission'}
          </button>

          <button
            id="sim-reset-btn"
            onClick={onReset}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700/60 font-display"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Speed Toggles */}
          <div className="flex items-center gap-1.5 ml-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-[10px] font-bold font-mono">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  simSpeed === spd 
                    ? 'bg-sky-500/10 text-sky-400 font-extrabold border border-sky-400/20' 
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Explain Allocation Button */}
        <button
          id="open-explain-btn"
          onClick={onOpenExplain}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all font-display"
        >
          <HelpCircle className="w-4 h-4 text-purple-500/60" />
          Explain Decision [X-AI]
        </button>
      </div>

      {/* Strategic Failure Injection Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-1">
          <span className="text-[10px] font-extrabold text-white uppercase tracking-[0.2em] flex items-center gap-2.5 font-display">
            <Skull className="w-4 h-4 text-red-500/60" />
            Strategic Stress Testing
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Failure Recovery Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            id="btn-inject-motor-failure"
            onClick={onInjectMotorFailure}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-950/40 hover:bg-red-500/5 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <Skull className="w-5 h-5 mb-1" />
            Kinetic Attrition
          </button>

          <button
            id="btn-inject-jammer"
            onClick={onInjectJammer}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-950/40 hover:bg-purple-500/5 border border-slate-800 hover:border-purple-500/30 text-slate-400 hover:text-purple-400 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <Radio className="w-5 h-5 mb-1" />
            RF Interference
          </button>

          <button
            id="btn-inject-sam"
            onClick={onInjectSAM}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-950/40 hover:bg-amber-500/5 border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <Flame className="w-5 h-5 mb-1" />
            Dynamic Hazard
          </button>

          <button
            id="btn-force-replan"
            onClick={onTriggerReplan}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-950/40 hover:bg-sky-500/5 border border-slate-800 hover:border-sky-500/30 text-slate-400 hover:text-sky-400 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <RefreshCw className="w-5 h-5 mb-1" />
            Global Sync
          </button>
        </div>
      </div>

      {/* AI Mission Directive Prompt Ingestion */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 mb-1">
          <div className="flex items-center gap-2.5 text-[10px] font-extrabold text-white uppercase tracking-[0.2em] font-display">
            <Sparkles className="w-4 h-4 text-emerald-500/60" />
            Strategic Directive Ingestion
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            NVIDIA NEMOTRON-4-340B
          </span>
        </div>

        {/* Preset Mission Buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onLoadPresetMission(p.prompt)}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors border border-slate-700"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Prompt Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            id="custom-mission-input"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Type custom operational orders (e.g. 'Deploy medical supplies to sector beta and loiter')..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 transition-colors"
          />
          <button
            type="submit"
            disabled={isParsingAI || !customPrompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-md"
          >
            {isParsingAI ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Dispatch
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
