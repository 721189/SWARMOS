import React, { useState } from 'react';
import { CotEvent, TakServerStatus, TaskEntity, AgentEntity } from '../types';
import { 
  Radio, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Send, 
  Compass, 
  MapPin, 
  Wifi, 
  Cpu, 
  Activity,
  Layers,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface AtakCotGatewayProps {
  cotEvents: CotEvent[];
  takServerStatus: TakServerStatus;
  agents: AgentEntity[];
  tasks: TaskEntity[];
  onExportMissionPackage: () => void;
  onBroadcastCustomCot?: (msg: string) => void;
}

export const AtakCotGateway: React.FC<AtakCotGatewayProps> = ({
  cotEvents,
  takServerStatus,
  agents,
  tasks,
  onExportMissionPackage,
}) => {
  const [selectedCotId, setSelectedCotId] = useState<string | null>(cotEvents[0]?.id || null);
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'UAV' | 'TARGET'>('ALL');
  const [customCallsign, setCustomCallsign] = useState('RECON-ALPHA');
  const [simulatedPingSent, setSimulatedPingSent] = useState(false);

  const selectedEvent = cotEvents.find((e) => e.id === selectedCotId) || cotEvents[0];

  const handleCopyXml = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCustomCoT = () => {
    setSimulatedPingSent(true);
    setTimeout(() => setSimulatedPingSent(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Radio className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                ATAK / WinTAK Tactical Cursor-on-Target (CoT) Gateway
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MIL-STD-2525D
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Real-time military situational awareness bridge translating decentralized CBBA swarm telemetry into standardized XML Cursor-on-Target (CoT) events for TAK Server, WinTAK, and ATAK handheld tactical devices.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="export-atak-pkg-btn"
              onClick={onExportMissionPackage}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Export ATAK Mission Package (.xml)
            </button>
          </div>
        </div>
      </div>

      {/* TAK Server Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">TAK Server Status</div>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              BROADCASTING
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">{takServerStatus.endpoint}</div>
          </div>
          <Wifi className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Transport Protocol</div>
            <div className="text-lg font-bold text-slate-100 mt-1">UDP Multicast</div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">Port 6969 / TLS 8089</div>
          </div>
          <Radio className="w-8 h-8 text-sky-500/30" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">CoT Packets Egress</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-1">
              {takServerStatus.packetsOut} pkts
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">Rate: ~12 events/sec</div>
          </div>
          <Activity className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Reference Datum</div>
            <div className="text-lg font-bold text-slate-100 font-mono mt-1">WGS-84 / HAE</div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">MCAS Miramar Range</div>
          </div>
          <Compass className="w-8 h-8 text-indigo-500/30" />
        </div>
      </div>

      {/* Main Tactical Feed & XML Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active CoT Tactical Objects */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Active Tactical Entities</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${filterType === 'ALL' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ALL
              </button>
              <button
                onClick={() => setFilterType('UAV')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${filterType === 'UAV' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                DRONES
              </button>
              <button
                onClick={() => setFilterType('TARGET')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${filterType === 'TARGET' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                TARGETS
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Friendly UAVs */}
            {(filterType === 'ALL' || filterType === 'UAV') && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-1">Airborne Friendly Units (a-f-A-M-F-Q)</div>
                {cotEvents.map((evt) => {
                  const isSelected = (selectedEvent?.id === evt.id);
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedCotId(evt.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-sky-950/40 border-sky-500/50 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                          <span className="font-mono font-bold text-xs text-sky-400">{evt.callsign}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {evt.uid}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">{evt.batteryPct}% BAT</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono text-slate-400">
                        <div>LAT: <span className="text-slate-200">{evt.lat.toFixed(4)}</span></div>
                        <div>LON: <span className="text-slate-200">{evt.lon.toFixed(4)}</span></div>
                        <div>SPD: <span className="text-slate-200">{evt.speedKts} KTS</span></div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-1">
                        <span>TASK: {evt.assignedTaskId || 'UNASSIGNED'}</span>
                        <span>HDG: {evt.headingDeg}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Target POIs */}
            {(filterType === 'ALL' || filterType === 'TARGET') && (
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-1">Mission Points of Interest (b-m-p-s-p-i)</div>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="font-mono font-bold text-xs text-amber-400">OBJ-{task.id}</span>
                        <span className="text-[10px] font-mono px-1.5 rounded bg-slate-800 text-slate-300">
                          {task.type}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 rounded ${
                        task.status === 'COMPLETED' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{task.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live CoT XML Stream Terminal */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                MIL-STD Cursor-on-Target XML Stream
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => selectedEvent && handleCopyXml(selectedEvent.rawXml)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy XML'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-950 p-4 font-mono text-xs overflow-y-auto">
            {selectedEvent ? (
              <pre className="text-slate-300 whitespace-pre leading-relaxed">
                {selectedEvent.rawXml.split('\n').map((line, idx) => {
                  let color = 'text-slate-300';
                  if (line.includes('<event') || line.includes('</event>')) color = 'text-sky-400 font-bold';
                  else if (line.includes('<point')) color = 'text-emerald-400';
                  else if (line.includes('<detail') || line.includes('</detail>')) color = 'text-purple-400';
                  else if (line.includes('<contact') || line.includes('<track')) color = 'text-amber-300';
                  else if (line.includes('<remarks')) color = 'text-slate-400 italic';

                  return (
                    <div key={idx} className={color}>
                      {line}
                    </div>
                  );
                })}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Waiting for incoming CoT telemetry stream...
              </div>
            )}
          </div>

          {/* Tactical Injector / Manual Broadcast */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Inject CoT Marker:</span>
            <input
              type="text"
              value={customCallsign}
              onChange={(e) => setCustomCallsign(e.target.value)}
              placeholder="CALLSIGN (e.g. VIPER-LEAD)"
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 w-44"
            />
            <button
              onClick={handleSendCustomCoT}
              className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast to TAK
            </button>
            {simulatedPingSent && (
              <span className="text-xs font-mono text-emerald-400 animate-pulse ml-2">
                ✓ CoT Multicast Dispatched (239.2.3.1)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MIL-STD Tactical Symbology Reference Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          STANAG & MIL-STD-2525D Type Hierarchy Mappings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <span className="w-3 h-3 border border-sky-400 rotate-45 inline-block" />
              a-f-A-M-F-Q
            </div>
            <div className="text-slate-300 font-sans mt-1 text-[11px]">Friendly Airborne Rotary-Wing Quadcopter</div>
            <div className="text-[10px] text-slate-500 mt-1">SWARMOS VIPER-01 through 06</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              b-m-p-s-p-i
            </div>
            <div className="text-slate-300 font-sans mt-1 text-[11px]">Battlefield Point of Interest (Strike/Recon Target)</div>
            <div className="text-[10px] text-slate-500 mt-1">Autonomous CBBA Task Objectives</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <span className="w-3 h-3 rounded-full border border-purple-400 inline-block" />
              e-j-R-F
            </div>
            <div className="text-slate-300 font-sans mt-1 text-[11px]">Hostile Electronic Warfare (RF Jammer Emitter)</div>
            <div className="text-[10px] text-slate-500 mt-1">Dynamic Comms Exclusion Zone</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 bg-emerald-400 inline-block" />
              b-r-f-h-c
            </div>
            <div className="text-slate-300 font-sans mt-1 text-[11px]">Friendly Forward Operating Base / Launch Station</div>
            <div className="text-[10px] text-slate-500 mt-1">Home Base Waypoints</div>
          </div>
        </div>
      </div>
    </div>
  );
};
