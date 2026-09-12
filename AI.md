# UrbanPulse AI — Edge Vision & AI Architecture

> **Multi-Modal Vision, Dehazing & Forensic Evidence Retrieval**

---

## 👁️ Overview of Modular AI Providers

UrbanPulse AI incorporates a modular provider system (`ObjectDetectionProvider`, `RoadDamageProvider`, `PlateDetectorProvider`, `OCRProvider`, `FogDetectorProvider`, `TrackingProvider`) structured for edge deployment on bus hardware (NVIDIA Jetson / ARM NPU) and browser/server execution.

```
[ Edge 4-Camera Array ] ──► [ Frame Downsampler & CLAHE Dehazer ]
                                       │
                                       ▼
                     [ YOLOv9 INT8 Quantized Core Engine ]
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
   [ Road Defect Classifier ]   [ LPRNet ANPR OCR ]    [ Pedestrian Hazard ]
   • Potholes (depth/diam)      • Plate Extraction      • Blindspot Proximity
   • Alligator Cracking         • Watchlist Matching    • Crossing Hazards
             │                         │                         │
             └─────────────────────────┼─────────────────────────┘
                                       ▼
                   [ Spatial-Temporal Corroboration Engine ]
                                       │
                                       ▼
                      [ Central ICCC WebSocket Stream ]
```

---

## 🛠️ Perception Pipelines & Capabilities

### 1. Pothole & Road Damage Detection (`RoadDamageProvider`)
- **Input**: 1080p/4K Optical Frame + Sub-meter GNSS + 6-axis Accelerometer IMU.
- **Output**: Bounding box `[x, y, w, h]`, defect class (`pothole`, `cracking`, `manhole_displacement`), depth estimation, and confidence score.
- **Trigger**: When a defect is registered, an observation is linked to the nearest road segment, updating its Pavement Condition Index (PCI).

### 2. ANPR & Watchlist Matching (`PlateDetectorProvider` + `OCRProvider`)
- **Input**: Vehicle crop frame.
- **Pipeline**: Frame → License Plate Bounding Box → Contrast Enhancement → LPRNet OCR → Plate Normalization.
- **Watchlist Warning Standard**: If a plate matches an admin watchlist, the system flags a:  
  `POTENTIAL VEHICLE-OF-INTEREST MATCH - Human verification required`.  
  *(Complies with legal safety standards—never automatically labels individuals as criminals).*

### 3. Fog & Winter Low-Visibility Dehazing (`FogDetectorProvider`)
- **Pipeline**:  
  `CAMERA FRAME` → `VISIBILITY ESTIMATION` → `CONDITION CLASSIFICATION`
  - **CLEAR**: Standard neural inference.
  - **MIST / LIGHT FOG**: CLAHE contrast enhancement & temporal frame smoothing.
  - **DENSE FOG**: Dehazing pipeline, local contrast enhancement, noise reduction, and confidence score scaling (e.g. 28% visibility score reduces confidence threshold to prevent false positives).

### 4. Forensic Incident Evidence Search
- **Search Query**: Incident Time (`14:32`) + Location Sector (`Sector 18`).
- **Matching Engine**: Calculates spatio-temporal proximity of all transit buses within a 150m radius at the incident time and ranks relevant video clips by proximity and camera angle relevance.

---

## 💻 Edge AI Privacy & Minimization (DPDP Act 2023)

1. **Zero Raw Video Transmit**: Raw video streams are processed in RAM on the bus edge unit and discarded immediately.
2. **On-Device Anonymization**: Faces and non-involved license plates are blurred on edge before metadata generation.
3. **Bandwidth Minimization**: Telemetry is serialized as lightweight JSON packets (< 2 MB per bus per hour).
