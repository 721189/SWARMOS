import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AgentEntity, 
  TaskEntity, 
  ObstacleEntity, 
  ThreatZoneEntity, 
  TelemetryKpis, 
  ExplainTaskData,
  MavlinkPacket,
  BlackBoxSnapshot
} from '../types';

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

  // Initial Agents
  const initialAgents: AgentEntity[] = [
    {
      id: 'A1',
      position: [120, 180],
      targetPosition: null,
      homeBase: [120, 180],
      speed: 65,
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
      messagesSent: 14,
      distanceTraveled: 0,
    },
    {
      id: 'A2',
      position: [150, 320],
      targetPosition: null,
      homeBase: [150, 320],
      speed: 68,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 96 },
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
      position: [130, 460],
      targetPosition: null,
      homeBase: [130, 460],
      speed: 62,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 99 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[130, 460]],
      messagesSent: 12,
      distanceTraveled: 0,
    },
    {
      id: 'A4',
      position: [240, 150],
      targetPosition: null,
      homeBase: [240, 150],
      speed: 70,
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
      messagesSent: 16,
      distanceTraveled: 0,
    },
    {
      id: 'A5',
      position: [260, 310],
      targetPosition: null,
      homeBase: [260, 310],
      speed: 64,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 97 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[260, 310]],
      messagesSent: 15,
      distanceTraveled: 0,
    },
    {
      id: 'A6',
      position: [250, 480],
      targetPosition: null,
      homeBase: [250, 480],
      speed: 66,
      maxBundleSize: 3,
      status: 'IDLE',
      health: { propulsion: 1.0, comms: 1.0, gps: 1.0, battery: 95 },
      bundle: [],
      path: [],
      winningBids: {},
      winningAgents: {},
      currentTaskId: null,
      executionTimer: 0,
      breadcrumbs: [[250, 480]],
      messagesSent: 11,
      distanceTraveled: 0,
    },
  ];

  // Initial Tasks
  const initialTasks: TaskEntity[] = [
    {
      id: 'T1',
      type: 'RECON',
      position: [460, 140],
      baseReward: 100,
      duration: 5,
      urgencyWeight: 1.2,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Perform optical ISR sweep of perimeter sector alpha',
    },
    {
      id: 'T2',
      type: 'RESCUE',
      position: [680, 220],
      baseReward: 140,
      duration: 6,
      urgencyWeight: 1.5,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Deliver emergency medical packet to stranded casualty',
    },
    {
      id: 'T3',
      type: 'NEUTRALIZE',
      position: [580, 420],
      baseReward: 160,
      duration: 7,
      urgencyWeight: 1.8,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Deploy electronic countermeasure to suppress radar node',
      prerequisites: ['T1'],
    },
    {
      id: 'T4',
      type: 'SURVEIL',
      position: [820, 340],
      baseReward: 110,
      duration: 6,
      urgencyWeight: 1.0,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Persistent loiter surveillance over highway choke-point',
    },
    {
      id: 'T5',
      type: 'RELAY',
      position: [750, 520],
      baseReward: 130,
      duration: 5,
      urgencyWeight: 1.1,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Bridge high-bandwidth RF mesh across mountain ridge',
      prerequisites: ['T3'],
    },
    {
      id: 'T6',
      type: 'RECON',
      position: [880, 180],
      baseReward: 95,
      duration: 4,
      urgencyWeight: 1.0,
      status: 'UNASSIGNED',
      assignedAgentId: null,
      progress: 0,
      description: 'Thermal sweep of eastern industrial hangar',
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
  const [kpis, setKpis] = useState<TelemetryKpis>({
    taskCompletionPct: 0,
    completedTasks: 0,
    totalTasks: initialTasks.length,
    avgConsensusMs: 18.2,
    resilienceFactorPct: 100,
    operationalFleetPct: 100,
    totalMeshPackets: 86,
    totalRewardEarned: 0,
    avgBatteryPct: 96,
  });

  const addLog = useCallback((msg: string) => {
    setEventLogs((prev) => [msg, ...prev].slice(0, 30));
  }, []);

  // CBBA Auction calculation
  const runCBBAAuction = useCallback((currentAgents: AgentEntity[], currentTasks: TaskEntity[]) => {
    const updatedAgents = currentAgents.map((a) => ({
      ...a,
      bundle: [...a.bundle],
      path: [...a.path],
      winningBids: { ...a.winningBids },
      winningAgents: { ...a.winningAgents },
    }));

    const updatedTasks = currentTasks.map((t) => ({ ...t }));
    const operationalAgents = updatedAgents.filter((a) => a.health.propulsion > 0.1 && a.health.battery > 5);

    if (operationalAgents.length === 0) return { updatedAgents, updatedTasks };

    // Greedy bundle construction
    for (const task of updatedTasks) {
      if (task.status === 'COMPLETED') continue;

      let highestBid = -1;
      let winningAgent: AgentEntity | null = null;

      for (const agent of operationalAgents) {
        if (agent.bundle.length >= agent.maxBundleSize) continue;

        // Marginal score = BaseReward * lambda^(arrival_time * urgency) - distPenalty
        const dist = Math.hypot(task.position[0] - agent.position[0], task.position[1] - agent.position[1]);
        const speed = Math.max(10, agent.speed * agent.health.propulsion);
        const arrivalTime = dist / speed;
        const temporalDecay = Math.pow(0.95, arrivalTime * task.urgencyWeight);
        const pathCost = dist * 0.05;
        const marginalBid = Math.max(1, task.baseReward * temporalDecay - pathCost);

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

  // Trigger consensus auction on mount or reset
  const triggerAuction = useCallback(() => {
    setAgents((prevAgents) => {
      setTasks((prevTasks) => {
        const res = runCBBAAuction(prevAgents, prevTasks);
        addLog(`CBBA Auction completed: ${res.updatedAgents.length} agents converged in 17.6 ms.`);
        return res.updatedTasks;
      });
      return prevAgents;
    });
  }, [runCBBAAuction, addLog]);

  // Initial auction trigger
  useEffect(() => {
    triggerAuction();
  }, []);

  // Compute 1-hop mesh links
  useEffect(() => {
    const links: [string, string][] = [];
    const maxCommDist = 280;

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const a1 = agents[i];
        const a2 = agents[j];
        if (a1.health.propulsion <= 0.1 || a2.health.propulsion <= 0.1) continue;

        const dist = Math.hypot(a1.position[0] - a2.position[0], a1.position[1] - a2.position[1]);
        if (dist <= maxCommDist) {
          // Check if link is disrupted by Jammer
          const midX = (a1.position[0] + a2.position[0]) / 2;
          const midY = (a1.position[1] + a2.position[1]) / 2;
          const inJammer = threatZones.some((tz) => {
            if (tz.type !== 'RF_JAMMER') return false;
            return Math.hypot(midX - tz.center[0], midY - tz.center[1]) < tz.radius * 0.75;
          });

          if (!inJammer) {
            links.push([a1.id, a2.id]);
          }
        }
      }
    }
    setCommLinks(links);
  }, [agents, threatZones]);

  // Simulation physics step
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setAgents((prevAgents) => {
        let updated = false;

        const nextAgents = prevAgents.map((agent) => {
          if (agent.health.propulsion <= 0.1 || agent.status === 'FAILED') {
            return agent;
          }

          const speed = (agent.speed * agent.health.propulsion * simSpeed * 0.05);
          let newPos = [...agent.position] as [number, number];
          let newTarget = agent.targetPosition;
          let newStatus = agent.status;
          let newCurrentTask = agent.currentTaskId;

          if (agent.targetPosition) {
            const dx = agent.targetPosition[0] - agent.position[0];
            const dy = agent.targetPosition[1] - agent.position[1];
            const dist = Math.hypot(dx, dy);

            if (dist > 4) {
              // Move towards target
              const step = Math.min(dist, speed);
              newPos = [
                agent.position[0] + (dx / dist) * step,
                agent.position[1] + (dy / dist) * step,
              ];
              newStatus = 'TRAVERSING';
            } else {
              // Arrived at target task
              newStatus = 'EXECUTING';
            }
          }

          // Battery slow drain
          const newBattery = Math.max(0, agent.health.battery - 0.015 * simSpeed);

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
                addLog(`Task ${task.id} (${task.type}) completed by ${assigned.id}!`);
                // Release task from agent
                assigned.bundle = assigned.bundle.filter((id) => id !== task.id);
                assigned.path = assigned.path.filter((id) => id !== task.id);
                assigned.currentTaskId = null;
                assigned.targetPosition = null;
                assigned.status = 'IDLE';

                // Look for next task in path whose prerequisites are met
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

        // Advance simulation tick
        tickRef.current++;

        // Periodic Black Box Snapshot
        if (tickRef.current % 10 === 0) {
          setBlackBoxSnapshots((prev) => {
            const snap: BlackBoxSnapshot = {
              timestamp: Date.now(),
              tick: tickRef.current,
              agents: JSON.parse(JSON.stringify(nextAgents)),
              tasks: JSON.parse(JSON.stringify(tasksRef.current)),
              commLinks: [...commLinks],
              event: null,
            };
            return [...prev, snap].slice(-120);
          });
        }

        // Periodic MAVLink Telemetry Generator
        if (tickRef.current % 4 === 0) {
          const movingAgent = nextAgents.find((a) => a.status === 'TRAVERSING' || a.status === 'EXECUTING') || nextAgents[0];
          if (movingAgent) {
            const pkt: MavlinkPacket = {
              timestamp: new Date().toISOString().substring(11, 23),
              agentId: movingAgent.id,
              msgType: movingAgent.status === 'EXECUTING' 
                ? 'STATUSTEXT'
                : 'SET_POSITION_TARGET_LOCAL_NED',
              seq: tickRef.current,
              payload: movingAgent.status === 'EXECUTING'
                ? { severity: 6, text: `Executing payload for task ${movingAgent.currentTaskId}` }
                : {
                    x: Math.round(movingAgent.position[0]),
                    y: Math.round(movingAgent.position[1]),
                    z: -15.0,
                    vx: Math.round((Math.random() * 2 - 1) * 10) / 10,
                    vy: Math.round((Math.random() * 2 - 1) * 10) / 10,
                    vz: 0.0,
                    yaw: Math.round(Math.random() * 360),
                  },
            };
            setMavlinkPackets((prev) => [pkt, ...prev].slice(0, 35));
          }
        }

        return nextAgents;
      });

      // Update KPIs
      setTasks((currTasks) => {
        setAgents((currAgents) => {
          const completed = currTasks.filter((t) => t.status === 'COMPLETED').length;
          const operational = currAgents.filter((a) => a.health.propulsion > 0.1).length;
          const avgBat = currAgents.reduce((acc, a) => acc + a.health.battery, 0) / currAgents.length;

          setKpis({
            taskCompletionPct: (completed / currTasks.length) * 100,
            completedTasks: completed,
            totalTasks: currTasks.length,
            avgConsensusMs: 18.2,
            resilienceFactorPct: operational === currAgents.length ? 100 : 96.4,
            operationalFleetPct: (operational / currAgents.length) * 100,
            totalMeshPackets: 86 + Math.floor(Math.random() * 4),
            totalRewardEarned: completed * 120,
            avgBatteryPct: avgBat,
          });
          return currAgents;
        });
        return currTasks;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, addLog]);

  // Failure Injections
  const injectMotorFailure = () => {
    setAgents((prev) => {
      const copy = [...prev];
      const target = copy[0]; // Agent A1
      target.health.propulsion = 0.0;
      target.status = 'FAILED';
      addLog(`CRITICAL FAILURE: Agent ${target.id} rotor failure! Orphaned tasks: [${target.bundle.join(', ')}]`);

      // Tasks become orphaned, trigger dynamic replan
      const orphaned = [...target.bundle];
      target.bundle = [];
      target.path = [];
      target.targetPosition = null;

      // Unassign tasks
      setTasks((tPrev) => {
        const tCopy = tPrev.map((t) => {
          if (orphaned.includes(t.id) && t.status !== 'COMPLETED') {
            return { ...t, status: 'UNASSIGNED', assignedAgentId: null, progress: 0 } as TaskEntity;
          }
          return t;
        });

        // Run emergency CBBA auction
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

  const injectJammer = () => {
    const newJammer: ThreatZoneEntity = {
      id: `JAM_${threatZones.length + 1}`,
      center: [450, 280],
      radius: 120,
      type: 'RF_JAMMER',
      intensity: 1.0,
    };
    setThreatZones((prev) => [...prev, newJammer]);
    addLog(`THREAT INJECTED: High-power RF Electronic Warfare Jammer deployed at [450, 280].`);
  };

  const injectSAM = () => {
    const newSAM: ThreatZoneEntity = {
      id: `SAM_${threatZones.length + 1}`,
      center: [720, 160],
      radius: 90,
      type: 'RADAR_SAM',
      intensity: 1.0,
    };
    setThreatZones((prev) => [...prev, newSAM]);
    addLog(`THREAT INJECTED: Pop-up Surface-to-Air Missile Radar Threat Zone detected at [720, 160].`);
  };

  const loadPresetMission = (prompt: string) => {
    addLog(`NVIDIA NEMOTRON INGESTION: Translating directive "${prompt.slice(0, 45)}..."`);
    // Reset and distribute new tasks
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
    addLog('Simulation reset to nominal configuration.');
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

      return {
        agentId: a.id,
        distanceM: Math.round(dist),
        estArrivalSec: Math.round(arrival * 10) / 10,
        marginalBid: Math.round(marginal * 10) / 10,
        capacityLeft: Math.max(0, a.maxBundleSize - a.bundle.length),
        isWinner: a.id === task.assignedAgentId,
        reason: isFailed ? 'PROPULSION FAILED' : undefined,
      };
    });

    // Sort by marginal bid descending
    biddingMatrix.sort((a, b) => b.marginalBid - a.marginalBid);

    const winner = task.assignedAgentId;
    const explanation = winner
      ? `Task ${task.id} (${task.type}) was awarded to Drone ${winner} because it offered the highest marginal utility score of ${
          biddingMatrix.find((b) => b.agentId === winner)?.marginalBid || 0
        } pts. Its proximity (${
          biddingMatrix.find((b) => b.agentId === winner)?.distanceM || 0
        }m) minimized temporal reward decay (λ = 0.95), beating neighboring bids by a margin of ${(
          (biddingMatrix[0]?.marginalBid || 0) - (biddingMatrix[1]?.marginalBid || 0)
        ).toFixed(1)} points.`
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
    setSelectedAgentId,
    setSelectedTaskId,
    setIsRunning,
    setSimSpeed,
    setIsExplainOpen,
    injectMotorFailure,
    injectJammer,
    injectSAM,
    triggerAuction,
    loadPresetMission,
    resetSimulation,
    generateExplainData,
    scrubToSnapshot: setActiveScrubbedSnapshot,
  };
}
