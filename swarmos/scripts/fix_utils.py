import re
with open('swarmos/nebius_jobs/experiments.py', 'r') as f:
    content = f.read()

content = content.replace("from utils.", "from swarmos.utils.")

with open('swarmos/nebius_jobs/experiments.py', 'w') as f:
    f.write(content)
