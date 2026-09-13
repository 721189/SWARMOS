import os
import json
from swarmos.nebius_jobs.experiments import run_authoritative_pipeline

# Create a minimal spec
spec = {
    "output_dir": "results/test",
    "packet_loss_rates": [0.0],
    "adversarial_fractions": [0.0],
    "attack_classes": ["A"],
    "trials_per_config": 1
}
os.makedirs("results/test", exist_ok=True)
with open("test_spec.json", "w") as f:
    json.dump(spec, f)

run_authoritative_pipeline("test_spec.json")
print("DONE")
