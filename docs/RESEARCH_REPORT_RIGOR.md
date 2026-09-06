# SWARMOS High-Rigor Statistical Report
**Audit Timestamp**: 2026-09-06T12:54:22.701289+00:00
**Artifact Version**: 2.1.0
**Benchmark Mode**: full_matrix_sweep
**Total Trials**: 1400

## 1. Statistical Significance (vs. CBBA Standard)
Comparing mission completion rates and convergence times.

| Configuration | Algorithm | Completion (Mean ± CI) | p-value | Significance | Effect Size (d) |
|:---|:---|:---|:---|:---|:---|
| FS=4, T=10, nominal | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, nominal | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, nominal | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, nominal | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, nominal | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, nominal | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, nominal | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_10 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_10 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_10 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_10 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_10 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_10 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_10 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_25 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_25 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_50_catastrophic | Static | 74.0% ± 4.29 | 0.0481 | * | -1.41 |
| FS=4, T=10, loss_50_catastrophic | Greedy | 68.0% ± 3.51 | 0.0150 | * | -2.92 |
| FS=4, T=10, loss_50_catastrophic | CBBA_Standard | 84.0% ± 4.29 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_50_catastrophic | CBBA_Recovery | 98.0% ± 3.51 | 0.0392 | * | 1.57 |
| FS=4, T=10, loss_50_catastrophic | CBBA_BFT | 84.0% ± 4.29 | 1.0000 | ns | 0.00 |
| FS=4, T=10, loss_50_catastrophic | CBBA_Recovery_BFT | 98.0% ± 3.51 | 0.0392 | * | 1.57 |
| FS=4, T=10, loss_50_catastrophic | SWARMOS | 98.0% ± 3.51 | 0.0392 | * | 1.57 |
| FS=4, T=10, adversarial_nodes | Static | 74.0% ± 4.29 | 0.0165 | * | -2.68 |
| FS=4, T=10, adversarial_nodes | Greedy | 82.0% ± 12.88 | 0.0894 | ns | -1.06 |
| FS=4, T=10, adversarial_nodes | CBBA_Standard | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=4, T=10, adversarial_nodes | CBBA_Recovery | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=4, T=10, adversarial_nodes | CBBA_BFT | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=4, T=10, adversarial_nodes | CBBA_Recovery_BFT | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=4, T=10, adversarial_nodes | SWARMOS | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=4, T=20, nominal | Static | 91.0% ± 5.11 | 0.0506 | ns | -1.38 |
| FS=4, T=20, nominal | Greedy | 94.0% ± 4.29 | 0.0826 | ns | -1.10 |
| FS=4, T=20, nominal | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, nominal | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, nominal | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, nominal | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, nominal | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_10 | Static | 91.0% ± 5.11 | 0.0506 | ns | -1.38 |
| FS=4, T=20, loss_10 | Greedy | 94.0% ± 4.29 | 0.0826 | ns | -1.10 |
| FS=4, T=20, loss_10 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_10 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_10 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_10 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_10 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_25 | Static | 91.0% ± 5.11 | 0.0506 | ns | -1.38 |
| FS=4, T=20, loss_25 | Greedy | 94.0% ± 4.29 | 0.0826 | ns | -1.10 |
| FS=4, T=20, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_50_catastrophic | Static | 68.0% ± 4.47 | 0.0108 | * | -4.38 |
| FS=4, T=20, loss_50_catastrophic | Greedy | 65.0% ± 3.92 | 0.0185 | * | -2.45 |
| FS=4, T=20, loss_50_catastrophic | CBBA_Standard | 80.0% ± 2.77 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_50_catastrophic | CBBA_Recovery | 80.0% ± 2.77 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_50_catastrophic | CBBA_BFT | 80.0% ± 2.77 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_50_catastrophic | CBBA_Recovery_BFT | 80.0% ± 2.77 | 1.0000 | ns | 0.00 |
| FS=4, T=20, loss_50_catastrophic | SWARMOS | 80.0% ± 2.77 | 1.0000 | ns | 0.00 |
| FS=4, T=20, adversarial_nodes | Static | 78.0% ± 11.29 | 0.0411 | * | -1.53 |
| FS=4, T=20, adversarial_nodes | Greedy | 88.0% ± 12.88 | 0.1849 | ns | -0.73 |
| FS=4, T=20, adversarial_nodes | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, adversarial_nodes | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, adversarial_nodes | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, adversarial_nodes | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=4, T=20, adversarial_nodes | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, nominal | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, nominal | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, nominal | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, nominal | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, nominal | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, nominal | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, nominal | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_10 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_10 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_10 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_10 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_10 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_10 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_10 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_25 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_25 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_50_catastrophic | Static | 82.0% ± 3.51 | 0.0150 | * | -2.92 |
| FS=8, T=10, loss_50_catastrophic | Greedy | 78.0% ± 3.51 | 0.0155 | * | -2.83 |
| FS=8, T=10, loss_50_catastrophic | CBBA_Standard | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_50_catastrophic | CBBA_Recovery | 100.0% ± 0.0 | 0.3768 | ns | 0.45 |
| FS=8, T=10, loss_50_catastrophic | CBBA_BFT | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=8, T=10, loss_50_catastrophic | CBBA_Recovery_BFT | 100.0% ± 0.0 | 0.3768 | ns | 0.45 |
| FS=8, T=10, loss_50_catastrophic | SWARMOS | 100.0% ± 0.0 | 0.3768 | ns | 0.45 |
| FS=8, T=10, adversarial_nodes | Static | 86.0% ± 7.01 | 0.0467 | * | -1.43 |
| FS=8, T=10, adversarial_nodes | Greedy | 88.0% ± 8.59 | 0.1001 | ns | -1.00 |
| FS=8, T=10, adversarial_nodes | CBBA_Standard | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=8, T=10, adversarial_nodes | CBBA_Recovery | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=8, T=10, adversarial_nodes | CBBA_BFT | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=8, T=10, adversarial_nodes | CBBA_Recovery_BFT | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=8, T=10, adversarial_nodes | SWARMOS | 98.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=8, T=20, nominal | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, nominal | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, nominal | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, nominal | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, nominal | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, nominal | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, nominal | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_10 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_10 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_10 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_10 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_10 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_10 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_10 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_25 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_25 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_50_catastrophic | Static | 86.0% ± 1.75 | 0.0467 | * | -1.43 |
| FS=8, T=20, loss_50_catastrophic | Greedy | 85.0% ± 0.0 | 0.0648 | ns | -1.23 |
| FS=8, T=20, loss_50_catastrophic | CBBA_Standard | 92.0% ± 4.47 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_50_catastrophic | CBBA_Recovery | 99.0% ± 1.75 | 0.0392 | * | 1.57 |
| FS=8, T=20, loss_50_catastrophic | CBBA_BFT | 92.0% ± 4.47 | 1.0000 | ns | 0.00 |
| FS=8, T=20, loss_50_catastrophic | CBBA_Recovery_BFT | 99.0% ± 1.75 | 0.0392 | * | 1.57 |
| FS=8, T=20, loss_50_catastrophic | SWARMOS | 99.0% ± 1.75 | 0.0392 | * | 1.57 |
| FS=8, T=20, adversarial_nodes | Static | 92.0% ± 5.94 | 0.3297 | ns | -0.50 |
| FS=8, T=20, adversarial_nodes | Greedy | 88.0% ± 5.26 | 0.0826 | ns | -1.10 |
| FS=8, T=20, adversarial_nodes | CBBA_Standard | 97.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=8, T=20, adversarial_nodes | CBBA_Recovery | 97.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=8, T=20, adversarial_nodes | CBBA_BFT | 97.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=8, T=20, adversarial_nodes | CBBA_Recovery_BFT | 97.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=8, T=20, adversarial_nodes | SWARMOS | 97.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=16, T=10, nominal | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, nominal | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, nominal | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, nominal | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, nominal | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, nominal | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, nominal | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_10 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_10 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_10 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_10 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_10 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_10 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_10 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_25 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_25 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_50_catastrophic | Static | 76.0% ± 4.29 | 0.0114 | * | -4.02 |
| FS=16, T=10, loss_50_catastrophic | Greedy | 22.0% ± 3.51 | 0.0082 | ** | -16.10 |
| FS=16, T=10, loss_50_catastrophic | CBBA_Standard | 94.0% ± 4.29 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_50_catastrophic | CBBA_Recovery | 96.0% ± 4.29 | 0.3768 | ns | 0.45 |
| FS=16, T=10, loss_50_catastrophic | CBBA_BFT | 94.0% ± 4.29 | 1.0000 | ns | 0.00 |
| FS=16, T=10, loss_50_catastrophic | CBBA_Recovery_BFT | 96.0% ± 4.29 | 0.3768 | ns | 0.45 |
| FS=16, T=10, loss_50_catastrophic | SWARMOS | 96.0% ± 4.29 | 0.3768 | ns | 0.45 |
| FS=16, T=10, adversarial_nodes | Static | 96.0% ± 4.29 | 0.1849 | ns | -0.73 |
| FS=16, T=10, adversarial_nodes | Greedy | 92.0% ± 8.59 | 0.1849 | ns | -0.73 |
| FS=16, T=10, adversarial_nodes | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, adversarial_nodes | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, adversarial_nodes | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, adversarial_nodes | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=10, adversarial_nodes | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, nominal | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, nominal | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, nominal | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, nominal | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, nominal | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, nominal | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, nominal | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_10 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_10 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_10 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_10 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_10 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_10 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_10 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_25 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_25 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_50_catastrophic | Static | 74.0% ± 1.75 | 0.0106 | * | -4.54 |
| FS=16, T=20, loss_50_catastrophic | Greedy | 63.0% ± 2.15 | 0.0095 | ** | -6.00 |
| FS=16, T=20, loss_50_catastrophic | CBBA_Standard | 93.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_50_catastrophic | CBBA_Recovery | 99.0% ± 1.75 | 0.0467 | * | 1.43 |
| FS=16, T=20, loss_50_catastrophic | CBBA_BFT | 93.0% ± 3.51 | 1.0000 | ns | 0.00 |
| FS=16, T=20, loss_50_catastrophic | CBBA_Recovery_BFT | 99.0% ± 1.75 | 0.0467 | * | 1.43 |
| FS=16, T=20, loss_50_catastrophic | SWARMOS | 99.0% ± 1.75 | 0.0467 | * | 1.43 |
| FS=16, T=20, adversarial_nodes | Static | 96.0% ± 4.29 | 0.1849 | ns | -0.73 |
| FS=16, T=20, adversarial_nodes | Greedy | 96.0% ± 4.29 | 0.1849 | ns | -0.73 |
| FS=16, T=20, adversarial_nodes | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, adversarial_nodes | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, adversarial_nodes | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, adversarial_nodes | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=16, T=20, adversarial_nodes | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, nominal | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, nominal | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, nominal | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, nominal | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, nominal | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, nominal | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, nominal | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_10 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_10 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_10 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_10 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_10 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_10 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_10 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_25 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_25 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_50_catastrophic | Static | 50.0% ± 5.54 | 0.0090 | ** | -7.07 |
| FS=32, T=10, loss_50_catastrophic | Greedy | 10.0% ± 0.0 | 0.0000 | *** | 0.00 |
| FS=32, T=10, loss_50_catastrophic | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_50_catastrophic | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_50_catastrophic | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_50_catastrophic | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, loss_50_catastrophic | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, adversarial_nodes | Static | 92.0% ± 3.51 | 0.0304 | * | -1.79 |
| FS=32, T=10, adversarial_nodes | Greedy | 84.0% ± 7.01 | 0.0304 | * | -1.79 |
| FS=32, T=10, adversarial_nodes | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, adversarial_nodes | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, adversarial_nodes | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, adversarial_nodes | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=10, adversarial_nodes | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, nominal | Static | 100.0% ± 0.0 | 0.1849 | ns | 0.73 |
| FS=32, T=20, nominal | Greedy | 100.0% ± 0.0 | 0.1849 | ns | 0.73 |
| FS=32, T=20, nominal | CBBA_Standard | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, nominal | CBBA_Recovery | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, nominal | CBBA_BFT | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, nominal | CBBA_Recovery_BFT | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, nominal | SWARMOS | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_10 | Static | 100.0% ± 0.0 | 0.3768 | ns | 0.45 |
| FS=32, T=20, loss_10 | Greedy | 100.0% ± 0.0 | 0.3768 | ns | 0.45 |
| FS=32, T=20, loss_10 | CBBA_Standard | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_10 | CBBA_Recovery | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_10 | CBBA_BFT | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_10 | CBBA_Recovery_BFT | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_10 | SWARMOS | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_25 | Static | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_25 | Greedy | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_25 | CBBA_Standard | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_25 | CBBA_Recovery | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_25 | CBBA_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_25 | CBBA_Recovery_BFT | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_25 | SWARMOS | 100.0% ± 0.0 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_50_catastrophic | Static | 77.0% ± 3.51 | 0.0118 | * | -3.83 |
| FS=32, T=20, loss_50_catastrophic | Greedy | 18.0% ± 3.51 | 0.0082 | ** | -16.00 |
| FS=32, T=20, loss_50_catastrophic | CBBA_Standard | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_50_catastrophic | CBBA_Recovery | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_50_catastrophic | CBBA_BFT | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_50_catastrophic | CBBA_Recovery_BFT | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, loss_50_catastrophic | SWARMOS | 98.0% ± 2.15 | 1.0000 | ns | 0.00 |
| FS=32, T=20, adversarial_nodes | Static | 98.0% ± 2.15 | 0.3768 | ns | -0.45 |
| FS=32, T=20, adversarial_nodes | Greedy | 94.0% ± 4.29 | 0.1001 | ns | -1.00 |
| FS=32, T=20, adversarial_nodes | CBBA_Standard | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, adversarial_nodes | CBBA_Recovery | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, adversarial_nodes | CBBA_BFT | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, adversarial_nodes | CBBA_Recovery_BFT | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |
| FS=32, T=20, adversarial_nodes | SWARMOS | 99.0% ± 1.75 | 1.0000 | ns | 0.00 |

