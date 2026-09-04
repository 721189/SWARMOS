import json
import os
import sys

# Add swarmos package root to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'swarmos')))

from nebius_jobs.experiments import run_experiment_matrix
from ai_layer.orchestrator import SwarmOrchestrator
from ai_layer.safety_compiler import SafetyCompiler

def execute_cli_matrix():
    print("Executing SWARMOS Python Experiment Matrix...")
    res = run_experiment_matrix()
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    execute_cli_matrix()
