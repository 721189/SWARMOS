import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AgentEntity, 
  TaskEntity, 
  ObstacleEntity, 
  ThreatZoneEntity, 
  TelemetryKpis, 
  ExplainTaskData,
  MavlinkPacket,
  BlackBoxSnapshot,
  ByzantineState,
  ByzantineAttackType,
  CotEvent,
  TakServerStatus,
  SdrMeshState,
  EdgeLlmState,
  PayloadCapability,
  WindVector,
  DubinsKinematics,
  ChoiRuleLog,
  CbbaStepState,
  TerrainRidgeEntity,
  RelayLinkStatus,
  SandboxTool,
  RedTeamThreatEntity
} from '../types';
import { stepKinematics, calculatePowerDraw } from '../utils/dubinsKinematics';
import { resolveChoi2009Conflict, createChoiLog } from '../utils/choi2009Rules';
import { calculateRelayNetwork } from '../utils/rfRelayModel';

export const agentCallsignMap: Record<string, string> = {
  'A1': 'VIPER-01 (Fixed-Wing)',
  'A2': 'VIPER-02 (Multirotor)',
  'A3': 'VIPER-03 (Cargo Quad)',
  'A4': 'VIPER-04 (Lidar Quad)',
  'A5': 'TITAN-01 (UGV Hub)',
  'A6': 'NAUTILUS-01 (USV Relay)',
};

export const canvasToGeo = (x: number, y: number): { lat: number; lon: number } => {
  const baseLat = 32.8812;
  const baseLon = -117.2345;
  const lat = baseLat + ((275 - y) * 0.000045);
  const lon = baseLon + ((x - 450) * 0.000054);
  return { lat: Number(lat.toFixed(6)), lon: Number(lon.toFixed(6)) };
};

export const generateCotXml = (agent: AgentEntity, callsign: string): string => {
  const geo = canvasToGeo(agent.position[0], agent.position[1]);
  const now = new Date();
  const timeStr = now.toISOString();
  const staleTime = new Date(now.getTime() + 25000).toISOString();
  const speedKts = Math.round(agent.speed * agent.health.propulsion * 0.54);
  const headingDeg = agent.headingDeg || 45;

  let cotType = 'a-f-A-M-F-Q';
  if (agent.domain === 'AIR_FIXED_WING') cotType = 'a-f-A-M-F-F';
  else if (agent.domain === 'GROUND_UGV') cotType = 'a-f-G-U-C-I';
  else if (agent.domain === 'SURFACE_USV') cotType = 'a-f-S-X-M';

  return `<?xml version="1.0" encoding="UTF-8"?>
<event version="2.0" uid="SWARMOS-${callsign.split(' ')[0]}" type="${cotType}" how="m-g" time="${timeStr}" start="${timeStr}" stale="${staleTime}">
  <point lat="${geo.lat.toFixed(6)}" lon="${geo.lon.toFixed(6)}" hae="${agent.altitudeM}.0" ce="1.5" le="2.0"/>
  <detail>
    <contact callsign="${callsign.split(' ')[0]}" endpoint="192.168.10.${agent.id.replace('A','')}:4242"/>
    <track speed="${speedKts}.0" course="${headingDeg}.0"/>
    <status battery="${Math.round(agent.health.battery)}" readiness="true"/>
    <precisionlocation altsrc="UWB_CRL" geopointsrc="UWB_MESH"/>
    <takv os="Linux-aarch64" version="4.10.0" device="OrinJetson" platform="WinTAK"/>
    <remarks>Domain: ${agent.domain} | Payloads: [${agent.payloads.join(', ')}] | Status: ${agent.status} | Packets: ${agent.messagesSent}</remarks>
  </detail>
</event>`;
};

