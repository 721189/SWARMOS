import os
import re

replacements = {
    r'(?i)zero-trust': 'anomaly-aware',
    r'BFT Quorum Health': 'Anomaly Filter Health',
    r'bftThresholdPct': 'anomalyThresholdPct',
    r'BFT 2f\+1 Quorum': 'Anomaly Filter',
    r'BFT Defense': 'Anomaly Defense',
    r'BFT EJECTED': 'ANOMALY EJECTED',
    r'bft_cbba_overleaf_bundle': 'anomaly_cbba_overleaf_bundle',
    r'preprint_ieee_bft_cbba': 'preprint_ieee_anomaly_cbba',
    r'fig2_bft_cbba_flowchart': 'fig2_anomaly_cbba_flowchart',
    r'BFT Security Rules': 'Anomaly Security Rules',
    r'BFT': 'Anomaly Filter',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, file))

process_file('swarmos/swarm_engine/bft_cbba.py')
process_file('swarmos/tests/test_baselines.py')
