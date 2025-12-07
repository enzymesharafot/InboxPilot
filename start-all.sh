#!/bin/bash
# InboxPilot - Start Both Frontend and Backend

echo "🚀 Starting InboxPilot Full Stack Application"
echo "=============================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo "📡 Starting Backend (Django)..."
cd backend
./venv/bin/python manage.py runserver &
BACKEND_PID=$!
echo "✅ Backend started at http://127.0.0.1:8000/ (PID: $BACKEND_PID)"
cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo ""
echo "🎨 Starting Frontend (Vite + React)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started at http://localhost:5173/ (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "=============================================="
echo "✅ InboxPilot is now running!"
echo ""
echo "📱 Frontend: http://localhost:5173/"
echo "🔧 Backend API: http://127.0.0.1:8000/api/"
echo "📚 API Docs: http://127.0.0.1:8000/swagger/"
echo "⚙️  Admin Panel: http://127.0.0.1:8000/admin/"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=============================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
