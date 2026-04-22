@echo off
chcp 437 >nul 2>nul
title W-CRM Launcher
cd /d "%~dp0"

echo.
echo  ============================================
echo     W-CRM  ::  Warehouse SaaS CRM Launcher
echo  ============================================
echo.

:: -----------------------------------------------
:: STEP 1: Check Python
:: -----------------------------------------------
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Python is not installed or not in PATH.
    echo  Please install Python 3.12+ from https://python.org
    echo.
    pause
    exit /b 1
)

:: -----------------------------------------------
:: STEP 2: Check Node.js
:: -----------------------------------------------
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Please install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: -----------------------------------------------
:: STEP 3: Create virtual environment (if needed)
:: -----------------------------------------------
if not exist "venv\Scripts\python.exe" (
    echo  [SETUP] Creating Python virtual environment...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo  [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo  [OK] Virtual environment created.
    echo.
)

:: -----------------------------------------------
:: STEP 4: Install Python dependencies (if needed)
:: -----------------------------------------------
if not exist "venv\Lib\site-packages\fastapi" (
    echo  [SETUP] Installing Python dependencies...
    echo  This may take 1-2 minutes on first run.
    echo.
    .\venv\Scripts\pip.exe install -r requirements.txt --quiet
    if %ERRORLEVEL% neq 0 (
        echo  [ERROR] Failed to install Python dependencies.
        pause
        exit /b 1
    )
    echo  [OK] Python dependencies installed.
    echo.
)

:: -----------------------------------------------
:: STEP 5: Create .env file (if needed)
:: -----------------------------------------------
if not exist ".env" (
    echo  [SETUP] Creating .env configuration file...
    (
        echo USE_SQLITE=true
        echo POSTGRES_USER=postgres
        echo POSTGRES_PASSWORD=change_me
        echo POSTGRES_SERVER=localhost
        echo POSTGRES_PORT=5432
        echo POSTGRES_DB=saas_crm
        echo JWT_ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=60
    ) > .env

    :: Generate a random JWT secret key
    for /f "delims=" %%k in ('.\venv\Scripts\python.exe -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"') do (
        echo %%k >> .env
    )
    echo  [OK] .env file created with a random JWT secret key.
    echo.
)

:: -----------------------------------------------
:: STEP 6: Run database migrations
:: -----------------------------------------------
if not exist "saas_crm.db" (
    echo  [SETUP] Initializing database...
    .\venv\Scripts\python.exe -m alembic upgrade head
    if %ERRORLEVEL% neq 0 (
        echo  [ERROR] Database migration failed.
        pause
        exit /b 1
    )
    echo  [OK] Database initialized.
    echo.
)

:: -----------------------------------------------
:: STEP 7: Install frontend dependencies (if needed)
:: -----------------------------------------------
if not exist "frontend\node_modules" (
    echo  [SETUP] Installing frontend dependencies...
    echo  This may take 1-3 minutes on first run.
    echo.
    cd frontend
    call npm install --silent
    cd ..
    if %ERRORLEVEL% neq 0 (
        echo  [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
    echo  [OK] Frontend dependencies installed.
    echo.
)

:: -----------------------------------------------
:: STEP 8: Launch servers
:: -----------------------------------------------
echo  [START] Launching Backend (FastAPI) on port 8000...
start "W-CRM Backend" cmd /k "cd /d %~dp0 && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

:: Wait a moment for the backend to initialize
timeout /t 2 /nobreak >nul

echo  [START] Launching Frontend (React) on port 5173...
start "W-CRM Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo  ============================================
echo     W-CRM is starting up!
echo  ============================================
echo.
echo    Frontend :  http://localhost:5173
echo    API Docs :  http://localhost:8000/docs
echo.
echo    Two server windows have been opened.
echo    Close them to stop the application.
echo  ============================================
echo.

:: Wait 4 seconds then open the browser
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

pause
