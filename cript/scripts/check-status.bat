@echo off
echo ========================================
echo    Secrets Vault - Status Check
echo ========================================
echo.

echo [1] Container Status:
echo -------------------
docker compose ps
echo.

echo [2] Nginx Logs (last 20 lines):
echo -------------------
docker compose logs --tail=20 nginx
echo.

echo [3] Backend Logs (last 20 lines):
echo -------------------
docker compose logs --tail=20 backend
echo.

echo [4] Frontend Logs (last 20 lines):
echo -------------------
docker compose logs --tail=20 frontend
echo.

echo [5] Testing Connections:
echo -------------------
echo Testing Nginx (port 80)...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost/health
echo.
echo Testing Backend directly (port 3001)...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3001/health
echo.

echo ========================================
echo.
echo If all healthy, open: http://localhost
echo.
pause
