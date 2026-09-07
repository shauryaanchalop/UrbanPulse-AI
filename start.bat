@echo off
echo =================================================
echo   UrbanPulse AI: Mobile Urban Intelligence Platform
echo   Smart India Hackathon 2026 (Problem 26124)
echo =================================================

echo [1/3] Seeding SQLite Database...
cd backend
python database.py

echo [2/3] Launching FastAPI Backend on Port 8000...
start cmd /k "python main.py"

echo [3/3] Launching Vite Frontend on Port 5173...
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo Application successfully launched!
echo Access Dashboard at: http://localhost:5173
echo Access REST Docs at: http://localhost:8000/docs
echo.
pause
