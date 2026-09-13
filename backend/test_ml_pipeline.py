import unittest
import os
import sys
import json
import numpy as np
from pathlib import Path

# Ensure ML package is importable
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "ml" / "inference"))

from ml.inference.detector import RoadDamageDetector
from ml.inference.tracker import ObjectTracker
from ml.inference.severity import SeverityEngine
from ml.inference.preprocessing import VisibilityProcessor
from ml.inference.geo_associator import GeoEventAssociator
from ml.inference.verification import CrossBusVerificationEngine, RoadHealthService
from ml.inference.pipeline import UrbanPulseVisionPipeline

class TestMLRoadDamagePipeline(unittest.TestCase):
    """
    Comprehensive ML & Road Damage Vision Pipeline Test Suite.
    Verifies model handling, tracking, severity, GPS association, multi-bus verification, and API format.
    Runs cleanly on CPU without requiring weights or GPU.
    """

    def setUp(self):
        self.detector = RoadDamageDetector()
        self.tracker = ObjectTracker()
        self.severity_engine = SeverityEngine()
        self.visibility_processor = VisibilityProcessor()
        self.geo_associator = GeoEventAssociator()
        self.verification_engine = CrossBusVerificationEngine()
        self.road_health_service = RoadHealthService()
        self.pipeline = UrbanPulseVisionPipeline()

    def test_01_model_loading_and_status(self):
        """Test model initialization state and fallback when weights are unconfigured."""
        info = self.detector.get_model_info()
        self.assertIn("status", info)
        self.assertIn("version", info)
        self.assertIn("classes", info)
        # Without ultralytics installed or weights, status should be MODEL_NOT_CONFIGURED
        self.assertIn(info["status"], ["MODEL_NOT_CONFIGURED", "MODEL_READY", "MODEL_OFFLINE"])

    def test_02_invalid_or_empty_image(self):
        """Test inference on None or zero-byte frame."""
        res_none = self.detector.predict_frame(None)
        self.assertEqual(res_none, [])

        blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        res_blank = self.detector.predict_frame(blank_frame)
        self.assertIsInstance(res_blank, list)

    def test_03_no_detections_honesty(self):
        """Verify no fake detections are generated when model is not configured."""
        blank_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        detections = self.detector.predict_frame(blank_frame)
        # Standard rule: zero fake detections when unconfigured/un-trained
        self.assertEqual(len(detections), 0)

    def test_04_confidence_filtering(self):
        """Test confidence threshold filtering."""
        det_high = {"class_name": "pothole", "confidence": 0.85, "bbox": {"x1": 10, "y1": 10, "x2": 50, "y2": 50}}
        det_low = {"class_name": "pothole", "confidence": 0.20, "bbox": {"x1": 10, "y1": 10, "x2": 50, "y2": 50}}
        
        filtered = [d for d in [det_high, det_low] if d["confidence"] >= self.detector.conf_threshold]
        self.assertEqual(len(filtered), 1)
        self.assertEqual(filtered[0]["confidence"], 0.85)

    def test_05_tracker_deduplication(self):
        """Test IoU tracker assigning persistent track IDs across frames."""
        detections_frame1 = [
            {"class_name": "pothole", "class_id": 0, "confidence": 0.88, "bbox": {"x1": 100, "y1": 100, "x2": 200, "y2": 200}}
        ]
        detections_frame2 = [
            {"class_name": "pothole", "class_id": 0, "confidence": 0.90, "bbox": {"x1": 105, "y1": 102, "x2": 205, "y2": 202}}
        ]

        tracked1 = self.tracker.update(detections_frame1)
        self.assertEqual(len(tracked1), 1)
        track_id1 = tracked1[0]["track_id"]

        tracked2 = self.tracker.update(detections_frame2)
        self.assertEqual(len(tracked2), 1)
        track_id2 = tracked2[0]["track_id"]

        self.assertEqual(track_id1, track_id2)
        self.assertEqual(tracked2[0]["observation_count"], 2)

    def test_06_severity_calculation(self):
        """Test severity engine multi-factor scoring."""
        defect = {
            "class_name": "pothole",
            "confidence": 0.92,
            "bbox": {"x1": 100, "y1": 100, "x2": 400, "y2": 400}  # Large area
        }
        sev = self.severity_engine.calculate_severity(defect, image_width=1280, image_height=720, observation_count=5)
        self.assertIn(sev["severity"], ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        self.assertGreater(sev["severity_score"], 0)

    def test_07_gps_telemetry_association(self):
        """Test binding detection with vehicle telemetry."""
        defect = {
            "class_name": "pothole",
            "confidence": 0.89,
            "track_id": "track_42",
            "bbox": {"x1": 100, "y1": 100, "x2": 200, "y2": 200}
        }
        telemetry = {
            "busId": "BUS-042",
            "routeId": "RT-101",
            "latitude": 18.5912,
            "longitude": 73.7389,
            "timestamp": "2026-09-13T12:00:00Z"
        }
        severity_info = {"severity": "HIGH", "severity_score": 75}
        event = self.geo_associator.associate_event(defect, telemetry, severity_info)

        self.assertEqual(event["vehicle_id"], "BUS-042")
        self.assertEqual(event["latitude"], 18.5912)
        self.assertEqual(event["defect_type"], "pothole")
        self.assertTrue(event["road_segment_id"].startswith("SEG-"))

    def test_08_cross_bus_verification(self):
        """Test multi-vehicle verification requiring 2+ bus passes."""
        existing_defects = [
            {
                "id": "DEF-101",
                "defect_type": "pothole",
                "latitude": 18.59120,
                "longitude": 73.73890,
                "vehicle_id": "BUS-042",
                "verification_status": "observed",
                "verification_count": 1,
                "vehicles_observing": ["BUS-042"]
            }
        ]

        new_event_bus2 = {
            "defect_type": "pothole",
            "latitude": 18.59122,  # ~2 meters away
            "longitude": 73.73891,
            "vehicle_id": "BUS-017"  # Different bus
        }

        res = self.verification_engine.process_observation(existing_defects, new_event_bus2)
        self.assertEqual(res["status"], "verified")
        self.assertEqual(res["verification_count"], 2)
        self.assertIn("BUS-017", res["vehicles"])

    def test_09_road_health_calculation(self):
        """Test road health score transitions."""
        health_clean = self.road_health_service.calculate_segment_health([])
        self.assertEqual(health_clean["health_status"], "GREEN")

        critical_defects = [
            {"severity": "CRITICAL", "verification_status": "verified"},
            {"severity": "HIGH", "verification_status": "verified"}
        ]
        health_bad = self.road_health_service.calculate_segment_health(critical_defects)
        self.assertIn(health_bad["health_status"], ["ORANGE", "RED"])

    def test_10_visibility_dehaze_gating(self):
        """Test visibility score and fog gating."""
        frame = np.ones((100, 100, 3), dtype=np.uint8) * 128
        vis = self.visibility_processor.estimate_visibility(frame)
        self.assertIn(vis["state"], ["CLEAR", "LIGHT_FOG", "DENSE_FOG"])

        gated_conf, is_low = self.visibility_processor.apply_confidence_gating(0.9, "DENSE_FOG")
        self.assertLess(gated_conf, 0.9)
        self.assertTrue(is_low)

    def test_11_full_pipeline_event(self):
        """Test full end-to-end vision pipeline processing."""
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        telemetry = {
            "busId": "BUS-004",
            "routeId": "RT-101",
            "latitude": 18.5912,
            "longitude": 73.7389
        }
        res = self.pipeline.process_frame_event(frame, telemetry)
        self.assertEqual(res["pipeline_status"], "OK")
        self.assertIn("model_status", res)
        self.assertIn("latency_ms", res)
        self.assertIn("detections", res)

if __name__ == "__main__":
    unittest.main()
