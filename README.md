# InboxPilot 📧

**AI-Powered Email Management with Privacy-First Architecture**

A modern, intelligent email management application with automatic dark mode, AI-powered features, and enterprise-grade security.

---

## ✨ Features

### 🎨 Modern UI/UX
- ✅ **Auto Dark Mode** - Time-based theme switching (7 PM - 7 AM)
- ✅ **Manual Dark Mode** - Full user control
- ✅ **Smooth Animations** - Framer Motion powered
- ✅ **Responsive Design** - Works on all devices
- ✅ **Toast Notifications** - Beautiful in-app alerts
- ✅ **Lazy Loading** - Optimized performance

### 📧 Email Management
- ✅ **Archive/Trash/Restore** - Full email organization
- ✅ **Star/Unstar** - Mark important emails
- ✅ **Priority Detection** - Auto-detect urgent emails
- ✅ **Read/Unread** - Track email status
- ✅ **Email Detail Modal** - Quick view on double-click
- ✅ **Dynamic Views** - Inbox/Archive/Trash navigation

### 🤖 AI Features
- ✅ **AI Summarizer** - Get email summaries
- ✅ **AI Writer** - Compose with AI assistance
- ✅ **Priority Detection** - Smart urgency analysis

### 🔒 Privacy & Security
- ✅ **Complete Data Isolation** - Users only see their own data
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Admin Restrictions** - Even admins can't see your emails
- ✅ **Encrypted Storage** - OAuth tokens encrypted
- ✅ **GDPR Compliant** - Privacy by design

### 📊 Multi-Account Support
- ✅ **Gmail Integration** - Connect Gmail accounts
- ✅ **Outlook Integration** - Connect Outlook accounts
- ✅ **Yahoo Support** - Connect Yahoo accounts
- ✅ **Account Sync** - Auto-sync emails
- ✅ **Primary Account** - Set default account

---

## 🚀 Quick Start

### One-Command Setup
```bash
./setup-dev.sh
```

This will:
- Create Python virtual environment
- Install all dependencies (backend + frontend)
- Run database migrations
- Prepare the application for development

### Start Both Frontend & Backend
```bash
./start-all.sh
```

This starts:
- **Frontend**: http://localhost:5173/
- **Backend API**: http://127.0.0.1:8000/api/
- **API Docs**: http://127.0.0.1:8000/swagger/
- **Admin Panel**: http://127.0.0.1:8000/admin/

### Stop All Servers
```bash
./stop-all.sh
```

---

## 📋 Manual Setup

