@echo off
echo ========================================
echo    Secrets Vault - Project Setup
echo ========================================
echo.

echo [1/6] Generating security keys...
node scripts\generate-keys.js
if %ERRORLEVEL% NEQ 0 (
    echo Error generating keys!
    pause
    exit /b 1
)
echo.

echo [2/6] Creating necessary directories...
if not exist "backend\logs" mkdir backend\logs
if not exist "secrets" mkdir secrets
if not exist "nginx\ssl" mkdir nginx\ssl
echo.

echo [3/6] Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing backend dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [4/6] Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing frontend dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [5/6] Building Docker containers...
docker compose build
if %ERRORLEVEL% NEQ 0 (
    echo Error building containers!
    pause
    exit /b 1
)
echo.

echo [6/6] Starting services...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo Error starting services!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Services are starting. Wait 30 seconds, then:
echo   1. Open http://localhost in your browser
echo   2. Or run: docker compose exec backend npm test
echo.
echo To view logs: docker compose logs -f
echo.
pause
