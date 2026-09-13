from typing import Dict, Any, Optional

class SeverityEngine:
    """
    Multi-Factor Severity Assessment Engine for UrbanPulse AI.
    Calculates operational severity (LOW, MEDIUM, HIGH, CRITICAL) using:
    - Relative defect area (bbox_area / image_area)
    - Detection confidence
    - Multi-pass observation recurrence count
    - Defect category criticality weight
    - Contextual road/traffic importance
    """
    def __init__(self):
        self.class_weights: Dict[str, float] = {
            "pothole": 1.5,
            "alligator_crack": 1.3,
            "waterlogging": 1.4,
            "road_edge_damage": 1.1,
            "transverse_crack": 1.0,
            "longitudinal_crack": 0.9,
            "manhole_damage": 1.2,
            "road_debris": 1.0,
            "repaired_patch": 0.5
        }

    def calculate_severity(
        self,
        defect: Dict[str, Any],
        image_width: int = 1280,
        image_height: int = 720,
        observation_count: int = 1,
        road_criticality: str = "Medium",
        is_waterlogged: bool = False
    ) -> Dict[str, Any]:
        cname = defect.get("class_name", "pothole")
        conf = defect.get("confidence", 0.85)
        bbox = defect.get("bbox", {"x1": 0, "y1": 0, "x2": 100, "y2": 100})

        # Calculate relative bounding box area
        bw = max(1, bbox["x2"] - bbox["x1"])
        bh = max(1, bbox["y2"] - bbox["y1"])
        bbox_area = bw * bh
        img_area = max(1, image_width * image_height)
        relative_size = round(bbox_area / float(img_area), 4)

        # Base score from relative size and confidence
        base_score = (relative_size * 50.0) + (conf * 15.0)

        # Apply class weight multiplier
        class_weight = self.class_weights.get(cname, 1.0)
        score = base_score * class_weight

        # Recurrence bonus
        if observation_count >= 3:
            score += 15.0
        elif observation_count >= 2:
            score += 8.0

        # Road criticality bonus
        if road_criticality == "High":
            score += 12.0
        elif road_criticality == "Critical":
            score += 20.0

        # Waterlogging bonus
        if is_waterlogged or cname == "waterlogging":
            score += 15.0

        # Categorize into severity tier
        if score >= 35.0 or (cname == "pothole" and relative_size > 0.04):
            severity = "CRITICAL"
        elif score >= 22.0:
            severity = "HIGH"
        elif score >= 12.0:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        priority = "P1" if severity == "CRITICAL" else ("P2" if severity == "HIGH" else "P3")

        return {
            "severity": severity,
            "priority": priority,
            "severity_score": round(score, 2),
            "relative_size": relative_size,
            "observation_count": observation_count,
            "class_weight": class_weight
        }
