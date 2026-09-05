export type TaskType = 'RECON' | 'NEUTRALIZE' | 'RESCUE' | 'SURVEIL' | 'RELAY';
export type TaskStatus = 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type AgentStatus = 'IDLE' | 'BIDDING' | 'TRAVERSING' | 'EXECUTING' | 'RETURNING' | 'JAMMED' | 'FAILED' | 'RECHARGING';

// Multi-Domain & Payload Capability
export type AgentDomain = 'AIR_FIXED_WING' | 'AIR_MULTIROTOR' | 'GROUND_UGV' | 'SURFACE_USV';
export type PayloadCapability = 
  | 'FLIR_THERMAL' 
  | 'SIGINT_DIRECTION_FINDER' 
  | 'LIDAR_3D' 
  | 'HEAVY_CARGO' 
  | 'MOBILE_RECHARGE_BAY' 
  | 'HIGH_POWER_RELAY';

export interface TaskEntity {
  id: string;
  type: TaskType;
  position: [number, number];
  baseReward: number;
  duration: number;
  urgencyWeight: number;
  status: TaskStatus;
  assignedAgentId: string | null;
  progress: number; // 0 to 1
  description: string;
  prerequisites?: string[]; // Task IDs that must be completed before execution
  requiredPayload?: PayloadCapability;
  requiredDomain?: AgentDomain;
  isOperatorOverride?: boolean; // Manual operator re-routing lock (bypasses CBBA auction)
  manualOverrideTimestamp?: number;
}

export interface MavlinkPacket {
  timestamp: string;
  agentId: string;
  msgType: 'HEARTBEAT' | 'SET_POSITION_TARGET_LOCAL_NED' | 'GLOBAL_POSITION_INT' | 'STATUSTEXT' | 'MISSION_ITEM_INT';
  payload: Record<string, string | number | boolean>;
  seq: number;
}

export interface BlackBoxSnapshot {
  timestamp: number;
  tick: number;
  agents: AgentEntity[];
  tasks: TaskEntity[];
  commLinks: [string, string][];
  event: string | null;
}

export interface AlgorithmBenchmark {
  name: string;
  type: 'CBBA_DECENTRALIZED' | 'CENTRALIZED_GCS' | 'GREEDY_FIRST_CHOICE';
  taskCompletionRate: number; // %
  spofResilience: number;     // %
  avgRecoveryTimeMs: number;  // ms
  bandwidthPerAgentKb: number; // KB/s
  energyEfficiencyPct: number; // %
  pros: string[];
  cons: string[];
}

export interface AgentHealth {
  propulsion: number; // 0 to 1
  comms: number;
  gps: number;
  battery: number; // 0 to 100
}

export interface AgentEntity {
  id: string;
  callsign: string;
  domain: AgentDomain;
  payloads: PayloadCapability[];
  altitudeM: number;
  batteryCapacityWh: number;
  headingDeg: number;
  isRechargeHub?: boolean;
  dockedAgents?: string[];
  position: [number, number];
  targetPosition: [number, number] | null;
  homeBase: [number, number];
  speed: number;
  maxBundleSize: number;
  status: AgentStatus;
  health: AgentHealth;
  bundle: string[]; // task IDs
  path: string[];   // ordered visit sequence
  winningBids: Record<string, number>;
  winningAgents: Record<string, string | null>;
  currentTaskId: string | null;
  executionTimer: number;
  breadcrumbs: [number, number][];
  messagesSent: number;
  distanceTraveled: number;
  isManualOverride?: boolean;
  // Kinematics & Dubins modeling
  turnRadiusM?: number;
  bankAngleDeg?: number;
  crabAngleDeg?: number;
  powerDrawWatts?: number;
  groundSpeedMps?: number;
}

export interface ObstacleEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'BUILDING' | 'MOUNTAIN' | 'NO_FLY';
}

export interface ThreatZoneEntity {
  id: string;
  center: [number, number];
  radius: number;
  type: 'RF_JAMMER' | 'RADAR_SAM';
  intensity: number;
}

export interface TelemetryKpis {
  taskCompletionPct: number;
  completedTasks: number;
  totalTasks: number;
  avgConsensusMs: number;
  resilienceFactorPct: number;
  operationalFleetPct: number;
  totalMeshPackets: number;
  totalRewardEarned: number;
  avgBatteryPct: number;
}

export interface ExplainTaskData {
  taskId: string;
  winnerAgentId: string | null;
  taskType: TaskType;
  explanation: string;
  biddingMatrix: {
    agentId: string;
    distanceM: number;
    estArrivalSec: number;
    marginalBid: number;
    capacityLeft: number;
    isWinner: boolean;
    reason?: string;
  }[];
}

export interface ScaffoldFile {
  path: string;
  name: string;
  category: 'core' | 'ai' | 'engine' | 'jobs' | 'ui' | 'utils' | 'docs' | 'hardware' | 'benchmark';
  content: string;
}

// --- GPS-Denied & Byzantine Resilient PNT & Consensus ---
export type ByzantineAttackType = 'BID_POISON' | 'TELEMETRY_SPOOF' | 'SYBIL_FLOOD' | 'NONE';

export interface ByzantineState {
  isGpsDenied: boolean;
  crlActive: boolean; // Cooperative Relative Localization active via UWB
  uwbMeshNoiseM: number;
  byzantineAgents: Record<string, {
    attack: ByzantineAttackType;
    trustScore: number; // 0 to 100
    status: 'TRUSTED' | 'SUSPECT' | 'QUARANTINED' | 'EJECTED';
    violations: string[];
  }>;
  bftThresholdPct: number; // 67% (2f+1 quorum)
  blockedPoisonBids: number;
  spoofedVectorsMitigated: number;
}

