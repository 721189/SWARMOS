import re

with open('swarmos/reference_cbba/cbba_oracle.py', 'r') as f:
    content = f.read()

replacement = """                if action == "UPDATE":
                    if agent_i.winning_agents.get(tid) != z_kj or agent_i.winning_bids.get(tid) != y_kj:
                        agent_i.winning_agents[tid] = z_kj
                        agent_i.winning_bids[tid] = y_kj
                        changed = True
                elif action == "RESET":
                    if agent_i.winning_agents.get(tid) is not None:
                        agent_i.winning_agents[tid] = None
                        agent_i.winning_bids[tid] = 0.0
                        changed = True"""

content = re.sub(r'                if action == "UPDATE":\n                    agent_i.winning_agents\[tid\] = z_kj\n                    agent_i.winning_bids\[tid\] = y_kj\n                    changed = True\n                elif action == "RESET":\n                    agent_i.winning_agents\[tid\] = None\n                    agent_i.winning_bids\[tid\] = 0.0\n                    changed = True', replacement, content)

with open('swarmos/reference_cbba/cbba_oracle.py', 'w') as f:
    f.write(content)
