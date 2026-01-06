#!/bin/bash

# Gmail OAuth Credentials Verification Script
# This script helps verify your Google OAuth setup

echo "=========================================="
echo "Gmail OAuth Credentials Verification"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    exit 1
fi

echo "📋 Current Configuration:"
echo "-------------------------"
echo "CLIENT_ID: ${GMAIL_CLIENT_ID:0:30}..."
echo "CLIENT_SECRET: ${GMAIL_CLIENT_SECRET:0:15}..."
echo "FRONTEND_URL: $FRONTEND_URL"
echo ""

echo "🔍 Verifying OAuth Client..."
echo "-------------------------"

# Test if the client ID is valid by making a request to Google's discovery endpoint
CLIENT_ID_CHECK=$(curl -s "https://oauth2.googleapis.com/tokeninfo?client_id=$GMAIL_CLIENT_ID")

if echo "$CLIENT_ID_CHECK" | grep -q "error"; then
    echo "❌ CLIENT_ID appears to be invalid or disabled"
    echo ""
    echo "Response from Google:"
    echo "$CLIENT_ID_CHECK" | python3 -m json.tool 2>/dev/null || echo "$CLIENT_ID_CHECK"
else
    echo "✅ CLIENT_ID format appears valid"
fi

echo ""
echo "=========================================="
echo "Action Required:"
echo "=========================================="
echo ""
echo "The 'invalid_client' error means your OAuth credentials"
echo "are not recognized by Google. This happens when:"
echo ""
echo "1. ❌ CLIENT_ID or CLIENT_SECRET are incorrect"
echo "2. ❌ OAuth client was deleted in Google Console"
echo "3. ❌ Credentials are from a different project"
echo "4. ❌ OAuth client is disabled"
echo ""
echo "=========================================="
echo "How to Fix:"
echo "=========================================="
echo ""
echo "Step 1: Go to Google Cloud Console"
echo "   → https://console.cloud.google.com/"
echo ""
echo "Step 2: Navigate to Credentials"
echo "   → APIs & Services → Credentials"
echo ""
echo "Step 3: Check if your OAuth 2.0 Client exists"
echo "   → Look for Client ID starting with: ${GMAIL_CLIENT_ID:0:20}..."
echo ""
echo "Step 4: If it doesn't exist, CREATE NEW:"
echo "   → Click '+ CREATE CREDENTIALS'"
echo "   → Select 'OAuth 2.0 Client ID'"
echo "   → Application type: Web application"
echo "   → Name: InboxPilot"
echo "   → Authorized redirect URIs:"
echo "      http://localhost:5173/oauth/gmail/callback"
echo "   → Click 'CREATE'"
echo ""
echo "Step 5: Copy NEW credentials to .env file:"
echo "   GMAIL_CLIENT_ID=YOUR_NEW_CLIENT_ID"
echo "   GMAIL_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET"
echo ""
echo "Step 6: Restart the application"
echo "   cd /media/inzamul-sharafot/Data/InboxPilot"
echo "   ./stop-all.sh && ./start-all.sh"
echo ""
echo "=========================================="
echo "Need to create OAuth Client? Here's what you need:"
echo "=========================================="
echo ""
echo "Application Type: Web application"
echo "Name: InboxPilot"
echo "Authorized JavaScript origins:"
echo "   http://localhost:5173"
echo ""
echo "Authorized redirect URIs:"
echo "   http://localhost:5173/oauth/gmail/callback"
echo ""
echo "Required APIs to Enable:"
echo "   - Gmail API"
echo "   - Google+ API (optional)"
echo ""
echo "=========================================="
