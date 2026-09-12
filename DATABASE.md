# URBANPULSE AI — DUAL DATABASE ARCHITECTURE & MIGRATION MANUAL

**Smart India Hackathon 2026 — Problem Statement ID: 26124**

---

## 1. Overview

UrbanPulse AI supports **Dual Database Modes** to guarantee zero-friction local offline development while enabling cloud scalability on Supabase PostgreSQL when deployed in production:

| Environment | Database Engine | Connection Source | Default Storage Path |
| :--- | :--- | :--- | :--- |
| **Local Development** | **SQLite** | Implicit (when `DATABASE_URL` is absent) | `./urbanpulse.db` |
| **Production Cloud** | **Supabase PostgreSQL** | `DATABASE_URL` env variable | Cloud Postgres Cluster |

---

## 2. Dynamic DB Abstraction (`backend/db_adapter.py`)

The application automatically selects the appropriate database driver based on the presence of `DATABASE_URL` or `POSTGRES_URL`:

- **SQLite Mode**:
  Uses Python's native `sqlite3` module.
  Positional parameter placeholders (`?`) are processed natively.
  
- **PostgreSQL Mode**:
  Uses `psycopg 3` (`psycopg[binary]`).
  `AbstractCursor` dynamically translates `?` positional placeholders to PostgreSQL `%s` placeholders at execution time.
  `RowAdapter` wraps dictionary/row results so code can seamlessly access columns using `row["col"]`, `row[0]`, `row.col`, or `row.get("col")`.

---

## 3. Database Commands

### A. Run Database Migrations (Alembic)
Alembic reads `DATABASE_URL` from environment or `.env` file (falling back to SQLite if absent):

```bash
cd backend
python -m alembic upgrade head
```

### B. Seed UrbanPulse AI Demo Data
Seed 23 relational tables across all 5 urban intelligence layers (Buses, Routes, Road Defects, Citizen Reports, ANPR, Watchlist, Maintenance Tickets, Rewards, System Health):

```bash
cd backend
python seed_demo.py
```

### C. Offline SQLite to PostgreSQL Data Migration
To migrate existing records from local `urbanpulse.db` to a target Supabase PostgreSQL instance:

```bash
cd backend
python migrate_sqlite_to_postgres.py urbanpulse.db "postgresql://user:password@host:5432/dbname"
```

---

## 4. Database Schema (23 Platform Tables)

1. `routes`
2. `buses`
3. `service_vehicles`
4. `road_segments`
5. `road_defects`
6. `citizen_reports`
7. `reward_accounts`
8. `reward_transactions`
9. `reward_rules`
10. `traffic_events`
11. `safety_incidents`
12. `distress_alerts`
13. `anpr_detections`
14. `vehicle_watchlist`
15. `watchlist_matches`
16. `survey_missions`
17. `video_clips`
18. `maintenance_tickets`
19. `users`
20. `audit_logs`
21. `system_health`
22. `notifications`
23. `notification_rules`

---

## 5. Health Check Diagnostics

Verify the active database engine via `GET /health` or `GET /api/health`:

```json
{
  "status": "HEALTHY",
  "api": "ok",
  "database": "ok",
  "database_type": "postgresql"
}
```
*(When `DATABASE_URL` is omitted, `"database_type"` will return `"sqlite"`).*
