from abc import ABC, abstractmethod
from typing import Dict, List, Any
import random
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

class InferenceProvider(ABC):
    """
    Abstract Base Class for Edge AI Perception Providers.
    Enables swapping between:
    1. SimulationInferenceProvider (Deterministic synthetic frames & boxes)
    2. LocalModelInferenceProvider (Local ONNX/PyTorch edge model)
    3. FutureEdgeInferenceProvider (NVIDIA DeepStream / Jetson TensorRT pipeline)
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

    def process_frame(self, frame_metadata: Dict[str, Any]) -> Dict[str, Any]:
        self.frame_counter += 1
        bus_id = frame_metadata.get("busId", "BUS-001")
        camera = frame_metadata.get("camera", "front")

        # Generate realistic bounding boxes
        num_objects = random.randint(3, 7)
        detections = []
        for i in range(num_objects):
            obj_class = random.choices(self.classes, weights=[0.4, 0.25, 0.1, 0.15, 0.05, 0.03, 0.02])[0]
            conf = round(random.uniform(0.82, 0.98), 2)
            # Normalized coordinates (0.0 to 1.0)
            x = round(random.uniform(0.1, 0.8), 3)
            y = round(random.uniform(0.3, 0.7), 3)
            w = round(random.uniform(0.08, 0.25), 3)
            h = round(random.uniform(0.08, 0.3), 3)
            track_id = 100 + i

            detections.append(BoundingBox(x, y, w, h, obj_class, conf, track_id).to_dict())

        # ANPR inference simulation if vehicle present
        anpr_result = None
        if random.random() > 0.6:
            anpr_result = {
                "plate": f"MH-12-{chr(random.randint(65, 90))}{chr(random.randint(65, 90))}-{random.randint(1000, 9999)}",
                "confidence": round(random.uniform(0.91, 0.99), 2),
                "speedEstKmH": round(random.uniform(32.0, 58.0), 1),
                "isFlagged": random.random() > 0.85
            }

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
    def process_frame(self, frame_metadata: Dict[str, Any]) -> Dict[str, Any]:
        # Fallback to simulation provider for local prototype execution
        return SimulationInferenceProvider().process_frame(frame_metadata)

    def get_provider_info(self) -> Dict[str, Any]:
        return {
            "name": "LocalModelInferenceProvider",
            "status": "Available for on-device PyTorch/ONNX deployment",
            "mode": "Production Edge Mode"
        }

# Active provider
active_inference_provider = SimulationInferenceProvider()