### Prerequisites
- **Node.js** v18+ 
- **Python** 3.10+
- **npm** or **yarn**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173/**

### Backend Setup (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install setuptools
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000/**

---

## 🏗️ Project Structure

```
InboxPilot/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── ComposeEmail.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/          # React Context
│   │   │   └── DarkModeContext.jsx
│   │   ├── hooks/            # Custom hooks
│   │   │   └── useToast.js
│   │   ├── pages/            # Main pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Auth.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Django Backend
│   ├── api/                  # Main API app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API endpoints
│   │   ├── serializers.py    # Data serializers
│   │   ├── urls.py           # URL routing
│   │   └── admin.py          # Admin panel
│   ├── inboxpilot/           # Project settings
│   │   ├── settings.py       # Django settings
│   │   └── urls.py           # Main URL config
│   ├── manage.py
│   ├── requirements.txt
│   ├── setup.sh              # Backend setup script
│   ├── start.sh              # Backend start script
│   ├── API_DOCUMENTATION.md  # Complete API docs
│   ├── SECURITY.md           # Security & privacy info
│   └── README.md
│
├── fastapi_service/          # FastAPI for AI features
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml        # Docker configuration
├── start-all.sh              # Start frontend + backend
├── stop-all.sh               # Stop all servers
├── setup-dev.sh              # Development setup
├── OPTIMIZATION_REPORT.md    # Performance optimizations
└── README.md                 # This file
```

---

## 🔧 Tech Stack

### Frontend
- **React 18** - UI framework with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Context API** - State management

### Backend
- **Django 4.2.7** - Python web framework
- **Django REST Framework** - API toolkit
- **JWT Authentication** - djangorestframework-simplejwt
- **SQLite** - Development database
- **PostgreSQL** - Production database (optional)
- **WhiteNoise** - Static file serving
- **drf-yasg** - Swagger/OpenAPI docs

### AI Service
- **FastAPI** - High-performance API
- **OpenAI API** - AI-powered features

---

## 📚 API Documentation

Once backend is running, access interactive docs:

- **Swagger UI**: http://127.0.0.1:8000/swagger/
- **ReDoc**: http://127.0.0.1:8000/redoc/
- **Full Docs**: [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

### Key Endpoints

```
POST /api/auth/register/          - Register user
POST /api/auth/login/             - Login (get JWT)
POST /api/auth/refresh/           - Refresh token

GET  /api/emails/                 - List emails
POST /api/emails/                 - Create email
POST /api/emails/{id}/archive/    - Archive email
POST /api/emails/{id}/trash/      - Move to trash
POST /api/emails/{id}/restore/    - Restore email
POST /api/emails/{id}/star/       - Star/unstar

GET  /api/preferences/my_preferences/     - Get preferences
PATCH /api/preferences/update_preferences/ - Update preferences

GET  /api/accounts/               - List email accounts
POST /api/accounts/               - Add account
POST /api/accounts/{id}/sync/     - Sync account
```

---

## 🔒 Security Features

InboxPilot implements **privacy-first architecture**:

- ✅ **Complete User Isolation** - Users only see their own data
- ✅ **Admin Restrictions** - Admins can't access user emails
- ✅ **JWT Tokens** - 1-hour access, 7-day refresh
- ✅ **Encrypted Storage** - OAuth tokens encrypted
- ✅ **Permission Checks** - Object-level permissions
- ✅ **CORS Security** - Configured for trusted origins
- ✅ **GDPR Compliant** - Privacy by design

See [backend/SECURITY.md](backend/SECURITY.md) for complete details.

---

## 🎯 Unique Features

### 🌙 Auto Dark Mode
**World's first email app with time-based dark mode!**

- Automatically switches to dark mode from **7 PM to 7 AM**
- Light mode from **7 AM to 7 PM**
- Checks time every minute
- User can override with manual mode
- Preference saved in backend

### 🔐 Privacy-First Admin
**Even admins can't read your emails!**

- Database-level user isolation
- Admin panel enforces same privacy rules
- No backdoors or overrides
- Complete audit trail

---

## 🛠️ Development

### Environment Variables

**Frontend** (`.env` in `frontend/`):
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_FASTAPI_URL=http://localhost:8001
```

**Backend** (`.env` in `backend/`):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### Build for Production

**Frontend**:
```bash
cd frontend
npm run build
```

**Backend**:
```bash
cd backend
source venv/bin/activate
python manage.py collectstatic
gunicorn inboxpilot.wsgi:application
```

---

## 📊 Performance Optimizations

- ✅ **Code Splitting** - React.lazy() for routes
- ✅ **Bundle Optimization** - Manual chunking (react-vendor, animation)
- ✅ **Minification** - Terser with console removal
- ✅ **Lazy Loading** - Suspense with loading states
- ✅ **Database Indexing** - Optimized queries
- ✅ **Pagination** - 20 items per page
- ✅ **Fast Animations** - 0.2s hover, 0.3s transitions

See [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) for details.

---

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run test
```

### Backend
```bash
cd backend
source venv/bin/activate
python manage.py test
```

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- FastAPI: http://localhost:8001

---

## 📝 Available Scripts

### Root Directory
- `./setup-dev.sh` - Complete development setup
- `./start-all.sh` - Start frontend + backend
- `./stop-all.sh` - Stop all servers

### Backend (`backend/`)
- `./setup.sh` - Backend setup only
- `./start.sh` - Start Django server
- `python manage.py createsuperuser` - Create admin (for managing your own data)

### Frontend (`frontend/`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- **Documentation**: See `backend/API_DOCUMENTATION.md`
- **Security**: See `backend/SECURITY.md`
- **Issues**: Open an issue on GitHub

---

## 🎉 Acknowledgments

- Built with ❤️ using React and Django
- Inspired by modern email clients
- Privacy-first design philosophy

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 27, 2025

---

## 🚀 Get Started Now!

```bash
# Clone the repo
git clone https://github.com/yourusername/InboxPilot.git
cd InboxPilot

# Setup everything
./setup-dev.sh

# Start the application
./start-all.sh
```

**Open http://localhost:5173** and start managing your emails! 📧✨
python manage.py migrate
python manage.py runserver
```

### FastAPI Service Setup

```bash
cd fastapi_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Using Docker

```bash
docker-compose up --build
```

## Environment Variables

Create `.env` files in respective directories:

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/inboxpilot
SECRET_KEY=your-secret-key
DEBUG=True
```

### FastAPI `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/inboxpilot
```

## Development

- Frontend runs on: http://localhost:5173
- Django runs on: http://localhost:8000
- FastAPI runs on: http://localhost:8001

## License

MIT