// --- ATAK / WinTAK & Cursor-on-Target (CoT) ---
export interface CotEvent {
  id: string;
  uid: string;
  type: string; // e.g., 'a-f-A-M-F-Q' (Friendly Airborne Multi-Rotor Drone)
  callsign: string;
  lat: number;
  lon: number;
  hae: number; // Height Above Ellipsoid (m)
  speedKts: number;
  headingDeg: number;
  time: string;
  stale: string;
  batteryPct: number;
  assignedTaskId: string | null;
  rawXml: string;
}

export interface TakServerStatus {
  connected: boolean;
  endpoint: string;
  protocol: 'UDP_MULTICAST' | 'TLS_TCP' | 'COT_STREAM';
  packetsOut: number;
  lastHeartbeat: string;
}

// --- Tactical SDR MANET & Zero-Trust Cryptography ---
export interface SdrMeshState {
  radioModel: 'SILVUS_STREAMCASTER_4400' | 'TRELLISWARE_TW950' | 'PERSISTENT_MPU5';
  frequencyMhz: number;
  bandwidthMhz: number;
  txPowerDbm: number;
  rfJammingActive: boolean;
  averageSnrDb: number;
  packetLossPct: number;
  throughputMbps: number;
  channelFadingModel: 'RAYLEIGH' | 'RICIAN_K4' | 'LOG_NORMAL_SHADOWING';
  cryptoSuite: 'CHACHA20_POLY1305' | 'CRYSTALS_KYBER_PQ';
  activeKeyEpoch: number;
  epochExpiresSec: number;
  replayAttacksBlocked: number;
  beamformingGainDbi: number;
  frequencyHoppingRateHopsSec: number;
}

// --- Edge SLM Jetson Orin Native Engine ---
export interface EdgeLlmState {
  model: 'SmolLM2-1.7B-Q4' | 'Phi-3.5-mini-Instruct-Q4' | 'Llama-3.2-3B-Q4';
  targetHardware: 'NVIDIA Jetson AGX Orin 64GB' | 'Jetson Orin Nano 8GB';
  inferenceEngine: 'TensorRT-LLM C++ Native' | 'llama.cpp GGUF';
  latencyMs: number;
  tokensPerSec: number;
  vramUsageMb: number;
  isOffline: boolean;
  promptTokens: number;
  completionTokens: number;
  lastEdgePlan: string;
  lastEdgePrompt: string;
  isInferring: boolean;
}

// --- Kinematics, Dubins Flight Dynamics & Atmospheric Modeling ---
export interface WindVector {
  speedMps: number;       // e.g. 0 to 30 m/s
  directionDeg: number;   // 0-360 degrees (meteorological origin)
  turbulencePct: number;  // 0-100% stochastic gusting
}

export interface DubinsKinematics {
  minTurnRadiusM: number;
  currentAirspeedMps: number;
  groundSpeedMps: number;
  bankAngleDeg: number;
  crabAngleDeg: number;
  rollRateDegS: number;
  maxBankAngleDeg: number;
  powerDrawWatts: number;
}

// --- CBBA Consensus Step-Debugger & Choi 2009 Rule Matrix ---
export type ChoiAction = 'UPDATE' | 'LEAVE' | 'RESET';

export interface ChoiRuleLog {
  id: string;
  timestampMs: number;
  receiverId: string;
  senderId: string;
  taskId: string;
  senderWinner: string | null;
  receiverWinner: string | null;
  senderBid: number;
  receiverBid: number;
  senderTimestamp: number;
  receiverTimestamp: number;
  ruleNumber: number;      // Rule 1..18 from Choi et al. 2009 Table 1/2
  action: ChoiAction;
  explanation: string;
}

export interface CbbaStepState {
  isStepMode: boolean;
  currentIteration: number;
  currentPhase: 'PHASE_1_BUNDLE' | 'PHASE_2_CONSENSUS' | 'CONVERGED';
  packetDropRatePct: number;
  droppedPacketsCount: number;
  yMatrix: Record<string, Record<string, number>>;         // agentId -> taskId -> bid
  zMatrix: Record<string, Record<string, string | null>>;   // agentId -> taskId -> winningAgentId
  timestampMatrix: Record<string, Record<string, number>>; // agentId -> peerId -> timestamp
  recentDecisions: ChoiRuleLog[];
  isConverged: boolean;
}

// --- Terrain Digital Elevation & Line-of-Sight (LOS) Relay ---
export interface TerrainRidgeEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  elevationM: number;
  roughnessFactor: number;
}

export interface RelayLinkStatus {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  isDirectLosBlocked: boolean;
  blockingRidgeId?: string;
  fresnelZoneM: number;
  relayedViaAgentId?: string;
  snrDb: number;
  throughputMbps: number;
}

// --- Adversarial Red-Team Sandbox & Live Mission Builder ---
export type SandboxTool = 
  | 'INSPECT' 
  | 'ADD_CONVOY' 
  | 'ADD_SAM' 
  | 'ADD_JAMMER' 
  | 'ADD_TASK' 
  | 'DRAW_NO_FLY'
  | 'SET_WIND';

export interface RedTeamThreatEntity {
  id: string;
  name: string;
  type: 'MOBILE_CONVOY' | 'RADAR_SAM' | 'RF_JAMMER';
  position: [number, number];
  radius: number;
  waypoints?: [number, number][];
  waypointIndex?: number;
  speed: number;
  headingDeg: number;
  intensity: number;
  active: boolean;
}
