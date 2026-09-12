# UrbanPulse AI: City-Scale Mobile Urban Intelligence Platform

> **"Every Bus. A Mobile Sensor. One Intelligent City."**
> **Smart India Hackathon 2026** | **Problem Statement ID**: 26124 | **Theme**: Smart Automation

---

## 🌟 Executive Overview

Fixed municipal road and traffic sensors cost millions of dollars, suffer from blind spots, and decay without regular maintenance. **UrbanPulse AI** eliminates new fixed infrastructure costs by turning public transit bus fleets into continuous, mobile AI sensing nodes. 

As public buses traverse city arterial roads and residential corridors daily, front, rear, and side optical cameras capture high-frequency visual data. Edge-accelerated AI models analyze the feeds locally, transmitting **only structured event metadata** (saving 99.4% cellular bandwidth) to a central **Integrated Command and Control Center (ICCC)**.

---

## 🚀 Key Innovation: Multi-Bus Cross-Verification Engine

A single optical detection can suffer from glare, shadow occlusions, or camera distortion. UrbanPulse AI implements spatial-temporal cross-corroboration:
- **Pass 1**: Bus 12 registers an asphalt cavity with 86% confidence.
- **Pass 2**: Bus 19 traverses the same location 25 minutes later and confirms the defect.
- **Result**: The system automatically promotes the issue to **"Cross-verified" (98% confidence)** and immediately dispatches a **Priority P1 Maintenance Ticket** to the municipal public works contractor with zero human delay.

---

## 🏗️ System Architecture

```
[ Public Transit Buses (32) ]
        │  Front, Rear, Left, Right 1080p Cameras + RTK GNSS + IMU
        ▼
[ Edge AI Compute Node (Jetson Orin Abstraction) ]
        │  • YOLOv9 INT8 Quantized Object Detection
        │  • ByteTrack Spatial Entity Tracking
        │  • RoadDefectNet Asphalt Anomaly Classifier
        │  • High-Confidence ANPR License Plate OCR
        │  • Edge-first DPDP Data Minimization (Raw video discarded in RAM)
        ▼  (Structured JSON Metadata via MQTT / HTTPS - 1.4 KB/pkt)
[ FastAPI Central ICCC Backend ]
        │  • In-Memory & MQTT EventBus Gateway
        │  • Spatial Multi-Bus Cross-Verification Engine
        │  • SQLite WAL Spatial Database
        │  • Real-Time Simulation Engine & Scripted Demo Controller
        ▼  (WebSocket /ws & REST /api/*)
[ UrbanPulse AI GIS Dashboard ]
        │  • Dark Enterprise ICCC GIS Interface (Leaflet + CartoDB)
        │  • Real-time Bus GPS Movement & 4-Camera Live Stream View
        │  • H3 Hexagonal Spatial Clustering
        │  • Automated Maintenance Work Orders (P1-P4 SLA Tracking)
```

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Leaflet GIS, Recharts, Lucide Icons.
- **Backend**: Python 3.14, FastAPI, Pydantic v2, WebSockets, SQLite WAL.
- **AI Perception Abstraction**: Modular `InferenceProvider` supporting simulated synthetic frames and edge PyTorch/DeepStream pipelines.

---

## ⚡ Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Start the FastAPI Backend (SQLite or Supabase PostgreSQL Mode)
```bash
cd backend
pip install -r requirements.txt
python -m alembic upgrade head   # Applies schema migrations
python seed_demo.py              # Seeds 30 buses, 120 defects, 40 traffic events, 23 tables
python -m uvicorn main:app --reload --port 8000
```
> **Database Selection**: If `DATABASE_URL` environment variable is set (e.g. Supabase), PostgreSQL mode is activated automatically. Otherwise, local development defaults to `./urbanpulse.db`.

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev          # Starts dashboard at http://localhost:5173
```

Open your browser at **`http://localhost:5173`** to access the UrbanPulse AI Command Center.

---

## 🎮 Scripted Hackathon Demo: "City Morning Peak Simulation"

Click the prominent **`[ START DEMO ]`** button in the top navigation bar to execute the automated 5-minute SIH presentation scenario:
1. **0:00** - Real-time fleet ingestion initialized across 32 transit buses.
2. **0:40** - Bus `BUS-004` detects High-Severity Pothole on Wakad Flyover ramp (94% conf).
3. **1:20** - Bus `BUS-012` arrives and **Cross-Verifies** the defect (Confidence boosts to 98%).
4. **1:40** - System automatically auto-populates Maintenance Ticket `TKT-2026-0842` (P1 Priority).
5. **2:00** - Traffic congestion builds up on Pune University corridor; live heatmap updates.
6. **2:40** - Bus `BUS-007` triggers Dangerous Pedestrian Proximity alert in blind spot.
7. **3:20** - Rash driving event detected in BRTS transit lane; ANPR logs `MH-12-KQ-7722`.
8. **4:30** - Municipal ICCC triage view aggregates cross-departmental operations.
9. **5:00** - Executive wrap-up: **"Observe → Detect → Verify → Prioritize → Act"**.
