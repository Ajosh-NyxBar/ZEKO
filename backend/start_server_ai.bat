@echo off
echo ============================================================
echo 🤖 ZEKO Backend Server - Phase 4 AI Development
echo ============================================================

cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Activate virtual environment if exists
if exist "..\\.venv\\Scripts\\activate.bat" (
    echo 📦 Activating virtual environment...
    call "..\\.venv\\Scripts\\activate.bat"
) else (
    echo ⚠️  Virtual environment not found, using system Python
)

REM Install/upgrade requirements
echo 📚 Installing requirements...
python -m pip install -r requirements.txt --quiet

REM Start server with AI models
echo 🚀 Starting ZEKO Backend Server with AI Models...
echo.
echo Server will be available at:
echo   • API Documentation: http://localhost:8000/api/docs
echo   • AI Models: http://localhost:8000/api/ai
echo   • Health Check: http://localhost:8000/api/health
echo.
echo Press Ctrl+C to stop the server
echo ============================================================

python start_server_ai.py

pause
