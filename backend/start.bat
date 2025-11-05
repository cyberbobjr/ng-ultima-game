@echo off
REM Quick start script for Ultima IV Assets Backend (Windows)

echo 🚀 Starting Ultima IV Assets Backend Server...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo 📥 Installing dependencies...
    pip install -r requirements.txt
)

REM Start the server
echo.
echo ✅ Starting server at http://localhost:8000
echo 📖 API docs at http://localhost:8000/docs
echo 🔍 Health check at http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py
