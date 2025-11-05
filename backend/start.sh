#!/bin/bash

# Quick start script for Ultima IV Assets Backend

echo "🚀 Starting Ultima IV Assets Backend Server..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo ""
echo "✅ Starting server at http://localhost:8000"
echo "📖 API docs at http://localhost:8000/docs"
echo "🔍 Health check at http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
