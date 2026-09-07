# UrbanPulse AI — REST & WebSocket API Reference

Base URL: `http://localhost:8000/api`
WebSocket URL: `ws://localhost:8000/ws`

---

## 1. Core Endpoints

### Overview KPIs
- `GET /api/overview`
  - Returns aggregate stats for active buses, total defects, critical incidents, congestion hotspots, open maintenance tickets, and multi-bus verified counts.

### Fleet Telemetry
- `GET /api/buses`
  - Query Params: `status` (`Active`, `Idle`, `Warning`, `Maintenance`)
  - Returns list of 32 buses with coordinates, speed, heading, camera health, and edge FPS.
- `GET /api/buses/{id}`
  - Returns full telemetry and 4-camera status for a single bus.

### Road Intelligence
- `GET /api/road-defects`
  - Query Params: `defectType`, `severity`, `status`
  - Returns detected road defects with verification counts, dimensions, and confirming bus IDs.
- `GET /api/road-defects/{id}`
  - Returns single defect detail with evidence URL.

### Traffic Analytics
- `GET /api/traffic`
  - Returns corridor congestion scores, average speeds, delays, and vehicle counts.
- `GET /api/routes`
  - Returns 10 transit routes and geometric waypoints.

### Safety & ANPR Enforcement
- `GET /api/incidents`
  - Returns safety alerts (rash driving, pedestrian proximity, lane swerve).
- `GET /api/anpr`
  - Returns vehicle license plate detections with OCR confidence and violation flags.

### Maintenance Work Orders
- `GET /api/maintenance`
  - Returns tickets sorted by priority (`P1` to `P4`) and SLA status.
- `POST /api/maintenance`
  - Creates a new work order automatically linked to a defect.
- `PATCH /api/maintenance/{id}`
  - Updates ticket status (`Assigned`, `In Progress`, `Resolved`, `Verified`).

### System Health
- `GET /api/system-health`
  - Returns camera health %, GPS RTK %, average edge FPS, API latency, and database status.

### Simulation Controls
- `GET /api/simulation/status` - Current simulation status.
- `POST /api/simulation/start` - Resume simulation loop.
- `POST /api/simulation/pause` - Pause simulation loop.
- `POST /api/simulation/reset` - Re-initialize database to initial seed.
- `POST /api/simulation/speed?speed={1|2|5|10}` - Set speed multiplier.
- `POST /api/simulation/demo` - Trigger scripted "City Morning Peak Simulation".

---

## 2. WebSocket Interface (`/ws`)

Connect to `ws://localhost:8000/ws` to receive live telemetry packets:
- `fleet_telemetry`: Emitted every second with updated bus coordinates.
- `defect_verified`: Emitted whenever a second bus corroborates a road defect.
- `demo_step`: Emitted during the scripted presentation scenario.
