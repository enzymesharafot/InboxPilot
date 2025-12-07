# InboxPilot Backend - Quick Start Guide

## 🚀 Quick Start

### First Time Setup
```bash
./setup.sh
```

This will:
- Create virtual environment
- Install all dependencies
- Run database migrations

### Start Development Server
```bash
./start.sh
```

Or manually:
```bash
./venv/bin/python manage.py runserver
```

Server runs at: **http://127.0.0.1:8000/**

---

## 🔑 Create Admin User

```bash
./venv/bin/python manage.py createsuperuser
```

Then access admin panel at: **http://127.0.0.1:8000/admin/**

---

## 📚 API Documentation

Once server is running:

- **Swagger UI**: http://127.0.0.1:8000/swagger/
- **ReDoc**: http://127.0.0.1:8000/redoc/
- **Health Check**: http://127.0.0.1:8000/api/health/

---

## 🔗 Available Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT token)
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/verify/` - Verify JWT token

### Emails
- `GET /api/emails/` - List all emails
- `POST /api/emails/` - Create email
- `GET /api/emails/{id}/` - Get email detail
- `PATCH /api/emails/{id}/` - Update email
- `DELETE /api/emails/{id}/` - Delete email
- `POST /api/emails/{id}/archive/` - Archive email
- `POST /api/emails/{id}/trash/` - Move to trash
- `POST /api/emails/{id}/restore/` - Restore email
- `POST /api/emails/{id}/star/` - Star/unstar email
- `POST /api/emails/{id}/mark_read/` - Mark as read
- `DELETE /api/emails/{id}/permanent_delete/` - Permanently delete

### Filters
- `GET /api/emails/?is_read=false` - Unread emails
- `GET /api/emails/?priority=high` - High priority
- `GET /api/emails/?is_starred=true` - Starred emails
- `GET /api/emails/?is_archived=true` - Archived emails
- `GET /api/emails/?is_trashed=true` - Trashed emails

### User Preferences
- `GET /api/preferences/my_preferences/` - Get my preferences
- `PATCH /api/preferences/update_preferences/` - Update preferences

### Email Accounts
- `GET /api/accounts/` - List connected accounts
- `POST /api/accounts/` - Add email account
- `DELETE /api/accounts/{id}/` - Remove account
- `POST /api/accounts/{id}/sync/` - Sync account
- `POST /api/accounts/{id}/set_primary/` - Set as primary

### Labels
- `GET /api/labels/` - List labels
- `POST /api/labels/` - Create label
- `PATCH /api/labels/{id}/` - Update label
- `DELETE /api/labels/{id}/` - Delete label

---

## 🧪 Test API with cURL

### Register User
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Get Emails (with JWT token)
```bash
curl -X GET http://127.0.0.1:8000/api/emails/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 📊 Database

Currently using **SQLite** for development (db.sqlite3).

For production, switch to PostgreSQL in `inboxpilot/settings.py`.

---

## 🛠️ Useful Commands

### Make Migrations
```bash
./venv/bin/python manage.py makemigrations
```

### Apply Migrations
```bash
./venv/bin/python manage.py migrate
```

### Create Test Data
```bash
./venv/bin/python manage.py shell
```

### Database Shell
```bash
./venv/bin/python manage.py dbshell
```

### Run Tests
```bash
./venv/bin/python manage.py test
```

---

## 📦 Features Implemented

✅ Email CRUD operations  
✅ Archive/Trash/Restore functionality  
✅ Priority detection (auto + manual)  
✅ Star/Unstar emails  
✅ Mark as read/unread  
✅ User preferences (dark mode, notifications)  
✅ Multi-account management (Gmail, Outlook, Yahoo)  
✅ JWT authentication  
✅ Email filtering & search  
✅ Label/Tag system  
✅ Admin panel with bulk actions  

---

## 🔒 Security

- JWT tokens expire after 1 hour
- Refresh tokens last 7 days
- Token rotation enabled
- User data isolation
- CORS configured for frontend

---

## 📝 Environment Variables

Create a `.env` file:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
```

---

## 🌐 CORS Settings

Frontend allowed at:
- http://localhost:5173
- http://127.0.0.1:5173

Update `inboxpilot/settings.py` to add more origins.

---

## 📖 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

---

## 🆘 Troubleshooting

### Module not found errors
```bash
./venv/bin/pip install -r requirements.txt
```

### Migration errors
```bash
./venv/bin/python manage.py makemigrations api
./venv/bin/python manage.py migrate
```

### Reset database
```bash
rm db.sqlite3
./venv/bin/python manage.py migrate
```

---

**Backend Status**: ✅ Running on http://127.0.0.1:8000/  
**Version**: 1.0.0  
**Last Updated**: October 27, 2025
