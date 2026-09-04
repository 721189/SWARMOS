"""
Mission Parser powered by NVIDIA Nemotron-4-340B-Instruct & OpenAI-compatible APIs.
Converts unstructured commander directives into structured swarm task manifests.
"""

import json
import os
import re
from typing import Dict, List, Any, Optional
from swarm_engine.tasks import Task, TaskType, TaskStatus
from utils.logger import logger

NEMOTRON_SYSTEM_PROMPT = """You are the SWARMOS Mission Parser AI powered by NVIDIA Nemotron.
Your role is to translate high-level natural language tactical mission briefings into a structured swarm task manifest.
Available Task Types:
- RECON: Reconnaissance of potential hostile zones or survivors.
- NEUTRALIZE: Electronic disruption or countermeasure deployment.
- RESCUE: Medical extraction or critical supply drop.
- SURVEIL: Persistent loiter and sensor observation.
- RELAY: High-altitude communications bridge over obstructed terrain.

Return strictly valid JSON matching this schema:
{
  "mission_name": "string",
  "tactical_intent": "string",
  "recommended_agents": 4-8,
  "tasks": [
    {
      "id": "T1",
      "type": "RECON|NEUTRALIZE|RESCUE|SURVEIL|RELAY",
      "position": [x_coordinate_between_100_and_1100, y_coordinate_between_100_and_700],
      "base_reward": 50-150,
      "duration": 4.0-8.0,
      "urgency_weight": 0.8-2.0,
      "description": "brief operational note"
    }
  ]
}
Do not wrap in markdown quotes if possible, output pure JSON."""

