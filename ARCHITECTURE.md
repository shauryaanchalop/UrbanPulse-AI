# UrbanPulse AI — Architecture Specification

## 1. System Philosophy: Edge-First Metadata Streaming

Fixed cameras in smart cities require expensive fiber optic backbones and draw continuous power. In contrast, municipal buses already possess electrical power, roof/dashboard mounting positions, and traverse the entire urban geography on predictable schedules.

UrbanPulse AI establishes an **Edge-First, Metadata-Only architecture**:
- Rather than streaming gigabytes of raw video per hour to the cloud, edge inference runs on an onboard compute module (e.g. NVIDIA Jetson Orin Nano).
- Models detect objects, classify anomalies, estimate speeds, and crop license plates.
- Only a structured JSON packet (~1.4 KB) containing bounding boxes, confidence, class, RTK coordinates, and timestamp is pushed over cellular 4G/5G.
- This results in a **99.4% reduction in cellular bandwidth consumption**, enabling sustainable city-scale municipal fleet deployments.

---

## 2. Component Breakdown

### A. Physical Perception Layer
- **Front Camera**: Long-range telephoto lens for road surface defect classification (potholes, cracks, waterlogging) and ANPR plate OCR.
- **Rear Camera**: Wide-angle lens tracking tailgating vehicles, aggressive overtake maneuvers, and exhaust emissions.
- **Side Cameras**: Curbside lane boundary inspection, missing zebra markings, damaged dividers, and sidewalk pedestrian proximity.
- **RTK GNSS / IMU**: Sub-meter spatial accuracy with dead reckoning under flyovers and tunnels.

### B. Edge Compute Layer
- **DeepStream / TensorRT Abstraction**: Hardware-accelerated pipeline decoding H.264/H.265 video streams directly into GPU memory.
- **YOLOv9 INT8**: Quantized object detection inference executing at ~30 FPS per camera.
- **ByteTrack**: Low-latency multi-object tracking preserving vehicle identity across occlusions.
- **LPRNet OCR**: Specialized character recognition fine-tuned on Indian standard High Security Registration Plates (HSRP).

### C. Ingestion & Multi-Bus Verification Engine (Backend)
- **FastAPI Core**: Async REST API and WebSocket streaming gateway.
- **EventBus**: Pub/sub abstraction decoupling message ingestion from persistent storage. Ready for MQTT broker substitution.
- **Spatial Verification Engine**: Monitors incoming defect coordinates against existing active defects using Euclidean distance thresholds (±25m). When a second distinct bus detects the defect, it automatically increases confidence and promotes status to `Cross-verified`.
- **Database**: SQLite WAL mode with spatial indexing for fast boundary box queries.

### D. Central Command & Control Center (Frontend)
- **Leaflet GIS Engine**: High-density dark cartographic view with custom SVG bus markers, heading indicators, and route overlays.
- **H3 Hexagonal Aggregator**: Displays density distribution of urban events to spotlight chronic infrastructural decay.
- **4-Angle Bus Inspector**: Live interactive switcher demonstrating multi-camera edge ingestion and hardware utilization.
- **Maintenance Dispatch**: Priority matrix mapping defect severity and confirmation count into P1-P4 SLA work orders.
