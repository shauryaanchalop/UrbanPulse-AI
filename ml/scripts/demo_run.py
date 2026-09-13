import os
import sys
import json
import numpy as np
import cv2
from pathlib import Path

# Add project root and ml/inference to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "ml" / "inference"))

from ml.inference.pipeline import UrbanPulseVisionPipeline
from ml.inference.verification import RoadHealthService

def main():
    print("=" * 70)
    print("URBANPULSE AI — ROAD DAMAGE AI MODEL & VISION PIPELINE DEMO")
    print("=" * 70)

    # 1. Initialize Pipeline
    pipeline = UrbanPulseVisionPipeline()
    model_info = pipeline.detector.get_model_info()
    print("\n[1] MODEL STATUS & SYSTEM HEALTH:")
    print(f"    - Model Name:       {model_info['name']}")
    print(f"    - Architecture:     {model_info['architecture']}")
    print(f"    - Model Version:    {model_info['version']}")
    print(f"    - Lifecycle State:  {model_info['status']}")
    print(f"    - Execution Device: {model_info['device']}")
    print(f"    - Taxonomy Classes: {len(model_info['classes'])} classes configured")

    # 2. Synthetic Test Road Image Generation
    print("\n[2] GENERATING TEST ROAD IMAGE & TELEMETRY...")
    # Create synthetic road frame (720, 1280, 3)
    frame = np.ones((720, 1280, 3), dtype=np.uint8) * 45  # Dark asphalt grey
    # Add lane lines
    cv2.line(frame, (640, 0), (640, 720), (255, 255, 255), 4)
    # Add synthetic defect pattern (pothole cavity)
    cv2.ellipse(frame, (450, 400), (90, 50), 0, 0, 360, (15, 15, 15), -1)
    cv2.ellipse(frame, (450, 400), (95, 55), 0, 0, 360, (220, 50, 50), 3)

    # Simulated Telemetry for Bus Pass 1
    telemetry_bus_1 = {
        "busId": "BUS-042",
        "routeId": "RT-101",
        "latitude": 18.59120,
        "longitude": 73.73890,
        "speedKmh": 38.5,
        "timestamp": "2026-09-13T19:30:00Z"
    }

    # 3. Pass 1 Inference Execution
    print("\n[3] EXECUTING REAL-TIME VISION INFERENCE (PASS 1: BUS-042)...")
    
    # If weights are missing, simulate a candidate defect detection in demo mode
    # so the full multi-bus verification & road health pipeline can be demonstrated
    if pipeline.detector.status != "MODEL_READY":
        print("    [Info] Weights file not loaded (MODEL_NOT_CONFIGURED). Injecting candidate defect for End-to-End Pipeline Demo...")
        candidate_det = {
            "class_name": "pothole",
            "class_id": 0,
            "confidence": 0.94,
            "bbox": {"x1": 355, "y1": 345, "x2": 545, "y2": 455}
        }
        # Run tracking & severity manually for demo
        tracked = pipeline.tracker.update([candidate_det])
        sev = pipeline.severity_engine.calculate_severity(tracked[0], 1280, 720, observation_count=1)
        assoc_event = pipeline.geo_associator.associate_event(tracked[0], telemetry_bus_1, sev)
        
        pass1_result = {
            "pipeline_status": "OK",
            "model_status": "DEMO_MODE (PIPELINE_ACTIVE)",
            "visibility": pipeline.visibility_processor.estimate_visibility(frame),
            "latency_ms": 11.4,
            "detections": tracked,
            "urbanpulse_events": [assoc_event]
        }
    else:
        pass1_result = pipeline.process_frame_event(frame, telemetry=telemetry_bus_1)

    print(json.dumps(pass1_result, indent=2))

    # 4. Pass 2 Inference & Multi-Bus Verification (BUS-017)
    print("\n[4] EXECUTING SECOND VEHICLE INFERENCE (PASS 2: BUS-017)...")
    telemetry_bus_2 = {
        "busId": "BUS-017",
        "routeId": "RT-101",
        "latitude": 18.59122,  # ~2m away
        "longitude": 73.73891,
        "speedKmh": 41.2,
        "timestamp": "2026-09-13T19:45:00Z"
    }

    event_pass1 = pass1_result["urbanpulse_events"][0]
    existing_defects_db = [{
        "id": "DEF-1842",
        "defect_type": event_pass1["defect_type"],
        "latitude": event_pass1["latitude"],
        "longitude": event_pass1["longitude"],
        "vehicle_id": event_pass1["detected_by_bus_id"],
        "vehicles_observing": [event_pass1["detected_by_bus_id"]],
        "verification_count": 1,
        "status": "UNVERIFIED"
    }]

    verif_res = pipeline.verification_engine.process_observation(existing_defects_db, {
        "latitude": telemetry_bus_2["latitude"],
        "longitude": telemetry_bus_2["longitude"],
        "detected_by_bus_id": telemetry_bus_2["busId"],
        "defect_type": "pothole",
        "confidence": 0.96
    })

    print("    [Multi-Bus Verification Output]:")
    print(json.dumps(verif_res, indent=2))

    # 5. Road Health Impact & Work Order Trigger
    print("\n[5] ROAD HEALTH IMPACT & WORK ORDER CREATION:")
    health_service = RoadHealthService()

    # Pre-repair health
    pre_repair_defects = [
        {"severity": "CRITICAL", "verification_status": "VERIFIED"},
        {"severity": "HIGH", "verification_status": "VERIFIED"}
    ]
    pre_health = health_service.calculate_segment_health(pre_repair_defects)
    print(f"    - Segment Health (Pre-Repair):  {pre_health['health_status']} ({pre_health['condition']})")

    # Post-repair health
    post_health = health_service.calculate_segment_health([])
    print(f"    - Segment Health (Post-Repair): {post_health['health_status']} ({pre_health['condition']} -> {post_health['condition']})")

    print("\n[Work Order Generated]:")
    work_order = {
        "work_order_id": "WO-2026-01842",
        "road_segment_id": event_pass1["road_segment_id"],
        "defect_type": event_pass1["defect_type"].upper(),
        "severity": event_pass1["severity"],
        "coordinates": f"{event_pass1['latitude']}, {event_pass1['longitude']}",
        "verification_status": verif_res["verification_status"],
        "verification_count": verif_res["verification_count"],
        "observing_vehicles": verif_res["vehicles"],
        "assigned_department": "PWD Road Maintenance Division 4",
        "status": "ASSIGNED_P1"
    }
    print(json.dumps(work_order, indent=2))

    print("\n" + "=" * 70)
    print("DEMO RUN COMPLETE: End-to-End Vision Pipeline Executed Successfully!")
    print("=" * 70)

if __name__ == "__main__":
    main()
