from typing import Dict, Any, Optional
from .cbba import CBBAEngine
from .anomaly_cbba import StrategicAnomalyFilter

class BaselineRegistry:
    """
    Standardizes the 6-baseline ladder (B0-B5) used in SWARMOS research.
    B0: Static - Rigid assignment
    B1: Greedy - Uncoordinated claiming
    B2: Standard CBBA - Choi 2009 baseline
    B3: CBBA + Recovery - Standard CBBA with orphaned task re-auction
    B4: CBBA + Anomaly Filtering - Standard CBBA with kinematic bounds
    B5: SWARMOS - The full integrated architecture (Recovery + Filtering)
    """
    
    @staticmethod
    def get_engine_config(baseline_id: str) -> Dict[str, Any]:
        configs = {
            "B0_Static": {
                "use_cbba": False,
                "use_recovery": False,
                "use_anomaly_filter": False,
                "strategy": "static_nearest"
            },
            "B1_Greedy": {
                "use_cbba": False,
                "use_recovery": False,
                "use_anomaly_filter": False,
                "strategy": "uncoordinated_greedy"
            },
            "B2_Standard_CBBA": {
                "use_cbba": True,
                "use_recovery": False,
                "use_anomaly_filter": False
            },
            "B3_CBBA_Recovery": {
                "use_cbba": True,
                "use_recovery": True,
                "use_anomaly_filter": False
            },
            "B4_CBBA_Anomaly": {
                "use_cbba": True,
                "use_recovery": False,
                "use_anomaly_filter": True
            },
            "B5_SWARMOS": {
                "use_cbba": True,
                "use_recovery": True,
                "use_anomaly_filter": True
            }
        }
        return configs.get(baseline_id, configs["B2_Standard_CBBA"])

    @staticmethod
    def create_engine(baseline_id: str, lambda_decay: float = 0.95) -> CBBAEngine:
        config = BaselineRegistry.get_engine_config(baseline_id)
        
        filter_obj = None
        if config.get("use_anomaly_filter"):
            filter_obj = StrategicAnomalyFilter()
            
        engine = CBBAEngine(
            lambda_decay=lambda_decay,
            anomaly_filter=filter_obj
        )
        # We attach the recovery flag to the engine for the simulation loop to check
        engine.enable_recovery = config.get("use_recovery", False)
        engine.baseline_id = baseline_id
        
        return engine
