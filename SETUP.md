# URBANPULSE AI — SETUP & LOCAL DEVELOPMENT GUIDE

**Smart India Hackathon 2026 — Problem Statement ID: 26124**

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- Git

---

## 2. Local Backend Setup (SQLite Mode)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply Alembic migrations
python -m alembic upgrade head

# 4. Seed demo data
python seed_demo.py

# 5. Start FastAPI Backend
python -m uvicorn main:app --reload --port 8000
```

Verify backend health: `http://localhost:8000/health`
Expected Response:
```json
{
  "status": "HEALTHY",
  "api": "ok",
  "database": "ok",
  "database_type": "sqlite"
}
```

---

## 3. Local Backend Setup (Supabase PostgreSQL Mode)

```bash
# 1. Set environment variable
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 2. Run Alembic migrations on Supabase
python -m alembic upgrade head

# 3. Seed demo data into Supabase
python seed_demo.py

# 4. Run backend
python -m uvicorn main:app --reload --port 8000
```

Verify health: `http://localhost:8000/health`
Expected Response:
```json
{
  "status": "HEALTHY",
  "api": "ok",
  "database": "ok",
  "database_type": "postgresql"
}
```

---

## 4. Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open browser at `http://localhost:5173`.

---

## 5. Running Automated Backend Tests

```bash
# Run DB Adapter unit test
python backend/test_db_adapter.py

# Run API endpoints unit tests
python backend/test_api_endpoints.py

# Run master end-to-end flow tests
python backend/test_master_flow.py
```
