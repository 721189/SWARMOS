# SWARMOS High-Rigor Statistical Report
**Audit Timestamp**: 2026-09-14T07:50:25.891423+00:00
**Artifact Version**: 4.2.0
**Benchmark Mode**: SWARMOS Factorial Bench (Spec=4.2.0)
**Total Trials**: 384

## 1. Statistical Significance (vs. CBBA Standard)
Comparing mission completion rates and convergence times.

| Configuration | Algorithm | Completion (Mean ± CI) | p-value | Significance | Effect Size (d) |
|:---|:---|:---|:---|:---|:---|
| FS=4, T=5, loss_0.0_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.1_class_A | CBBA_Standard | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.1_class_A | B3_CBBA_Recovery | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 1.75 |
| FS=4, T=5, loss_0.0_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 1.75 |
| FS=4, T=5, loss_0.0_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.0_adv_0.1_class_D | B4_CBBA_Anomaly | 100.0% ± 28.68% | 1.0000 | n.s. | -0.58 |
| FS=4, T=5, loss_0.0_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.1_class_A | CBBA_Standard | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.1_class_A | B3_CBBA_Recovery | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 1.53 |
| FS=4, T=5, loss_0.2_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 1.53 |
| FS=4, T=5, loss_0.2_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=5, loss_0.2_adv_0.1_class_D | B4_CBBA_Anomaly | 100.0% ± 28.68% | 1.0000 | n.s. | -0.58 |
| FS=4, T=5, loss_0.2_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.1_class_A | CBBA_Standard | 30.0% ± 74.52% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.1_class_A | B3_CBBA_Recovery | 30.0% ± 74.52% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 1.33 |
| FS=4, T=10, loss_0.0_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 1.33 |
| FS=4, T=10, loss_0.0_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.0_adv_0.1_class_D | B4_CBBA_Anomaly | 90.0% ± 14.34% | 1.0000 | n.s. | -0.58 |
| FS=4, T=10, loss_0.0_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.1_class_A | CBBA_Standard | 30.0% ± 74.52% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.1_class_A | B3_CBBA_Recovery | 30.0% ± 74.52% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 1.33 |
| FS=4, T=10, loss_0.2_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 1.33 |
| FS=4, T=10, loss_0.2_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=4, T=10, loss_0.2_adv_0.1_class_D | B4_CBBA_Anomaly | 90.0% ± 14.34% | 1.0000 | n.s. | -0.58 |
| FS=4, T=10, loss_0.2_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.1_class_A | CBBA_Standard | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.1_class_A | B3_CBBA_Recovery | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 1.53 |
| FS=8, T=5, loss_0.0_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 1.53 |
| FS=8, T=5, loss_0.0_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.1_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.0_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.1_class_A | CBBA_Standard | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.1_class_A | B3_CBBA_Recovery | 20.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 1.53 |
| FS=8, T=5, loss_0.2_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 1.53 |
| FS=8, T=5, loss_0.2_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.1_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=5, loss_0.2_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.1_class_A | CBBA_Standard | 10.0% ± 37.95% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.1_class_A | B3_CBBA_Recovery | 10.0% ± 37.95% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 4.80 |
| FS=8, T=10, loss_0.0_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 4.80 |
| FS=8, T=10, loss_0.0_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.1_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.0_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_A | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_A | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_A | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.0_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.1_class_A | CBBA_Standard | 10.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.1_class_A | B3_CBBA_Recovery | 10.0% ± 75.89% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.1_class_A | B4_CBBA_Anomaly | 100.0% ± 0.00% | 0.5443 | n.s. | 2.07 |
| FS=8, T=10, loss_0.2_adv_0.1_class_A | SWARMOS | 100.0% ± 0.00% | 0.5443 | n.s. | 2.07 |
| FS=8, T=10, loss_0.2_adv_0.1_class_D | CBBA_Standard | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.1_class_D | B3_CBBA_Recovery | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.1_class_D | B4_CBBA_Anomaly | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |
| FS=8, T=10, loss_0.2_adv_0.1_class_D | SWARMOS | 100.0% ± 0.00% | 1.0000 | n.s. | 0.00 |

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