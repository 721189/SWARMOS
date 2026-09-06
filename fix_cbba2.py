import re

with open('swarmos/swarm_engine/cbba.py', 'r') as f:
    content = f.read()

replacement = """    def _resolve_conflict(
        self, i_id: str, k_id: str, z_i: str, z_k: str, y_i: float, y_k: float,
        s_im: float, s_in: float, s_km: float, s_kn: float
    ) -> str:
        # Implements Choi 2009 Rule Matrix strictly
        action = "LEAVE"
        
        if z_k == k_id:
            if z_i == i_id:
                if y_k > y_i + self.bid_epsilon: action = "UPDATE"
                elif abs(y_k - y_i) <= self.bid_epsilon and k_id < i_id: action = "UPDATE"
                else: action = "LEAVE"
            elif z_i == k_id:
                action = "UPDATE"
            elif z_i not in (i_id, k_id, None):
                if s_km > s_im: action = "UPDATE"
                elif y_k > y_i + self.bid_epsilon: action = "UPDATE"
                else: action = "LEAVE"
            else:
                action = "UPDATE"
        elif z_k == i_id:
            if z_i == i_id: action = "LEAVE"
            elif z_i == k_id: action = "RESET"
            elif z_i not in (i_id, k_id, None): action = "LEAVE"
            else: action = "LEAVE"
        elif z_k not in (i_id, k_id, None):
            m_id = z_k
            if z_i == i_id:
                if s_km > s_im: action = "UPDATE"
                elif y_k > y_i + self.bid_epsilon: action = "UPDATE"
                elif abs(y_k - y_i) <= self.bid_epsilon and m_id < i_id: action = "UPDATE"
                else: action = "LEAVE"
            elif z_i == k_id:
                if s_km > s_im: action = "UPDATE"
                else: action = "RESET"
            elif z_i == m_id:
                if s_km > s_im: action = "UPDATE"
                else: action = "LEAVE"
            elif z_i not in (i_id, k_id, m_id, None):
                # z_i = n_id
                if s_km > s_im and s_kn > s_in: action = "UPDATE"
                elif s_km > s_im and s_kn <= s_in:
                    if y_k > y_i + self.bid_epsilon: action = "UPDATE"
                    elif abs(y_k - y_i) <= self.bid_epsilon and m_id < z_i: action = "UPDATE"
                    else: action = "LEAVE"
                elif s_km <= s_im and s_kn > s_in: action = "UPDATE"
                elif s_km <= s_im and s_kn <= s_in:
                    if y_k > y_i + self.bid_epsilon: action = "UPDATE"
                    else: action = "LEAVE"
            else:
                action = "UPDATE"
        else: # z_k is None
            if z_i == i_id: action = "LEAVE"
            elif z_i == k_id: action = "UPDATE"
            elif z_i not in (i_id, k_id, None):
                if s_km > s_im: action = "UPDATE"
                else: action = "LEAVE"
            else: action = "LEAVE"
            
        return action
"""

# Replace from `def _resolve_conflict` to the end of that method before `def _record_decision`
pattern = r'    def _resolve_conflict\(.*?return action\n'
new_content = re.sub(pattern, replacement.strip('\n') + '\n', content, flags=re.DOTALL)

# Let's also fix the phase2 loop that passes `s_in, s_kn`
# In `cbba.py`, the original phase2 calls `s_in = ...` and `s_kn = ...` if `z_i` not in (i_id, k_id, z_k)
# Actually the previous version passed `s_km_current` and `s_im_current` as `s_km` and `s_im`. Let's just update `cbba.py` to match the arguments of `_resolve_conflict`.
with open('swarmos/swarm_engine/cbba.py', 'w') as f:
    f.write(new_content)
