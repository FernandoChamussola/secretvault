@echo off
echo ===================================
echo    CofreKeys - Starting DEV Mode
echo ===================================
echo.

echo Stopping any running containers...
docker compose -f docker-compose.dev.yml down

echo.
echo Building and starting containers...
docker compose -f docker-compose.dev.yml up --build

pause
