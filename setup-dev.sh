#!/bin/bash
# InboxPilot - Development Setup Script

echo "🚀 InboxPilot Development Setup"
echo "================================"
echo ""

# Backend Setup
echo "📡 Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "  📦 Creating Python virtual environment..."
    python3 -m venv venv
fi
echo "  📚 Installing Python dependencies..."
./venv/bin/pip install -q -r requirements.txt
./venv/bin/pip install -q setuptools
echo "  🗄️  Running database migrations..."
./venv/bin/python manage.py makemigrations --noinput
./venv/bin/python manage.py migrate --noinput
echo "✅ Backend setup complete!"
cd ..

echo ""

# Frontend Setup
echo "🎨 Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "  📦 Installing Node.js dependencies..."
    npm install
else
    echo "  ✅ Node modules already installed"
fi
echo "✅ Frontend setup complete!"
cd ..

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "To start the application, run:"
echo "  ./start-all.sh"
echo ""
echo "Or start services individually:"
echo "  Backend:  cd backend && ./start.sh"
echo "  Frontend: cd frontend && npm run dev"
echo ""
