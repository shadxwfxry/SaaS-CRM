@echo off
title Launch SaaS CRM
echo =========================================
echo       [SaaS CRM] Quick Start
echo =========================================
echo.
echo Launching Backend (FastAPI)...
start "Backend" cmd /k "cd /d %~dp0 && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Launching Frontend (React)...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Done! Two new windows were opened.
echo Frontend: http://localhost:5173
echo.
echo To stop servers, close the two black windows.
echo You can close this window now.
pause
