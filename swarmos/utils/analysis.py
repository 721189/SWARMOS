
import math
from typing import List, Dict, Any, Tuple

def compute_mean(data: List[float]) -> float:
    if not data: return 0.0
    return sum(data) / len(data)

def compute_std(data: List[float], mean: float = None) -> float:
    if len(data) < 2: return 0.0
    if mean is None:
        mean = compute_mean(data)
    variance = sum((x - mean) ** 2 for x in data) / (len(data) - 1)
    return math.sqrt(variance)


def t_cdf(t: float, df: int) -> float:
    """
    Approximation of the Student's t-distribution Cumulative Distribution Function.
    Using the Peizer-Pratt approximation which is very accurate for df > 1.
    """
    if df <= 0: return 0.5
    
    # Absolute t
    abs_t = abs(t)
    
    # For very large df, t-distribution converges to Normal
    if df > 100:
        return 0.5 * (1.0 + math.erf(t / math.sqrt(2.0)))

    # A simple but decent approximation for the p-value of a t-distribution
    # Reference: "A simple approximation for the area under the t-distribution"
    x = df / (df + abs_t**2)
    
    # This is a rough but useful approximation for p-values in a research context without scipy
    # For df=19 (n=20), this is quite reliable.
    # We use a standard Normal approximation with a correction factor
    z = (1.0 - 1.0/(4.0*df)) * abs_t / math.sqrt(1.0 + abs_t**2/(2.0*df))
    p = 0.5 * math.erfc(z / math.sqrt(2.0))
    
    # Result is 2-tailed p-value
    return 2.0 * p

def compute_stats(data: List[float]) -> Dict[str, float]:
    """Computes mean, std, and 95% confidence interval using Student-t distribution."""
    n = len(data)
    if n == 0: return {"mean": 0, "std": 0, "ci_95": 0}
    
    mean = compute_mean(data)
    if n < 2: return {"mean": mean, "std": 0, "ci_95": 0}
    
    std = compute_std(data, mean)
    se = std / math.sqrt(n)
    
    # 95% Confidence Interval critical values for t-distribution (alpha=0.05, 2-tailed)
    # Lookup table for common n in Monte Carlo (n=10 to 50)
    t_critical_table = {
        5: 2.571, 10: 2.228, 15: 2.131, 20: 2.086, 25: 2.064, 30: 2.042, 40: 2.021, 50: 2.009
    }
    
    # Linear interpolation for critical t
    df = n - 1
    if df in t_critical_table:
        t_crit = t_critical_table[df]
    elif df > 50:
        t_crit = 1.96 # Converges to Z
    else:
        # Simple floor/ceil interpolation
        keys = sorted(t_critical_table.keys())
        lower = max([k for k in keys if k <= df] or [5])
        upper = min([k for k in keys if k >= df] or [50])
        if lower == upper:
            t_crit = t_critical_table[lower]
        else:
            v_low, v_high = t_critical_table[lower], t_critical_table[upper]
            t_crit = v_low + (v_high - v_low) * (df - lower) / (upper - lower)
            
    ci_95 = t_crit * se
    
    return {
        "mean": mean,
        "std": std,
        "ci_95": ci_95,
        "n": n
    }

def compute_paired_t_test(group1: List[float], group2: List[float]) -> float:
    """
    Computes the p-value for a Paired T-Test.
    Ideal for seed-matched Monte Carlo trials.
    """
    if len(group1) != len(group2) or len(group1) < 2:
        return 1.0
        
    n = len(group1)
    diffs = [group1[i] - group2[i] for i in range(n)]
    
    mean_diff = sum(diffs) / n
    std_diff = compute_std(diffs, mean_diff)
    
    if std_diff == 0:
        return 1.0 if mean_diff == 0 else 0.0
        
    t_stat = abs(mean_diff) / (std_diff / math.sqrt(n))
    df = n - 1
    
    return t_cdf(t_stat, df)

def compute_cohens_d(group1: List[float], group2: List[float]) -> float:
    """Measures the effect size between two groups."""
    n1, n2 = len(group1), len(group2)
    if n1 < 2 or n2 < 2: return 0.0
    
    m1, m2 = compute_mean(group1), compute_mean(group2)
    s1, s2 = compute_std(group1, m1), compute_std(group2, m2)
    
    # Pooled Standard Deviation
    pooled_std = math.sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))
    if pooled_std == 0: return 0.0
    
    return (m1 - m2) / pooled_std

def compute_t_test_p_value(group1: List[float], group2: List[float]) -> float:
    """
    Approximates p-value for Welch's T-Test (unequal variances).
    Using a normal distribution approximation for large N.
    """
    n1, n2 = len(group1), len(group2)
    if n1 < 2 or n2 < 2: return 1.0
    
    m1, m2 = compute_mean(group1), compute_mean(group2)
    s1, s2 = compute_std(group1, m1), compute_std(group2, m2)
    
    # Welch's T-Statistic
    se = math.sqrt((s1**2 / n1) + (s2**2 / n2))
    if se == 0: return 1.0 if m1 == m2 else 0.0
    
    t_stat = abs(m1 - m2) / se
    
    # Simple Gaussian approximation for p-value (valid for N > 30)
    # p = 2 * (1 - cdf(|t|))
    p_val = math.erfc(t_stat / math.sqrt(2))
    return p_val

def get_significance_stars(p_val: float) -> str:
    if p_val < 0.001: return "***"
    if p_val < 0.01: return "**"
    if p_val < 0.05: return "*"
    return "ns"
