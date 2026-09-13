import json
import os

def generate_heatmap(data, p_rates, f_rates):
    print("\n[Figure 1] Failure Envelope Heatmap: P(TCR >= 0.9)")
    print("      f | " + " | ".join(f"{f:.2f}" for f in f_rates))
    print("  p     |" + "-" * (len(f_rates) * 7))
    
    for p in p_rates:
        row = f"  {p:.2f}  |"
        for f in f_rates:
            val = data.get((p, f), 0.0)
            # Use color-coded ASCII if possible, or just density
            char = "█" if val >= 0.9 else "▓" if val >= 0.7 else "▒" if val >= 0.4 else "░" if val >= 0.1 else " "
            row += f" {char} {val:.1f} |"
        print(row)
    print("\nLegend: █ >=0.9, ▓ >=0.7, ▒ >=0.4, ░ >=0.1\n")

def generate_line_plot(data, p_rates):
    print("[Figure 2] Performance Degradation: TCR vs Packet Loss (f=0.1)")
    print("  TCR |")
    for i in range(10, -1, -1):
        y = i / 10.0
        row = f"  {y:.1f} |"
        for p in p_rates:
            val = data.get(p, 0.0)
            if abs(val - y) < 0.05:
                row += "  *  "
            else:
                row += "     "
        print(row)
    print("      +" + "-----" * len(p_rates))
    print("        " + " ".join(f"{p:.2f}" for p in p_rates))
    print("              Packet Loss (p)\n")

def main():
    results_path = "results/canonical/results.json"
    if not os.path.exists(results_path):
        print(f"Error: {results_path} not found.")
        return

    with open(results_path, "r") as f:
        full_data = json.load(f)

    # Filter for SWARMOS (B5)
    swarmos_runs = [r for r in full_data["configs"] if r["algorithm"] == "B5_SWARMOS"]
    
    p_rates = sorted(list(set(r["packet_loss"] for r in swarmos_runs)))
    f_rates = sorted(list(set(r["adversarial_fraction"] for r in swarmos_runs)))
    
    heatmap_data = {}
    for r in swarmos_runs:
        heatmap_data[(r["packet_loss"], r["adversarial_fraction"])] = r["prob_success_09"]
        
    generate_heatmap(heatmap_data, p_rates, f_rates)
    
    # Line plot data for f=0.1
    line_data = {r["packet_loss"]: r["TCR"] for r in swarmos_runs if r["adversarial_fraction"] == 0.1}
    generate_line_plot(line_data, p_rates)

if __name__ == "__main__":
    main()
