# URBANPULSE AI — PRODUCTION DEPLOYMENT MANUAL

**Smart India Hackathon 2026 — Problem Statement ID: 26124**

---

## 1. Cloud Architecture Overview

UrbanPulse AI is designed for seamless deployment across standard cloud providers:
- **Frontend App**: Vercel or Netlify (React + Vite + TypeScript)
- **Backend API & WebSockets**: Render, Railway, or AWS EC2 (FastAPI + Python)
- **Database**: Supabase PostgreSQL + PostGIS (or embedded SQLite for local/edge nodes)
- **Object Storage**: Supabase Storage or AWS S3 (Video Clips & Evidence Images)
- **Notification Gateways**: SendGrid (Email) & Twilio (SMS)

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Database Setup (Supabase / PostgreSQL)
1. Create a project on [Supabase](https://supabase.com).
2. Retrieve the PostgreSQL database connection string (`DATABASE_URL`).
3. Run migrations and seed data:
   ```bash
   python backend/database.py
   ```

### Step 2: Backend API Deployment (Render)
1. Connect your GitHub repository to [Render](https://render.com).
2. Select **New Web Service** and choose `Dockerfile.api`.
3. Set the Environment Variables:
   - `APP_ENV` = `production`
   - `SECRET_KEY` = `<your-jwt-secret>`
   - `SENDGRID_API_KEY` = `<your-sendgrid-key>`
   - `TWILIO_ACCOUNT_SID` = `<your-twilio-sid>`
   - `TWILIO_AUTH_TOKEN` = `<your-twilio-token>`
4. Deploy the service. The service will expose health check at `GET https://your-backend.onrender.com/health`.

### Step 3: Frontend Deployment (Vercel)
1. Connect your repository to [Vercel](https://vercel.com).
2. Set Framework Preset to **Vite**.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - `VITE_WS_URL` = `wss://your-backend.onrender.com/ws`
6. Deploy the frontend application.

---

## 3. Production Health Diagnostic Endpoint

Verify system health by making a request to:
```bash
curl https://your-backend.onrender.com/health
```
**Sample Response:**
```json
{
  "status": "HEALTHY",
  "api": "ok",
  "database": "ok",
  "storage": "local_demo_storage",
  "ai": "local_inference_active",
  "simulation": "running",
  "notifications": "sendgrid_twilio_abstraction_active",
  "timestamp": "2026-09-12T13:30:00"
}
```
