import unittest
import math
from swarmos.utils.analysis import (
    compute_mean,
    compute_std,
    compute_confidence_interval,
    cohens_d,
    t_test_paired,
    wilcoxon_signed_rank,
    holm_correction
)

class TestAnalysisStats(unittest.TestCase):
    def test_mean_and_std(self):
        data = [2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0]
        self.assertAlmostEqual(compute_mean(data), 5.0, places=5)
        # Sample variance = 32/7 = 4.571428..., std = 2.1380899...
        self.assertAlmostEqual(compute_std(data), 2.1380899, places=4)

    def test_confidence_interval(self):
        data = [10.0] * 10
        low, high = compute_confidence_interval(data)
        self.assertAlmostEqual(low, 10.0)
        self.assertAlmostEqual(high, 10.0)

    def test_paired_t_test_identical(self):
        g1 = [1.0, 2.0, 3.0, 4.0]
        g2 = [1.0, 2.0, 3.0, 4.0]
        t_stat, p_val = t_test_paired(g1, g2)
        self.assertEqual(t_stat, 0.0)
        self.assertEqual(p_val, 1.0)

    def test_paired_t_test_significant_difference(self):
        g1 = [10.0, 11.0, 12.0, 10.5, 11.5, 10.8]
        g2 = [2.0, 2.5, 3.0, 2.2, 2.8, 2.4]
        t_stat, p_val = t_test_paired(g1, g2)
        self.assertGreater(t_stat, 0.0)
        self.assertLess(p_val, 0.001)

    def test_wilcoxon_signed_rank_identical(self):
        g1 = [1.0, 2.0, 3.0, 4.0]
        g2 = [1.0, 2.0, 3.0, 4.0]
        w_stat, p_val = wilcoxon_signed_rank(g1, g2)
        self.assertEqual(p_val, 1.0)

    def test_wilcoxon_signed_rank_positive_shift(self):
        g1 = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
        g2 = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5]
        w_stat, p_val = wilcoxon_signed_rank(g1, g2)
        self.assertLess(p_val, 0.05)

    def test_cohens_d(self):
        g1 = [10.0, 10.0, 10.0, 10.0]
        g2 = [5.0, 5.0, 5.0, 5.0]
        # Identical differences have 0 std_diff -> 0.0
        self.assertEqual(cohens_d(g1, g2), 0.0)
        
        g1_var = [10.0, 12.0, 14.0, 16.0]
        g2_var = [5.0, 6.0, 8.0, 9.0]
        d = cohens_d(g1_var, g2_var)
        self.assertGreater(d, 0.0)

    def test_holm_correction(self):
        p_vals = [0.01, 0.04, 0.03]
        corrected = holm_correction(p_vals)
        # Sorted: 0.01 (x3 -> 0.03), 0.03 (x2 -> 0.06), 0.04 (x1 -> 0.04 -> monotonicity 0.06)
        self.assertAlmostEqual(corrected[0], 0.03, places=4)
        self.assertAlmostEqual(corrected[1], 0.06, places=4)
        self.assertAlmostEqual(corrected[2], 0.06, places=4)

if __name__ == "__main__":
    unittest.main()
