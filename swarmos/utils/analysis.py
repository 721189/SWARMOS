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

def student_t_pdf(x: float, df: float) -> float:
    """Student's t probability density function."""
    if df <= 0:
        return 0.0
    log_c = math.lgamma((df + 1.0) / 2.0) - 0.5 * math.log(df * math.pi) - math.lgamma(df / 2.0)
    return math.exp(log_c - 0.5 * (df + 1.0) * math.log(1.0 + (x * x) / df))

def student_t_cdf_half(t_val: float, df: float, steps: int = 1000) -> float:
    """Integral of Student's t PDF from 0 to t_val via Simpson's rule."""
    if t_val <= 0 or df <= 0:
        return 0.0
    h = t_val / steps
    s = student_t_pdf(0.0, df) + student_t_pdf(t_val, df)
    for i in range(1, steps):
        x = i * h
        weight = 4.0 if i % 2 == 1 else 2.0
        s += weight * student_t_pdf(x, df)
    return s * h / 3.0

def student_t_ppf(p: float, df: float) -> float:
    """
    Inverse cumulative distribution function (quantile function) for Student's t distribution.
    For 95% two-sided CI with df=n-1, pass p=0.975.
    """
    if df < 1:
        return 1.95996
    if HAS_SCIPY and sp_stats is not None:
        try:
            return float(sp_stats.t.ppf(p, df))
        except Exception:
            pass
    target = p - 0.5
    low, high = 0.0, 100.0
    for _ in range(50):
        mid = (low + high) / 2.0
        val = student_t_cdf_half(mid, df)
        if val < target:
            low = mid
        else:
            high = mid
    return mid

def compute_confidence_interval(data: List[float], confidence: float = 0.95) -> Tuple[float, float]:
    """
    Computes exact (lower, upper) Student-t confidence interval (df = n - 1) for the sample mean.
    Required for publication rigor when n is finite (e.g. n = 15).
    """
    n = len(data)
    if n == 0:
        return 0.0, 0.0
    mean = compute_mean(data)
    if n < 2:
        return mean, mean
    std = compute_std(data, mean)
    df = n - 1
    p = 1.0 - (1.0 - confidence) / 2.0
    t_crit = student_t_ppf(p, df)
    margin = t_crit * (std / math.sqrt(n))
    return mean - margin, mean + margin

def compute_bootstrap_ci(
    data: List[float],
    confidence: float = 0.95,
    n_resamples: int = 2000,
    seed: int = 42
) -> Tuple[float, float]:
    """Non-parametric percentile bootstrap 95% confidence interval for sample mean."""
    n = len(data)
    if n < 2:
        m = compute_mean(data)
        return m, m
    import random
    rng = random.Random(seed)
    means = []
    for _ in range(n_resamples):
        sample = [rng.choice(data) for _ in range(n)]
        means.append(compute_mean(sample))
    means.sort()
    alpha = 1.0 - confidence
    lower_idx = int(math.floor(alpha / 2.0 * n_resamples))
    upper_idx = int(math.ceil((1.0 - alpha / 2.0) * n_resamples)) - 1
    lower_idx = max(0, min(n_resamples - 1, lower_idx))
    upper_idx = max(0, min(n_resamples - 1, upper_idx))
    return means[lower_idx], means[upper_idx]

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