Identifying critical thresholds where swarm coordination breaks down.

### Packet Loss Sweep (FS=12, T=25)
| Packet Loss | Mission Completion (TCR) | Status |
|:---|:---|:---|
| 0% | 100.0% | STABLE |
| 10% | 99.2% | STABLE |
| 20% | 100.0% | STABLE |
| 30% | 99.2% | STABLE |
| 40% | 98.4% | STABLE |
| 50% | 96.8% | STABLE |
| 60% | 93.6% | STABLE |
| 70% | 93.6% | STABLE |
| 80% | 82.4% | DEGRADED |

## 3. Systematic Ablation Study
Isolating the impact of individual SWARMOS modules on mission resilience.

*   **Anomaly Filter Impact**: Contributes a **+0.1%** marginal TCR gain by isolating malicious/malfunctioning nodes.
*   **Safety Compiler Impact**: Contributes a **+0.0%** TCR gain by ensuring valid mission manifests before deployment.
*   **Recovery Module Impact**: Contributes a **+2.0%** TCR gain through deterministic re-allocation of orphaned tasks.
*   **Cumulative Resilience**: SWARMOS provides a total of **+2.0%** TCR improvement over baseline CBBA.
*   **Adversarial Defense**: In targeted adversarial trials, SWARMOS maintained **99.3%** TCR vs **98.9%** for Standard CBBA.