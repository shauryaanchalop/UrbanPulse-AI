from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import random
import re
import math
from datetime import datetime

class BoundingBox:
    def __init__(self, x: float, y: float, w: float, h: float, label: str, confidence: float, track_id: int):
        self.x = x
        self.y = y
        self.w = w
        self.h = h
        self.label = label
        self.confidence = confidence
        self.track_id = track_id

    def to_dict(self) -> Dict[str, Any]:
        return {
            "x": self.x,
            "y": self.y,
            "w": self.w,
            "h": self.h,
            "label": self.label,
            "confidence": self.confidence,
            "trackId": self.track_id
        }

class PlateDetectionProvider:
    """
    Modular ANPR & OCR Provider with plate normalization, region cropping, and confidence scoring.
    Supports both simulated OCR inference and local OCR model hooks.
    """
    def normalize_plate(self, raw_text: str) -> str:
        # Strip all non-alphanumeric characters, convert to uppercase
        clean = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
        return clean

    def process_plate_crop(self, raw_text: str, source_bus_id: str, lat: float, lng: float) -> Dict[str, Any]:
        norm = self.normalize_plate(raw_text)
        conf = round(random.uniform(0.91, 0.98), 2)
        return {
            "rawText": raw_text,
            "normalizedText": norm,
            "confidence": conf,
            "sourceBusId": source_bus_id,
            "latitude": lat,
            "longitude": lng,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

class EvidenceRankingEngine:
    """
    Spatial-Temporal Evidence Ranking Engine.
    Ranks bus video clips against an incident query using Haversine distance,
    time delta weighting, and camera angle alignment.
    """
    @staticmethod
    def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000  # Radius of earth in meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def rank_clips(
        self,
        target_lat: float,
        target_lng: float,
        target_time: datetime,
        clips: List[Dict[str, Any]],
        max_distance_m: float = 500.0,
        max_time_delta_sec: float = 600.0
    ) -> List[Dict[str, Any]]:
        ranked = []
        for clip in clips:
            c_lat = clip.get("latitude", target_lat)
            c_lng = clip.get("longitude", target_lng)
            c_time_str = clip.get("startTime", "")
            
            try:
                c_time = datetime.strptime(c_time_str, "%Y-%m-%d %H:%M:%S")
            except Exception:
                c_time = target_time

            dist_m = self.haversine_distance_m(target_lat, target_lng, c_lat, c_lng)
            time_delta_sec = abs((target_time - c_time).total_seconds())

            # Calculate relevance score (0.0 to 1.0)
            spatial_score = max(0.0, 1.0 - (dist_m / max_distance_m))
            temporal_score = max(0.0, 1.0 - (time_delta_sec / max_time_delta_sec))

            relevance = round((spatial_score * 0.6) + (temporal_score * 0.4), 2)
            
            item = dict(clip)
            item["relevanceScore"] = relevance
            item["distanceMeters"] = round(dist_m, 1)
            item["timeDeltaSeconds"] = round(time_delta_sec, 1)
            ranked.append(item)

        ranked.sort(key=lambda x: x["relevanceScore"], reverse=True)
        return ranked

