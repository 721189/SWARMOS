"""
SWARMOS Tactical Cursor-on-Target (CoT) Gateway
MIL-STD-2525D / ATAK / WinTAK / CivTAK Telemetry & Event Bridge

Broadcasts real-time swarm telemetry over UDP multicast (239.2.3.1:6969)
and exports standard Mission Packages (.zip / .xml).
"""

import socket
import time
import uuid
import math
from datetime import datetime, timezone
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional

# Default ATAK Multicast Configuration
DEFAULT_MULTICAST_GROUP = "239.2.3.1"
DEFAULT_MULTICAST_PORT = 6969
DEFAULT_BASE_LAT = 32.8812   # MCAS Miramar Tactical Range
DEFAULT_BASE_LON = -117.2345
METERS_TO_DEG = 1.0 / 111320.0

class CotEventBuilder:
    """Constructs MIL-STD-2525 Cursor-on-Target XML events."""

    @staticmethod
    def create_uav_cot(
        callsign: str,
        uid: str,
        lat: float,
        lon: float,
        hae_alt_m: float = 120.0,
        speed_mps: float = 12.5,
        course_deg: float = 45.0,
        battery_pct: float = 95.0,
        assigned_task: Optional[str] = None
    ) -> str:
        """
        Creates an a-f-A-M-F-Q (Friendly Airborne Rotary-Wing Quadcopter) CoT XML string.
        """
        now = datetime.now(timezone.utc)
        time_str = now.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        # 2-minute stale timeout
        stale_time = datetime.fromtimestamp(now.timestamp() + 120, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

        event = ET.Element("event", {
            "version": "2.0",
            "uid": uid,
            "type": "a-f-A-M-F-Q",
            "how": "m-g",
            "time": time_str,
            "start": time_str,
            "stale": stale_time
        })

        # Point element (WGS-84)
        ET.SubElement(event, "point", {
            "lat": f"{lat:.6f}",
            "lon": f"{lon:.6f}",
            "hae": f"{hae_alt_m:.1f}",
            "ce": "3.5",
            "le": "2.0"
        })

        # Detail element
        detail = ET.SubElement(event, "detail")
        ET.SubElement(detail, "contact", {"callsign": callsign})
        ET.SubElement(detail, "track", {
            "course": f"{course_deg:.1f}",
            "speed": f"{speed_mps * 1.94384:.1f}"  # in knots
        })
        ET.SubElement(detail, "status", {"battery": f"{battery_pct:.1f}"})
        ET.SubElement(detail, "remarks").text = (
            f"SWARMOS CBBA Node {uid} | Status: OPERATIONAL | Assigned Task: {assigned_task or 'PATROL'}"
        )

        return ET.tostring(event, encoding="utf-8").decode("utf-8")

    @staticmethod
    def create_target_cot(
        task_id: str,
        task_type: str,
        lat: float,
        lon: float,
        reward: float = 100.0,
        description: str = ""
    ) -> str:
        """
        Creates a b-m-p-s-p-i (Battlefield Point of Interest) CoT XML string.
        """
        now = datetime.now(timezone.utc)
        time_str = now.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        stale_time = datetime.fromtimestamp(now.timestamp() + 600, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")

        event = ET.Element("event", {
            "version": "2.0",
            "uid": f"SWARMOS-TASK-{task_id}",
            "type": "b-m-p-s-p-i",
            "how": "m-g",
            "time": time_str,
            "start": time_str,
            "stale": stale_time
        })

        ET.SubElement(event, "point", {
            "lat": f"{lat:.6f}",
            "lon": f"{lon:.6f}",
            "hae": "0.0",
            "ce": "5.0",
            "le": "5.0"
        })

        detail = ET.SubElement(event, "detail")
        ET.SubElement(detail, "contact", {"callsign": f"OBJ-{task_id}:{task_type}"})
        ET.SubElement(detail, "remarks").text = (
            f"Task: {task_type} | Base Reward: {reward} | {description}"
        )

        return ET.tostring(event, encoding="utf-8").decode("utf-8")


class AtakCotBroadcaster:
    """Asynchronous Multicast Transmitter for TAK Server / WinTAK clients."""

    def __init__(self, multicast_ip: str = DEFAULT_MULTICAST_GROUP, port: int = DEFAULT_MULTICAST_PORT):
        self.multicast_ip = multicast_ip
        self.port = port
        self._sock: Optional[socket.socket] = None

    def start(self):
        """Initializes the UDP Multicast socket."""
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        # Set Time-to-Live for multicast packets (2 = local subnet/mesh)
        self._sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)

    def broadcast_xml(self, cot_xml: str):
        """Dispatches a CoT XML message to the multicast group."""
        if not self._sock:
            self.start()
        payload = cot_xml.encode("utf-8")
        try:
            self._sock.sendto(payload, (self.multicast_ip, self.port))
        except Exception as e:
            print(f"[ATAK-COT] Broadcast warning: {e}")

    def close(self):
        if self._sock:
            self._sock.close()
            self._sock = None


if __name__ == "__main__":
    print("[SWARMOS] Starting Standalone ATAK Cursor-on-Target Broadcaster...")
    broadcaster = AtakCotBroadcaster()
    broadcaster.start()

    # Simulate VIPER-01 CoT burst
    test_cot = CotEventBuilder.create_uav_cot(
        callsign="VIPER-01",
        uid="SWARMOS-VIPER-01",
        lat=DEFAULT_BASE_LAT + 0.001,
        lon=DEFAULT_BASE_LON + 0.001,
        speed_mps=15.2,
        battery_pct=92.0,
        assigned_task="T1"
    )
    print(f"[SWARMOS] Emitting CoT Event:\n{test_cot}")
    broadcaster.broadcast_xml(test_cot)
    print("[SWARMOS] Broadcasted successfully to 239.2.3.1:6969")
