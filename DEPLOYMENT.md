# URBANPULSE AI — PRODUCTION DEPLOYMENT MANUAL

**Smart India Hackathon 2026 — Problem Statement ID: 26124**

---

## 1. Cloud Architecture Overview

UrbanPulse AI is designed for dual deployment modes:
- **Frontend**: Vercel (React 19 + Vite + TypeScript)
- **Backend API & WebSockets**: Render (FastAPI + Python 3.14 + Uvicorn)
- **Database**: Supabase PostgreSQL (Production) / embedded SQLite (Local)
- **Migrations**: Alembic (`python -m alembic upgrade head`)
- **Seed Utility**: `python seed_demo.py`

---

## 2. Step-by-Step Production Deployment

### Step 1: Supabase Database Setup
1. Create a PostgreSQL project on [Supabase](https://supabase.com).
2. Copy the Connection String under Settings -> Database (`postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`).

### Step 2: Render Backend Service Configuration
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a **Web Service** pointing to `backend/main.py`.
3. Set Build Command:
   ```bash
   pip install -r backend/requirements.txt && cd backend && python -m alembic upgrade head && python seed_demo.py
   ```
4. Set Start Command:
   ```bash
   cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Environment Variables on Render:
   - `DATABASE_URL` = `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
   - `SECRET_KEY` = `<your-jwt-secret>`
   - `SENDGRID_API_KEY` = `<your-sendgrid-key>`
   - `TWILIO_ACCOUNT_SID` = `<your-twilio-sid>`

### Step 3: Vercel Frontend Deployment
1. Connect repository to [Vercel](https://vercel.com).
2. Set Environment Variables:
   - `VITE_API_URL` = `https://urbanpulse-backend-it4i.onrender.com`
   - `VITE_WS_URL` = `wss://urbanpulse-backend-it4i.onrender.com/ws`

---

## 3. Production Health Diagnostic Endpoint

Check backend and database health:
```bash
curl https://urbanpulse-backend-it4i.onrender.com/health
```

Expected Output:
```json
{
  "status": "HEALTHY",
  "api": "ok",
  "database": "ok",
  "database_type": "postgresql"
}
```
