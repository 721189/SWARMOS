/**
 * Deterministic Safety Compiler for SWARMOS (TypeScript Port).
 * Ensures Gemini missions adhere to the same physical boundaries as the simulation.
 */

export interface Task {
  id: string;
  type: string;
  position: [number, number];
  base_reward: number;
  duration: number;
  urgency_weight?: number;
  payload_kg: number;
  description?: string;
}

export interface MissionManifest {
  mission_name?: string;
  tactical_intent?: string;
  tasks: Task[];
  constraints: {
    max_range_meters: number;
    minimum_active_agents: number;
  };
}

export class SafetyCompiler {
  private maxRangeMeters = 1200.0;
  private maxPayloadKg = 5.0;
  private minAgents = 2;
  private baseOrigin: [number, number] = [120.0, 680.0];

  validate(manifest: MissionManifest): MissionManifest {
    const { tasks, constraints } = manifest;

    if (!constraints) throw new Error("Safety Violation: Missing constraints.");
    if (constraints.max_range_meters > this.maxRangeMeters) {
      throw new Error(`Safety Violation: Range ${constraints.max_range_meters}m exceeds limit ${this.maxRangeMeters}m.`);
    }
    if (constraints.minimum_active_agents < this.minAgents) {
      throw new Error(`Safety Violation: Min agents ${constraints.minimum_active_agents} below redundancy floor ${this.minAgents}.`);
    }

    const validatedTasks: Task[] = tasks.map((task, idx) => {
      const id = task.id || `T${idx}`;
      const [x, y] = task.position;

      // Coordinate bounds
      if (x < 0 || x > 1200 || y < 0 || y > 800) {
        throw new Error(`Safety Violation: Task ${id} coordinates [${x}, ${y}] out of theater bounds.`);
      }

      // Range from origin
      const dist = Math.sqrt(Math.pow(x - this.baseOrigin[0], 2) + Math.pow(y - this.baseOrigin[1], 2));
      if (dist > this.maxRangeMeters) {
        throw new Error(`Safety Violation: Task ${id} exceeds max operational radius (${dist.toFixed(1)}m).`);
      }

      // Payload check
      if (task.payload_kg > this.maxPayloadKg) {
        throw new Error(`Safety Violation: Task ${id} payload ${task.payload_kg}kg exceeds capacity ${this.maxPayloadKg}kg.`);
      }

      return {
        ...task,
        id,
        type: task.type || "RECON",
        urgency_weight: task.urgency_weight || 1.0,
      };
    });

    return {
      ...manifest,
      tasks: validatedTasks,
      mission_name: manifest.mission_name || "Autonomous Mission",
    };
  }
}
