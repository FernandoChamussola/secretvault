@echo off
REM CofreKeys Setup Script for Windows
REM This script helps you set up the CofreKeys password manager

echo ==========================================
echo     CofreKeys - Setup Script
echo ==========================================
echo.

REM Check if .env exists
if exist .env (
    echo Warning: .env file already exists.
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i not "%OVERWRITE%"=="y" (
        echo Setup cancelled.
        exit /b 0
    )
)

echo Generating secure credentials...
echo.

REM Note: For production, you should use proper random generation
REM This is a simplified version for Windows

REM Generate random strings (simplified - use proper tools in production)
set DB_PASSWORD=secure_db_pass_%RANDOM%%RANDOM%%RANDOM%
set JWT_SECRET=secure_jwt_secret_%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%

REM For ENCRYPTION_KEY, it must be exactly 32 characters
set ENCRYPTION_KEY=12345678901234567890123456789012

REM Create .env file
(
echo # Database
echo DB_PASSWORD=%DB_PASSWORD%
echo.
echo # JWT ^(at least 32 characters recommended^)
echo JWT_SECRET=%JWT_SECRET%
echo.
echo # Encryption ^(must be exactly 32 characters^)
echo ENCRYPTION_KEY=%ENCRYPTION_KEY%
) > .env

echo Created .env file with credentials
echo.
echo ==========================================
echo     Important Notice
echo ==========================================
echo.
echo For production, please generate secure values:
echo.
echo 1. Database Password:
echo    Use a password manager or random generator
echo.
echo 2. JWT Secret:
echo    Minimum 32 characters, random string
echo.
echo 3. Encryption Key:
echo    MUST be exactly 32 characters
echo    Use: openssl rand -hex 16
echo.
echo ==========================================
echo.

REM Ask if user wants to start services
set /p START="Do you want to start the services now? (y/N): "
if /i "%START%"=="y" (
    echo.
    echo Starting services...
    docker-compose up -d --build

    echo.
    echo Waiting for services to start...
    timeout /t 10 /nobreak > nul

    echo.
    echo Running database migrations...
    docker-compose exec -T cofrekeys-api npx prisma migrate deploy

    echo.
    echo ==========================================
    echo     Setup Complete!
    echo ==========================================
    echo.
    echo CofreKeys is now running!
    echo.
    echo Next steps:
    echo   1. Access the application at http://localhost
    echo   2. Create your first account
    echo   3. Start managing your passwords!
    echo.
    echo View logs: docker-compose logs -f
    echo Stop services: docker-compose down
    echo.
) else (
    echo.
    echo Setup complete! To start the services, run:
    echo   docker-compose up -d --build
    echo.
)

pause
