# InboxPilot Backend API Documentation

## Overview
Django REST Framework backend for InboxPilot - AI-powered email management system.

## Features Implemented ✅

### 1. Email Archive/Trash/Restore System
- Archive emails
- Move to trash
- Restore from archive/trash
- Permanent delete
- Trash timestamp tracking

### 2. User Preferences API
- Dark mode preference (auto/manual)
- Email notifications
- Desktop notifications
- Weekly digest
- Auto-archive read emails

### 3. Email Account Management
- Connect multiple email accounts (Gmail, Outlook, Yahoo)
- OAuth token storage (encrypted)
- Account sync management
- Primary account designation
- Account status tracking (active, syncing, error, disconnected)

### 4. JWT Authentication
- User registration
- Login with JWT tokens
- Token refresh
- Token verification
- 1-hour access token lifetime
- 7-day refresh token lifetime

### 5. Email Filtering & Priority Detection
- Priority levels: high, normal, low
- Auto-detect priority based on keywords
- Filter by: read/unread, starred, archived, trashed, priority
- Indexed queries for performance

---

## Installation & Setup

### 1. Create Virtual Environment
```bash
cd /media/inzamul-sharafot/Data/InboxPilot/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
DB_NAME=inboxpilot
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

---

## API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "preferences": {
      "dark_mode_preference": "auto",
      "dark_mode_enabled": false,
      "email_notifications": true,
      "desktop_notifications": false,
      "weekly_digest": true,
      "auto_archive_read": false
    }
  }
}
```

#### Login (Get JWT Token)
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Verify Token
```http
POST /api/auth/verify/
Content-Type: application/json

{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### Email Endpoints

**Note:** All email endpoints require authentication. Include JWT token in headers:
```
Authorization: Bearer <your_access_token>
```

#### List Emails
```http
GET /api/emails/
GET /api/emails/?is_read=false
GET /api/emails/?is_archived=true
GET /api/emails/?is_trashed=true
GET /api/emails/?priority=high
GET /api/emails/?is_starred=true
```

**Response:**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/emails/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "sender": "boss@company.com",
      "recipient": "john@example.com",
      "subject": "URGENT: Quarterly Report Due",
      "body": "Please submit the quarterly report ASAP...",
      "priority": "high",
      "is_read": false,
      "is_starred": true,
      "is_archived": false,
      "is_trashed": false,
      "trashed_at": null,
      "labels": [],
      "created_at": "2025-10-27T10:30:00Z",
      "updated_at": "2025-10-27T10:30:00Z"
    }
  ]
}
```

#### Create Email
```http
POST /api/emails/
Content-Type: application/json

{
  "sender": "sender@example.com",
  "recipient": "recipient@example.com",
  "subject": "Meeting Tomorrow",
  "body": "Don't forget about our meeting at 2 PM."
}
```

#### Archive Email
```http
POST /api/emails/{id}/archive/
```

**Response:**
```json
{
  "message": "Email archived successfully",
  "email": { /* email object */ }
}
```

#### Move to Trash
```http
POST /api/emails/{id}/trash/
```

#### Restore Email
```http
POST /api/emails/{id}/restore/
```

#### Permanent Delete
```http
DELETE /api/emails/{id}/permanent_delete/
```

#### Star/Unstar Email
```http
POST /api/emails/{id}/star/
```

#### Mark as Read
```http
POST /api/emails/{id}/mark_read/
```

#### Update Email
```http
PATCH /api/emails/{id}/
Content-Type: application/json

{
  "is_read": true,
  "is_starred": true
}
```

---

### User Preferences Endpoints

#### Get My Preferences
```http
GET /api/preferences/my_preferences/
```

**Response:**
```json
{
  "id": 1,
  "dark_mode_preference": "auto",
  "dark_mode_enabled": false,
  "email_notifications": true,
  "desktop_notifications": false,
  "weekly_digest": true,
  "auto_archive_read": false,
  "created_at": "2025-10-27T08:00:00Z",
  "updated_at": "2025-10-27T10:30:00Z"
}
```

#### Update Preferences
```http
PATCH /api/preferences/update_preferences/
Content-Type: application/json

{
  "dark_mode_preference": "manual",
  "dark_mode_enabled": true,
  "email_notifications": false
}
```

**Response:**
```json
{
  "message": "Preferences updated successfully",
  "preferences": { /* updated preferences */ }
}
```

---

### Email Account Management Endpoints

#### List Connected Accounts
```http
GET /api/accounts/
```

**Response:**
```json
[
  {
    "id": 1,
    "email_address": "john@gmail.com",
    "provider": "gmail",
    "status": "active",
    "is_primary": true,
    "last_sync": "2025-10-27T10:00:00Z",
    "sync_enabled": true,
    "created_at": "2025-10-20T08:00:00Z",
    "updated_at": "2025-10-27T10:00:00Z"
  },
  {
    "id": 2,
    "email_address": "john@outlook.com",
    "provider": "outlook",
    "status": "active",
    "is_primary": false,
    "last_sync": "2025-10-27T09:45:00Z",
    "sync_enabled": true,
    "created_at": "2025-10-21T12:00:00Z",
    "updated_at": "2025-10-27T09:45:00Z"
  }
]
```

