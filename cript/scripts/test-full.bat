@echo off
echo ========================================
echo    Secrets Vault - Full Test Suite
echo ========================================
echo.

echo [1/5] Checking if services are running...
docker compose ps
echo.

echo [2/5] Waiting for services to be ready...
timeout /t 10 /nobreak
echo.

echo [3/5] Running API test script...
docker compose exec -T backend npm test
echo.

echo [4/5] Checking backend logs...
docker compose logs --tail=20 backend
echo.

echo [5/5] Test complete!
echo.
echo Open your browser at: http://localhost
echo.
pause
