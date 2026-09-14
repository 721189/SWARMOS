import math
from typing import List, Dict, Any, Tuple, Optional

# Attempt to import scipy for gold-standard scientific routines if installed
try:
    import scipy.stats as sp_stats
    HAS_SCIPY = True
except ImportError:
    sp_stats = None
    HAS_SCIPY = False

def compute_mean(data: List[float]) -> float:
    if not data:
        return 0.0
    return sum(data) / len(data)

def compute_std(data: List[float], mean: Optional[float] = None) -> float:
    if len(data) < 2:
        return 0.0
    if mean is None:
        mean = compute_mean(data)
    variance = sum((x - mean) ** 2 for x in data) / (len(data) - 1)
    return math.sqrt(variance)

def erf(x: float) -> float:
    """Handbook of Mathematical Functions (Abramowitz & Stegun formula 7.1.26)."""
    a1 = 0.254829592
    a2 = -0.284496736
    a3 = 1.421413741
    a4 = -1.453152027
    a5 = 1.061405429
    p = 0.3275911

    sign = 1 if x >= 0 else -1
    x = abs(x)
    t = 1.0 / (1.0 + p * x)
    y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * math.exp(-x * x)
    return sign * y

def normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + erf(x / math.sqrt(2.0)))

def compute_confidence_interval(data: List[float], confidence: float = 0.95) -> Tuple[float, float]:
    """Computes (lower, upper) confidence interval for the sample mean."""
    n = len(data)
    if n == 0:
        return 0.0, 0.0
    mean = compute_mean(data)
    if n < 2:
        return mean, mean
    std = compute_std(data, mean)
    # Z-critical for 95% = 1.95996, 99% = 2.57583
    z_crit = 1.95996 if abs(confidence - 0.95) < 0.01 else 2.57583
    margin = z_crit * (std / math.sqrt(n))
    return mean - margin, mean + margin

def cohens_d(g1: List[float], g2: List[float]) -> float:
    """Calculates Cohen's d effect size for paired or equal-variance comparisons."""
    n = min(len(g1), len(g2))
    if n < 2:
        return 0.0
    diffs = [g1[i] - g2[i] for i in range(n)]
    mean_d = compute_mean(diffs)
    std_d = compute_std(diffs, mean_d)
    if std_d == 0:
        return 0.0
    return mean_d / std_d

def t_test_paired(g1: List[float], g2: List[float]) -> Tuple[float, float]:
    """Paired Student's T-test with SciPy or validated analytical approximation."""
    n = min(len(g1), len(g2))
    if n < 2:
        return 0.0, 1.0
        
    if HAS_SCIPY and sp_stats is not None:
        res = sp_stats.ttest_rel(g1[:n], g2[:n])
        t_stat = float(res.statistic) if not math.isnan(res.statistic) else 0.0
        p_val = float(res.pvalue) if not math.isnan(res.pvalue) else 1.0
        return t_stat, p_val

    diffs = [g1[i] - g2[i] for i in range(n)]
    mean_diff = sum(diffs) / n
    std_diff = compute_std(diffs, mean_diff)
    if std_diff == 0:
        return 0.0, (1.0 if mean_diff == 0 else 0.0)
    t_stat = mean_diff / (std_diff / math.sqrt(n))
    # Two-tailed normal approximation
    p_val = 2.0 * (1.0 - normal_cdf(abs(t_stat)))
    return t_stat, max(0.0, min(1.0, p_val))

def wilcoxon_signed_rank(g1: List[float], g2: List[float]) -> Tuple[float, float]:
    """Wilcoxon Signed-Rank Test with tie-handling, zero exclusion, and continuity correction."""
    n = min(len(g1), len(g2))
    if n < 2:
        return 0.0, 1.0
        
    diffs = [g1[i] - g2[i] for i in range(n) if g1[i] != g2[i]]
    n_nonzero = len(diffs)
    if n_nonzero < 3:
        return 0.0, 1.0

    if HAS_SCIPY and sp_stats is not None:
        try:
            res = sp_stats.wilcoxon(g1[:n], g2[:n], zero_method="pratt", correction=True)
            w_stat = float(res.statistic)
            p_val = float(res.pvalue)
            return w_stat, p_val
        except Exception:
            pass

    abs_diffs = [abs(d) for d in diffs]
    # Group ranks for ties
    indexed = sorted(enumerate(abs_diffs), key=lambda x: x[1])
    ranks = [0.0] * n_nonzero
    i = 0
    while i < n_nonzero:
        j = i
        while j < n_nonzero - 1 and abs(indexed[j + 1][1] - indexed[i][1]) < 1e-12:
            j += 1
        avg_rank = (i + 1 + j + 1) / 2.0
        for k in range(i, j + 1):
            orig_idx = indexed[k][0]
            ranks[orig_idx] = avg_rank
        i = j + 1

    w_pos = sum(ranks[i] for i, d in enumerate(diffs) if d > 0)
    w_neg = sum(ranks[i] for i, d in enumerate(diffs) if d < 0)
    w_stat = min(w_pos, w_neg)

    # Normal approximation with continuity correction
    mu_w = n_nonzero * (n_nonzero + 1) / 4.0
    sigma_w = math.sqrt(n_nonzero * (n_nonzero + 1) * (2 * n_nonzero + 1) / 24.0)
    if sigma_w == 0:
        return w_stat, 1.0
        
    z = (abs(w_stat - mu_w) - 0.5) / sigma_w
    p_val = 2.0 * (1.0 - normal_cdf(abs(z)))
    return float(w_stat), max(0.0, min(1.0, float(p_val)))

def holm_correction(p_values: List[float]) -> List[float]:
    """Step-down Holm-Bonferroni multi-hypothesis testing correction."""
    m = len(p_values)
    if m == 0:
        return []
    indexed_p = sorted(enumerate(p_values), key=lambda x: x[1])
    corrected = [0.0] * m
    for i, (original_idx, p) in enumerate(indexed_p):
        corrected[original_idx] = min(1.0, p * (m - i))
    # Enforce monotonicity
    for i in range(1, m):
        idx_curr = indexed_p[i][0]
        idx_prev = indexed_p[i - 1][0]
        corrected[idx_curr] = max(corrected[idx_curr], corrected[idx_prev])
    return corrected