#### Add Email Account
```http
POST /api/accounts/
Content-Type: application/json

{
  "email_address": "new@gmail.com",
  "provider": "gmail",
  "access_token": "oauth_access_token_here",
  "refresh_token": "oauth_refresh_token_here"
}
```

#### Sync Account
```http
POST /api/accounts/{id}/sync/
```

**Response:**
```json
{
  "message": "Sync started successfully",
  "account": { /* account object */ }
}
```

#### Set Primary Account
```http
POST /api/accounts/{id}/set_primary/
```

#### Remove Account
```http
DELETE /api/accounts/{id}/
```

---

### Label Endpoints

#### List Labels
```http
GET /api/labels/
```

#### Create Label
```http
POST /api/labels/
Content-Type: application/json

{
  "name": "Work",
  "color": "#3b82f6"
}
```

#### Update Label
```http
PATCH /api/labels/{id}/
Content-Type: application/json

{
  "name": "Important Work",
  "color": "#ef4444"
}
```

#### Delete Label
```http
DELETE /api/labels/{id}/
```

---

## Models

### Email Model
```python
- user: ForeignKey(User)
- sender: EmailField
- recipient: EmailField
- subject: CharField(max_length=500)
- body: TextField
- priority: CharField(choices=['high', 'normal', 'low'])
- is_read: BooleanField
- is_starred: BooleanField
- is_archived: BooleanField
- is_trashed: BooleanField
- trashed_at: DateTimeField (nullable)
- created_at: DateTimeField
- updated_at: DateTimeField
```

**Priority Detection:**
Auto-detects high priority based on keywords: urgent, asap, important, critical, emergency, immediate

### UserPreference Model
```python
- user: OneToOneField(User)
- dark_mode_preference: CharField(choices=['auto', 'manual'])
- dark_mode_enabled: BooleanField
- email_notifications: BooleanField
- desktop_notifications: BooleanField
- weekly_digest: BooleanField
- auto_archive_read: BooleanField
- created_at: DateTimeField
- updated_at: DateTimeField
```

### EmailAccount Model
```python
- user: ForeignKey(User)
- email_address: EmailField
- provider: CharField(choices=['gmail', 'outlook', 'yahoo', 'other'])
- status: CharField(choices=['active', 'syncing', 'error', 'disconnected'])
- is_primary: BooleanField
- access_token: TextField (encrypted)
- refresh_token: TextField (encrypted)
- token_expires_at: DateTimeField (nullable)
- last_sync: DateTimeField (nullable)
- sync_enabled: BooleanField
- created_at: DateTimeField
- updated_at: DateTimeField
```

### Label Model
```python
- name: CharField(max_length=100)
- user: ForeignKey(User)
- color: CharField(max_length=7, default='#3b82f6')
- created_at: DateTimeField
```

---

## Admin Panel

Access at: `http://localhost:8000/admin/`

**Features:**
- Manage all emails with bulk actions (mark read, archive, trash)
- User preference management
- Email account management with sync controls
- Label management
- User management

**Bulk Actions:**
- Mark selected emails as read
- Archive selected emails
- Move selected emails to trash
- Enable/disable sync for email accounts

---

## API Documentation (Interactive)

### Swagger UI
```
http://localhost:8000/swagger/
```

### ReDoc
```
http://localhost:8000/redoc/
```

---

## Security Features

✅ JWT Authentication with token rotation  
✅ Encrypted OAuth token storage  
✅ CORS configuration  
✅ Password validation  
✅ User isolation (users only see their own data)  
✅ HTTPS ready (use SSL in production)  

---

## Performance Optimizations

✅ Database indexing on frequently queried fields  
✅ Pagination (20 items per page)  
✅ Efficient querysets with select_related/prefetch_related  
✅ Compressed static files with WhiteNoise  

---

## Next Steps

1. **Install dependencies** in virtual environment
2. **Run migrations** to create database tables
3. **Create superuser** for admin access
4. **Test endpoints** using Swagger UI or Postman
5. **Integrate with frontend** (update API URLs)
6. **Implement OAuth** for Gmail/Outlook (future feature)
7. **Connect to FastAPI** for AI features

---

## Environment Variables

```env
# Required
SECRET_KEY=your-django-secret-key
DEBUG=True/False

# Database
DB_NAME=inboxpilot
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Optional (for production)
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

---

## Testing API with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
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
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Get Emails (with auth)
```bash
curl -X GET http://localhost:8000/api/emails/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Technology Stack

- **Framework:** Django 4.2.7
- **API:** Django REST Framework 3.14.0
- **Auth:** djangorestframework-simplejwt 5.3.0
- **Database:** PostgreSQL (psycopg2-binary)
- **CORS:** django-cors-headers
- **Docs:** drf-yasg (Swagger/ReDoc)
- **Static Files:** WhiteNoise
- **Encryption:** cryptography 41.0.7

---

## Support & Contact

For issues or questions, contact: contact@inboxpilot.local

---

**Status:** ✅ Backend Ready for Development  
**Version:** 1.0.0  
**Last Updated:** October 27, 2025
