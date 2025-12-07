#!/bin/bash
# InboxPilot - Stop All Running Servers

echo "🛑 Stopping InboxPilot servers..."

# Stop Django (backend)
pkill -f "python.*manage.py runserver" && echo "✅ Backend stopped" || echo "⚠️  Backend not running"

# Stop Vite (frontend)
pkill -f "vite" && echo "✅ Frontend stopped" || echo "⚠️  Frontend not running"

echo ""
echo "🏁 All servers stopped!"