class MissionParser:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model: str = "nvidia/nemotron-4-340b-instruct"):
        self.api_key = api_key or os.getenv("NEBIUS_API_KEY", "")
        self.base_url = base_url or os.getenv("NEBIUS_API_BASE", "https://api.studio.nebius.ai/v1")
        self.model = model

    def parse_directive(self, prompt: str) -> Dict[str, Any]:
        """
        Calls NVIDIA Nemotron endpoint via OpenAI SDK or falls back to an
        intelligent deterministic tactical rule engine.
        """
        if self.api_key:
            try:
                from openai import OpenAI
                client = OpenAI(base_url=self.base_url, api_key=self.api_key)
                logger.info(f"Dispatching mission briefing to NVIDIA Nemotron model: {self.model}")
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": NEMOTRON_SYSTEM_PROMPT},
                        {"role": "user", "content": f"Directive: {prompt}"}
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
                raw_text = response.choices[0].message.content
                return json.loads(raw_text)
            except Exception as e:
                logger.warning(f"Nemotron API call failed ({e}). Reverting to rule-based fallback parser.")

        return self._heuristic_fallback(prompt)

    def _heuristic_fallback(self, prompt: str) -> Dict[str, Any]:
        """Deterministic NLP pattern matcher for standalone offline operation."""
        p_lower = prompt.lower()
        tasks_manifest = []

        if "rescue" in p_lower or "search" in p_lower or "disaster" in p_lower:
            name = "Operation Horizon Rescue"
            intent = "Rapid casualty location and automated medical package drop"
            tasks_manifest = [
                {"id": "T1", "type": "RECON", "position": [320, 220], "base_reward": 90, "duration": 4.0, "urgency_weight": 1.2, "description": "Sector Alpha thermal sweep"},
                {"id": "T2", "type": "RESCUE", "position": [480, 290], "base_reward": 140, "duration": 6.0, "urgency_weight": 1.5, "description": "Survivor LZ medical drop"},
                {"id": "T3", "type": "SURVEIL", "position": [780, 360], "base_reward": 80, "duration": 5.0, "urgency_weight": 0.9, "description": "Monitor river flood level"},
                {"id": "T4", "type": "RESCUE", "position": [880, 520], "base_reward": 130, "duration": 6.0, "urgency_weight": 1.4, "description": "Rooftop extraction marker"},
                {"id": "T5", "type": "RELAY", "position": [600, 380], "base_reward": 70, "duration": 4.0, "urgency_weight": 0.8, "description": "Tactical comms mesh bridge"}
            ]
        elif "hostile" in p_lower or "jammer" in p_lower or "strike" in p_lower or "threat" in p_lower:
            name = "Operation Silent Shield"
            intent = "Penetrate radar bubble, neutralize hostile electronic warfare assets"
            tasks_manifest = [
                {"id": "T1", "type": "RECON", "position": [280, 480], "base_reward": 85, "duration": 4.0, "urgency_weight": 1.1, "description": "Perimeter radar scan"},
                {"id": "T2", "type": "NEUTRALIZE", "position": [620, 420], "base_reward": 160, "duration": 7.0, "urgency_weight": 1.8, "description": "Disrupt primary EW jammer node"},
                {"id": "T3", "type": "RELAY", "position": [450, 250], "base_reward": 75, "duration": 5.0, "urgency_weight": 0.9, "description": "Stand-off data link node"},
                {"id": "T4", "type": "SURVEIL", "position": [850, 280], "base_reward": 95, "duration": 6.0, "urgency_weight": 1.0, "description": "Runway watchtower loiter"},
                {"id": "T5", "type": "NEUTRALIZE", "position": [950, 580], "base_reward": 150, "duration": 7.0, "urgency_weight": 1.6, "description": "Secondary radar emitter blind"}
            ]
        else:
            name = "Operation Autonomous Sweep"
            intent = "Coordinated multi-agent spatial reconnaissance and perimeter security"
            tasks_manifest = [
                {"id": "T1", "type": "RECON", "position": [250, 200], "base_reward": 80, "duration": 4.0, "urgency_weight": 1.0, "description": "Northwest grid sweep"},
                {"id": "T2", "type": "SURVEIL", "position": [520, 280], "base_reward": 100, "duration": 5.0, "urgency_weight": 1.0, "description": "Central intersection loiter"},
                {"id": "T3", "type": "RECON", "position": [850, 220], "base_reward": 85, "duration": 4.0, "urgency_weight": 1.0, "description": "Northeast perimeter sweep"},
                {"id": "T4", "type": "RELAY", "position": [650, 520], "base_reward": 75, "duration": 5.0, "urgency_weight": 0.9, "description": "Southern communications link"},
                {"id": "T5", "type": "RESCUE", "position": [400, 620], "base_reward": 120, "duration": 6.0, "urgency_weight": 1.3, "description": "Depot resource package deliver"}
            ]

        return {
            "mission_name": name,
            "tactical_intent": intent,
            "recommended_agents": 6,
            "tasks": tasks_manifest
        }

    def convert_to_tasks(self, manifest: Dict[str, Any]) -> List[Task]:
        """Convert raw JSON manifest items into executable Task domain entities."""
        type_mapping = {
            "RECON": TaskType.RECON,
            "NEUTRALIZE": TaskType.NEUTRALIZE,
            "RESCUE": TaskType.RESCUE,
            "SURVEIL": TaskType.SURVEIL,
            "RELAY": TaskType.RELAY
        }
        domain_tasks = []
        for raw in manifest.get("tasks", []):
            tt = type_mapping.get(raw.get("type", "RECON"), TaskType.RECON)
            pos = tuple(raw.get("position", [400.0, 300.0]))
            t = Task(
                id=raw.get("id", f"T{len(domain_tasks)+1}"),
                task_type=tt,
                position=(float(pos[0]), float(pos[1])),
                base_reward=float(raw.get("base_reward", 100.0)),
                duration=float(raw.get("duration", 5.0)),
                urgency_weight=float(raw.get("urgency_weight", 1.0)),
                status=TaskStatus.UNASSIGNED,
                description=raw.get("description", "")
            )
            domain_tasks.append(t)
        return domain_tasks