export function useSwarmSimulation() {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [explainData, setExplainData] = useState<ExplainTaskData | null>(null);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [mavlinkPackets, setMavlinkPackets] = useState<MavlinkPacket[]>([]);
  const [blackBoxSnapshots, setBlackBoxSnapshots] = useState<BlackBoxSnapshot[]>([]);
  const [activeScrubbedSnapshot, setActiveScrubbedSnapshot] = useState<BlackBoxSnapshot | null>(null);
  const tickRef = useRef<number>(0);

  // Heterogeneous Multi-Domain Fleet
  const initialAgents: AgentEntity[] = [
    {
      id: 'A1',
      callsign: 'VIPER-01',
      domain: 'AIR_FIXED_WING',
      payloads: ['SIGINT_DIRECTION_FINDER', 'FLIR_THERMAL'],
      altitudeM: 180,
      batteryCapacityWh: 450,
      headingDeg: 45,
      position: [120, 180],
      targetPosition: null,
      homeBase: [120, 180],
      speed: 92,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 98 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[120, 180]],
      messagesSent: 24,
      distanceTraveled: 0,
    },
    {
      id: 'A2',
      callsign: 'VIPER-02',
      domain: 'AIR_MULTIROTOR',
      payloads: ['FLIR_THERMAL'],
      altitudeM: 60,
      batteryCapacityWh: 180,
      headingDeg: 90,
      position: [150, 320],
      targetPosition: null,
      homeBase: [150, 320],
      speed: 66,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 92 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[150, 320]],
      messagesSent: 18,
      distanceTraveled: 0,
    },
    {
      id: 'A3',
      callsign: 'VIPER-03',
      domain: 'AIR_MULTIROTOR',
      payloads: ['HEAVY_CARGO'],
      altitudeM: 45,
      batteryCapacityWh: 260,
      headingDeg: 120,
      position: [130, 460],
      targetPosition: null,
      homeBase: [130, 460],
      speed: 54,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 89 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[130, 460]],
      messagesSent: 16,
      distanceTraveled: 0,
    },
    {
      id: 'A4',
      callsign: 'VIPER-04',
      domain: 'AIR_MULTIROTOR',
      payloads: ['LIDAR_3D'],
      altitudeM: 55,
      batteryCapacityWh: 180,
      headingDeg: 180,
      position: [240, 150],
      targetPosition: null,
      homeBase: [240, 150],
      speed: 68,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 94 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[240, 150]],
      messagesSent: 20,
      distanceTraveled: 0,
    },
    {
      id: 'A5',
      callsign: 'TITAN-01',
      domain: 'GROUND_UGV',
      payloads: ['MOBILE_RECHARGE_BAY', 'HIGH_POWER_RELAY'],
      altitudeM: 0,
      batteryCapacityWh: 5200,
      headingDeg: 270,
      isRechargeHub: true,
      dockedAgents: [],
      position: [260, 310],
      targetPosition: null,
      homeBase: [260, 310],
      speed: 36,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 99 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[260, 310]],
      messagesSent: 32,
      distanceTraveled: 0,
    },
    {
      id: 'A6',
      callsign: 'NAUTILUS-01',
      domain: 'SURFACE_USV',
      payloads: ['HIGH_POWER_RELAY', 'SIGINT_DIRECTION_FINDER'],
      altitudeM: 0,
      batteryCapacityWh: 3800,
      headingDeg: 315,
      position: [250, 480],
      targetPosition: null,
      homeBase: [250, 480],
      speed: 44,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 96 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[250, 480]],
      messagesSent: 28,
      distanceTraveled: 0,
    },
  ];

  // Initial Tasks with Role-Based Payload Constraints
  const initialTasks: TaskEntity[] = [
    {
      id: 'T1',
      type: 'RECON',
      position: [460, 140],
      baseReward: 110,
      duration: 5,
      urgencyWeight: 1.2,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Optical & FLIR thermal sweep of perimeter sector alpha',
      requiredPayload: 'FLIR_THERMAL',
    },
    {
      id: 'T2',
      type: 'RESCUE',
      position: [680, 220],
      baseReward: 160,
      duration: 6,
      urgencyWeight: 1.6,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Deliver 15kg emergency relief payload to isolated squad',
      requiredPayload: 'HEAVY_CARGO',
    },
    {
      id: 'T3',
      type: 'NEUTRALIZE',
      position: [580, 420],
      baseReward: 175,
      duration: 7,
      urgencyWeight: 1.8,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'SIGINT RF direction finding and radar node geo-triangulation',
      requiredPayload: 'SIGINT_DIRECTION_FINDER',
      prerequisites: ['T1'],
    },
    {
      id: 'T4',
      type: 'SURVEIL',
      position: [820, 340],
      baseReward: 120,
      duration: 6,
      urgencyWeight: 1.1,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: '3D high-density lidar point-cloud mapping of highway choke-point',
      requiredPayload: 'LIDAR_3D',
    },
    {
      id: 'T5',
      type: 'RELAY',
      position: [750, 520],
      baseReward: 140,
      duration: 5,
      urgencyWeight: 1.2,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'High-power directional beamforming bridge across mountain ridge',
      requiredPayload: 'HIGH_POWER_RELAY',
      prerequisites: ['T3'],
    },
    {
      id: 'T6',
      type: 'RECON',
      position: [880, 180],
      baseReward: 100,
      duration: 4,
      urgencyWeight: 1.0,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'FLIR thermal perimeter patrol over eastern industrial hangar',
      requiredPayload: 'FLIR_THERMAL',
    },
  ];

  // Obstacles
  const initialObstacles: ObstacleEntity[] = [
    { id: 'B1', x: 380, y: 220, width: 80, height: 160, type: 'BUILDING' },
    { id: 'B2', x: 520, y: 80, width: 60, height: 100, type: 'NO_FLY' },
  ];

  // Threat Zones
  const initialThreats: ThreatZoneEntity[] = [
    { id: 'JAM_1', center: [650, 380], radius: 100, type: 'RF_JAMMER', intensity: 0.8 },
  ];

  const [agents, setAgents] = useState<AgentEntity[]>(initialAgents);
  const [tasks, setTasks] = useState<TaskEntity[]>(initialTasks);
  const tasksRef = useRef<TaskEntity[]>(initialTasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  const [obstacles, setObstacles] = useState<ObstacleEntity[]>(initialObstacles);
  const [threatZones, setThreatZones] = useState<ThreatZoneEntity[]>(initialThreats);
  const [commLinks, setCommLinks] = useState<[string, string][]>([]);

  // --- Tactical SDR MANET State ---
  const [sdrMeshState, setSdrMeshState] = useState<SdrMeshState>({
    radioModel: 'SILVUS_STREAMCASTER_4400',
    frequencyMhz: 2250.0,
    bandwidthMhz: 20.0,
    txPowerDbm: 33.0,
    rfJammingActive: false,
    averageSnrDb: 25.4,
    packetLossPct: 0.15,
    throughputMbps: 18.2,
    channelFadingModel: 'RAYLEIGH',
    cryptoSuite: 'CHACHA20_POLY1305',
    activeKeyEpoch: 104,
    epochExpiresSec: 46,
    replayAttacksBlocked: 21,
    beamformingGainDbi: 6.5,
    frequencyHoppingRateHopsSec: 1200,
  });

  // --- Edge SLM Jetson Orin Native Engine ---
  const [edgeLlmState, setEdgeLlmState] = useState<EdgeLlmState>({
    model: 'SmolLM2-1.7B-Q4',
    targetHardware: 'NVIDIA Jetson AGX Orin 64GB',
    inferenceEngine: 'TensorRT-LLM C++ Native',
    latencyMs: 38,
    tokensPerSec: 79.2,
    vramUsageMb: 1840,
    isOffline: true,
    promptTokens: 342,
    completionTokens: 135,
    isInferring: false,
    lastEdgePrompt: 'Tactical Situation: High-power RF jammer active at Grid (650, 380). Rebalance multi-domain fleet.',
    lastEdgePlan: `[JETSON ORIN TENSORRT-LLM MISSION REPLAN]
Execution Mode: 100% Offline C++ TensorRT-LLM (INT4 Quantized)
Domain Coordination Summary:
1. High-Altitude Airborne Scout: VIPER-01 (Fixed-Wing, 180m) maintains standoff SIGINT orbit outside 100m jamming radius.
2. Ground Mobility Anchor: TITAN-01 (Heavy UGV) dispatched as high-power relay node to establish +6.5 dBi beamforming link with NAUTILUS-01 (USV).
3. Payload Constraint Matching:
   - Task T2 [RESCUE] awarded exclusively to VIPER-03 (Cargo Quad) holding HEAVY_CARGO payload.
   - Task T4 [SURVEIL] awarded exclusively to VIPER-04 (Lidar Quad) holding LIDAR_3D.
4. Autonomous Dock-Recharge: Multirotor VIPER-02 battery prioritized for mobile inductive docking onto TITAN-01.
5. anomaly-aware Layer: ChaCha20-Poly1305 nonce synchronized across all 6 ad-hoc SDR nodes. Replay attacks blocked.`,
  });

  // --- Byzantine & GPS-Denied State ---
  const [byzantineState, setByzantineState] = useState<ByzantineState>({
    isGpsDenied: false,
    crlActive: false,
    uwbMeshNoiseM: 0.14,
    byzantineAgents: {
      'A1': { attack: 'NONE', trustScore: 100, status: 'TRUSTED', violations: [] },
      'A2': { attack: 'NONE', trustScore: 100, status: 'TRUSTED', violations: [] },
      'A3': { attack: 'NONE', trustScore: 100, status: 'TRUSTED', violations: [] },
      'A4': { attack: 'NONE', trustScore: 100, status: 'TRUSTED', violations: [] },
      'A5': { attack: 'NONE', trustScore: 100, status: 'TRUSTED', violations: [] },
      'A6': { attack: 'NONE', trustScore: 100, status: 'TRUSTED', violations: [] },
    },
    anomalyThresholdPct: 66.7,
    blockedPoisonBids: 0,
    spoofedVectorsMitigated: 0,
  });

  const byzantineStateRef = useRef<ByzantineState>(byzantineState);
  useEffect(() => {
    byzantineStateRef.current = byzantineState;
  }, [byzantineState]);

  // Tactical visual overlays
  const [tacticalMode, setTacticalMode] = useState<{
    showMilStdSymbology: boolean;
    showUwbRangingMesh: boolean;
    showCotCallsigns: boolean;
  }>({
    showMilStdSymbology: false,
    showUwbRangingMesh: false,
    showCotCallsigns: true,
  });

  // ATAK CoT and TAK Server states
  const [cotEvents, setCotEvents] = useState<CotEvent[]>([]);
  const [takServerStatus, setTakServerStatus] = useState<TakServerStatus>({
    connected: true,
    endpoint: '239.2.3.1:6969',
    protocol: 'UDP_MULTICAST',
    packetsOut: 240,
    lastHeartbeat: new Date().toISOString().substring(11, 19),
  });

  // --- Atmospheric Wind Vector & Dubins Flight Dynamics ---
  const [windVector, setWindVector] = useState<WindVector>({
    speedMps: 12,
    directionDeg: 240,
    turbulencePct: 15,
  });

  // --- Terrain Digital Elevation Model (DEM) & LOS Relay ---
  const [terrainRidges, setTerrainRidges] = useState<TerrainRidgeEntity[]>([
    { id: 'RIDGE_SIERRA', name: 'Ridge Sierra', x: 340, y: 160, width: 80, height: 180, elevationM: 140, roughnessFactor: 0.8 },
    { id: 'RIDGE_ECHO', name: 'Ridge Echo', x: 590, y: 260, width: 80, height: 160, elevationM: 110, roughnessFactor: 0.6 },
  ]);
  const [isAutonomousRelayActive, setIsAutonomousRelayActive] = useState<boolean>(true);
  const [relayLinks, setRelayLinks] = useState<RelayLinkStatus[]>([]);

  // --- CBBA Consensus Step-Debugger & Choi 2009 Rule State ---
  const [cbbaStepState, setCbbaStepState] = useState<CbbaStepState>({
    isStepMode: false,
    currentIteration: 1,
    currentPhase: 'CONVERGED',
    packetDropRatePct: 0,
    droppedPacketsCount: 0,
    yMatrix: {},
    zMatrix: {},
    timestampMatrix: {},
    recentDecisions: [],
    isConverged: true,
  });

  // --- Adversarial Red-Team Sandbox & Live Mission Builder ---
  const [redTeamThreats, setRedTeamThreats] = useState<RedTeamThreatEntity[]>([
    {
      id: 'THREAT_CONVOY_1',
      name: 'OPFOR-CONVOY-BRAVO',
      type: 'MOBILE_CONVOY',
      position: [680, 160],
      radius: 45,
      waypoints: [[680, 160], [780, 160], [780, 320], [680, 320]],
      waypointIndex: 0,
      speed: 16,
      headingDeg: 90,
      intensity: 0.9,
      active: true,
    },
  ]);
  const [activeSandboxTool, setActiveSandboxTool] = useState<SandboxTool>('INSPECT');

  const [kpis, setKpis] = useState<TelemetryKpis>({
    taskCompletionPct: 0,
    completedTasks: 0,
    totalTasks: initialTasks.length,
    avgConsensusMs: 16.8,
    resilienceFactorPct: 100,
    operationalFleetPct: 100,
    totalMeshPackets: 112,
    totalRewardEarned: 0,
    avgBatteryPct: 95,
  });

  const addLog = useCallback((msg: string) => {
    setEventLogs((prev) => [msg, ...prev].slice(0, 30));
  }, []);

  // CBBA Auction calculation with Payload & Domain Constraint-Satisfaction
  const runCBBAAuction = useCallback((currentAgents: AgentEntity[], currentTasks: TaskEntity[]) => {
    const updatedAgents = currentAgents.map((a) => ({
      ...a,
      bundle: [...a.bundle],
      path: [...a.path],
      winningBids: { ...a.winningBids },
      winningAgents: { ...a.winningAgents },
    }));

    const updatedTasks = currentTasks.map((t) => ({ ...t }));
    const operationalAgents = updatedAgents.filter((a) => {
      const byz = byzantineStateRef.current.byzantineAgents[a.id];
      if (byz && (byz.status === 'QUARANTINED' || byz.status === 'EJECTED')) {
        return false; // Anomaly Filter isolates quarantined/ejected nodes
      }
      return a.health.propulsion > 0.1 && a.health.battery > 5 && a.status !== 'RECHARGING';
    });

    if (operationalAgents.length === 0) return { updatedAgents, updatedTasks };

    // Greedy bundle construction
    for (const task of updatedTasks) {
      if (task.status === 'COMPLETED') continue;

      // Operator Override Lock: Bypass CBBA auction for manually routed tasks
      if (task.isOperatorOverride && task.assignedAgentId) {
        const assignedAgent = updatedAgents.find((a) => a.id === task.assignedAgentId);
        if (assignedAgent && assignedAgent.health.propulsion > 0.1) {
          if (!assignedAgent.bundle.includes(task.id)) {
            assignedAgent.bundle.unshift(task.id);
            assignedAgent.path.unshift(task.id);
          }
          assignedAgent.winningBids[task.id] = 999999;
          assignedAgent.winningAgents[task.id] = assignedAgent.id;
          continue; // Successfully locked to operator-assigned agent
        }
      }

      let highestBid = -1;
      let winningAgent: AgentEntity | null = null;

      for (const agent of operationalAgents) {
        if (agent.bundle.length >= agent.maxBundleSize) continue;

        // Constraint-Satisfaction 1: Payload Compatibility
        if (task.requiredPayload && !agent.payloads.includes(task.requiredPayload)) {
          continue; // Incompatible sensor / hardware
        }

        // Constraint-Satisfaction 2: Domain Compatibility
        if (task.requiredDomain && agent.domain !== task.requiredDomain) {
          continue; // Domain mismatch (e.g. Ground UGV vs Air Fixed-Wing)
        }

        const byz = byzantineStateRef.current.byzantineAgents[agent.id];

        // Marginal score = BaseReward * lambda^(arrival_time * urgency) - distPenalty
        const dist = Math.hypot(task.position[0] - agent.position[0], task.position[1] - agent.position[1]);
        const speed = Math.max(10, agent.speed * agent.health.propulsion);
        const arrivalTime = dist / speed;
        const temporalDecay = Math.pow(0.95, arrivalTime * task.urgencyWeight);
        const pathCost = dist * 0.05;
        let marginalBid = Math.max(1, task.baseReward * temporalDecay - pathCost);

        // Anomaly Defense: Detect and quarantine Byzantine Bid Poisoning
        if (byz && byz.attack === 'BID_POISON') {
          const rogueBid = 9999;
          const maxTheoretical = task.baseReward * 1.25;
          if (rogueBid > maxTheoretical) {
            setTimeout(() => {
              setByzantineState((prev) => {
                const ag = prev.byzantineAgents[agent.id];
                if (!ag) return prev;
                const newTrust = Math.max(0, ag.trustScore - 40);
                const newStatus = newTrust <= 20 ? 'EJECTED' : newTrust <= 50 ? 'SUSPECT' : 'TRUSTED';
                return {
                  ...prev,
                  blockedPoisonBids: prev.blockedPoisonBids + 1,
                  byzantineAgents: {
                    ...prev.byzantineAgents,
                    [agent.id]: {
                      ...ag,
                      trustScore: newTrust,
                      status: newStatus,
                      violations: [...ag.violations, `Bid ${rogueBid} > bound ${maxTheoretical.toFixed(0)} on ${task.id}`].slice(-4),
                    },
                  },
                };
              });
            }, 0);
            continue; // Reject rogue bid under Byzantine anomaly rules
          }
        }

        if (marginalBid > highestBid) {
          highestBid = marginalBid;
          winningAgent = agent;
        }
      }

      if (winningAgent) {
        // Assign to winner
        if (!winningAgent.bundle.includes(task.id)) {
          winningAgent.bundle.push(task.id);
          winningAgent.path.push(task.id);
        }
        winningAgent.winningBids[task.id] = highestBid;
        winningAgent.winningAgents[task.id] = winningAgent.id;
        task.assignedAgentId = winningAgent.id;
        if (task.status === 'UNASSIGNED') {
          task.status = 'ASSIGNED';
        }
      }
    }

    // Update targets for agents respecting CBBA-PR DAG prerequisites
    for (const agent of updatedAgents) {
      if (agent.path.length > 0 && !agent.currentTaskId) {
        for (const candidateId of agent.path) {
          const candidate = updatedTasks.find((t) => t.id === candidateId);
          if (candidate && candidate.status !== 'COMPLETED') {
            const prereqsMet = !candidate.prerequisites || candidate.prerequisites.every((prereqId) => {
              const pTask = updatedTasks.find((pt) => pt.id === prereqId);
              return pTask && pTask.status === 'COMPLETED';
            });
            if (prereqsMet) {
              agent.currentTaskId = candidateId;
              agent.targetPosition = candidate.position;
              agent.status = 'TRAVERSING';
              break;
            }
          }
        }
      }
    }

    return { updatedAgents, updatedTasks };
  }, []);

  const triggerAuction = useCallback(() => {
    const res = runCBBAAuction(agents, tasksRef.current);
    setAgents(res.updatedAgents);
    setTasks(res.updatedTasks);
    addLog(`CBBA AUCTION: Quorum consensus converged in ${(14 + Math.random() * 6).toFixed(1)} ms with constraint satisfaction.`);
  }, [agents, runCBBAAuction, addLog]);

  // Initial auction on mount
  useEffect(() => {
    triggerAuction();
  }, []);

  // Update mesh connectivity & SDR RF metrics
  useEffect(() => {
    const links: [string, string][] = [];
    const maxCommDist = 280;
    let totalSnr = 0;
    let linkCount = 0;

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const a1 = agents[i];
        const a2 = agents[j];
        const dist = Math.hypot(a1.position[0] - a2.position[0], a1.position[1] - a2.position[1]);

        if (dist <= maxCommDist) {
          // Check if link passes through RF Jammer
          let inJammer = false;
          for (const threat of threatZones) {
            if (threat.type === 'RF_JAMMER') {
              const dMid = Math.hypot(
                (a1.position[0] + a2.position[0]) / 2 - threat.center[0],
                (a1.position[1] + a2.position[1]) / 2 - threat.center[1]
              );
              if (dMid <= threat.radius) {
                inJammer = true;
                break;
              }
            }
          }

          if (!inJammer) {
            links.push([a1.id, a2.id]);
            // Calculate Path Loss & SNR
            // FSPL ~ 20*log10(dist) + 20*log10(2250MHz) - 147.55
            const fsplDb = 20 * Math.log10(Math.max(10, dist)) + 20 * Math.log10(sdrMeshState.frequencyMhz) - 147.55;
            const hasRelay = a1.payloads.includes('HIGH_POWER_RELAY') || a2.payloads.includes('HIGH_POWER_RELAY');
            const beamGain = hasRelay ? sdrMeshState.beamformingGainDbi : 2.1;
            const rxPowerDbm = sdrMeshState.txPowerDbm + beamGain - fsplDb;
            const snrDb = Math.max(0, rxPowerDbm - (-101.0)); // Noise floor -101 dBm
            totalSnr += snrDb;
            linkCount++;
          }
        }
      }
    }

    setCommLinks(links);

    // Calculate 3D Terrain Line-of-Sight & Autonomous Relay network
    const rLinks = calculateRelayNetwork(agents, terrainRidges, sdrMeshState.frequencyMhz);
    setRelayLinks(rLinks);

    // Update SDR Mesh KPI
    const avgSnr = linkCount > 0 ? totalSnr / linkCount : 12.0;
    const packetLoss = avgSnr < 10 ? 12.5 : avgSnr < 18 ? 2.4 : 0.15;
    const throughput = Math.max(2.0, Number(((avgSnr / 30.0) * 22.5).toFixed(1)));

    setSdrMeshState((prev) => ({
      ...prev,
      averageSnrDb: Number(avgSnr.toFixed(1)),
      packetLossPct: Number(packetLoss.toFixed(2)),
      throughputMbps: throughput,
    }));
  }, [agents, threatZones, terrainRidges, sdrMeshState.frequencyMhz, sdrMeshState.txPowerDbm, sdrMeshState.beamformingGainDbi]);

  // Key Epoch Countdown & Anti-Replay Keystream
  useEffect(() => {
    const timer = setInterval(() => {
      setSdrMeshState((prev) => {
        const nextSec = prev.epochExpiresSec - 1;
        if (nextSec <= 0) {
          return {
            ...prev,
            activeKeyEpoch: prev.activeKeyEpoch + 1,
            epochExpiresSec: 60,
            replayAttacksBlocked: prev.replayAttacksBlocked + Math.floor(Math.random() * 3),
          };
        }
        return { ...prev, epochExpiresSec: nextSec };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulation physics & MUM-T recharging loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setAgents((prevAgents) => {
        // Find UGV recharge hub
        const ugvHub = prevAgents.find((a) => a.domain === 'GROUND_UGV' && a.isRechargeHub);

        const nextAgents = prevAgents.map((agent) => {
          if (agent.health.propulsion <= 0.1 || agent.status === 'FAILED') {
            return agent;
          }

          // Handle Recharging at UGV Dock
          if (agent.status === 'RECHARGING') {
            const reloadedBattery = Math.min(100, agent.health.battery + (0.5 * simSpeed));
            if (reloadedBattery >= 96) {
              addLog(`MUM-T DOCK: ${agent.callsign} induction recharging complete (96%). Returning to active patrol.`);
              return {
                ...agent,
                status: 'IDLE' as const,
                health: { ...agent.health, battery: 96 },
              };
            }
            return {
              ...agent,
              health: { ...agent.health, battery: reloadedBattery },
            };
          }

          // Check if Multirotor needs emergency recharge
          if (
            agent.domain === 'AIR_MULTIROTOR' &&
            agent.health.battery < 25 &&
            ugvHub &&
            agent.status !== 'EXECUTING'
          ) {
            const distToUgv = Math.hypot(agent.position[0] - ugvHub.position[0], agent.position[1] - ugvHub.position[1]);
            if (distToUgv < 35) {
              addLog(`MUM-T DOCK: ${agent.callsign} docked with ${ugvHub.callsign} Mobile Ground Recharge Bay.`);
              return {
                ...agent,
                status: 'RECHARGING' as const,
                targetPosition: ugvHub.position,
              };
            } else {
              // Fly to UGV for recharge
              const speed = (agent.speed * agent.health.propulsion * simSpeed * 0.05);
              const dx = ugvHub.position[0] - agent.position[0];
              const dy = ugvHub.position[1] - agent.position[1];
              const newPos: [number, number] = [
                agent.position[0] + (dx / distToUgv) * speed,
                agent.position[1] + (dy / distToUgv) * speed,
              ];
              return {
                ...agent,
                position: newPos,
                targetPosition: ugvHub.position,
                status: 'RETURNING' as const,
              };
            }
          }

          let newPos = [...agent.position] as [number, number];
          let newTarget = agent.targetPosition;
          let newStatus = agent.status;
          let heading = agent.headingDeg;
          let bankAngle = agent.bankAngleDeg || 0;
          let crabAngle = agent.crabAngleDeg || 0;
          let groundSpeed = agent.groundSpeedMps || agent.speed;

          // Fixed-wing Dubins coordinated turn physics vs Multirotor direct hover
          if (agent.domain === 'AIR_FIXED_WING' && agent.targetPosition) {
            const dx = agent.targetPosition[0] - agent.position[0];
            const dy = agent.targetPosition[1] - agent.position[1];
            const dist = Math.hypot(dx, dy);

            if (dist > 40) {
              const kin = stepKinematics(
                agent.position,
                agent.headingDeg,
                agent.targetPosition,
                agent.speed * agent.health.propulsion,
                agent.turnRadiusM || 35,
                0.05 * simSpeed,
                true,
                windVector
              );
              newPos = kin.nextPos;
              heading = kin.nextHeadingDeg;
              bankAngle = kin.bankAngleDeg;
              crabAngle = kin.crabAngleDeg;
              groundSpeed = kin.groundSpeedMps;
              newStatus = 'TRAVERSING';
            } else {
              // Sweeping loiter orbit around target with coordinated bank
              const orbitRadius = 45;
              const angle = (Date.now() / 2000) * (agent.speed / 50);
              newPos = [
                agent.targetPosition[0] + Math.cos(angle) * orbitRadius,
                agent.targetPosition[1] + Math.sin(angle) * orbitRadius,
              ];
              heading = Math.round(((angle + Math.PI / 2) * 180 / Math.PI + 360) % 360);
              bankAngle = 22;
              newStatus = 'EXECUTING';
            }
          } else if (agent.targetPosition) {
            const dist = Math.hypot(agent.targetPosition[0] - agent.position[0], agent.targetPosition[1] - agent.position[1]);
            if (dist > 4) {
              const kin = stepKinematics(
                agent.position,
                agent.headingDeg,
                agent.targetPosition,
                agent.speed * agent.health.propulsion,
                15,
                0.05 * simSpeed,
                false,
                windVector
              );
              newPos = kin.nextPos;
              heading = kin.nextHeadingDeg;
              crabAngle = kin.crabAngleDeg;
              groundSpeed = kin.groundSpeedMps;
              bankAngle = 0;
              newStatus = 'TRAVERSING';
            } else {
              newStatus = 'EXECUTING';
            }
          }

          // Aerodynamic Energy Derating in Watts
          const powerWatts = calculatePowerDraw(agent, groundSpeed, windVector);
          const energyUsedWh = powerWatts * (0.05 * simSpeed / 3600);
          const batteryPctDrain = (energyUsedWh / agent.batteryCapacityWh) * 100;
          const newBattery = Math.max(0, agent.health.battery - batteryPctDrain);

          // Breadcrumbs
          const newBreadcrumbs = [...agent.breadcrumbs];
          if (Math.hypot(newPos[0] - newBreadcrumbs[newBreadcrumbs.length - 1][0], newPos[1] - newBreadcrumbs[newBreadcrumbs.length - 1][1]) > 15) {
            newBreadcrumbs.push(newPos);
            if (newBreadcrumbs.length > 20) newBreadcrumbs.shift();
          }

          return {
            ...agent,
            position: newPos,
            status: newStatus,
            headingDeg: heading,
            bankAngleDeg: bankAngle,
            crabAngleDeg: crabAngle,
            groundSpeedMps: groundSpeed,
            powerDrawWatts: powerWatts,
            health: { ...agent.health, battery: newBattery },
            breadcrumbs: newBreadcrumbs,
          };
        });

        // Update task execution progress
        setTasks((prevTasks) => {
          return prevTasks.map((task) => {
            if (task.status === 'COMPLETED') return task;

            // Find assigned agent
            const assigned = nextAgents.find((a) => a.id === task.assignedAgentId);
            if (assigned && assigned.status === 'EXECUTING' && assigned.currentTaskId === task.id) {
              const newProgress = Math.min(1, task.progress + (0.04 * simSpeed));
              if (newProgress >= 1) {
                addLog(`MISSION SUCCESS: Task ${task.id} (${task.type}) fulfilled by ${assigned.callsign}!`);
                assigned.bundle = assigned.bundle.filter((id) => id !== task.id);
                assigned.path = assigned.path.filter((id) => id !== task.id);
                assigned.currentTaskId = null;
                assigned.targetPosition = null;
                assigned.status = 'IDLE';

                // Next task in path
                for (const nextId of assigned.path) {
                  const nt = prevTasks.find((t) => t.id === nextId);
                  if (nt && nt.status !== 'COMPLETED') {
                    const prereqsMet = !nt.prerequisites || nt.prerequisites.every((pid) => pid === task.id || prevTasks.find((pt) => pt.id === pid)?.status === 'COMPLETED');
                    if (prereqsMet) {
                      assigned.currentTaskId = nextId;
                      assigned.targetPosition = nt.position;
                      assigned.status = 'TRAVERSING';
                      break;
                    }
                  }
                }

                return { ...task, progress: 1, status: 'COMPLETED' };
              }
              return { ...task, progress: newProgress, status: 'IN_PROGRESS' };
            }
            return task;
          });
        });

        return nextAgents;
      });

      // Advance dynamic hostile red-team convoys
      setRedTeamThreats((prevThreats) => {
        return prevThreats.map((threat) => {
          if (!threat.active || threat.speed === 0 || !threat.waypoints || threat.waypoints.length === 0) {
            return threat;
          }
          const currIdx = threat.waypointIndex || 0;
          const targetWp = threat.waypoints[currIdx];
          const dx = targetWp[0] - threat.position[0];
          const dy = targetWp[1] - threat.position[1];
          const dist = Math.hypot(dx, dy);
          const step = (threat.speed * simSpeed * 0.05);

          if (dist <= step || dist < 4) {
            const nextIdx = (currIdx + 1) % threat.waypoints.length;
            return {
              ...threat,
              position: targetWp,
              waypointIndex: nextIdx,
            };
          } else {
            const newPos: [number, number] = [
              threat.position[0] + (dx / dist) * step,
              threat.position[1] + (dy / dist) * step,
            ];
            const heading = Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360);
            return {
              ...threat,
              position: newPos,
              headingDeg: heading,
            };
          }
        });
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, addLog]);

  // Periodic CoT event emission
  useEffect(() => {
    const interval = setInterval(() => {
      const newCotEvents: CotEvent[] = agents.map((agent) => {
        const geo = canvasToGeo(agent.position[0], agent.position[1]);
        const callsign = agentCallsignMap[agent.id] || agent.id;
        const rawXml = generateCotXml(agent, callsign);
        return {
          id: `COT-${agent.id}-${Date.now()}`,
          uid: `SWARMOS-${callsign.split(' ')[0]}`,
          type: agent.domain === 'AIR_FIXED_WING' ? 'a-f-A-M-F-F' : agent.domain === 'GROUND_UGV' ? 'a-f-G-U-C-I' : agent.domain === 'SURFACE_USV' ? 'a-f-S-X-M' : 'a-f-A-M-F-Q',
          callsign: callsign.split(' ')[0],
          lat: geo.lat,
          lon: geo.lon,
          hae: agent.altitudeM,
          speedKts: Math.round(agent.speed * agent.health.propulsion * 0.54),
          headingDeg: agent.headingDeg || 45,
          time: new Date().toISOString(),
          stale: new Date(Date.now() + 25000).toISOString(),
          batteryPct: Math.round(agent.health.battery),
          assignedTaskId: agent.currentTaskId,
          rawXml,
        };
      });

      setCotEvents(newCotEvents);
      setTakServerStatus((prev) => ({
        ...prev,
        packetsOut: prev.packetsOut + newCotEvents.length,
        lastHeartbeat: new Date().toISOString().substring(11, 19),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [agents]);

  // Failure and threat injection
  const injectMotorFailure = (agentId: string) => {
    setAgents((prev) => {
      const copy = prev.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            health: { ...a.health, propulsion: 0.0 },
            status: 'FAILED' as const,
          };
        }
        return a;
      });

      const failedAgent = copy.find((a) => a.id === agentId);
      const orphaned = failedAgent ? [...failedAgent.bundle] : [];

      addLog(`CATASTROPHIC FAILURE: ${failedAgent?.callsign || agentId} lost propulsion.`);

      // Unassign tasks
      setTasks((tPrev) => {
        const tCopy = tPrev.map((t) => {
          if (orphaned.includes(t.id) && t.status !== 'COMPLETED') {
            return { ...t, status: 'UNASSIGNED', assignedAgentId: null, progress: 0 } as TaskEntity;
          }
          return t;
        });

        setTimeout(() => {
          const res = runCBBAAuction(copy, tCopy);
          addLog(`DYNAMIC REPLANNER: Orphaned tasks [${orphaned.join(', ')}] re-allocated across surviving fleet in 14.8 ms.`);
          setAgents(res.updatedAgents);
          setTasks(res.updatedTasks);
        }, 150);

        return tCopy;
      });

      return copy;
    });
  };

  const injectJammer = (x = 450, y = 280) => {
    const newJammer: ThreatZoneEntity = {
      id: `JAM_${threatZones.length + 1}`,
      center: [x, y],
      radius: 120,
      type: 'RF_JAMMER',
      intensity: 1.0,
    };
    setThreatZones((prev) => [...prev, newJammer]);
    addLog(`THREAT INJECTED: High-power RF Electronic Warfare Jammer deployed at [${Math.round(x)}, ${Math.round(y)}].`);
  };

  const injectSAM = (x = 720, y = 160) => {
    const newSAM: ThreatZoneEntity = {
      id: `SAM_${threatZones.length + 1}`,
      center: [x, y],
      radius: 90,
      type: 'RADAR_SAM',
      intensity: 1.0,
    };
    setThreatZones((prev) => [...prev, newSAM]);
    addLog(`THREAT INJECTED: Pop-up Surface-to-Air Missile Radar Threat Zone detected at [${Math.round(x)}, ${Math.round(y)}].`);
  };

  const dockAgentToUgv = (agentId: string, ugvId: string) => {
    const ugv = agents.find((a) => a.id === ugvId);
    if (!ugv) return;
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            targetPosition: ugv.position,
            status: 'RETURNING' as const,
          };
        }
        return a;
      })
    );
    addLog(`MUM-T COMMAND: Ordered ${agentCallsignMap[agentId] || agentId} to rendezvous with ${ugv.callsign} for induction recharge.`);
  };

  const setSdrRadioModel = (model: SdrMeshState['radioModel']) => {
    setSdrMeshState((prev) => ({
      ...prev,
      radioModel: model,
      txPowerDbm: model === 'SILVUS_STREAMCASTER_4400' ? 33.0 : model === 'TRELLISWARE_TW950' ? 30.0 : 32.0,
      beamformingGainDbi: model === 'SILVUS_STREAMCASTER_4400' ? 6.5 : 4.2,
    }));
    addLog(`SDR MANET: Radio waveform switched to ${model}.`);
  };

  const toggleSdrCryptoSuite = () => {
    setSdrMeshState((prev) => {
      const nextSuite = prev.cryptoSuite === 'CHACHA20_POLY1305' ? 'CRYSTALS_KYBER_PQ' : 'CHACHA20_POLY1305';
      addLog(`anomaly-aware: Swapped session cipher to ${nextSuite}.`);
      return {
        ...prev,
        cryptoSuite: nextSuite,
        activeKeyEpoch: prev.activeKeyEpoch + 1,
        epochExpiresSec: 60,
      };
    });
  };

  const triggerEdgeLlmInference = (customPrompt?: string) => {
    const prompt = customPrompt || edgeLlmState.lastEdgePrompt;
    setEdgeLlmState((prev) => ({ ...prev, isInferring: true, lastEdgePrompt: prompt }));
    addLog(`JETSON ORIN INFERENCE: Running offline INT4 TensorRT-LLM on prompt: "${prompt.slice(0, 40)}..."`);

    setTimeout(() => {
      const generatedPlan = `[JETSON ORIN TENSORRT-LLM MISSION DIRECTIVE]
Model: ${edgeLlmState.model} | HW: ${edgeLlmState.targetHardware}
Zero-Cloud Native Execution | Inference Latency: 38ms | Throughput: 79.2 tok/s

Autonomous Re-planning Decision:
1. Threat Deconfliction: Re-route VIPER-01 (Fixed-Wing Scout) to orbit waypoint (410, 120), outside jamming envelope.
2. Dynamic Payload Matching:
   - Task T2 (RESCUE) assigned to VIPER-03 (Cargo Quad, 260Wh) due to HEAVY_CARGO requirement.
   - Task T4 (SURVEIL) assigned to VIPER-04 (Lidar Quad, 180Wh) due to LIDAR_3D requirement.
3. Ground Anchor Maneuver: Advance TITAN-01 (UGV Hub) to Grid (320, 280) to bridge tactical SDR link with NAUTILUS-01 (USV).
4. Inductive Dock-Recharge: Scheduled multirotor battery turnaround at TITAN-01 Mobile Bay.
5. Cryptographic Nonce: ChaCha20-Poly1305 epoch key ${edgeLlmState.promptTokens + 104} verified.`;

      setEdgeLlmState((prev) => ({
        ...prev,
        isInferring: false,
        lastEdgePlan: generatedPlan,
        promptTokens: 350 + Math.floor(Math.random() * 30),
        completionTokens: 140 + Math.floor(Math.random() * 20),
      }));
      addLog('JETSON ORIN INFERENCE: Mission plan generated and executed across swarm.');
      triggerAuction();
    }, 600);
  };

  const loadPresetMission = (prompt: string) => {
    addLog(`NVIDIA NEMOTRON INGESTION: Translating directive "${prompt.slice(0, 45)}..."`);
    const newTasks: TaskEntity[] = [
      {
        id: 'T1',
        type: 'RECON',
        position: [420, 160],
        baseReward: 110,
        duration: 5,
        urgencyWeight: 1.2,
        status: 'UNASSIGNED',
        assignedAgentId: null,
        progress: 0,
        description: 'Sweep priority sector and map terrain obstacles',
        requiredPayload: 'FLIR_THERMAL',
      },
      {
        id: 'T2',
        type: 'RESCUE',
        position: [640, 260],
        baseReward: 150,
        duration: 6,
        urgencyWeight: 1.6,
        status: 'UNASSIGNED',
        assignedAgentId: null,
        progress: 0,
        description: 'Deliver emergency drop at designated coordinates',
        requiredPayload: 'HEAVY_CARGO',
      },
      {
        id: 'T3',
        type: 'NEUTRALIZE',
        position: [780, 390],
        baseReward: 175,
        duration: 7,
        urgencyWeight: 1.8,
        status: 'UNASSIGNED',
        assignedAgentId: null,
        progress: 0,
        description: 'Electronic suppression of enemy emitter',
        requiredPayload: 'SIGINT_DIRECTION_FINDER',
      },
      {
        id: 'T4',
        type: 'SURVEIL',
        position: [850, 160],
        baseReward: 105,
        duration: 5,
        urgencyWeight: 1.0,
        status: 'UNASSIGNED',
        assignedAgentId: null,
        progress: 0,
        description: 'Continuous aerial perimeter surveillance',
        requiredPayload: 'LIDAR_3D',
      },
    ];

    setTasks(newTasks);
    setAgents(initialAgents);
    setTimeout(() => {
      const res = runCBBAAuction(initialAgents, newTasks);
      setAgents(res.updatedAgents);
      setTasks(res.updatedTasks);
      addLog(`NEMOTRON PARSER: Dispatched ${newTasks.length} objectives. Swarm reached consensus in 19.1 ms.`);
    }, 200);
  };

  const resetSimulation = () => {
    setAgents(initialAgents);
    setTasks(initialTasks);
    setThreatZones(initialThreats);
    addLog('Simulation reset to nominal multi-domain configuration.');
    setTimeout(() => {
      triggerAuction();
    }, 100);
  };

  const generateExplainData = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId) || tasks[0];
    const biddingMatrix = agents.map((a) => {
      const isFailed = a.health.propulsion <= 0.1;
      const dist = Math.hypot(task.position[0] - a.position[0], task.position[1] - a.position[1]);
      const speed = a.speed * a.health.propulsion;
      const arrival = isFailed ? 999 : dist / Math.max(1, speed);
      const decay = Math.pow(0.95, arrival * task.urgencyWeight);
      const marginal = isFailed ? 0 : Math.max(0, task.baseReward * decay - dist * 0.05);

      let reason: string | undefined = undefined;
      if (isFailed) reason = 'PROPULSION FAILED';
      else if (task.requiredPayload && !a.payloads.includes(task.requiredPayload)) {
        reason = `LACKS REQUIRED PAYLOAD: ${task.requiredPayload}`;
      } else if (task.requiredDomain && a.domain !== task.requiredDomain) {
        reason = `DOMAIN MISMATCH: Needs ${task.requiredDomain}`;
      }

      return {
        agentId: a.id,
        distanceM: Math.round(dist),
        estArrivalSec: Math.round(arrival * 10) / 10,
        marginalBid: Math.round(marginal * 10) / 10,
        capacityLeft: Math.max(0, a.maxBundleSize - a.bundle.length),
        isWinner: a.id === task.assignedAgentId,
        reason,
      };
    });

    biddingMatrix.sort((a, b) => b.marginalBid - a.marginalBid);

    const winner = task.assignedAgentId;
    const winnerAgent = agents.find((a) => a.id === winner);
    const explanation = task.isOperatorOverride && winner
      ? `⚡ [MANUAL OPERATOR OVERRIDE] Task ${task.id} (${task.type}) was manually re-routed to ${winnerAgent?.callsign || winner} via operator drag-and-drop intervention, forcefully locking assignment and bypassing autonomous CBBA auction consensus.`
      : winner
      ? `Task ${task.id} (${task.type}) was awarded to ${winnerAgent?.callsign || winner} because it satisfies payload requirements (${task.requiredPayload || 'GENERIC'}) and offered the highest marginal utility score of ${
          biddingMatrix.find((b) => b.agentId === winner)?.marginalBid || 0
        } pts.`
      : 'Task is currently unassigned due to agent capacity limits or hostile jamming interference.';

    setExplainData({
      taskId: task.id,
      winnerAgentId: winner,
      taskType: task.type,
      explanation,
      biddingMatrix,
    });
    setIsExplainOpen(true);
  };

  const toggleGpsDenied = () => {
    setByzantineState((prev) => {
      const nextGpsDenied = !prev.isGpsDenied;
      if (nextGpsDenied) {
        addLog('[EW PNT ALERT] GPS L1/L2 constellation denied across theater. Swarm transitioned to UWB ranging mesh CRL & dead-reckoning.');
      } else {
        addLog('[EW PNT] GPS constellation acquired. Swarm restored GNSS absolute positioning.');
      }
      return {
        ...prev,
        isGpsDenied: nextGpsDenied,
        crlActive: nextGpsDenied,
      };
    });

    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        health: {
          ...a.health,
          gps: byzantineStateRef.current.isGpsDenied ? 1.0 : 0.0,
        },
      }))
    );
  };

  const injectByzantineAttack = (agentId: string, attack: ByzantineAttackType) => {
    const isAttacking = attack !== 'NONE';
    setByzantineState((prev) => {
      const target = prev.byzantineAgents[agentId] || { attack: 'NONE', trustScore: 100, status: 'TRUSTED', violations: [] };
      return {
        ...prev,
        byzantineAgents: {
          ...prev.byzantineAgents,
          [agentId]: {
            ...target,
            attack,
            status: isAttacking ? 'SUSPECT' : 'TRUSTED',
            trustScore: isAttacking ? 60 : 100,
            violations: isAttacking ? [`Adversary mode activated: ${attack}`] : [],
          },
        },
      };
    });

    if (isAttacking) {
      addLog(`[CYBER ATTACK] Adversary injected ${attack} into node ${agentId} (${agentCallsignMap[agentId] || agentId}). Byzantine anomaly filter actively monitoring.`);
      setTimeout(() => {
        triggerAuction();
      }, 50);
    } else {
      addLog(`[CYBER RECOVERY] Node ${agentId} scrubbed & restored to TRUSTED status.`);
      setTimeout(() => {
        triggerAuction();
      }, 50);
    }
  };

  const remediateByzantine = (agentId: string) => {
    injectByzantineAttack(agentId, 'NONE');
  };

  const exportAtakMissionPackage = () => {
    const headerXml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- SWARMOS ATAK / WinTAK Mission Data Package -->
<!-- Generated at: ${new Date().toISOString()} -->
<!-- Coordinate System: WGS-84 / Ellipsoidal -->
<missionPackage version="2.0">
  <metadata name="SWARMOS_TACTICAL_PACKAGE" author="SWARMOS Ground Station" time="${new Date().toISOString()}"/>
  <events count="${cotEvents.length}">
${cotEvents.map((e) => e.rawXml).join('\n\n')}
  </events>
  <targets count="${tasks.length}">
${tasks.map((t) => {
  const geo = canvasToGeo(t.position[0], t.position[1]);
  return `    <target id="${t.id}" type="${t.type}" lat="${geo.lat}" lon="${geo.lon}" status="${t.status}" assignedTo="${t.assignedAgentId || 'NONE'}" requiredPayload="${t.requiredPayload || 'NONE'}"/>`;
}).join('\n')}
  </targets>
</missionPackage>`;

    const blob = new Blob([headerXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swarmos_atak_mission_package_${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Exported official ATAK CoT Mission Data Package (.xml).');
  };

  // --- Tactical Handlers: Wind & Dubins ---
  const updateWindVector = useCallback((partial: Partial<WindVector>) => {
    setWindVector((prev) => {
      const next = { ...prev, ...partial };
      addLog(`METOC: Atmospheric wind vector adjusted to ${next.speedMps} m/s @ ${next.directionDeg}° (Turbulence: ${next.turbulencePct}%).`);
      return next;
    });
  }, [addLog]);

  // --- Tactical Handlers: Terrain & Relay ---
  const toggleAutonomousRelay = useCallback(() => {
    setIsAutonomousRelayActive((prev) => {
      const next = !prev;
      addLog(`RF RELAY: Autonomous Airborne/UGV Relay bridging ${next ? 'ACTIVATED' : 'DEACTIVATED'}.`);
      return next;
    });
  }, [addLog]);

  // --- Tactical Handlers: Choi 2009 CBBA Step Debugger ---
  const toggleStepMode = useCallback(() => {
    setCbbaStepState((prev) => {
      const nextMode = !prev.isStepMode;
      addLog(`CBBA STEP DEBUGGER: Step-by-step mode ${nextMode ? 'ENABLED (Simulation paused for deterministic Choi 2009 inspection)' : 'DISABLED (Continuous consensus resumed)'}.`);
      return { ...prev, isStepMode: nextMode };
    });
  }, [addLog]);

  const setPacketDropRate = useCallback((pct: number) => {
    setCbbaStepState((prev) => ({ ...prev, packetDropRatePct: pct }));
  }, []);

  const resetAuctionStepDebugger = useCallback(() => {
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        bundle: [],
        path: [],
        winningBids: {},
        winningAgents: {},
        currentTaskId: null,
      }))
    );
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'UNASSIGNED',
        assignedAgentId: null,
        progress: 0,
      }))
    );
    setCbbaStepState({
      isStepMode: true,
      currentIteration: 1,
      currentPhase: 'PHASE_1_BUNDLE',
      packetDropRatePct: 0,
      droppedPacketsCount: 0,
      yMatrix: {},
      zMatrix: {},
      timestampMatrix: {},
      recentDecisions: [],
      isConverged: false,
    });
    addLog('CBBA STEP DEBUGGER: Reset consensus state vectors (y, z, s) to zero for fresh execution.');
  }, [addLog]);

  const stepAuctionIteration = useCallback((phase: 'PHASE_1_BUNDLE' | 'PHASE_2_CONSENSUS') => {
    if (phase === 'PHASE_1_BUNDLE') {
      const res = runCBBAAuction(agents, tasksRef.current);
      setAgents(res.updatedAgents);
      setTasks(res.updatedTasks);

      const yMat: Record<string, Record<string, number>> = {};
      const zMat: Record<string, Record<string, string | null>> = {};
      res.updatedAgents.forEach((a) => {
        yMat[a.id] = { ...a.winningBids };
        zMat[a.id] = { ...a.winningAgents };
      });

      setCbbaStepState((prev) => ({
        ...prev,
        currentPhase: 'PHASE_1_BUNDLE',
        yMatrix: yMat,
        zMatrix: zMat,
        isConverged: false,
      }));
      addLog(`CBBA STEP: Phase 1 (Bundle Addition) computed for Iteration ${cbbaStepState.currentIteration}.`);
    } else {
      const decisions: ChoiRuleLog[] = [];
      let droppedCount = 0;
      let conflictCount = 0;

      const updatedAgents = agents.map((a) => ({
        ...a,
        winningBids: { ...a.winningBids },
        winningAgents: { ...a.winningAgents },
      }));

      commLinks.forEach(([id1, id2]) => {
        const a1 = updatedAgents.find((a) => a.id === id1);
        const a2 = updatedAgents.find((a) => a.id === id2);
        if (!a1 || !a2) return;

        if (Math.random() * 100 < cbbaStepState.packetDropRatePct) {
          droppedCount++;
          return;
        }

        tasksRef.current.forEach((t) => {
          const z1 = a1.winningAgents[t.id] || null;
          const y1 = a1.winningBids[t.id] || 0;
          const z2 = a2.winningAgents[t.id] || null;
          const y2 = a2.winningBids[t.id] || 0;

          if (z1 !== z2 || y1 !== y2) {
            conflictCount++;
            const d1 = resolveChoi2009Conflict(a1.id, a2.id, t.id, z1, y1, z2, y2);
            if (d1.action === 'UPDATE') {
              a1.winningAgents[t.id] = d1.newWinningAgent;
              a1.winningBids[t.id] = d1.newWinningBid;
            } else if (d1.action === 'RESET') {
              a1.winningAgents[t.id] = null;
              a1.winningBids[t.id] = 0;
            }
            decisions.push(createChoiLog(a1.id, a2.id, t.id, z1, y1, z2, y2, d1));

            const d2 = resolveChoi2009Conflict(a2.id, a1.id, t.id, z2, y2, z1, y1);
            if (d2.action === 'UPDATE') {
              a2.winningAgents[t.id] = d2.newWinningAgent;
              a2.winningBids[t.id] = d2.newWinningBid;
            } else if (d2.action === 'RESET') {
              a2.winningAgents[t.id] = null;
              a2.winningBids[t.id] = 0;
            }
            decisions.push(createChoiLog(a2.id, a1.id, t.id, z2, y2, z1, y1, d2));
          }
        });
      });

      setAgents(updatedAgents);
      const isConverged = conflictCount === 0;

      const yMat: Record<string, Record<string, number>> = {};
      const zMat: Record<string, Record<string, string | null>> = {};
      updatedAgents.forEach((a) => {
        yMat[a.id] = { ...a.winningBids };
        zMat[a.id] = { ...a.winningAgents };
      });

      setCbbaStepState((prev) => ({
        ...prev,
        currentPhase: isConverged ? 'CONVERGED' : 'PHASE_2_CONSENSUS',
        currentIteration: prev.currentIteration + 1,
        droppedPacketsCount: prev.droppedPacketsCount + droppedCount,
        yMatrix: yMat,
        zMatrix: zMat,
        recentDecisions: [...decisions, ...prev.recentDecisions].slice(0, 50),
        isConverged,
      }));

      addLog(`CBBA STEP: Phase 2 gossip completed. ${decisions.length} Choi 2009 rules evaluated. Converged: ${isConverged}`);
    }
  }, [agents, commLinks, cbbaStepState.currentIteration, cbbaStepState.packetDropRatePct, runCBBAAuction, addLog]);

  // --- Tactical Handlers: Red-Team Sandbox ---
  const addThreat = useCallback((threat: Omit<RedTeamThreatEntity, 'id'>) => {
    const id = `THREAT_${Date.now()}`;
    const newThreat: RedTeamThreatEntity = { ...threat, id };
    setRedTeamThreats((prev) => [...prev, newThreat]);
    addLog(`RED-TEAM OPFOR: Deployed ${newThreat.name} (${newThreat.type}) at [${Math.round(newThreat.position[0])}, ${Math.round(newThreat.position[1])}].`);
  }, [addLog]);

  const removeThreat = useCallback((id: string) => {
    setRedTeamThreats((prev) => prev.filter((t) => t.id !== id));
    addLog(`RED-TEAM OPFOR: Eliminated threat ${id}.`);
  }, [addLog]);

  const toggleThreat = useCallback((id: string) => {
    setRedTeamThreats((prev) => prev.map((t) => t.id === id ? { ...t, active: !t.active } : t));
  }, []);

  const addCustomTask = useCallback((customTask: Omit<TaskEntity, 'id' | 'status' | 'assignedAgentId' | 'progress'>) => {
    const nextId = `T${tasks.length + 1}`;
    const newTask: TaskEntity = {
      ...customTask,
      id: nextId,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
    };
    setTasks((prev) => [...prev, newTask]);
    addLog(`MISSION BUILDER: Injected custom task ${newTask.id} (${newTask.type}) with ${newTask.requiredPayload || 'GENERIC'} payload.`);
    setTimeout(() => {
      triggerAuction();
    }, 100);
  }, [tasks.length, triggerAuction, addLog]);

  // --- Operator Intervention: Manual Re-routing & Task Drag-and-Drop ---
  const manualRerouteTask = useCallback((taskId: string, targetAgentId: string) => {
    const targetCallsign = agentCallsignMap[targetAgentId] || targetAgentId;

    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prevTasks;
      const targetTask = prevTasks[taskIndex];

      const updatedTasks = prevTasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            assignedAgentId: targetAgentId,
            status: t.status === 'COMPLETED' ? 'COMPLETED' : 'ASSIGNED',
            isOperatorOverride: true,
            manualOverrideTimestamp: Date.now(),
          } as TaskEntity;
        }
        return t;
      });

      setAgents((prevAgents) => {
        return prevAgents.map((agent) => {
          // If another agent had this task, remove it
          if (agent.id !== targetAgentId) {
            const hasTask = agent.bundle.includes(taskId) || agent.path.includes(taskId);
            if (hasTask) {
              const newBundle = agent.bundle.filter((id) => id !== taskId);
              const newPath = agent.path.filter((id) => id !== taskId);
              const newWinningBids = { ...agent.winningBids };
              delete newWinningBids[taskId];
              const newWinningAgents = { ...agent.winningAgents };
              delete newWinningAgents[taskId];

              let newCurrentTaskId = agent.currentTaskId;
              let newTargetPos = agent.targetPosition;
              let newStatus = agent.status;

              if (agent.currentTaskId === taskId) {
                newCurrentTaskId = newPath.length > 0 ? newPath[0] : null;
                const nextTask = updatedTasks.find((t) => t.id === newCurrentTaskId);
                newTargetPos = nextTask ? nextTask.position : null;
                newStatus = newCurrentTaskId ? 'TRAVERSING' : 'IDLE';
              }

              return {
                ...agent,
                bundle: newBundle,
                path: newPath,
                winningBids: newWinningBids,
                winningAgents: newWinningAgents,
                currentTaskId: newCurrentTaskId,
                targetPosition: newTargetPos,
                status: newStatus,
              };
            }
            return agent;
          }

          // Target agent gets immediate high-priority override dispatch
          const newBundle = [taskId, ...agent.bundle.filter((id) => id !== taskId)];
          const newPath = [taskId, ...agent.path.filter((id) => id !== taskId)];
          const newWinningBids = { ...agent.winningBids, [taskId]: 999999 };
          const newWinningAgents = { ...agent.winningAgents, [taskId]: targetAgentId };

          return {
            ...agent,
            bundle: newBundle,
            path: newPath,
            winningBids: newWinningBids,
            winningAgents: newWinningAgents,
            currentTaskId: taskId,
            targetPosition: targetTask.position,
            status: 'TRAVERSING',
            isManualOverride: true,
          };
        });
      });

      addLog(`⚡ [OPERATOR OVERRIDE] Manual re-route: Task ${taskId} (${targetTask.type}) forcefully assigned to ${targetCallsign.split(' ')[0]} (CBBA auction bypassed).`);
      return updatedTasks;
    });
  }, [addLog]);

  const manualMoveTask = useCallback((taskId: string, newPos: [number, number]) => {
    const roundedPos: [number, number] = [Math.round(newPos[0]), Math.round(newPos[1])];
    setTasks((prevTasks) => {
      const task = prevTasks.find((t) => t.id === taskId);
      if (!task) return prevTasks;

      if (task.assignedAgentId) {
        setAgents((prevAgents) => {
          return prevAgents.map((agent) => {
            if (agent.id === task.assignedAgentId && agent.currentTaskId === taskId) {
              return {
                ...agent,
                targetPosition: roundedPos,
              };
            }
            return agent;
          });
        });
      }

      addLog(`📍 [TACTICAL RETARGET] Task ${taskId} repositioned to [${roundedPos[0]}, ${roundedPos[1]}].`);
      return prevTasks.map((t) => (t.id === taskId ? { ...t, position: roundedPos } : t));
    });
  }, [addLog]);

  const clearTaskOverride = useCallback((taskId: string) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            isOperatorOverride: false,
          };
        }
        return t;
      });
      addLog(`🔄 [OPERATOR RELEASE] Task ${taskId} returned to autonomous CBBA consensus.`);
      setTimeout(() => {
        triggerAuction();
      }, 50);
      return updated;
    });
  }, [triggerAuction, addLog]);

  return {
    agents: activeScrubbedSnapshot ? activeScrubbedSnapshot.agents : agents,
    tasks: activeScrubbedSnapshot ? activeScrubbedSnapshot.tasks : tasks,
    obstacles,
    threatZones,
    commLinks: activeScrubbedSnapshot ? activeScrubbedSnapshot.commLinks : commLinks,
    kpis,
    isRunning,
    simSpeed,
    selectedAgentId,
    selectedTaskId,
    explainData,
    isExplainOpen,
    eventLogs,
    mavlinkPackets,
    blackBoxSnapshots,
    activeScrubbedSnapshot,
    byzantineState,
    tacticalMode,
    cotEvents,
    takServerStatus,
    sdrMeshState,
    edgeLlmState,
    windVector,
    terrainRidges,
    isAutonomousRelayActive,
    relayLinks,
    cbbaStepState,
    redTeamThreats,
    activeSandboxTool,
    setSelectedAgentId,
    setSelectedTaskId,
    setIsRunning,
    setSimSpeed,
    setIsExplainOpen,
    setTacticalMode,
    injectMotorFailure,
    injectJammer,
    injectSAM,
    triggerAuction,
    loadPresetMission,
    resetSimulation,
    generateExplainData,
    toggleGpsDenied,
    injectByzantineAttack,
    remediateByzantine,
    exportAtakMissionPackage,
    dockAgentToUgv,
    setSdrRadioModel,
    toggleSdrCryptoSuite,
    triggerEdgeLlmInference,
    updateWindVector,
    toggleAutonomousRelay,
    toggleStepMode,
    setPacketDropRate,
    resetAuctionStepDebugger,
    stepAuctionIteration,
    addThreat,
    removeThreat,
    toggleThreat,
    addCustomTask,
    manualRerouteTask,
    manualMoveTask,
    clearTaskOverride,
    setActiveSandboxTool,
    scrubToSnapshot: setActiveScrubbedSnapshot,
  };
}
