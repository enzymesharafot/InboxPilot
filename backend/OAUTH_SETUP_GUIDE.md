# OAuth Integration Guide

## Overview
InboxPilot supports syncing emails from Gmail and Outlook/Microsoft accounts using OAuth2 authentication.

## Table of Contents
1. [Gmail OAuth Setup](#gmail-oauth-setup)
2. [Outlook OAuth Setup](#outlook-oauth-setup)
3. [API Endpoints](#api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Email Syncing](#email-syncing)

---

## Gmail OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it (e.g., "InboxPilot")

### Step 2: Enable Gmail API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click **Enable**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for testing) or **Internal** (for organization)
   - App name: InboxPilot
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add `gmail.readonly`, `gmail.send`, `gmail.modify`
   - Test users: Add your Gmail address (for testing)

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: InboxPilot Web Client
   - Authorized redirect URIs:
     - `http://localhost:5173` (development - just base URL, no path!)
     - `https://yourdomain.com` (production - just base URL, no path!)
   - **Note**: Google doesn't allow paths in redirect URIs, use only the base domain

5. Copy the **Client ID** and **Client Secret**

### Step 4: Add to Environment Variables

Add to `backend/.env`:
```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
```

---

## Outlook OAuth Setup

### Step 1: Register Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - Name: InboxPilot
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: 
     - Platform: **Web**
     - URI: `http://localhost:5173/oauth/outlook/callback`

### Step 2: Add API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**
3. Add these permissions:
   - `Mail.Read`
   - `Mail.Send`
   - `Mail.ReadWrite`
   - `offline_access` (to get refresh tokens)
4. Click **Grant admin consent** (if you have admin rights)

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: InboxPilot Backend
4. Expiry: Choose duration (24 months recommended)
5. Click **Add**
6. **Copy the secret value immediately** (you won't be able to see it again)

### Step 4: Get Application (Client) ID

1. Go to **Overview**
2. Copy the **Application (client) ID**

### Step 5: Add to Environment Variables

Add to `backend/.env`:
```env
OUTLOOK_CLIENT_ID=your-application-client-id
OUTLOOK_CLIENT_SECRET=your-client-secret-value
```

---

## API Endpoints

### Gmail Endpoints

#### 1. Get Authorization URL
```http
GET /api/oauth/gmail/authorize/
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/auth?...",
  "provider": "gmail"
}
```

#### 2. Complete Authorization (Exchange Code for Tokens)
```http
POST /api/oauth/gmail/callback/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "authorization_code_from_google"
}
```

**Response:**
```json
{
  "message": "Gmail account connected successfully",
  "email": "user@gmail.com",
  "account_id": 1
}
```

### Outlook Endpoints

#### 1. Get Authorization URL
```http
GET /api/oauth/outlook/authorize/
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...",
  "provider": "outlook"
}
```

#### 2. Complete Authorization
```http
POST /api/oauth/outlook/callback/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "authorization_code_from_microsoft"
}
```

**Response:**
```json
{
  "message": "Outlook account connected successfully",
  "email": "user@outlook.com",
  "account_id": 2
}
```

### Sync Endpoints

#### Sync Emails from Account
```http
POST /api/oauth/sync/{account_id}/
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Emails synced successfully",
  "emails_synced": 25,
  "total_emails": 50
}
```

#### Disconnect Account
```http
DELETE /api/oauth/disconnect/{account_id}/
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Email account disconnected successfully"
}
```

---

## Frontend Integration

### React Example

```jsx
import { useState } from 'react';
import axios from 'axios';

function ConnectEmailAccount() {
  const [loading, setLoading] = useState(false);
  
  const connectGmail = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get authorization URL
      const response = await axios.get(
        'http://localhost:8000/api/oauth/gmail/authorize/',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      
      // Step 2: Redirect to Google's consent screen
      window.location.href = response.data.auth_url;
      
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      setLoading(false);
    }
  };
  
  const connectOutlook = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get authorization URL
      const response = await axios.get(
        'http://localhost:8000/api/oauth/outlook/authorize/',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      
      // Step 2: Redirect to Microsoft's consent screen
      window.location.href = response.data.auth_url;
      
    } catch (error) {
      console.error('Error connecting Outlook:', error);
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={connectGmail} disabled={loading}>
        Connect Gmail
      </button>
      <button onClick={connectOutlook} disabled={loading}>
        Connect Outlook
      </button>
    </div>
  );
}

export default ConnectEmailAccount;
```

### OAuth Callback Handler

Create pages for handling OAuth callbacks:

**`/oauth/gmail/callback`**
```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GmailCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        alert('Authorization failed');
        navigate('/dashboard');
        return;
      }
      
      try {
        // Exchange code for tokens
        const response = await axios.post(
          'http://localhost:8000/api/oauth/gmail/callback/',
          { code },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        alert(response.data.message);
        navigate('/dashboard');
        
      } catch (error) {
        console.error('Error completing Gmail authorization:', error);
        alert('Failed to connect Gmail account');
        navigate('/dashboard');
      }
    };
    
    handleCallback();
  }, [navigate]);
  
  return <div>Connecting Gmail account...</div>;
}

export default GmailCallback;
```

**`/oauth/outlook/callback`**
```jsx
// Similar to Gmail callback, but for Outlook
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OutlookCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        alert('Authorization failed');
        navigate('/dashboard');
        return;
      }
      
      try {
        const response = await axios.post(
          'http://localhost:8000/api/oauth/outlook/callback/',
          { code },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        alert(response.data.message);
        navigate('/dashboard');
        
      } catch (error) {
        console.error('Error completing Outlook authorization:', error);
        alert('Failed to connect Outlook account');
        navigate('/dashboard');
      }
    };
    
    handleCallback();
  }, [navigate]);
  
  return <div>Connecting Outlook account...</div>;
}

export default OutlookCallback;
```

### Sync Emails Example

```jsx
const syncEmails = async (accountId) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/oauth/sync/${accountId}/`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      }
    );
    
    alert(`Synced ${response.data.emails_synced} new emails`);
    // Refresh email list
    
  } catch (error) {
    console.error('Error syncing emails:', error);
    alert('Failed to sync emails');
  }
};
```

---

## Email Syncing

### Automatic Syncing (Future Feature)

You can set up a cron job or Celery task to automatically sync emails:

```python
# backend/api/tasks.py (with Celery)
from celery import shared_task
from .models import EmailAccount
from .oauth_services import GmailOAuthService, OutlookOAuthService

