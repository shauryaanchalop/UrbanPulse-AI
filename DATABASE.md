# UrbanPulse AI — Database Schema & Data Engine

> **Dual-Adapter Architecture: SQLite (Local) & Supabase PostgreSQL (Production)**

---

## 🗄️ Relational Entity Model

```
   ┌──────────┐              ┌──────────────┐              ┌────────────────┐
   │  Buses   │ ───────────► │ RoadSegments │ ───────────► │  RoadDefects   │
   └──────────┘              └──────────────┘              └────────────────┘
        │                           │                              │
        │                           │                              │
        ▼                           ▼                              ▼
┌──────────────┐            ┌──────────────┐              ┌────────────────┐
│ ANPR Plate   │            │ Traffic      │              │ Maintenance    │
│ Detections   │            │ Events       │              │ Work Orders    │
└──────────────┘            └──────────────┘              └────────────────┘
```

---

## 📊 Massive Seed Dataset

UrbanPulse AI seeds a dataset across 23 relational tables:

- **100 Transit Buses & Municipal Rovers** with telemetry parameters (speed, GPS, camera health, AI status, network status).
- **40 Service Vehicles & Municipal Rovers**.
- **25 Bus Transit Routes**.
- **1,000 Road Segments** with condition scores, PCI ratings, and color states (`GREEN`, `YELLOW`, `ORANGE`, `RED`, `GRAY`).
- **1,000+ Road Observations**.
- **500 Road Defects** (Potholes, Cracks, Manhole Displacements).
- **500 Traffic Events** (Congestion Hotspots, Transit Delays).
- **300 Safety Incidents** (Pedestrian Risk, Waterlogging).
- **500 Citizen Reports** with status progression (`RECEIVED` → `VERIFIED` → `IN_PROGRESS` → `RESOLVED`).
- **250 Maintenance Work Orders** (P1-P4 SLA tracking).
- **500 ANPR Number Plate Detections**.
- **50 Vehicle-of-Interest Watchlist Records**.

---

## 🔄 Dual Database Mode & Adapter Pattern (`db_adapter.py`)

- **SQLite Mode**: Active by default when `DATABASE_URL` is omitted. Database stored at `urbanpulse.db`.
- **PostgreSQL Mode**: Activated when `DATABASE_URL` points to Supabase.
- **psycopg Escaping**: `db_adapter.py` translates `?` parameters to `%s` and escapes literal percent signs (`%` → `%%`) so PostgreSQL DDL queries execute without syntax exceptions.

### Migration Management
```bash
# Run schema migration via Alembic
python -m alembic upgrade head

# Re-seed database
python seed_demo.py
```