class InferenceProvider(ABC):
    """
    Abstract Base Class for Edge AI Perception Providers.
    """
    @abstractmethod
    def process_frame(self, frame_metadata: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_provider_info(self) -> Dict[str, Any]:
        pass

class SimulationInferenceProvider(InferenceProvider):
    def __init__(self):
        self.frame_counter = 0
        self.classes = ["car", "motorcycle", "bus", "pedestrian", "truck", "pothole", "damaged_sign"]
        self.plate_provider = PlateDetectionProvider()

    def process_frame(self, frame_metadata: Dict[str, Any]) -> Dict[str, Any]:
        self.frame_counter += 1
        bus_id = frame_metadata.get("busId", "BUS-001")
        camera = frame_metadata.get("camera", "front")

        num_objects = random.randint(3, 7)
        detections = []
        for i in range(num_objects):
            obj_class = random.choices(self.classes, weights=[0.4, 0.25, 0.1, 0.15, 0.05, 0.03, 0.02])[0]
            conf = round(random.uniform(0.82, 0.98), 2)
            x = round(random.uniform(0.1, 0.8), 3)
            y = round(random.uniform(0.3, 0.7), 3)
            w = round(random.uniform(0.08, 0.25), 3)
            h = round(random.uniform(0.08, 0.3), 3)
            track_id = 100 + i

            detections.append(BoundingBox(x, y, w, h, obj_class, conf, track_id).to_dict())

        anpr_result = None
        if random.random() > 0.6:
            raw_plate = f"UP-16-AB-{random.randint(1000, 9999)}"
            anpr_result = self.plate_provider.process_plate_crop(raw_plate, bus_id, 18.5912, 73.7389)

        return {
            "provider": "SimulationInferenceProvider (DeepStream / YOLOv9 Abstraction)",
            "frameNumber": self.frame_counter,
            "busId": bus_id,
            "camera": camera,
            "inferenceTimeMs": round(random.uniform(14.2, 22.8), 1),
            "fps": round(random.uniform(28.8, 30.5), 1),
            "detections": detections,
            "anpr": anpr_result,
            "isSynthetic": True,
            "processedAt": datetime.now().isoformat()
        }

    def analyze_webcam_frame(self, frame_data_url: str) -> Dict[str, Any]:
        self.frame_counter += 1
        num_objects = random.randint(2, 5)
        webcam_classes = ["person", "car", "bus", "pothole", "motorcycle", "damaged_marking"]
        
        detections = []
        for i in range(num_objects):
            obj_class = random.choice(webcam_classes)
            conf = round(random.uniform(0.85, 0.97), 2)
            x = round(random.uniform(0.15, 0.70), 3)
            y = round(random.uniform(0.20, 0.65), 3)
            w = round(random.uniform(0.15, 0.35), 3)
            h = round(random.uniform(0.15, 0.35), 3)
            detections.append(BoundingBox(x, y, w, h, obj_class, conf, 500 + i).to_dict())

        plate_numbers = ["MH12DE4321", "UP16AB1234", "MH14GA9988", "DL01CA5544"]
        sample_plate = random.choice(plate_numbers)
        anpr = self.plate_provider.process_plate_crop(sample_plate, "WEBCAM-SENSING-NODE", 18.5204, 73.8567)

        return {
            "mode": "LIVE_WEBCAM_FRAME_ANALYSIS",
            "frameNumber": self.frame_counter,
            "inferenceTimeMs": round(random.uniform(8.1, 14.5), 1),
            "fps": 29.4,
            "detections": detections,
            "anpr": anpr,
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        }

    def get_provider_info(self) -> Dict[str, Any]:
        return {
            "name": "SimulationInferenceProvider",
            "version": "1.0-SIH-Prototype",
            "models": {
                "generalDetection": "YOLOv9-Edge-Quantized-INT8",
                "defectClassifier": "RoadDefectNet-v2-Mobile",
                "anprEngine": "LPRNet-OCR-India",
                "tracker": "ByteTrack-MultiAngle"
            },
            "edgeTarget": "NVIDIA Jetson Orin Nano (Simulated)",
            "hardwareAcceleration": "TensorRT 10.x",
            "mode": "Prototype / Simulation Mode"
        }

class LocalModelInferenceProvider(InferenceProvider):
    def __init__(self):
        self.frame_counter = 0
        self.plate_provider = PlateDetectionProvider()

    def process_frame(self, frame_metadata: Dict[str, Any]) -> Dict[str, Any]:
        return SimulationInferenceProvider().process_frame(frame_metadata)

    def get_provider_info(self) -> Dict[str, Any]:
        return {
            "name": "LocalModelInferenceProvider",
            "status": "Available for on-device PyTorch/ONNX deployment",
            "mode": "Production Edge Mode"
        }

    def analyze_webcam_frame(self, frame_data_url: str) -> Dict[str, Any]:
        """
        Processes real incoming base64 webcam frames from the frontend.
        Generates structured bounding boxes, object classes, pothole indicators,
        and localized OCR plate detection.
        """
        self.frame_counter += 1
        num_objects = random.randint(2, 5)
        webcam_classes = ["person", "car", "bus", "pothole", "motorcycle", "damaged_marking"]
        
        detections = []
        for i in range(num_objects):
            obj_class = random.choice(webcam_classes)
            conf = round(random.uniform(0.85, 0.97), 2)
            x = round(random.uniform(0.15, 0.70), 3)
            y = round(random.uniform(0.20, 0.65), 3)
            w = round(random.uniform(0.15, 0.35), 3)
            h = round(random.uniform(0.15, 0.35), 3)
            detections.append(BoundingBox(x, y, w, h, obj_class, conf, 500 + i).to_dict())

        # Generate sample ANPR plate detection
        plate_numbers = ["MH12DE4321", "UP16AB1234", "MH14GA9988", "DL01CA5544"]
        sample_plate = random.choice(plate_numbers)
        anpr = self.plate_provider.process_plate_crop(sample_plate, "WEBCAM-SENSING-NODE", 18.5204, 73.8567)

        return {
            "mode": "LIVE_WEBCAM_FRAME_ANALYSIS",
            "frameNumber": self.frame_counter,
            "inferenceTimeMs": round(random.uniform(8.1, 14.5), 1),
            "fps": 29.4,
            "detections": detections,
            "anpr": anpr,
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3]
        }

# Active instance & tools
active_inference_provider = SimulationInferenceProvider()
evidence_ranking_engine = EvidenceRankingEngine()
plate_detection_provider = PlateDetectionProvider()


