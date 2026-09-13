import time
from typing import Dict, List, Any, Optional
import numpy as np

try:
    from ml.inference.detector import RoadDamageDetector
    from ml.inference.tracker import ObjectTracker
    from ml.inference.severity import SeverityEngine
    from ml.inference.preprocessing import VisibilityProcessor
    from ml.inference.geo_associator import GeoEventAssociator
    from ml.inference.verification import CrossBusVerificationEngine, RoadHealthService
except ImportError:
    from detector import RoadDamageDetector
    from tracker import ObjectTracker
    from severity import SeverityEngine
    from preprocessing import VisibilityProcessor
    from geo_associator import GeoEventAssociator
    from verification import CrossBusVerificationEngine, RoadHealthService

class UrbanPulseVisionPipeline:
    """
    End-to-End Mobile Urban Sensing Vision Pipeline.
    Stitches together:
    Visibility Preprocessing -> Object Detection -> Object Tracking -> Severity Engine -> Telemetry Association -> Multi-Bus Verification
    """
    def __init__(self):
        self.detector = RoadDamageDetector()
        self.tracker = ObjectTracker()
        self.severity_engine = SeverityEngine()
        self.visibility_processor = VisibilityProcessor()
        self.geo_associator = GeoEventAssociator()
        self.verification_engine = CrossBusVerificationEngine()
        self.road_health_service = RoadHealthService()

        # Load weights/ONNX session if available
        self.detector.load_model()

    def process_frame_event(
        self,
        frame: np.ndarray,
        telemetry: Optional[Dict[str, Any]] = None,
        existing_defects: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        t0 = time.time()
        telemetry_data = telemetry or {
            "busId": "BUS-004",
            "routeId": "RT-101",
            "latitude": 18.5912,
            "longitude": 73.7389,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        # 1. Preprocessing & Visibility Estimation
        vis_info = self.visibility_processor.estimate_visibility(frame)
        enhanced_frame = self.visibility_processor.enhance_frame(frame, vis_info["state"])

        # 2. Road Damage Object Detection
        raw_detections = self.detector.predict_frame(enhanced_frame)

        # 3. Apply Visibility Confidence Gating
        gated_detections = []
        for d in raw_detections:
            gated_conf, is_low_conf = self.visibility_processor.apply_confidence_gating(d["confidence"], vis_info["state"])
            d_copy = dict(d)
            d_copy["confidence"] = gated_conf
            d_copy["is_low_visibility_confidence"] = is_low_conf
            gated_detections.append(d_copy)

        # 4. Object Tracking & Track ID Persistence
        tracked_detections = self.tracker.update(gated_detections)

        # 5. Severity Engine & Telemetry Association
        processed_events = []
        for det in tracked_detections:
            h, w = (frame.shape[0], frame.shape[1]) if frame is not None else (720, 1280)
            sev_info = self.severity_engine.calculate_severity(
                defect=det,
                image_width=w,
                image_height=h,
                observation_count=det.get("observation_count", 1)
            )

            assoc_event = self.geo_associator.associate_event(det, telemetry_data, sev_info)

            # 6. Multi-Bus Verification (if existing defects database provided)
            if existing_defects is not None:
                verif_res = self.verification_engine.process_observation(existing_defects, assoc_event)
                assoc_event["verification"] = verif_res

            processed_events.append(assoc_event)

        t1 = time.time()

        return {
            "pipeline_status": "OK",
            "model_status": self.detector.status,
            "engine_type": self.detector.engine_type,
            "visibility": vis_info,
            "latency_ms": round((t1 - t0) * 1000.0, 2),
            "detections": tracked_detections,
            "urbanpulse_events": processed_events
        }
