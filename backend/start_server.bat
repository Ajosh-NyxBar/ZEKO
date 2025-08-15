@echo off
echo ========================================
echo    ZEKO Backend Server Startup
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo.
echo Starting ZEKO Backend API...
echo.
echo The server will be available at:
echo   - API Documentation: http://localhost:8000/api/docs
echo   - Health Check: http://localhost:8000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

python start_server.py

pause
