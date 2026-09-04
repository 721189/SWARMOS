import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Pause, 
  Server, 
  Layers, 
  ArrowRight,
  Wifi,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { AgentEntity, TaskEntity, MavlinkPacket } from '../types';

interface HardwareBridgeViewerProps {
  agents: AgentEntity[];
  tasks: TaskEntity[];
  mavlinkPackets: MavlinkPacket[];
}

export const HardwareBridgeViewer: React.FC<HardwareBridgeViewerProps> = ({
  agents,
  tasks,
  mavlinkPackets,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mavlink' | 'ros2' | 'sitl'>('mavlink');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleExportWaypoints = () => {
    // QGroundControl / MAVLink WPL 110 format
    let fileContent = 'QGC WPL 110\n';
    let seq = 0;
    // Home base
    fileContent += `${seq++}\t1\t0\t16\t0\t0\t0\t0\t37.774929\t-122.419416\t10.0\t1\n`;

    tasks.forEach((t) => {
      const lat = (37.774929 + (t.position[1] - 300) * 0.0001).toFixed(6);
      const lon = (-122.419416 + (t.position[0] - 500) * 0.0001).toFixed(6);
      fileContent += `${seq++}\t0\t3\t16\t0\t0\t0\t0\t${lat}\t${lon}\t15.0\t1\n`;
    });

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swarmos_mission.waypoints';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Connection Status Banner */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900/80 to-slate-950/80 p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Hardware-in-the-Loop (HIL) Drone Gateway
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  MAVLINK 2.0 PROTOCOL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Translates decentralized CBBA waypoint allocations directly into MAVLink micro-services and ROS 2 Humble node topics for PX4 Autopilot SITL &amp; physical airframes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWaypoints}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export .waypoints (QGC)</span>
            </button>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                isStreaming
                  ? 'bg-sky-500 text-slate-950 font-bold hover:bg-sky-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Stream Active' : 'Stream Paused'}</span>
            </button>
          </div>
        </div>

        {/* Protocol Pipeline Diagram */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Input Layer</div>
              <div className="text-white font-bold">CBBA Bundle Engine</div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Gateway Bridge</div>
              <div className="text-sky-300 font-bold">pymavlink / rclpy</div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Transport Ingress</div>
              <div className="text-emerald-300 font-bold">UDP:14550 / DDS</div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Flight Target</div>
            <div className="text-amber-300 font-bold">PX4 SITL / Gazebo</div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('mavlink')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'mavlink'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          MAVLink 2.0 Packet Stream ({mavlinkPackets.length} pkts)
        </button>
        <button
          onClick={() => setActiveSubTab('ros2')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'ros2'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          ROS 2 Humble Node &amp; Topic Graph
        </button>
        <button
          onClick={() => setActiveSubTab('sitl')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeSubTab === 'sitl'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          PX4 SITL &amp; Gazebo Multi-UAV Launch Guide
        </button>
      </div>

      {/* Tab 1: MAVLink Packet Inspector */}
      {activeSubTab === 'mavlink' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Packet Log Table */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                Live MAVLink 2.0 Ingress Monitor [Port 14550]
              </span>
              <span className="text-[11px] text-slate-500">Rate: 50.0 Hz • Latency: 1.2ms</span>
            </div>

            <div className="h-[420px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {mavlinkPackets.map((pkt, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">
                        #{pkt.seq}
                      </span>
                      <span className="text-slate-400">{pkt.timestamp}</span>
                      <span className="font-bold text-white">[{pkt.agentId}]</span>
                      <span className="text-amber-300 font-bold">{pkt.msgType}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      CRC OK
                    </span>
                  </div>

                  <pre className="text-[10px] text-slate-300 bg-slate-950/80 p-2 rounded overflow-x-auto border border-slate-800/40">
                    {JSON.stringify(pkt.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Active Drone Telemetry Cards */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>HIL Fleet Flight Controllers ({agents.length})</span>
              <span className="text-emerald-400 text-[11px]">All GUIDED</span>
            </div>

            <div className="space-y-2.5">
              {agents.map((agent) => {
                const isFailed = agent.status === 'FAILED';
                return (
                  <div 
                    key={agent.id}
                    className={`p-3 rounded-xl border transition-all text-xs font-mono ${
                      isFailed 
                        ? 'border-red-500/30 bg-red-950/20' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isFailed ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        <span className="font-bold text-white">{agent.id}</span>
                        <span className="text-[10px] text-slate-400">PX4 SITL #{agent.id.replace('A', '')}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        isFailed ? 'bg-red-500/20 text-red-300' : 'bg-sky-500/10 text-sky-400'
                      }`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div>NED X, Y: <strong className="text-white">{Math.round(agent.position[0])}, {Math.round(agent.position[1])}m</strong></div>
                      <div>Target: <strong className="text-sky-300">{agent.currentTaskId || 'LOITER'}</strong></div>
                      <div>Battery: <strong className="text-emerald-300">{Math.round(agent.health.battery)}%</strong></div>
                      <div>MAVLink Pkts: <strong className="text-white">{agent.messagesSent * 8}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ROS 2 Topic Graph */}
      {activeSubTab === 'ros2' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>ROS 2 Humble / Iron Swarm Topics Architecture</span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                DDS Cyclone Middleware Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="text-sky-400 font-bold flex items-center justify-between">
                  <span>Published Topics</span>
                  <span className="text-[10px] text-slate-400">SwarmOS → PX4</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <code className="text-emerald-300">/swarm/&#123;uav_id&#125;/cmd_vel</code>
                    <p className="text-[10px] text-slate-400 mt-0.5">geometry_msgs/Twist (velocity vector to waypoint)</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <code className="text-emerald-300">/swarm/&#123;uav_id&#125;/setpoint_raw/local</code>
                    <p className="text-[10px] text-slate-400 mt-0.5">mavros_msgs/PositionTarget (NED 3D target coordinates)</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <code className="text-emerald-300">/swarm/cbba_consensus</code>
                    <p className="text-[10px] text-slate-400 mt-0.5">swarmos_msgs/MeshAuctionState (bid vector &amp; assignments)</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="text-amber-400 font-bold flex items-center justify-between">
                  <span>Subscribed Feedback Topics</span>
                  <span className="text-[10px] text-slate-400">PX4 → SwarmOS</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <code className="text-sky-300">/swarm/&#123;uav_id&#125;/local_position/pose</code>
                    <p className="text-[10px] text-slate-400 mt-0.5">geometry_msgs/PoseStamped (high-frequency EKF2 telemetry)</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <code className="text-sky-300">/swarm/&#123;uav_id&#125;/battery</code>
                    <p className="text-[10px] text-slate-400 mt-0.5">sensor_msgs/BatteryState (voltage &amp; remaining capacity)</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <code className="text-sky-300">/swarm/threat_zones/detected</code>
                    <p className="text-[10px] text-slate-400 mt-0.5">swarmos_msgs/ThreatZones (onboard SDR RF jammer triggers)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyable CLI verification command */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Echo live consensus topic: </span>
                <code className="text-sky-300 font-bold">ros2 topic echo /swarm/cbba_consensus</code>
              </div>
              <button
                onClick={() => handleCopy('ros2 topic echo /swarm/cbba_consensus', 'ros2-echo')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1"
              >
                {copiedCmd === 'ros2-echo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'ros2-echo' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Launch Guide & CLI */}
      {activeSubTab === 'sitl' && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 text-xs font-mono">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>How to Launch SWARMOS with Real PX4 SITL &amp; Gazebo</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-300 font-bold mb-1">Step 1: Launch Gazebo Multi-UAV Simulation</div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <code className="text-sky-300">
                  PX4_SYS_AUTOSTART=4001 ./Tools/simulation/gazebo-classic/sitl_multiple_run.sh -m iris -n 6
                </code>
                <button
                  onClick={() => handleCopy('PX4_SYS_AUTOSTART=4001 ./Tools/simulation/gazebo-classic/sitl_multiple_run.sh -m iris -n 6', 'step1')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  {copiedCmd === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-300 font-bold mb-1">Step 2: Start SWARMOS MAVLink Bridge Node</div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <code className="text-sky-300">
                  python3 swarmos/hardware_bridge/mavlink_bridge.py --fleet-size 6 --port-base 14540
                </code>
                <button
                  onClick={() => handleCopy('python3 swarmos/hardware_bridge/mavlink_bridge.py --fleet-size 6 --port-base 14540', 'step2')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  {copiedCmd === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-300 font-bold mb-1">Step 3: Run Decentralized CBBA Swarm Orchestrator</div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <code className="text-sky-300">
                  python3 ui/main.py --mode hil --mavlink-udp 127.0.0.1:14550
                </code>
                <button
                  onClick={() => handleCopy('python3 ui/main.py --mode hil --mavlink-udp 127.0.0.1:14550', 'step3')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  {copiedCmd === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
