# 📧 Gmail & Outlook Integration - Quick Start

## ✅ What's Been Implemented

### Backend Files Created/Modified:
1. **`api/oauth_services.py`** - OAuth2 services for Gmail and Outlook
   - `GmailOAuthService` - Handle Gmail authentication and email fetching
   - `OutlookOAuthService` - Handle Outlook authentication and email fetching

2. **`api/oauth_views.py`** - API endpoints for OAuth flow
   - Gmail authorize & callback
   - Outlook authorize & callback
   - Email syncing
   - Account disconnection

3. **`api/urls.py`** - New OAuth routes added
4. **`inboxpilot/settings.py`** - OAuth credentials configuration
5. **`requirements.txt`** - Added OAuth packages
6. **`.env.example`** - OAuth credentials template
7. **`OAUTH_SETUP_GUIDE.md`** - Complete setup documentation

### Packages Installed:
- ✅ google-auth
- ✅ google-auth-oauthlib
- ✅ google-auth-httplib2
- ✅ google-api-python-client
- ✅ msal (Microsoft Authentication Library)
- ✅ requests

## 🚀 How to Use

### Step 1: Get OAuth Credentials

#### For Gmail:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Gmail API
3. Create OAuth credentials
4. Add redirect URI: `http://localhost:5173` (just the base URL, no path!)

#### For Outlook:
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register app in Azure AD
3. Add API permissions (Mail.Read, Mail.Send, Mail.ReadWrite, offline_access)
4. Add redirect URI: `http://localhost:5173/oauth/outlook/callback`

### Step 2: Configure Backend

Add to `backend/.env`:
```env
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret

OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret

FRONTEND_URL=http://localhost:5173
```

### Step 3: API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oauth/gmail/authorize/` | GET | Get Gmail auth URL |
| `/api/oauth/gmail/callback/` | POST | Complete Gmail auth |
| `/api/oauth/outlook/authorize/` | GET | Get Outlook auth URL |
| `/api/oauth/outlook/callback/` | POST | Complete Outlook auth |
| `/api/oauth/sync/{account_id}/` | POST | Sync emails |
| `/api/oauth/disconnect/{account_id}/` | DELETE | Disconnect account |

## 💡 Frontend Integration Flow

### 1. User Clicks "Connect Gmail"
```jsx
const connectGmail = async () => {
  const response = await axios.get(
    'http://localhost:8000/api/oauth/gmail/authorize/',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  // Redirect to Google
  window.location.href = response.data.auth_url;
};
```

### 2. Google Redirects Back to Your App
User lands on: `http://localhost:5173/oauth/gmail/callback?code=xxx`

### 3. Exchange Code for Tokens
```jsx
// In /oauth/gmail/callback page
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

await axios.post(
  'http://localhost:8000/api/oauth/gmail/callback/',
  { code },
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### 4. Sync Emails
```jsx
await axios.post(
  `http://localhost:8000/api/oauth/sync/${accountId}/`,
  {},
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

## 📋 What Happens Automatically

1. **Token Refresh** - Access tokens are automatically refreshed when expired
2. **Email Parsing** - Gmail/Outlook emails are converted to unified format
3. **Duplicate Prevention** - Same email won't be synced twice (using external_id)
4. **Privacy** - Each user can only access their own connected accounts
5. **Encryption** - Tokens are stored encrypted in database

## 📁 Database Fields Used

The `EmailAccount` model stores:
- `email_address` - User's Gmail/Outlook email
- `provider` - "gmail" or "outlook"
- `access_token` - OAuth access token (encrypted)
- `refresh_token` - OAuth refresh token (encrypted)
- `token_expires_at` - When access token expires
- `is_active` - Account status
- `sync_enabled` - Auto-sync enabled/disabled
- `last_synced_at` - Last sync timestamp

The `Email` model gets populated with:
- `external_id` - Gmail/Outlook message ID
- `subject`, `sender`, `recipient`, `body`
- `received_at` - When email was received
- `is_read`, `is_starred` - Email status
- `email_account` - Link to connected account

## 🔐 Security Features

- ✅ JWT authentication required for all endpoints
- ✅ User isolation (can't access other users' accounts)
- ✅ Tokens encrypted in database
- ✅ HTTPS recommended for production
- ✅ OAuth state parameter for CSRF protection
- ✅ Minimal scopes requested

## 📖 Next Steps

1. **Test with your own accounts**:
   - Get Gmail/Outlook OAuth credentials
   - Add them to `.env`
   - Test the OAuth flow

2. **Build Frontend UI**:
   - Add "Connect Gmail" and "Connect Outlook" buttons
   - Create callback pages for OAuth
   - Show connected accounts list
   - Add sync button for each account

3. **Optional Enhancements**:
   - Auto-sync on schedule (use Celery)
   - Webhook notifications (Gmail push notifications)
   - Two-way sync (send emails)
   - Label/folder syncing

## 🆘 Need Help?

See `OAUTH_SETUP_GUIDE.md` for:
- Detailed step-by-step setup
- Frontend code examples
- Troubleshooting guide
- Production deployment tips

## 🎯 Quick Test Command

After setup, test the health endpoint:
```bash
curl http://localhost:8000/api/health/
```

Then test OAuth flow from your frontend!
