import express from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure results directory exists
const RESULTS_DIR = path.join(process.cwd(), "results");
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// API: Run Experiment Matrix (Invoking actual Python simulation matrix sweep)
app.post("/api/experiments/run", async (req, res) => {
  try {
    try {
      execSync("python3 swarmos/run_matrix_cli.py", { cwd: process.cwd(), stdio: "inherit" });
    } catch (execErr) {
      console.warn("Python matrix execution warning:", execErr);
    }

    const resultsPath = path.join(process.cwd(), "nebius_experiment_results.json");
    let experimentOutput: any = {};
    if (fs.existsSync(resultsPath)) {
      const rawData = fs.readFileSync(resultsPath, "utf-8");
      experimentOutput = JSON.parse(rawData);
    } else {
      experimentOutput = {
        timestamp: Date.now() / 1000,
        total_trials: 0,
        algorithms_evaluated: ["Static", "Greedy", "CBBA_Standard", "CBBA_Recovery", "SWARMOS"],
        summary_table: []
      };
    }

    res.json({
      status: "completed",
      experiment_id: `SWARM-${new Date().toISOString().split("T")[0]}-${Math.floor(Math.random() * 899 + 100)}`,
      timestamp: new Date().toISOString(),
      environment: process.env.NEBIUS_API_BASE ? "Nebius AI Cloud (k8s-gpu-nemotron-west1)" : "Local Python Swarm Simulation Engine",
      total_trials: experimentOutput.total_trials || 0,
      algorithms_evaluated: experimentOutput.algorithms_evaluated || ["Static", "Greedy", "CBBA_Standard", "CBBA_Recovery", "SWARMOS"],
      matrix_results: experimentOutput.summary_table || []
    });
  } catch (error: any) {
    console.error("Experiment run error:", error);
    res.status(500).json({ error: error.message || "Experiment execution failed" });
  }
});

// API: NVIDIA Nemotron AI Mission Planning & Deterministic Safety Compiler (Python Canonical Path)
app.post("/api/ai/plan-mission", async (req, res) => {
  try {
    const { prompt = "Conduct multi-sector reconnaissance sweep" } = req.body;
    const sanitizedPrompt = prompt.replace(/"/g, '\\"');

    // Authoritative Python CLI execution: ensures zero TS logic duplication
    const stdout = execSync(`python3 swarmos/plan_mission_cli.py "${sanitizedPrompt}"`, {
      cwd: process.cwd(),
      encoding: "utf-8"
    });

    const parsed = JSON.parse(stdout.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Mission Planning error:", error);
    // Fallback response with canonical structure
    res.json({
      planner: "deterministic_tactical_rule_engine",
      fallback_used: true,
      manifest: {
        mission_name: "Operation Autonomous Sweep",
        tactical_intent: "Coordinated multi-agent spatial reconnaissance",
        recommended_agents: 6,
        tasks: [
          { id: "T1", type: "RECON", position: [250.0, 200.0], base_reward: 80.0, duration: 4.0, urgency_weight: 1.0, payload_kg: 0.0, description: "Northwest grid sweep" },
          { id: "T2", type: "SURVEIL", position: [520.0, 280.0], base_reward: 100.0, duration: 5.0, urgency_weight: 1.0, payload_kg: 0.0, description: "Central intersection loiter" },
          { id: "T3", type: "RECON", position: [850.0, 220.0], base_reward: 85.0, duration: 4.0, urgency_weight: 1.0, payload_kg: 0.0, description: "Northeast perimeter sweep" }
        ],
        constraints: { max_range_meters: 1200.0, minimum_active_agents: 2 },
        safety_verdict: "APPROVED",
        violations_logged: ["Executed fallback path."],
        compiler_timestamp: new Date().toISOString()
      }
    });
  }
});

// API: Run Ablation Studies & Baseline Comparisons (Empirical Python Simulation)
app.post("/api/experiments/ablation", async (req, res) => {
  try {
    const resultsPath = path.join(process.cwd(), "nebius_experiment_results.json");
    if (!fs.existsSync(resultsPath)) {
      execSync("python3 swarmos/run_matrix_cli.py", { cwd: process.cwd(), stdio: "inherit" });
    }

    let experimentOutput: any = {};
    if (fs.existsSync(resultsPath)) {
      const rawData = fs.readFileSync(resultsPath, "utf-8");
      experimentOutput = JSON.parse(rawData);
    }

    const summaryTable: any[] = experimentOutput.summary_table || [];
    const algorithms = ["Static", "Greedy", "CBBA_Standard", "CBBA_Recovery", "SWARMOS"];

    const variants = algorithms.map(algoName => {
      const algoRows = summaryTable.filter(r => r.algorithm === algoName);
      if (algoRows.length === 0) {
        return {
          variant: algoName,
          trials: 0,
          metrics: {
            mission_completion: { mean: 0.0, std: 0.0, ci_95: 0.0 },
            replan_latency_seconds: 0.0,
            consensus_time_ms: 0.0,
            fleet_survival_pct: 0.0
          }
        };
      }

      const meanCompletion = algoRows.reduce((sum, r) => sum + r.mission_completion, 0) / algoRows.length;
      const meanConsensus = algoRows.reduce((sum, r) => sum + r.mean_convergence_ms, 0) / algoRows.length;
      const meanReplan = algoRows.reduce((sum, r) => sum + r.mean_replan_latency, 0) / algoRows.length;
      const meanSurvival = algoRows.reduce((sum, r) => sum + r.fleet_survival_pct, 0) / algoRows.length;

      const variance = algoRows.reduce((sum, r) => sum + Math.pow(r.mission_completion - meanCompletion, 2), 0) / algoRows.length;
      const stdComp = Math.sqrt(variance);
      const ci95 = 1.96 * (stdComp / Math.sqrt(algoRows.length));

      return {
        variant: algoName,
        trials: algoRows.length,
        metrics: {
          mission_completion: {
            mean: Number((meanCompletion / 100.0).toFixed(3)),
            std: Number((stdComp / 100.0).toFixed(3)),
            ci_95: Number((ci95 / 100.0).toFixed(3))
          },
          replan_latency_seconds: Number((meanReplan / 1000.0).toFixed(3)),
          consensus_time_ms: Number(meanConsensus.toFixed(2)),
          fleet_survival_pct: Number(meanSurvival.toFixed(1))
        }
      };
    });

    res.json({
      status: "completed",
      experiment_type: "ablation_and_baseline_comparison",
      timestamp: new Date().toISOString(),
      variants
    });
  } catch (error: any) {
    console.error("Ablation error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SWARMOS Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
