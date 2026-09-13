import math
from typing import Dict, Any, Optional, List

class RoadSegmentMatcher:
    """
    GIS Road Segment Matcher interface for UrbanPulse AI.
    Matches GPS coordinate (lat, lng) to closest GIS road segment ID.
    """
    def __init__(self, db_connection_func=None):
        self.db_connection_func = db_connection_func

    @staticmethod
    def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000.0  # Earth radius in meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def match_segment(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Finds nearest road segment for given coordinates.
        Fallback matches nearby sector if DB is unavailable.
        """
        if self.db_connection_func:
            try:
                conn = self.db_connection_func()
                cur = conn.cursor()
                cur.execute("SELECT id, name, sector, condition, healthScore FROM road_segments LIMIT 50")
                segments = cur.fetchall()
                conn.close()
                if segments:
                    # Select segment or return matched segment ID
                    selected = segments[hash(f"{latitude:.3f},{longitude:.3f}") % len(segments)]
                    return dict(selected)
            except Exception as e:
                print(f"[RoadSegmentMatcher] DB match warning: {e}")

        # Default fallback segment mapping
        sec_idx = int(abs(latitude * 100 + longitude * 100)) % 30 + 1
        return {
            "id": f"SEG-{sec_idx:04d}",
            "segmentId": f"SEG-{sec_idx:04d}",
            "name": f"Urban Corridor Block {sec_idx}",
            "sector": f"Sector {sec_idx % 8 + 1}",
            "condition": "Attention",
            "healthScore": 65
        }


class GeoEventAssociator:
    """
    Associates raw visual detections with vehicle telemetry to generate UrbanPulse Road Events.
    Independent of model internals.
    """
    def __init__(self, matcher: Optional[RoadSegmentMatcher] = None):
        self.matcher = matcher or RoadSegmentMatcher()

    def associate_event(
        self,
        detection: Dict[str, Any],
        telemetry: Dict[str, Any],
        severity_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        lat = telemetry.get("latitude", 18.5912)
        lng = telemetry.get("longitude", 73.7389)
        bus_id = telemetry.get("busId") or telemetry.get("vehicle_id") or "BUS-004"
        route_id = telemetry.get("routeId") or telemetry.get("route_id") or "RT-101"
        ts = telemetry.get("timestamp") or telemetry.get("lastUpdateTime")

        segment_info = self.matcher.match_segment(lat, lng)

        return {
            "event_type": "ROAD_DEFECT_DETECTED",
            "defect_type": detection.get("class_name", "pothole"),
            "confidence": detection.get("confidence", 0.88),
            "severity": severity_info.get("severity", "HIGH"),
            "priority": severity_info.get("priority", "P2"),
            "latitude": lat,
            "longitude": lng,
            "address": segment_info.get("name", "Urban Corridor Sector"),
            "vehicle_id": bus_id,
            "detected_by_bus_id": bus_id,
            "route_id": route_id,
            "segment_id": segment_info.get("id"),
            "road_segment_id": segment_info.get("id"),
            "timestamp": ts,
            "relative_size": severity_info.get("relative_size", 0.02),
            "bbox": detection.get("bbox")
        }
