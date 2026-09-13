# UrbanPulse AI — Road Damage AI Vision Pipeline

This directory contains the production-grade, trainable Machine Learning and Computer Vision pipeline for **UrbanPulse AI** (Smart India Hackathon 2026).

---

## 1. Model Architecture

The primary object detector uses transfer learning on pretrained **YOLO11s** (with automatic fallback to **YOLOv8s** / **ONNX Runtime**).
All detector capabilities are encapsulated within the `RoadDamageDetector` abstraction (`ml/inference/detector.py`).

### Honest Model Lifecycle States
- `MODEL_READY`: Model weights loaded; executing real object detection.
- `MODEL_TRAINING`: Model actively undergoing fine-tuning.
- `MODEL_NOT_CONFIGURED`: Weights file absent; returning clean `[]` empty detections without generating fake bounding boxes.
- `MODEL_ERROR`: Runtime model error captured in developer diagnostics.

---

## 2. Dataset Structure & Taxonomy

Dataset structure follows standard YOLO detection format:

```
ml/datasets/road_damage/
├── images/ {train, val, test}
├── labels/ {train, val, test}
└── data.yaml
```

### Supported Class Taxonomy
0. `pothole`
1. `longitudinal_crack`
2. `transverse_crack`
3. `alligator_crack`
4. `road_edge_damage`
5. `manhole_damage`
6. `road_debris`
7. `repaired_patch`

---

## 3. Dataset Preparation & Validation

Run dataset validation to check annotation bounds, leakage, and class distribution:

```bash
python ml/scripts/validate_dataset.py
```

Sample video frame extraction:
```bash
python ml/scripts/extract_frames.py --video bus_footage.mp4 --fps 1.0
```

Video source split (preventing data leakage across adjacent frames):
```bash
python ml/scripts/split_dataset.py
```

---

## 4. Model Training & Evaluation

Train the model on custom road imagery:
```bash
python ml/training/train.py --model yolo11s.pt --epochs 100 --batch 16
```

Evaluate model precision, recall, mAP50, and mAP50-95:
```bash
python ml/training/validate.py
```

Outputs machine-readable metrics to `ml/models/production/model_metrics.json`.

---

## 5. Model Export & Benchmarking

Export trained PyTorch weights to ONNX format:
```bash
python ml/training/export.py
```

Benchmark inference throughput, latency, and RAM usage:
```bash
python ml/scripts/benchmark.py
```

---

## 6. Vision Inference & Telemetry Pipeline

```
Frame -> Visibility Estimator -> YOLO Detector -> Object Tracker -> Severity Engine -> Telemetry Associator -> Multi-Bus Verification
```

- **Object Tracker** (`ml/inference/tracker.py`): Tracks objects across frames (`Pothole Track #42`) to prevent duplicate event spam.
- **Severity Engine** (`ml/inference/severity.py`): Evaluates relative bounding box area, confidence, recurrence, and road criticality to output `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- **Telemetry Associator** (`ml/inference/geo_associator.py`): Binds visual detections to bus GPS coordinates, speed, timestamp, and GIS road segments.
- **Multi-Bus Verification** (`ml/inference/verification.py`): Marks defects as `VERIFIED` when observed by 2+ distinct vehicles.

---

## 7. FastAPI Backend Endpoints

- `POST /api/v1/vision/detect`: Predicts road damage for uploaded image / frame.
- `POST /api/v1/vision/video`: Processes video file with frame sampling & tracking.
- `GET /api/v1/vision/model`: Returns active model manifest, status, and classes.
- `GET /api/v1/vision/health`: Health status endpoint.

---

## 8. What This Model Can Actually Detect

Based strictly on trained dataset classes, this model detects:
- Potholes & road surface depressions
- Longitudinal, transverse, and alligator cracking
- Road edge degradation & damaged manholes
- Repaired asphalt patches

It does NOT attempt to detect traffic violations or unrelated objects within the road-damage module.
