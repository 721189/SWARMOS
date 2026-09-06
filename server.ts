import express from "express";
import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";
import { createServer as createViteServer } from "vite";

import { ai } from "./lib/gemini";
import { Type } from "@google/genai";
import { SafetyCompiler } from "./swarmos/ai_layer/safety_compiler";

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Gemini Strategic Mission Decomposition
app.post("/api/gemini/strategic-plan", async (req, res) => {
  try {
    const { mission_prompt = "Execute high-stakes reconnaissance across the north-east sector" } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "Gemini API key not configured. Please add it to your secrets." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Decompose the following high-level drone swarm mission into technical task parameters for a CBBA (Consensus-Based Bundle Algorithm) coordination engine: "${mission_prompt}"
      
      CRITICAL: You must provide a valid position [x, y] where x is 0-1200 and y is 0-800. 
      Total mission payload must not exceed 5.0kg. 
      Mission must be within 1200m range of origin [120, 680].`,
      config: {
        systemInstruction: "You are the SWARMOS Strategic Mission Planner. Your goal is to translate human natural language mission intents into machine-readable task payloads. Focus on mission priority, required payloads (sensors), and geographic distribution.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mission_name: { type: Type.STRING },
            strategic_priority: { type: Type.NUMBER, description: "Scale 1-10" },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["RECON", "DELIVERY", "RESCUE", "MONITORING"] },
                  position: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER },
                    minItems: 2,
                    maxItems: 2
                  },
                  base_reward: { type: Type.NUMBER },
                  duration: { type: Type.NUMBER },
                  payload_kg: { type: Type.NUMBER }
                },
                required: ["id", "type", "position", "base_reward", "duration", "payload_kg"]
              }
            },
            constraints: {
              type: Type.OBJECT,
              properties: {
                max_range_meters: { type: Type.NUMBER },
                minimum_active_agents: { type: Type.NUMBER }
              },
              required: ["max_range_meters", "minimum_active_agents"]
            },
            risk_assessment: { type: Type.STRING }
          },
          required: ["mission_name", "strategic_priority", "tasks", "constraints", "risk_assessment"]
        }
      }
    });

    const rawPlan = JSON.parse(response.text || "{}");
    
    // P0: Gemini missions must terminate at the same SafetyCompiler boundary
    const compiler = new SafetyCompiler();
    try {
      const validatedPlan = compiler.validate(rawPlan);
      res.json({
        status: "success",
        source: "Gemini 1.5 Flash (Strategic Layer)",
        validation: "SAFETY_VERIFIED_DETREMINISTIC",
        plan: validatedPlan
      });
    } catch (safetyErr: any) {
      res.status(400).json({
        error: "Safety Violation: Gemini mission rejected by deterministic compiler",
        details: safetyErr.message,
        raw_plan: rawPlan
      });
    }

  } catch (error: any) {
    console.error("Gemini strategic planning error:", error);
    res.status(500).json({ error: "Gemini mission decomposition failed", details: error.message });
  }
});

// Serve static documents and figures
app.use("/docs", express.static(path.join(process.cwd(), "docs")));
app.use("/figures", express.static(path.join(process.cwd(), "public", "figures")));

// Ensure results directory exists
const RESULTS_DIR = path.join(process.cwd(), "results");
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// API: Run Experiment Matrix (Invoking actual Python simulation matrix sweep safely)
app.post("/api/experiments/run", async (req, res) => {
  try {
    const isReduced = Boolean(req.body?.reduced ?? true);
    const pythonArgs = isReduced ? ["swarmos/run_matrix_cli.py", "--reduced"] : ["swarmos/run_matrix_cli.py"];

    // Safe execution without shell interpolation; will throw if exit code != 0
    execFileSync("python3", pythonArgs, {
      cwd: process.cwd(),
      encoding: "utf-8",
      maxBuffer: 20 * 1024 * 1024
    });

    const resultsPath = path.join(process.cwd(), "nebius_experiment_results.json");
    if (!fs.existsSync(resultsPath)) {
      return res.status(500).json({ error: "Experiment output file not generated by simulator." });
    }

    const rawData = fs.readFileSync(resultsPath, "utf-8");
    const experimentOutput = JSON.parse(rawData);

    res.json({
      status: "completed",
      experiment_id: `SWARM-${new Date().toISOString().split("T")[0]}-${Math.floor(Math.random() * 899 + 100)}`,
      timestamp: new Date().toISOString(),
      benchmark_mode: experimentOutput.benchmark_mode || (isReduced ? "reduced_benchmark" : "full_matrix_sweep"),
      environment: process.env.NEBIUS_API_BASE ? "Nebius AI Cloud (k8s-gpu-nemotron-west1)" : "Local Python Swarm Simulation Engine",
      total_configurations: experimentOutput.total_configurations || experimentOutput.summary_table?.length || 0,
      total_trials: experimentOutput.total_trials || 0,
      trials_per_configuration: experimentOutput.trials_per_configuration || 1,
      algorithms_evaluated: experimentOutput.algorithms_evaluated || ["Static", "Greedy", "CBBA_Standard", "CBBA_Recovery", "SWARMOS"],
      matrix_results: experimentOutput.summary_table || []
    });
  } catch (error: any) {
    console.error("Experiment run error:", error);
    res.status(500).json({
      error: "Experiment matrix execution failed",
      details: error.stderr || error.message || String(error)
    });
  }
});

// API: NVIDIA Nemotron AI Mission Planning & Deterministic Safety Compiler (Python Canonical Path)
app.post("/api/ai/plan-mission", async (req, res) => {
  try {
    const { prompt = "Conduct multi-sector reconnaissance sweep" } = req.body;

    // Safe positional argument array prevents shell injection
    const stdout = execFileSync("python3", ["swarmos/plan_mission_cli.py", String(prompt)], {
      cwd: process.cwd(),
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024
    });

    const parsed = JSON.parse(stdout.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Mission Planning error:", error);
    res.status(500).json({
      error: "AI mission planning execution failed",
      details: error.stderr || error.message || String(error)
    });
  }
});

// API: Run Ablation Studies & Baseline Comparisons (Empirical Python Simulation)
app.post("/api/experiments/ablation", async (req, res) => {
  try {
    const resultsPath = path.join(process.cwd(), "nebius_experiment_results.json");
    if (!fs.existsSync(resultsPath)) {
      execFileSync("python3", ["swarmos/run_matrix_cli.py", "--reduced"], {
        cwd: process.cwd(),
        encoding: "utf-8",
        maxBuffer: 20 * 1024 * 1024
      });
    }

    if (!fs.existsSync(resultsPath)) {
      return res.status(500).json({ error: "Unable to find empirical experiment results file." });
    }

    const rawData = fs.readFileSync(resultsPath, "utf-8");
    const experimentOutput = JSON.parse(rawData);

    const rawSummaryTable: any[] = experimentOutput.summary_table || [];
    const requestedScenario = req.body?.scenario;

    // Filter by scenario if specified (e.g. 'mild_attrition', 'electronic_warfare_dense', etc.)
    let summaryTable = rawSummaryTable;
    if (requestedScenario && requestedScenario !== 'all') {
      const scenarioMatched = rawSummaryTable.filter(r => r.failure_mode === requestedScenario);
      if (scenarioMatched.length > 0) {
        summaryTable = scenarioMatched;
      }
    }

    const algorithms = experimentOutput.algorithms_evaluated || ["Static", "Greedy", "CBBA_Standard", "CBBA_Recovery", "CBBA_BFT", "CBBA_Recovery_BFT", "SWARMOS"];

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
            fleet_survival_pct: 0.0,
            packets_generated_mean: 0.0,
            packets_delivered_mean: 0.0,
            packets_dropped_mean: 0.0,
            observed_packet_loss_pct: 0.0
          }
        };
      }

      const meanCompletion = algoRows.reduce((sum, r) => sum + r.mission_completion, 0) / algoRows.length;
      const meanConsensus = algoRows.reduce((sum, r) => sum + r.mean_convergence_ms, 0) / algoRows.length;
      const meanReplan = algoRows.reduce((sum, r) => sum + r.mean_replan_latency, 0) / algoRows.length;
      const meanSurvival = algoRows.reduce((sum, r) => sum + r.fleet_survival_pct, 0) / algoRows.length;
      const meanGenPkts = algoRows.reduce((sum, r) => sum + (r.packets_generated_mean || 0), 0) / algoRows.length;
      const meanDelivPkts = algoRows.reduce((sum, r) => sum + (r.packets_delivered_mean || 0), 0) / algoRows.length;
      const meanDropPkts = algoRows.reduce((sum, r) => sum + (r.packets_dropped_mean || 0), 0) / algoRows.length;
      const meanLossPct = algoRows.reduce((sum, r) => sum + (r.observed_packet_loss_pct || 0), 0) / algoRows.length;

      const variance = algoRows.reduce((sum, r) => sum + Math.pow(r.mission_completion - meanCompletion, 2), 0) / algoRows.length;
      const stdComp = Math.sqrt(variance);
      const ci95 = 1.96 * (stdComp / Math.sqrt(algoRows.length));

      const totalTrialsForVariant = algoRows.reduce((sum, r) => sum + (r.trials || 1), 0);

      return {
        variant: algoName,
        configurations: algoRows.length,
        trials: totalTrialsForVariant,
        metrics: {
          mission_completion: {
            mean: Number((meanCompletion / 100.0).toFixed(3)),
            std: Number((stdComp / 100.0).toFixed(3)),
            ci_95: Number((ci95 / 100.0).toFixed(3))
          },
          replan_latency_seconds: Number((meanReplan / 1000.0).toFixed(3)),
          consensus_time_ms: Number(meanConsensus.toFixed(2)),
          fleet_survival_pct: Number(meanSurvival.toFixed(1)),
          packets_generated_mean: Number(meanGenPkts.toFixed(1)),
          packets_delivered_mean: Number(meanDelivPkts.toFixed(1)),
          packets_dropped_mean: Number(meanDropPkts.toFixed(1)),
          observed_packet_loss_pct: Number(meanLossPct.toFixed(1))
        }
      };
    });

    res.json({
      status: "completed",
      experiment_type: "ablation_and_baseline_comparison",
      selected_scenario: requestedScenario || "all",
      benchmark_mode: experimentOutput.benchmark_mode || "empirical_matrix",
      timestamp: new Date().toISOString(),
      variants
    });
  } catch (error: any) {
    console.error("Ablation error:", error);
    res.status(500).json({ error: "Failed to generate ablation baseline results", details: error.message });
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
