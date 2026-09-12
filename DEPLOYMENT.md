# UrbanPulse AI — Production Deployment Guide

> **Vercel (Frontend) + Render (FastAPI Backend) + Supabase (PostgreSQL Database)**

---

## 🏗️ Architecture & Cloud Infrastructure

```
┌─────────────────────────┐       HTTPS / WS       ┌─────────────────────────┐
│     Vercel Frontend     │ ─────────────────────► │     Render Backend      │
│  (React 19 + Vite SPA)  │                        │ (FastAPI + WebSockets)  │
└─────────────────────────┘                        └────────────┬────────────┘
                                                                │
                                                         psycopg │ PostgreSQL
                                                                ▼
                                                   ┌─────────────────────────┐
                                                   │    Supabase Database    │
                                                   │  (PostgreSQL + Storage) │
                                                   └─────────────────────────┘
```

---

## 🔑 Environment Variables Matrix

### Frontend (`frontend/.env` or Vercel Settings)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend HTTP API Base URL | `https://urbanpulse-api.onrender.com` |
| `VITE_WS_URL` | Backend WebSocket URL | `wss://urbanpulse-api.onrender.com/ws` |

> **Production Rule**: Never use `localhost` URLs in production Vercel environments.

### Backend (`backend/.env` or Render Settings)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase PostgreSQL Connection String | `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | Secret key for JWT signing | `urbanpulse-sih-2026-production-jwt-secret-key` |
| `SENDGRID_API_KEY` | SendGrid Email Notification Key | `SG.xxxxxxxxxxxxxxxxxxxxxx` |
| `SENDGRID_FROM_EMAIL` | Sender Email Address | `alerts@urbanpulse.ai` |
| `TWILIO_ACCOUNT_SID` | Twilio SMS Account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio SMS Auth Token | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_FROM_NUMBER` | Twilio Sender Phone Number | `+18005550199` |
| `MODEL_PROVIDER` | AI Inference Provider (`simulated` or `onnx`) | `simulated` |

---

## 🚀 1. Frontend Deployment on Vercel

1. Push repository to GitHub/GitLab.
2. In Vercel, import project root and set Root Directory to `frontend`.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL` = `https://urbanpulse-api.onrender.com`
   - `VITE_WS_URL` = `wss://urbanpulse-api.onrender.com/ws`
6. Deploy. Vercel routes all SPA URLs via `vercel.json`.

### `vercel.json` Configuration
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🚀 2. Backend Deployment on Render

1. Create a new **Web Service** on Render connected to your repository.
2. Set Root Directory: `backend`
3. Environment: `Python 3`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python main.py` or `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).

---

## 🚀 3. Database Migration on Supabase PostgreSQL

When `DATABASE_URL` is configured, `database.py` automatically initializes PostgreSQL mode via `db_adapter.py`:

```bash
# Run database schema migrations
cd backend
python -m alembic upgrade head

# Seed massive demo dataset (100 buses, 40 service vehicles, 1000 road segments, etc.)
python seed_demo.py
```

### Percent Sign Escaping (`psycopg`)
`db_adapter.py` seamlessly translates SQLite positional `?` parameters to `%s` and escapes literal percent signs (`%` → `%%`) so psycopg executes DDL and queries without error.
