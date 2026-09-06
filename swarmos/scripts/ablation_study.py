
import json
from swarmos.nebius_jobs.experiments import run_single_baseline_trial
from swarmos.utils.logger import logger

def run_ablation_study():
    configs = [
        {"fleet_size": 8, "task_count": 15, "scen": "nominal", "p_loss": 0.0},
        {"fleet_size": 8, "task_count": 15, "scen": "adversarial", "p_loss": 0.25}
    ]
    
    seeds = range(1000, 1030) # 30 seeds per ablation
    
    # Ablation Targets:
    # 1. SWARMOS (Full)
    # 2. SWARMOS - AnomalyFilter
    # 3. SWARMOS - SafetyCompiler (already handled by choosing Standard CBBA baseline basically)
    # 4. SWARMOS - Recovery
    
    results = []
    
    for cfg in configs:
        for seed in seeds:
            # Full SWARMOS
            full = run_single_baseline_trial(
                cfg["fleet_size"], cfg["task_count"], cfg["scen"], 350.0, cfg["p_loss"], seed, "SWARMOS"
            )
            
            # CBBA Recovery (Ablated Anomaly/Safety)
            recovery = run_single_baseline_trial(
                cfg["fleet_size"], cfg["task_count"], cfg["scen"], 350.0, cfg["p_loss"], seed, "CBBA_Recovery"
            )
            
            # CBBA Standard (Ablated Recovery/Anomaly/Safety)
            standard = run_single_baseline_trial(
                cfg["fleet_size"], cfg["task_count"], cfg["scen"], 350.0, cfg["p_loss"], seed, "CBBA_Standard"
            )
            
            results.extend([full, recovery, standard])
            
    # Save to dedicated ablation results
    with open("swarmos/research/ablation_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("Ablation study complete. Results saved to swarmos/research/ablation_results.json")

if __name__ == "__main__":
    run_ablation_study()