@shared_task
def sync_all_active_accounts():
    """Sync emails from all active email accounts"""
    accounts = EmailAccount.objects.filter(
        is_active=True,
        sync_enabled=True
    )
    
    for account in accounts:
        try:
            if account.provider == 'gmail':
                GmailOAuthService.fetch_emails(account.access_token)
            else:
                OutlookOAuthService.fetch_emails(account.access_token)
        except Exception as e:
            print(f"Error syncing account {account.id}: {e}")
```

### Manual Sync

Users can manually trigger sync using the API endpoint:
```http
POST /api/oauth/sync/{account_id}/
```

---

## Security Considerations

1. **Token Storage**: Tokens are encrypted in the database
2. **HTTPS Only**: In production, use HTTPS for all OAuth redirects
3. **Token Refresh**: Access tokens are automatically refreshed when expired
4. **Privacy**: Each user can only access their own connected accounts
5. **Scopes**: Only request necessary Gmail/Outlook permissions

---

## Troubleshooting

### Gmail Issues

**Error: "Access blocked: This app's request is invalid"**
- Make sure you've enabled Gmail API
- Verify redirect URI matches exactly (including http/https)
- Check that the OAuth consent screen is configured

**Error: "invalid_grant"**
- The authorization code has expired or been used
- User needs to re-authorize

### Outlook Issues

**Error: "AADSTS50011: The reply URL specified in the request does not match"**
- Verify the redirect URI in Azure Portal matches exactly
- Check both development and production URLs

**Error: "insufficient privileges"**
- Make sure you've added the required API permissions
- Grant admin consent if needed

---

## Production Deployment

1. Update redirect URIs in Google Cloud Console and Azure Portal
2. Use environment variables for all credentials
3. Enable HTTPS
4. Set `FRONTEND_URL` to your production domain
5. Consider implementing rate limiting
6. Set up monitoring for OAuth failures

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify your OAuth credentials are correct
3. Ensure redirect URIs match exactly
4. Check API responses for detailed error messages
