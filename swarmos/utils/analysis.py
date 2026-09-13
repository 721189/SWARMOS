import math
from typing import List, Dict, Any, Tuple

def compute_mean(data: List[float]) -> float:
    if not data: return 0.0
    return sum(data) / len(data)

def compute_std(data: List[float], mean: float = None) -> float:
    if len(data) < 2: return 0.0
    if mean is None: mean = compute_mean(data)
    variance = sum((x - mean) ** 2 for x in data) / (len(data) - 1)
    return math.sqrt(variance)

def erf(x: float) -> float:
    """Error function approximation."""
    # constants
    a1 =  0.254829592
    a2 = -0.284496736
    a3 =  1.421413741
    a4 = -1.453152027
    a5 =  1.061405429
    p  =  0.3275911

    # Save the sign of x
    sign = 1
    if x < 0: sign = -1
    x = abs(x)

    # A&S formula 7.1.26
    t = 1.0/(1.0 + p*x)
    y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*math.exp(-x*x)
    return sign*y

def normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + erf(x / math.sqrt(2.0)))

def t_test_paired(g1: List[float], g2: List[float]) -> Tuple[float, float]:
    """Paired T-test (Pure Python)."""
    n = len(g1)
    if n < 2: return 0.0, 1.0
    diffs = [g1[i] - g2[i] for i in range(n)]
    mean_diff = sum(diffs) / n
    std_diff = compute_std(diffs, mean_diff)
    if std_diff == 0: return 0.0, (1.0 if mean_diff == 0 else 0.0)
    t_stat = mean_diff / (std_diff / math.sqrt(n))
    # Approximation of p-value for large-ish n using Normal
    p_val = 2 * (1 - normal_cdf(abs(t_stat)))
    return t_stat, p_val

def wilcoxon_signed_rank(g1: List[float], g2: List[float]) -> Tuple[float, float]:
    """Wilcoxon Signed-Rank Test (Pure Python)."""
    n = len(g1)
    diffs = [g1[i] - g2[i] for i in range(n) if g1[i] != g2[i]]
    n_nonzero = len(diffs)
    if n_nonzero < 5: return 0.0, 1.0
    
    abs_diffs = [abs(d) for d in diffs]
    # Rank them
    sorted_abs = sorted(enumerate(abs_diffs), key=lambda x: x[1])
    ranks = [0] * n_nonzero
    for i, (original_idx, val) in enumerate(sorted_abs):
        ranks[original_idx] = i + 1
    
    w_pos = sum(ranks[i] for i, d in enumerate(diffs) if d > 0)
    w_neg = sum(ranks[i] for i, d in enumerate(diffs) if d < 0)
    w_stat = min(w_pos, w_neg)
    
    # Normal approximation
    mu_w = n_nonzero * (n_nonzero + 1) / 4
    sigma_w = math.sqrt(n_nonzero * (n_nonzero + 1) * (2 * n_nonzero + 1) / 24)
    z = (w_stat - mu_w) / sigma_w
    p_val = 2 * normal_cdf(z) # z is usually negative
    return w_stat, p_val

def holm_correction(p_values: List[float]) -> List[float]:
    """Holm-Bonferroni correction."""
    m = len(p_values)
    indexed_p = sorted(enumerate(p_values), key=lambda x: x[1])
    corrected = [0.0] * m
    for i, (original_idx, p) in enumerate(indexed_p):
        corrected[original_idx] = min(1.0, p * (m - i))
    # Ensure monotonicity
    for i in range(1, m):
        idx_curr = indexed_p[i][0]
        idx_prev = indexed_p[i-1][0]
        corrected[idx_curr] = max(corrected[idx_curr], corrected[idx_prev])
    return corrected
