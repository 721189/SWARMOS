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
    <div className="space-y-4">
      {/* Playback & Speed Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            id="sim-play-pause-btn"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isRunning 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Pause Sim' : 'Resume Sim'}
          </button>

          <button
            id="sim-reset-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Speed Toggles */}
          <div className="flex items-center gap-1 ml-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  simSpeed === spd 
                    ? 'bg-sky-500/20 text-sky-400 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-purple-400" />
          Explain Why [X-AI]
        </button>
      </div>

      {/* Failure & Anomaly Injection Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Skull className="w-3.5 h-3.5 text-red-400" />
            Stochastic Failure Injection
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Stress-test CBBA dynamic re-auction
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            id="btn-inject-motor-failure"
            onClick={onInjectMotorFailure}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-200 text-xs font-semibold transition-all hover:border-red-500/60"
          >
            <Skull className="w-3.5 h-3.5 text-red-400" />
            Kill Drone A1
          </button>

          <button
            id="btn-inject-jammer"
            onClick={onInjectJammer}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold transition-all hover:border-purple-500/60"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            Spawn RF Jammer
          </button>

          <button
            id="btn-inject-sam"
            onClick={onInjectSAM}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 text-amber-200 text-xs font-semibold transition-all hover:border-amber-500/60"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Pop-up SAM Radar
          </button>

          <button
            id="btn-force-replan"
            onClick={onTriggerReplan}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-200 text-xs font-semibold transition-all hover:border-sky-500/60"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            Force Re-Auction
          </button>
        </div>
      </div>

      {/* AI Mission Directive Prompt Ingestion */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            NVIDIA Nemotron Mission Ingestion
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Nemotron-4-340B API
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
