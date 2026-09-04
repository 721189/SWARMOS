# SWARMOS Safety Compiler & Mission Validator

This module implements the deterministic safety compiler that sits between the generative AI mission planner (NVIDIA Nemotron-4-340B / Gemini) and the consensus allocator (CBBA).

## Architecture Principle
> **"The generative model proposes; deterministic software decides what is executable."**

## Constraint Verification Checks
1. **Max Operational Range**: Rejects any waypoint exceeding agent fuel/battery range limits (e.g. `> 1000m`).
2. **Minimum Active Agents**: Ensures fleet availability meets task redundancy requirements.
3. **Payload & Mass Capacities**: Verifies drone payload limits against mission task requirements.
4. **No-Fly Zones & Obstacles**: Validates trajectories against DEM elevation and obstacle polygons.
