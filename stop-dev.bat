@echo off
echo ===================================
echo    CofreKeys - Stopping DEV Mode
echo ===================================
echo.

docker compose -f docker-compose.dev.yml down

echo.
echo Containers stopped!
pause
