
import json
import math
from swarmos.nebius_jobs.experiments import run_single_baseline_trial
from swarmos.utils.logger import logger

def find_failure_envelopes():
    # Sweep Packet Loss from 0% to 80%
    packet_loss_sweep = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
    # Sweep Attrition (nodes failed mid-mission) from 0 to 50%
    # We'll use a fixed config for this: FS=12, T=25
    fs = 12
    td = 25
    seeds = range(100, 105) # 5 seeds per point for quick envelope finding
    
    envelopes = {
        "packet_loss": {},
        "attrition": {}
    }
    
    print("Starting Packet Loss Envelope Sweep...")
    for p_loss in packet_loss_sweep:
        results = []
        for seed in seeds:
            res = run_single_baseline_trial(fs, td, "nominal", 350.0, p_loss, seed, "SWARMOS")
            results.append(res["mission_completion"])
        
        avg_tcr = sum(results) / len(results)
        envelopes["packet_loss"][p_loss] = avg_tcr
        print(f"P-Loss: {p_loss*100:.0f}% -> TCR: {avg_tcr:.1f}%")
        if avg_tcr < 70.0:
            print(f"!!! CRITICAL FAILURE ENVELOPE REACHED AT {p_loss*100:.0f}% Packet Loss")
            break

    print("\nStarting Attrition Envelope Sweep...")
    # To test attrition, we can't easily change the experiment.py failure_mode logic without edits
    # But we can use 'high_attrition' if we defined it in matrix.json, or just stick to P-loss for this specific leap
    
    # Save findings
    with open("swarmos/research/failure_envelopes.json", "w") as f:
        json.dump(envelopes, f, indent=2)
    
    print("\nFailure Envelope Analysis Complete.")

if __name__ == "__main__":
    find_failure_envelopes()
