#!/bin/bash
# InboxPilot Backend Setup Script

echo "🚀 InboxPilot Backend Setup"
echo "==========================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created!"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo ""
echo "📚 Installing dependencies..."
./venv/bin/pip install -r requirements.txt
./venv/bin/pip install setuptools  # For drf-yasg compatibility
echo "✅ Dependencies installed!"

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
./venv/bin/python manage.py makemigrations
./venv/bin/python manage.py migrate
echo "✅ Migrations completed!"

echo ""
echo "✅ Setup complete!"
echo ""
echo "To create a superuser, run:"
echo "  ./venv/bin/python manage.py createsuperuser"
echo ""
echo "To start the development server, run:"
echo "  ./venv/bin/python manage.py runserver"
echo ""
echo "Or use the start.sh script:"
echo "  ./start.sh"
