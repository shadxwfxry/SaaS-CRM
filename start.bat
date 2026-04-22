@echo off
title Запуск SaaS CRM
echo =========================================
echo       [SaaS CRM] Быстрый запуск
echo =========================================
echo.
echo Запуск Backend-сервера (FastAPI) в новом окне...
start "Backend (FastAPI)" cmd /k "cd /d %~dp0 && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Запуск Frontend-сервера (React) в новом окне...
start "Frontend (React)" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Готово! Были открыты два дополнительных окна для серверов. 
echo Фронтенд будет доступен по адресу: http://localhost:5173
echo.
echo Для остановки серверов просто закройте те два черных окна.
echo Это окно программы запуска можно безопасно закрыть.
pause
