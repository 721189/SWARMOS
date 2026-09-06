import math
from typing import Dict, List, Tuple
from swarmos.swarm_engine.agents import Agent
from swarmos.swarm_engine.tasks import Task, TaskType
from swarmos.reference_cbba.cbba_oracle import ReferenceCBBAOracle

tasks = {
    "T1": Task("T1", TaskType.RECON, (10, 10), 100.0),
    "T2": Task("T2", TaskType.SURVEIL, (20, 20), 150.0),
    "T3": Task("T3", TaskType.NEUTRALIZE, (50, 50), 200.0)
}
agents = {
    "A1": Agent("A1", (0, 0), speed=10.0, max_bundle_size=3),
    "A2": Agent("A2", (100, 100), speed=10.0, max_bundle_size=3)
}
comm_links = [
    ("A1", "A2"),
    ("A2", "A1")
]

oracle = ReferenceCBBAOracle(lambda_decay=0.95)
for i in range(10):
    for a in agents.values():
        oracle.phase1_build_bundle(a, tasks)
    print(f"Iter {i} Phase1 A1 bundle: {agents['A1'].bundle}, A2 bundle: {agents['A2'].bundle}")
    changed = oracle.phase2_conflict_resolution(agents, comm_links)
    print(f"Iter {i} Phase2 changed: {changed}, A1 winners: {agents['A1'].winning_agents}, A2 winners: {agents['A2'].winning_agents}")
    for a in agents.values():
        oracle.release_tasks_after_reset(a)
    print(f"Iter {i} AfterRelease A1 bundle: {agents['A1'].bundle}, A2 bundle: {agents['A2'].bundle}")
    if not changed:
        # Wait, if phase 1 added something, changed is false in phase 2 because everyone agrees on nothing new? 
        # Actually if phase 1 added something, phase 2 WILL communicate it.
        # But if phase 2 already communicated, it won't change on the NEXT iteration.
        pass
