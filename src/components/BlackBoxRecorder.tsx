import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Eye,
  Activity
} from 'lucide-react';
import { BlackBoxSnapshot, AgentEntity, TaskEntity } from '../types';

interface BlackBoxRecorderProps {
  snapshots: BlackBoxSnapshot[];
  onScrubToSnapshot: (snapshot: BlackBoxSnapshot | null) => void;
  activeScrubbedSnapshot: BlackBoxSnapshot | null;
}

export const BlackBoxRecorder: React.FC<BlackBoxRecorderProps> = ({
  snapshots,
  onScrubToSnapshot,
  activeScrubbedSnapshot,
}) => {
  const [sliderIndex, setSliderIndex] = useState<number>(snapshots.length - 1);
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);

  const currentIndex = activeScrubbedSnapshot
    ? snapshots.findIndex((s) => s.tick === activeScrubbedSnapshot.tick)
    : snapshots.length - 1;

  const currentFrame = snapshots[currentIndex >= 0 ? currentIndex : snapshots.length - 1] || snapshots[0];

  const handleSliderChange = (newIdx: number) => {
    setSliderIndex(newIdx);
    if (newIdx >= snapshots.length - 1) {
      onScrubToSnapshot(null); // Return to live simulation
    } else {
      onScrubToSnapshot(snapshots[newIdx]);
    }
  };

  const handleReturnToLive = () => {
    setIsPlayingReplay(false);
    onScrubToSnapshot(null);
    setSliderIndex(snapshots.length - 1);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshots, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swarmos_blackbox_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Find frames with events (failures, replans)
  const eventFrames = snapshots.filter((s) => s.event);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono">
                Tactical "Black Box" Flight Recorder &amp; Time Scrubber
              </h3>
              {activeScrubbedSnapshot ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold animate-pulse">
                  HISTORICAL REPLAY MODE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  RECORDING LIVE (50ms TICK)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic state scrub: Inspect winning bid consensus vectors ($y_i$), task queues ($z_i$), and RF mesh topology frame-by-frame.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeScrubbedSnapshot && (
            <button
              onClick={handleReturnToLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Live Swarm</span>
            </button>
          )}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Black Box JSON</span>
          </button>
        </div>
      </div>

      {/* Scrubber Controls */}
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Frame: <strong className="text-white">{currentFrame?.tick ?? 0}</strong> / {snapshots.length}</span>
            <span>•</span>
            <span>Time: <strong className="text-white">{((currentFrame?.tick ?? 0) * 0.05).toFixed(1)}s</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Quick Event Jump:</span>
            {eventFrames.slice(-3).map((ef) => (
              <button
                key={ef.tick}
                onClick={() => {
                  const idx = snapshots.findIndex((s) => s.tick === ef.tick);
                  if (idx >= 0) handleSliderChange(idx);
                }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/40 text-amber-300 text-[10px] hover:bg-amber-500/10"
              >
                {ef.event?.slice(0, 16)}...
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={0}
          max={Math.max(0, snapshots.length - 1)}
          value={currentIndex >= 0 ? currentIndex : snapshots.length - 1}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />
      </div>

      {/* Frame Inspector Summary */}
      {currentFrame && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase mb-1">Fleet State in Frame</div>
            <div className="flex items-center justify-between text-slate-200">
              <span>Operational UAVs:</span>
              <strong className="text-emerald-400 font-bold">
                {currentFrame.agents.filter(a => a.health.propulsion > 0.1).length} / {currentFrame.agents.length}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-200 mt-1">
              <span>Active Mesh Links:</span>
              <strong className="text-sky-400 font-bold">{currentFrame.commLinks.length} P2P</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase mb-1">Task Allocation Matrix</div>
            <div className="flex items-center justify-between text-slate-200">
              <span>Completed / In Progress:</span>
              <strong className="text-white font-bold">
                {currentFrame.tasks.filter(t => t.status === 'COMPLETED').length} / {currentFrame.tasks.length}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-200 mt-1">
              <span>Active Assignments:</span>
              <strong className="text-purple-300 font-bold">
                {currentFrame.tasks.filter(t => t.assignedAgentId).length} Bound
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase mb-1">Frame Event Incident</div>
            <div className="text-amber-300 font-bold text-xs truncate">
              {currentFrame.event || 'Nominal Consensus Operation'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Recorded at: {new Date(currentFrame.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
