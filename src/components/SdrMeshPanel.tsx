import React, { useState } from 'react';
import { SdrMeshState, EdgeLlmState } from '../types';
import { 
  Radio, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  RefreshCw, 
  Zap, 
  Activity, 
  Terminal, 
  Send, 
  Flame, 
  Layers, 
  WifiOff, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface SdrMeshPanelProps {
  sdrMeshState: SdrMeshState;
  edgeLlmState: EdgeLlmState;
  onSetRadioModel: (model: SdrMeshState['radioModel']) => void;
  onToggleCryptoSuite: () => void;
  onTriggerEdgeLlm: (prompt?: string) => void;
}

const radioModelConfigs: Record<
  SdrMeshState['radioModel'],
  { name: string; mfg: string; bands: string; maxEirp: string; desc: string }
> = {
  SILVUS_STREAMCASTER_4400: {
    name: 'StreamCaster 4400',
    mfg: 'Silvus Technologies',
    bands: '1775 - 2250 MHz (COFDM Tactical S-Band)',
    maxEirp: '20W (4x4 MIMO Beamforming)',
    desc: 'Dual-band tactical MANET transceiver with MN-MIMO beamforming & bi-directional spatial diversity.',
  },
  TRELLISWARE_TW950: {
    name: 'TW-950 TSM Shadow',
    mfg: 'TrellisWare Technologies',
    bands: 'UHF / L-Band / S-Band (225 - 2500 MHz)',
    maxEirp: '10W (Barrage Relay TSM)',
    desc: 'Ultra-low latency tactical mesh leveraging Barrage Relay technology across severe multipath clutter.',
  },
  PERSISTENT_MPU5: {
    name: 'MPU5 Wave Relay',
    mfg: 'Persistent Systems',
    bands: 'L-Band / S-Band / C-Band (3x3 MIMO)',
    maxEirp: '18W (Distributed Cloud Relay)',
    desc: 'Modular tactical MANET running Wave Relay protocol with integrated onboard Android computing core.',
  },
};

const edgeModelConfigs: Record<
  EdgeLlmState['model'],
  { name: string; params: string; quant: string; vram: string; tokPerSec: string }
> = {
  'SmolLM2-1.7B-Q4': {
    name: 'SmolLM2-1.7B-Instruct',
    params: '1.7 Billion',
    quant: 'INT4 AWQ (TensorRT-LLM)',
    vram: '1.42 GB VRAM',
    tokPerSec: '94.2 tok/s',
  },
  'Phi-3.5-mini-Instruct-Q4': {
    name: 'Phi-3.5-mini-3.8B',
    params: '3.8 Billion',
    quant: 'INT4 FP16 GEMM',
    vram: '2.35 GB VRAM',
    tokPerSec: '62.8 tok/s',
  },
  'Llama-3.2-3B-Q4': {
    name: 'Llama-3.2-3B-Instruct',
    params: '3.2 Billion',
    quant: 'INT4 AWQ (TensorRT-LLM)',
    vram: '2.10 GB VRAM',
    tokPerSec: '74.5 tok/s',
  },
};

export const SdrMeshPanel: React.FC<SdrMeshPanelProps> = ({
  sdrMeshState,
  edgeLlmState,
  onSetRadioModel,
  onToggleCryptoSuite,
  onTriggerEdgeLlm,
}) => {
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const radioConfig = radioModelConfigs[sdrMeshState.radioModel];
  const modelConfig = edgeModelConfigs[edgeLlmState.model];

  const presetScenarios = [
    {
      title: 'Hostile Radar SAM Active',
      prompt: 'Tactical Situation: Pop-up Radar SAM at Grid (720, 160). Re-route air fleet and establish ground UGV relay.',
    },
    {
      title: 'Multirotor Battery Alert',
      prompt: 'Tactical Situation: VIPER-02 battery depleted to 22%. Coordinate autonomous rendezvous with TITAN-01 UGV.',
    },
    {
      title: 'EW Jammer Penetration',
      prompt: 'Tactical Situation: RF Jammer deployed at Grid (450, 280). Initiate frequency-hopping and beamforming bridge.',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Radio className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Edge-Native anomaly-aware SDR Mesh &amp; Jetson Orin SLM
              </h2>
              <p className="text-xs text-slate-400">
                Tactical MANET Waveform Modeling, ChaCha20-Poly1305 Cryptography &amp; Onboard INT4 Edge LLMs
              </p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5" />
            100% AIR-GAPPED (ZERO-CLOUD)
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            NVIDIA JETSON ORIN NATIVE
          </span>
        </div>
      </div>

      {/* Grid: Tactical SDR Radio & anomaly-aware Crypto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: SDR Waveform Modeling */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Tactical SDR MANET Waveform</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                MIL-STD-188-220
              </span>
            </div>

            {/* Radio Model Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Select Tactical SDR Radio Platform:</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(radioModelConfigs) as SdrMeshState['radioModel'][]).map((model) => (
                  <button
                    key={model}
                    onClick={() => onSetRadioModel(model)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      sdrMeshState.radioModel === model
                        ? 'border-sky-500 bg-sky-500/15 text-white font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] truncate">{radioModelConfigs[model].name}</div>
                    <div className="text-[9px] text-slate-500 truncate">{radioModelConfigs[model].mfg}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Radio Details */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bands:</span>
                <strong className="text-sky-300">{radioConfig.bands}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">RF Power / MIMO:</span>
                <strong className="text-amber-400">{radioConfig.maxEirp}</strong>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                {radioConfig.desc}
              </p>
            </div>

            {/* Live RF Channel Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">CARRIER FREQ</span>
                <strong className="text-sm text-sky-400 font-mono">{sdrMeshState.frequencyMhz} MHz</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MEAN SNR</span>
                <strong className="text-sm text-emerald-400 font-mono">{sdrMeshState.averageSnrDb} dB</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">PACKET LOSS</span>
                <strong
                  className={`text-sm font-mono ${
                    sdrMeshState.packetLossPct > 5 ? 'text-red-400' : 'text-slate-200'
                  }`}
                >
                  {sdrMeshState.packetLossPct}%
                </strong>
              </div>
            </div>

            {/* Directional Beamforming & Frequency Hopping */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Directional Beamforming Gain:</span>
                <strong className="text-sky-300">+{sdrMeshState.beamformingGainDbi} dBi Array Gain</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">FHSS Hopping Rate:</span>
                <strong className="text-purple-300 font-mono">
                  {sdrMeshState.frequencyHoppingRateHopsSec} hops/sec
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: anomaly-aware Ephemeral Cryptography */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Lock className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">anomaly-aware Ephemeral Cryptography</h3>
              </div>
              <button
                onClick={onToggleCryptoSuite}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700"
              >
                <RefreshCw className="w-3 h-3 text-sky-400" />
                Rotate Cipher
              </button>
            </div>

            {/* Active Cryptographic Suite Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Cipher Suite:</span>
                <strong className="text-emerald-400 font-mono">
                  {sdrMeshState.cryptoSuite === 'CHACHA20_POLY1305'
                    ? 'ChaCha20-Poly1305 AEAD (256-bit Key, 96-bit Nonce)'
                    : 'CRYSTALS-Kyber-768 (Post-Quantum KEM)'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Key Epoch:</span>
                <span className="text-sky-300 font-mono font-bold">
                  Epoch #{sdrMeshState.activeKeyEpoch}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Key Rotation Countdown:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {sdrMeshState.epochExpiresSec}s until next rekey
                </span>
              </div>
            </div>

            {/* Replay Attack Defense & Authentication Log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Anti-Replay Nonce Verification:
                </span>
                <span className="text-emerald-400 font-bold">
                  {sdrMeshState.replayAttacksBlocked} RF Injections Blocked
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 font-mono text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>[NONCE VERIFIED] Timestamp: {new Date().toISOString().substring(11, 19)} | Monotonic counter: 0x4F1A29</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <KeyRound className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                  <span>[KEK EPOCH {sdrMeshState.activeKeyEpoch}] 256-bit authenticated tag valid across all 6 SDR mesh peers</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>[RF GUARD] Rejected stale auction packet with duplicate nonce</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Edge SLM (NVIDIA Jetson Orin Native Engine) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Local Edge SLM (NVIDIA Jetson Orin Native Engine)
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  C++ TensorRT-LLM Native
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Air-Gapped Small Language Model executing on-drone with zero cloud dependence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Inference Latency:</span>{' '}
              <strong className="text-emerald-400 font-mono">{edgeLlmState.latencyMs} ms</strong>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Throughput:</span>{' '}
              <strong className="text-sky-400 font-mono">{modelConfig.tokPerSec}</strong>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Memory Footprint:</span>{' '}
              <strong className="text-purple-400 font-mono">{modelConfig.vram}</strong>
            </div>
          </div>
        </div>

        {/* Interactive Tactical Re-planning Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 5 Cols: Presets & Input */}
          <div className="lg:col-span-5 space-y-3">
            <label className="text-xs text-slate-300 font-medium block">
              Inject Emergency Tactical Directive:
            </label>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              {presetScenarios.map((scenario) => (
                <button
                  key={scenario.title}
                  onClick={() => {
                    setCustomPrompt(scenario.prompt);
                    onTriggerEdgeLlm(scenario.prompt);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-800 hover:border-sky-500/50 bg-slate-950/70 hover:bg-slate-950 transition-all text-xs group"
                >
                  <div className="font-bold text-slate-200 group-hover:text-sky-300 flex items-center justify-between">
                    <span>{scenario.title}</span>
                    <Zap className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{scenario.prompt}</div>
                </button>
              ))}
            </div>

            {/* Custom Prompt Input */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter custom tactical situation for Jetson Orin..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onTriggerEdgeLlm(customPrompt);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={() => onTriggerEdgeLlm(customPrompt)}
                  disabled={edgeLlmState.isInferring}
                  className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {edgeLlmState.isInferring ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Execute
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Directly triggers on-drone TensorRT-LLM engine without any cloud or internet connection.
              </span>
            </div>
          </div>

          {/* Right 7 Cols: Live Generated Mission Directives */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Live On-Device Re-planning Output
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Tokens: {edgeLlmState.promptTokens} in / {edgeLlmState.completionTokens} out
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap shadow-inner">
              {edgeLlmState.isInferring ? (
                <div className="flex items-center gap-2 text-sky-400 animate-pulse py-6 justify-center">
                  <Cpu className="w-5 h-5 animate-spin" />
                  <span>Executing Jetson Orin TensorRT-LLM forward pass (38ms)...</span>
                </div>
              ) : (
                edgeLlmState.lastEdgePlan
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
