"""
OAuth2 integration services for Gmail and Outlook
"""
import base64
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from django.conf import settings
from google.oauth2.credentials import Credentials  # type: ignore
from google_auth_oauthlib.flow import Flow  # type: ignore
from googleapiclient.discovery import build  # type: ignore
from googleapiclient.errors import HttpError  # type: ignore
import msal  # type: ignore
import requests  # type: ignore


class GmailOAuthService:
    """Gmail OAuth2 and API service"""
    
    SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
    ]
    
    @staticmethod
    def get_authorization_url(redirect_uri: str) -> Dict[str, str]:
        """
        Generate Gmail OAuth2 authorization URL
        
        Returns:
            dict with 'auth_url' and 'state'
        """
        # Use the provided redirect URI (no longer hardcoded)
        full_redirect_uri = redirect_uri
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GMAIL_CLIENT_ID,
                    "client_secret": settings.GMAIL_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [full_redirect_uri],
                }
            },
            scopes=GmailOAuthService.SCOPES,
            redirect_uri=full_redirect_uri
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='select_account',  # Force account selection - allows choosing specific Gmail
            state='gmail'  # Add state to identify provider
        )
        
        return {
            'auth_url': authorization_url,
            'state': 'gmail'
        }
    
    @staticmethod
    def exchange_code_for_tokens(code: str, redirect_uri: str) -> Dict[str, str]:
        """
        Exchange authorization code for access and refresh tokens
        
        Args:
            code: Authorization code from OAuth callback
            redirect_uri: Must match the one used in authorization
            
        Returns:
            dict with 'access_token', 'refresh_token', 'expires_in', 'email'
        """
        try:
            # Use the provided redirect URI parameter
            full_redirect_uri = redirect_uri
            
            print(f"[Gmail OAuth] Attempting token exchange")
            print(f"[Gmail OAuth] Redirect URI: {full_redirect_uri}")
            print(f"[Gmail OAuth] Client ID: {settings.GMAIL_CLIENT_ID[:20]}...")
            
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": settings.GMAIL_CLIENT_ID,
                        "client_secret": settings.GMAIL_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [full_redirect_uri],
                    }
                },
                scopes=GmailOAuthService.SCOPES,
                redirect_uri=full_redirect_uri
            )
            
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            email = GmailOAuthService._get_user_email(credentials.token)
            print(f"[Gmail OAuth] Successfully authenticated: {email}")
            
            return {
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'expires_in': credentials.expiry.isoformat() if credentials.expiry else None,
                'email': email
            }
        except Exception as e:
            print(f"[Gmail OAuth Error] {type(e).__name__}: {str(e)}")
            raise Exception(f"Failed to exchange authorization code: {str(e)}")
    
    @staticmethod
    def _get_user_email(access_token: str) -> str:
        """Get user's email address from Gmail API"""
        try:
            credentials = Credentials(token=access_token)
            service = build('gmail', 'v1', credentials=credentials)
            profile = service.users().getProfile(userId='me').execute()
            return profile.get('emailAddress', '')
        except Exception:
            return ''
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Dict[str, str]:
        """
        Refresh the access token using refresh token
        
        Args:
            refresh_token: The refresh token
            
        Returns:
            dict with new 'access_token' and 'expires_in'
        """
        credentials = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GMAIL_CLIENT_ID,
            client_secret=settings.GMAIL_CLIENT_SECRET,
        )
        
        from google.auth.transport.requests import Request  # type: ignore
        credentials.refresh(Request())
        
        return {
            'access_token': credentials.token,
            'expires_in': credentials.expiry.isoformat() if credentials.expiry else None,
        }
    
    @staticmethod
    def fetch_emails(access_token: str, max_results: int = 50, page_token: Optional[str] = None) -> Dict:
        """
        Fetch emails from Gmail
        
        Args:
            access_token: Valid access token
            max_results: Maximum number of emails to fetch
            page_token: Token for pagination
            
        Returns:
            dict with 'emails' list and 'next_page_token'
        """
        try:
            credentials = Credentials(token=access_token)
            service = build('gmail', 'v1', credentials=credentials)
            
            # Fetch messages
            results = service.users().messages().list(
                userId='me',
                maxResults=max_results,
                pageToken=page_token
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for message in messages:
                # Get full message details
                msg = service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='full'
                ).execute()
                
                # Parse email data
                email_data = GmailOAuthService._parse_gmail_message(msg)
                emails.append(email_data)
            
            return {
                'emails': emails,
                'next_page_token': results.get('nextPageToken')
            }
            
        except HttpError as error:
            raise Exception(f"Gmail API error: {error}")
    
    @staticmethod
    def _parse_gmail_message(message: Dict) -> Dict:
        """Parse Gmail message into our email format"""
        headers = {header['name']: header['value'] for header in message['payload']['headers']}
        
        # Get body
        body = ''
        if 'parts' in message['payload']:
            for part in message['payload']['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                    break
        elif 'body' in message['payload'] and 'data' in message['payload']['body']:
            body = base64.urlsafe_b64decode(message['payload']['body']['data']).decode('utf-8')
        
        return {
            'external_id': message['id'],
            'subject': headers.get('Subject', '(No Subject)'),
            'sender': headers.get('From', ''),
            'recipient': headers.get('To', ''),
            'body': body,
            'received_at': datetime.fromtimestamp(int(message['internalDate']) / 1000),
            'is_read': 'UNREAD' not in message.get('labelIds', []),
            'is_starred': 'STARRED' in message.get('labelIds', []),
            'raw_data': message
        }


class OutlookOAuthService:
    """Outlook/Microsoft OAuth2 and API service"""
    
    SCOPES = [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Mail.ReadWrite',
        'offline_access',
    ]
    
    @staticmethod
    def get_authorization_url(redirect_uri: str) -> Dict[str, str]:
        """
        Generate Outlook OAuth2 authorization URL
        
        Returns:
            dict with 'auth_url' and 'state'
        """
        msal_app = msal.ConfidentialClientApplication(
            settings.OUTLOOK_CLIENT_ID,
            authority=f"https://login.microsoftonline.com/common",
            client_credential=settings.OUTLOOK_CLIENT_SECRET,
        )
        
        auth_url = msal_app.get_authorization_request_url(
            scopes=OutlookOAuthService.SCOPES,
            redirect_uri=redirect_uri,
            state='outlook_oauth_state',
            prompt='select_account'  # Force account selection - allows choosing specific Outlook account
        )
        
        return {
            'auth_url': auth_url,
            'state': 'outlook_oauth_state'
        }
    
    @staticmethod
    def exchange_code_for_tokens(code: str, redirect_uri: str) -> Dict[str, str]:
        """
        Exchange authorization code for access and refresh tokens
        
        Args:
            code: Authorization code from OAuth callback
            redirect_uri: Must match the one used in authorization
            
        Returns:
            dict with 'access_token', 'refresh_token', 'expires_in'
        """
        msal_app = msal.ConfidentialClientApplication(
            settings.OUTLOOK_CLIENT_ID,
            authority="https://login.microsoftonline.com/common",
            client_credential=settings.OUTLOOK_CLIENT_SECRET,
        )
        
        result = msal_app.acquire_token_by_authorization_code(
            code,
            scopes=OutlookOAuthService.SCOPES,
            redirect_uri=redirect_uri
        )
        
        if "access_token" in result:
            # Get user email
            email = OutlookOAuthService._get_user_email(result['access_token'])
            
            return {
                'access_token': result['access_token'],
                'refresh_token': result.get('refresh_token', ''),
                'expires_in': (datetime.now() + timedelta(seconds=result['expires_in'])).isoformat(),
                'email': email
            }
        else:
            raise Exception(f"Failed to get token: {result.get('error_description', 'Unknown error')}")
    
    @staticmethod
    def _get_user_email(access_token: str) -> str:
        """Get user's email address from Microsoft Graph API"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get('https://graph.microsoft.com/v1.0/me', headers=headers)
            if response.status_code == 200:
                return response.json().get('mail', '') or response.json().get('userPrincipalName', '')
            return ''
        except Exception:
            return ''
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Dict[str, str]:
        """
        Refresh the access token using refresh token
        
        Args:
            refresh_token: The refresh token
            
        Returns:
            dict with new 'access_token' and 'expires_in'
        """
        msal_app = msal.ConfidentialClientApplication(
            settings.OUTLOOK_CLIENT_ID,
            authority="https://login.microsoftonline.com/common",
            client_credential=settings.OUTLOOK_CLIENT_SECRET,
        )
        
        result = msal_app.acquire_token_by_refresh_token(
            refresh_token,
            scopes=OutlookOAuthService.SCOPES
        )
        
        if "access_token" in result:
            return {
                'access_token': result['access_token'],
                'expires_in': (datetime.now() + timedelta(seconds=result['expires_in'])).isoformat(),
            }
        else:
            raise Exception(f"Failed to refresh token: {result.get('error_description', 'Unknown error')}")
    
    @staticmethod
    def fetch_emails(access_token: str, max_results: int = 50, skip: int = 0) -> Dict:
        """
        Fetch emails from Outlook
        
        Args:
            access_token: Valid access token
            max_results: Maximum number of emails to fetch
            skip: Number of emails to skip (pagination)
            
        Returns:
            dict with 'emails' list and 'next_skip'
        """
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            url = f'https://graph.microsoft.com/v1.0/me/messages?$top={max_results}&$skip={skip}&$orderby=receivedDateTime DESC'
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            messages = data.get('value', [])
            
            emails = [OutlookOAuthService._parse_outlook_message(msg) for msg in messages]
            
            return {
                'emails': emails,
                'next_skip': skip + len(messages) if len(messages) == max_results else None
            }
            
        except requests.exceptions.RequestException as error:
            raise Exception(f"Outlook API error: {error}")
    
    @staticmethod
    def _parse_outlook_message(message: Dict) -> Dict:
        """Parse Outlook message into our email format"""
        return {
            'external_id': message['id'],
            'subject': message.get('subject', '(No Subject)'),
            'sender': message.get('from', {}).get('emailAddress', {}).get('address', ''),
            'recipient': ', '.join([r['emailAddress']['address'] for r in message.get('toRecipients', [])]),
            'body': message.get('body', {}).get('content', ''),
            'received_at': datetime.fromisoformat(message['receivedDateTime'].replace('Z', '+00:00')),
            'is_read': message.get('isRead', False),
            'is_starred': message.get('flag', {}).get('flagStatus') == 'flagged',
            'raw_data': message
        }
