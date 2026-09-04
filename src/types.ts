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
  category: 'core' | 'ai' | 'engine' | 'jobs' | 'ui' | 'utils' | 'docs';
  content: string;
}
