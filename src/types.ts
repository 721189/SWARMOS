export type TaskType = 'RECON' | 'NEUTRALIZE' | 'RESCUE' | 'SURVEIL' | 'RELAY';
export type TaskStatus = 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type AgentStatus = 'IDLE' | 'BIDDING' | 'TRAVERSING' | 'EXECUTING' | 'RETURNING' | 'JAMMED' | 'FAILED';

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
