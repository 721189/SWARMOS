"""
CLI helper for AI mission planning and deterministic safety compilation.
Can be invoked by server.ts to ensure Python remains the single source of truth.
"""

import sys
import json
from ai_layer.mission_parser import MissionParser
from ai_layer.safety_compiler import SafetyCompiler

def plan_and_compile(prompt: str) -> str:
    parser = MissionParser()
    compiler = SafetyCompiler()
    raw_manifest = parser.parse_directive(prompt)
    compiled = compiler.compile_and_validate(raw_manifest)
    return json.dumps({
        "planner": "nvidia_nemotron_4_340b_instruct" if parser.api_key else "deterministic_tactical_rule_engine",
        "fallback_used": not bool(parser.api_key),
        "manifest": compiled
    })

if __name__ == "__main__":
    directive = sys.argv[1] if len(sys.argv) > 1 else "Conduct multi-sector reconnaissance sweep"
    print(plan_and_compile(directive))
