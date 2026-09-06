
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

def compute_stats(data: List[float]) -> Dict[str, float]:
    """Computes mean, std, and 95% confidence interval."""
    n = len(data)
    if n == 0: return {"mean": 0, "std": 0, "ci_95": 0}
    
    mean = compute_mean(data)
    if n < 2: return {"mean": mean, "std": 0, "ci_95": 0}
    
    std = compute_std(data, mean)
    se = std / math.sqrt(n)
    ci_95 = 1.96 * se
    
    return {
        "mean": mean,
        "std": std,
        "ci_95": ci_95,
        "n": n
    }

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
