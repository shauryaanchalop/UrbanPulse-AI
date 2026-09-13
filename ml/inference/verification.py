import math
from datetime import datetime
from typing import Dict, List, Any, Optional

class CrossBusVerificationEngine:
    """
    Multi-Vehicle Verification Engine for UrbanPulse AI.
    Cross-checks defect observations across distinct buses passing the same geographic coordinate.
    Marks defect status as 'VERIFIED' only when observed by 2+ distinct vehicles.
    """
    def __init__(self, proximity_threshold_m: float = 25.0):
        self.proximity_threshold_m = proximity_threshold_m

    @staticmethod
    def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000.0
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def process_observation(
        self,
        existing_defects: List[Dict[str, Any]],
        new_event: Dict[str, Any]
    ) -> Dict[str, Any]:
        new_lat = new_event["latitude"]
        new_lng = new_event["longitude"]
        bus_id = new_event.get("detected_by_bus_id") or new_event.get("vehicle_id") or "BUS-001"
        defect_type = new_event.get("defect_type") or new_event.get("defectType") or "pothole"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Find matching existing defect nearby
        match = None
        for d in existing_defects:
            existing_type = d.get("defect_type") or d.get("defectType") or ""
            if existing_type.lower() == defect_type.lower():
                dist = self.haversine_distance_m(new_lat, new_lng, d["latitude"], d["longitude"])
                if dist <= self.proximity_threshold_m:
                    match = d
                    break

        if match:
            # Check bus list
            buses = match.get("vehicles_observing") or match.get("crossVerifyingBuses", [])
            if isinstance(buses, str):
                import json
                try:
                    buses = json.loads(buses)
                except Exception:
                    buses = []
            elif isinstance(buses, list):
                buses = list(buses)

            orig_bus = match.get("vehicle_id") or match.get("detected_by_bus_id")
            if orig_bus and orig_bus not in buses:
                buses.append(orig_bus)

            if bus_id not in buses:
                buses.append(bus_id)

            verification_count = max(match.get("verification_count", 1) + 1, len(buses))
            is_verified = verification_count >= 2
            status = "verified" if is_verified else "observed"
            new_conf = min(0.98, max(match.get("confidence", 0.85), new_event.get("confidence", 0.85) + 0.05))

            return {
                "action": "UPDATED_EXISTING_DEFECT",
                "defect_id": match.get("id", "DEF-0001"),
                "verification_status": "VERIFIED" if is_verified else "UNVERIFIED",
                "verification_count": verification_count,
                "vehicles": buses,
                "vehicles_observing": buses,
                "confidence": round(new_conf, 2),
                "status": status,
                "last_observed": now_str
            }

        # First observation -> Unverified
        return {
            "action": "CREATED_NEW_DEFECT",
            "defect_id": f"DEF-{hash(f'{new_lat:.4f},{new_lng:.4f}') % 10000:04d}",
            "verification_status": "UNVERIFIED",
            "verification_count": 1,
            "vehicles": [bus_id],
            "vehicles_observing": [bus_id],
            "confidence": round(new_event.get("confidence", 0.85), 2),
            "status": "observed",
            "first_observed": now_str,
            "last_observed": now_str
        }


class RoadHealthService:
    """
    Calculates Road Segment Health Status:
    - GREEN: Healthy
    - YELLOW: Degrading
    - ORANGE: Attention
    - RED: Critical
    - GRAY: Insufficient Data / Unobserved
    """
    def calculate_segment_health(self, defects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates segment health directly from a list of active defects."""
        critical_count = sum(1 for d in defects if d.get("severity") == "CRITICAL" or d.get("severity") == "Critical")
        res = self.calculate_health(
            observation_count=len(defects) if defects else 1,
            defect_count=len(defects),
            critical_defect_count=critical_count,
            coverage_state="RECENTLY_OBSERVED" if defects is not None else "UNOBSERVED"
        )
        res["health_status"] = res["badge"]
        return res

    @staticmethod
    def calculate_health(
        observation_count: int,
        defect_count: int,
        critical_defect_count: int,
        coverage_state: str = "RECENTLY_OBSERVED"
    ) -> Dict[str, Any]:
        if coverage_state == "UNOBSERVED" or observation_count == 0:
            return {
                "condition": "Unknown",
                "health_score": 50.0,
                "badge": "GRAY",
                "health_status": "GRAY",
                "label": "Insufficient Observations"
            }

        if critical_defect_count >= 2 or defect_count >= 5:
            condition = "Critical"
            health_score = max(15.0, 40.0 - (critical_defect_count * 10))
            badge = "RED"
        elif critical_defect_count >= 1 or defect_count >= 3:
            condition = "Attention"
            health_score = max(45.0, 65.0 - (defect_count * 5))
            badge = "ORANGE"
        elif defect_count >= 1:
            condition = "Degrading"
            health_score = max(70.0, 82.0 - (defect_count * 3))
            badge = "YELLOW"
        else:
            condition = "Healthy"
            health_score = min(99.0, 85.0 + (observation_count * 0.5))
            badge = "GREEN"

        return {
            "condition": condition,
            "health_score": round(health_score, 1),
            "badge": badge,
            "health_status": badge,
            "label": f"{condition} (Score: {round(health_score, 1)})"
        }
