# 🚀 Quick Deployment Checklist

Follow this checklist to deploy InboxPilot in 30 minutes!

## ☑️ Pre-Deployment

- [ ] GitHub repository is up to date
- [ ] Have Gemini API key ready
- [ ] Have OAuth credentials (Google & Azure) ready
- [ ] Signed up for Vercel account
- [ ] Signed up for Render account

---

## 🗄️ Backend Deployment (Render) - 15 minutes

### Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Database is running (green status)

### Web Service Setup
- [ ] Create Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Configure Build Command: `./build.sh`
- [ ] Configure Start Command: `gunicorn backend.wsgi:application`
- [ ] Add all environment variables from `.env.production.example`
- [ ] Link PostgreSQL database
- [ ] Deploy and wait for completion
- [ ] Save backend URL: `https://_________.onrender.com`

### Post-Deployment
- [ ] Open Render Shell
- [ ] Run: `python manage.py createsuperuser`
- [ ] Run: `python manage.py populate_demo_emails`
- [ ] Test backend API: `https://your-backend.onrender.com/api/`

---

## 🎨 Frontend Deployment (Vercel) - 10 minutes

### Pre-deployment Update
- [ ] Update `frontend/src/utils/api.js` with production backend URL
- [ ] Commit and push changes to GitHub

### Vercel Setup
- [ ] Import GitHub repository on Vercel
- [ ] Set Root Directory to `frontend`
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Deploy and wait for completion
- [ ] Save frontend URL: `https://_________.vercel.app`

---

## 🔐 OAuth Configuration - 5 minutes

### Google OAuth
- [ ] Go to Google Cloud Console
- [ ] Add redirect URI: `https://your-backend.onrender.com/api/oauth/gmail/callback/`
- [ ] Add redirect URI: `https://your-frontend.vercel.app/oauth/callback`
- [ ] Save changes

### Azure OAuth (Outlook)
- [ ] Go to Azure Portal
- [ ] Add redirect URI: `https://your-backend.onrender.com/api/oauth/outlook/callback/`
- [ ] Add redirect URI: `https://your-frontend.vercel.app/oauth/callback`
- [ ] Save changes

---

## ⚙️ Final Configuration

### Update Backend Environment
- [ ] Update `CORS_ALLOWED_ORIGINS` with Vercel frontend URL
- [ ] Update `ALLOWED_HOSTS` to include both Render and Vercel domains
- [ ] Trigger redeploy on Render

### Test Everything
- [ ] Visit frontend URL
- [ ] Test user signup/login
- [ ] Test Gmail OAuth connection
- [ ] Test Outlook OAuth connection
- [ ] Test AI Summarize feature
- [ ] Test AI Reply feature
- [ ] Test email sending

---

## 🎉 Success!

Your app is live at:
- **Frontend**: https://_________.vercel.app
- **Backend**: https://_________.onrender.com

---

## 📝 Notes

**Backend Cold Starts**: Render free tier spins down after 15 min inactivity (~30s to wake up)

**Database Retention**: Free PostgreSQL keeps data for 90 days

**Auto-Deploy**: Both Vercel and Render auto-deploy on `git push`

---

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Backend Logs: https://dashboard.render.com/select/[your-service]/logs
- Frontend Logs: https://vercel.com/[your-app]/deployments

---

## 🆘 Need Help?

Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting!
