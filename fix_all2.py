import re
with open('swarmos/nebius_jobs/experiments.py', 'r') as f:
    content = f.read()

content = content.replace("from ai_layer", "from swarmos.ai_layer")
content = content.replace("from ui.", "from swarmos.ui.")

with open('swarmos/nebius_jobs/experiments.py', 'w') as f:
    f.write(content)
