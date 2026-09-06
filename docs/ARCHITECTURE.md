# SWARMOS Research Architecture

## Core Engine (`swarm_engine/`)
- `cbba.py`: Implements the Consensus-Based Bundle Algorithm (Choi 2009) with Phase 1 (Bundle Construction) and Phase 2 (Conflict Resolution).
- `bft_cbba.py`: Byzantine Anomaly Filter. Isolates malicious or failing nodes injecting poisoned bids.
- `environment.py`: Simulated RF mesh network, physical world state.
- `failures.py`: Injects deterministic failures (motor, jammer).

## AI Layer (`ai_layer/`)
- `safety_compiler.py`: Verifies mission manifest bounds before execution.
- `orchestrator.py`: Main API surface.

## Research Matrix (`research/` and `nebius_jobs/`)
- `reproduce.py`: CLI to reproduce exact experimental benchmarks.
- `configs/matrix.json`: Sweep bounds (fleet size, failure rates, etc.).
- `experiments.py`: Generates identical determinism via `random.Random(seed)`.

## Type Contracts
- All core domains are mapped strictly using Python `typing` (`Dict`, `List`, `Optional`) and native enums (`Enum`).
- See `AgentStatus`, `TaskStatus`, `AuctionTermination`.

## Performance
- 24,000 Cartesian simulations run in ~3 minutes on local compute via optimized single-thread logic (bypassing heavy GIL overhead through strict datastructures).
