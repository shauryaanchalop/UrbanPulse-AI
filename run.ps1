# UrbanPulse AI - Unified Startup Script for Windows PowerShell
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  UrbanPulse AI: Mobile Urban Intelligence Platform" -ForegroundColor Cyan
Write-Host "  Smart India Hackathon 2026 (Problem 26124)" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/3] Initializing SQLite Spatial Database..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "database.py" -WorkingDirectory "$CurrentDir\backend" -NoNewWindow -Wait

Write-Host "`n[2/3] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "main.py" -WorkingDirectory "$CurrentDir\backend"

Start-Sleep -Seconds 2

Write-Host "`n[3/3] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$CurrentDir\frontend"

Start-Sleep -Seconds 3

Write-Host "`n[SUCCESS] UrbanPulse AI is now running!" -ForegroundColor Cyan
Write-Host "Frontend Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "FastAPI Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "Press Ctrl+C in spawned windows to stop."
