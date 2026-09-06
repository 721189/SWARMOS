import { execFileSync } from "child_process";
import path from "path";

/**
 * Deterministic Safety Compiler for SWARMOS (TypeScript -> Python Integration).
 * Integrates TypeScript server routes directly with Python's canonical SafetyCompiler.
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

  validate(manifest: MissionManifest): any {
    // 1. Primary Canonical Execution: Invoke Python SafetyCompiler as the single source of truth
    try {
      const scriptPath = path.join(process.cwd(), "swarmos", "ai_layer", "safety_compiler.py");
      const stdout = execFileSync("python3", [scriptPath, JSON.stringify(manifest)], {
        cwd: process.cwd(),
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024
      });

      const res = JSON.parse(stdout.trim());
      if (res.status === "APPROVED" && res.compiled) {
        return res.compiled;
      } else {
        throw new Error(res.error || "Mission manifest rejected by Python SafetyCompiler");
      }
    } catch (err: any) {
      // Check if Python returned a structured safety rejection
      if (err.stdout) {
        try {
          const parsed = JSON.parse(err.stdout.trim());
          if (parsed.error) {
            throw new Error(`Safety Violation: ${parsed.error}`);
          }
        } catch (_) {}
      }

      // If python process failure wasn't a standard exit code 2 safety violation, verify if node fallback is needed
      if (err.message && err.message.startsWith("Safety Violation:")) {
        throw err;
      }

      // Fallback deterministic validation in pure TypeScript if python executable is unavailable
      return this.validateTypeScriptFallback(manifest);
    }
  }

  private validateTypeScriptFallback(manifest: MissionManifest): MissionManifest {
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

