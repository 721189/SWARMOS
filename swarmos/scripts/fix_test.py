import re

with open('swarmos/tests/test_oracle_validation.py', 'r') as f:
    content = f.read()

content = re.sub(
    r'            messages = {.*?            changed = engine.phase2_conflict_resolution\(agents_optimized, received_messages\)',
    '            changed = engine.phase2_consensus_conflict_resolution(agents_optimized, self.tasks, self.comm_links)',
    content, flags=re.DOTALL
)

with open('swarmos/tests/test_oracle_validation.py', 'w') as f:
    f.write(content)
