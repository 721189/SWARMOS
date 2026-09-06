import re

with open('swarmos/swarm_engine/cbba.py', 'r') as f:
    lines = f.readlines()

new_lines = lines[:186]

# Append the oracle logic here
oracle_logic = """
                    action = "LEAVE"
                    if z_k == k_id:
                        if z_i == i_id:
                            if y_k > y_i: action = "UPDATE"
                            elif abs(y_k - y_i) <= self.bid_epsilon and k_id < i_id: action = "UPDATE"
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
                            elif abs(y_k - y_i) <= self.bid_epsilon and m_id < i_id: action = "UPDATE"
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
                                elif abs(y_k - y_i) <= self.bid_epsilon and m_id < n_id: action = "UPDATE"
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
"""

new_lines.append(oracle_logic)
new_lines.extend(lines[223:])

with open('swarmos/swarm_engine/cbba.py', 'w') as f:
    f.writelines(new_lines)
