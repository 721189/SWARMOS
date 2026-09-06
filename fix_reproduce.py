import re
with open('swarmos/research/reproduce.py', 'r') as f:
    content = f.read()

content = content.replace("from nebius_jobs", "from swarmos.nebius_jobs")

with open('swarmos/research/reproduce.py', 'w') as f:
    f.write(content)
