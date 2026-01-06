# 🚀 InboxPilot Deployment Guide

Complete guide to deploy InboxPilot for **FREE** using Vercel (Frontend) + Render (Backend)

---

## 📋 Prerequisites

1. GitHub account with InboxPilot repository
2. Vercel account (sign up at https://vercel.com)
3. Render account (sign up at https://render.com)
4. Your OAuth credentials (Gmail, Outlook)
5. Gemini API key

---

## 🎯 Deployment Architecture

```
Frontend (Vercel)          Backend (Render)           Database (Render)
  React/Vite      →    Django REST API    →    PostgreSQL
  Port: 443             Port: 10000              Port: 5432
```

---

## Part 1: Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `inboxpilot-db`
   - **Database:** `inboxpilot`
   - **User:** `inboxpilot_user`
   - **Region:** Choose closest to you
   - **Plan:** **Free**
4. Click **"Create Database"**
5. **SAVE** the connection details (especially Internal Database URL)

### Step 2: Deploy Django Backend

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `enzymesharafot/InboxPilot`
3. Configure:
   - **Name:** `inboxpilot-api`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn backend.wsgi:application`
   - **Plan:** **Free**

4. Click **"Advanced"** and add Environment Variables:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app

# Database (Will be auto-filled by Render)
DATABASE_URL=<from PostgreSQL instance>

# OAuth - Gmail
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://your-backend.onrender.com/api/oauth/gmail/callback/

# OAuth - Outlook
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_REDIRECT_URI=https://your-backend.onrender.com/api/oauth/outlook/callback/

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **SAVE** your backend URL: `https://inboxpilot-api.onrender.com`

### Step 3: Run Database Migrations

1. In Render dashboard, go to your web service
2. Click **"Shell"** tab
3. Run these commands:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py populate_demo_emails
```

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Update `frontend/src/utils/api.js`:

```javascript
// Change this line:
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// To:
const API_BASE_URL = 'https://your-backend.onrender.com/api';
```

2. Commit and push:

```bash
git add frontend/src/utils/api.js
git commit -m "Update API URL for production"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `enzymesharafot/InboxPilot`
3. Configure:
   - **Project Name:** `inboxpilot`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variables (if needed):
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. **SAVE** your frontend URL: `https://inboxpilot.vercel.app`

---

## Part 3: Configure OAuth Redirect URLs

### Update Google OAuth Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client
3. Add Authorized Redirect URIs:
   ```
   https://your-backend.onrender.com/api/oauth/gmail/callback/
   https://inboxpilot.vercel.app/oauth/callback
   ```

### Update Azure Portal (Outlook)

1. Go to https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
2. Select your app registration
3. Go to **Authentication** → **Platform configurations** → **Web**
4. Add Redirect URIs:
   ```
   https://your-backend.onrender.com/api/oauth/outlook/callback/
   https://inboxpilot.vercel.app/oauth/callback
   ```

---

## Part 4: Update Backend CORS Settings

1. In Render dashboard, update environment variable:

```bash
CORS_ALLOWED_ORIGINS=https://inboxpilot.vercel.app
```

2. Redeploy backend (automatic trigger)

---

## Part 5: Final Configuration

### Update Backend Allowed Hosts

In Render environment variables, update:

```bash
ALLOWED_HOSTS=.onrender.com,.vercel.app
```

### Test Your Deployment

1. Visit: `https://inboxpilot.vercel.app`
2. Test signup/login
3. Test OAuth connections
4. Test AI features

---

## 🎉 Success!

Your InboxPilot is now live at:
- **Frontend:** https://inboxpilot.vercel.app
- **Backend API:** https://inboxpilot-api.onrender.com

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Solution:**
```bash
# In Render, update:
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

### Issue: Database Connection Failed

**Solution:**
- Verify `DATABASE_URL` in Render environment variables
- Check PostgreSQL instance is running

### Issue: OAuth Not Working

**Solution:**
- Verify redirect URIs match exactly
- Check environment variables for OAuth credentials
- Ensure HTTPS is used everywhere

### Issue: Static Files Not Loading

**Solution:**
```bash
# In Render Shell:
python manage.py collectstatic --noinput
```

---

## 💰 Cost (FREE Tier Limits)

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS

**Render:**
- ✅ 750 hours/month (always-on if you have only 1 service)
- ✅ PostgreSQL: 90 days data retention
- ⚠️ Spins down after 15 minutes of inactivity (cold starts ~30 seconds)

---

## 🚀 Custom Domain (Optional)

### Vercel Frontend

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `inboxpilot.com`)
3. Update DNS records as instructed

### Render Backend

1. Go to Render Dashboard → Your Service → Settings → Custom Domain
2. Add your domain (e.g., `api.inboxpilot.com`)
3. Update DNS records as instructed

---

## 📊 Monitoring

- **Vercel:** Analytics dashboard automatically available
- **Render:** Logs available in dashboard under "Logs" tab

---

## 🔄 Continuous Deployment

Both Vercel and Render auto-deploy when you push to `main` branch!

```bash
git add .
git commit -m "Update feature"
git push origin main
```

✅ Vercel auto-deploys frontend  
✅ Render auto-deploys backend

---

## 🎯 Next Steps

1. Set up custom domain
2. Configure email notifications
3. Enable database backups (Render paid plan)
4. Set up monitoring alerts
5. Add rate limiting for API

**Happy Deploying! 🚀**
