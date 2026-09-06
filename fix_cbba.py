import re

with open('swarmos/swarm_engine/cbba.py', 'r') as f:
    content = f.read()

replacement = """
                    action = None
                    z_i = agent_i.winning_agents.get(task_id)
                    y_i = agent_i.winning_bids.get(task_id, 0.0)
                    z_k = agent_k.winning_agents.get(task_id)
                    y_k = agent_k.winning_bids.get(task_id, 0.0)
                    
                    if z_k == k_id:
                        if z_i == i_id:
                            if y_k > y_i: action = "UPDATE"
                            elif y_k == y_i and k_id < i_id: action = "UPDATE"
                            else: action = "LEAVE"
                        elif z_i == k_id:
                            action = "UPDATE"
                        elif z_i not in (i_id, k_id, None):
                            m_id = z_i
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0):
                                action = "UPDATE"
                            elif y_k > y_i:
                                action = "UPDATE"
                            else:
                                action = "LEAVE"
                        else: # z_i is None
                            action = "UPDATE"
                    elif z_k == i_id:
                        if z_i == i_id: action = "LEAVE"
                        elif z_i == k_id: action = "RESET"
                        elif z_i not in (i_id, k_id, None): action = "LEAVE"
                        else: action = "LEAVE"
                    elif z_k not in (i_id, k_id, None):
                        m_id = z_k
                        if z_i == i_id:
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            elif y_k > y_i: action = "UPDATE"
                            elif y_k == y_i and m_id < i_id: action = "UPDATE"
                            else: action = "LEAVE"
                        elif z_i == k_id:
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            else: action = "RESET"
                        elif z_i == m_id:
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            else: action = "LEAVE"
                        elif z_i not in (i_id, k_id, m_id, None):
                            n_id = z_i
                            t_k_m = agent_k.timestamps.get(m_id, 0.0)
                            t_i_m = agent_i.timestamps.get(m_id, 0.0)
                            t_k_n = agent_k.timestamps.get(n_id, 0.0)
                            t_i_n = agent_i.timestamps.get(n_id, 0.0)
                            
                            if t_k_m > t_i_m and t_k_n > t_i_n: action = "UPDATE"
                            elif t_k_m > t_i_m and t_k_n <= t_i_n:
                                if y_k > y_i: action = "UPDATE"
                                elif y_k == y_i and m_id < n_id: action = "UPDATE"
                                else: action = "LEAVE"
                            elif t_k_m <= t_i_m and t_k_n > t_i_n: action = "UPDATE"
                            elif t_k_m <= t_i_m and t_k_n <= t_i_n:
                                if y_k > y_i: action = "UPDATE"
                                else: action = "LEAVE"
                        else: # z_i is None
                            action = "UPDATE"
                    else: # z_k is None
                        if z_i == i_id: action = "LEAVE"
                        elif z_i == k_id: action = "UPDATE"
                        elif z_i not in (i_id, k_id, None):
                            m_id = z_i
                            if agent_k.timestamps.get(m_id, 0.0) > agent_i.timestamps.get(m_id, 0.0): action = "UPDATE"
                            else: action = "LEAVE"
                        else: action = "LEAVE"
    
                    if action == "UPDATE":
                        if agent_i.winning_agents.get(task_id) != z_k or agent_i.winning_bids.get(task_id, 0.0) != y_k:
                            agent_i.winning_agents[task_id] = z_k
                            agent_i.winning_bids[task_id] = y_k
                            changes_occurred = True
                    elif action == "RESET":
                        if agent_i.winning_agents.get(task_id) is not None:
                            agent_i.winning_agents[task_id] = None
                            agent_i.winning_bids[task_id] = 0.0
                            changes_occurred = True
"""

pattern = r'                    action = None\n.*?changes_occurred = True'
content = re.sub(pattern, replacement.strip('\n'), content, flags=re.DOTALL)

with open('swarmos/swarm_engine/cbba.py', 'w') as f:
    f.write(content)
