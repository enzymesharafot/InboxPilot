"""
OAuth2 views for Gmail and Outlook integration
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from .oauth_services import GmailOAuthService, OutlookOAuthService
from .models import EmailAccount, Email


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gmail_authorize(request):
    """
    Step 1: Get Gmail OAuth authorization URL
    
    Returns the URL to redirect user to Google's consent screen
    """
    try:
        # Use just the base frontend URL (no path) - Google requirement
        redirect_uri = settings.FRONTEND_URL
        result = GmailOAuthService.get_authorization_url(redirect_uri)
        
        return Response({
            'auth_url': result['auth_url'],
            'provider': 'gmail',
            'state': result['state']
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def gmail_callback(request):
    """
    Step 2: Handle Gmail OAuth callback
    
    Exchange authorization code for tokens and save email account
    
    Expected POST data:
    {
        "code": "authorization_code_from_google"
    }
    """
    try:
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use just the base frontend URL (no path) - Google requirement
        redirect_uri = settings.FRONTEND_URL
        
        # Log for debugging
        print(f"[OAuth Debug] Exchanging code with redirect_uri: {redirect_uri}")
        print(f"[OAuth Debug] Code starts with: {code[:20]}...")
        
        tokens = GmailOAuthService.exchange_code_for_tokens(code, redirect_uri)
        
        # Parse the expiry time and make it timezone-aware
        token_expiry = None
        if tokens.get('expires_in'):
            token_expiry = parse_datetime(tokens['expires_in'])
            if token_expiry and timezone.is_naive(token_expiry):
                token_expiry = timezone.make_aware(token_expiry)
        
        # Create or update email account
        email_account, created = EmailAccount.objects.update_or_create(
            user=request.user,
            email_address=tokens['email'],
            provider='gmail',
            defaults={
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'token_expires_at': token_expiry,
                'status': 'active',
                'sync_enabled': True,
            }
        )
        
        return Response({
            'message': 'Gmail account connected successfully',
            'email': tokens['email'],
            'account_id': email_account.id
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def outlook_authorize(request):
    """
    Step 1: Get Outlook OAuth authorization URL
    
    Returns the URL to redirect user to Microsoft's consent screen
    """
    try:
        # Outlook allows full redirect URI with path
        redirect_uri = f"{settings.FRONTEND_URL}/oauth/outlook/callback"
        result = OutlookOAuthService.get_authorization_url(redirect_uri)
        
        return Response({
            'auth_url': result['auth_url'],
            'provider': 'outlook',
            'state': result['state']
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def outlook_callback(request):
    """
    Step 2: Handle Outlook OAuth callback
    
    Exchange authorization code for tokens and save email account
    
    Expected POST data:
    {
        "code": "authorization_code_from_microsoft"
    }
    """
    try:
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        redirect_uri = f"{settings.FRONTEND_URL}/oauth/outlook/callback"
        tokens = OutlookOAuthService.exchange_code_for_tokens(code, redirect_uri)
        
        # Parse the expiry time and make it timezone-aware
        token_expiry = None
        if tokens.get('expires_in'):
            token_expiry = parse_datetime(tokens['expires_in'])
            if token_expiry and timezone.is_naive(token_expiry):
                token_expiry = timezone.make_aware(token_expiry)
        
        # Create or update email account
        email_account, created = EmailAccount.objects.update_or_create(
            user=request.user,
            email_address=tokens['email'],
            provider='outlook',
            defaults={
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'token_expires_at': token_expiry,
                'status': 'active',
                'sync_enabled': True,
            }
        )
        
        return Response({
            'message': 'Outlook account connected successfully',
            'email': tokens['email'],
            'account_id': email_account.id
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_emails(request, account_id):
    """
    Manually sync emails from a connected account
    
    URL: POST /api/oauth/sync/{account_id}/
    """
    try:
        # Get the email account
        try:
            email_account = EmailAccount.objects.get(
                id=account_id,
                user=request.user
            )
        except EmailAccount.DoesNotExist:
            return Response(
                {'error': 'Email account not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not email_account.is_active:
            return Response(
                {'error': 'Email account is inactive'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if token needs refresh
        if email_account.token_expires_at and timezone.now() >= timezone.datetime.fromisoformat(email_account.token_expires_at):
            # Refresh token
            if email_account.provider == 'gmail':
                new_tokens = GmailOAuthService.refresh_access_token(email_account.refresh_token)
            else:  # outlook
                new_tokens = OutlookOAuthService.refresh_access_token(email_account.refresh_token)
            
            email_account.access_token = new_tokens['access_token']
            email_account.token_expires_at = new_tokens['expires_in']
            email_account.save()
        
        # Fetch emails
        if email_account.provider == 'gmail':
            result = GmailOAuthService.fetch_emails(email_account.access_token)
        else:  # outlook
            result = OutlookOAuthService.fetch_emails(email_account.access_token)
        
        # Save emails to database
        emails_created = 0
        for email_data in result['emails']:
            # Check if email already exists
            if not Email.objects.filter(
                user=request.user,
                external_id=email_data['external_id']
            ).exists():
                Email.objects.create(
                    user=request.user,
                    email_account=email_account,
                    external_id=email_data['external_id'],
                    subject=email_data['subject'],
                    sender=email_data['sender'],
                    recipient=email_data['recipient'],
                    body=email_data['body'],
                    received_at=email_data['received_at'],
                    is_read=email_data['is_read'],
                    is_starred=email_data['is_starred'],
                )
                emails_created += 1
        
        # Update last sync time
        email_account.last_synced_at = timezone.now()
        email_account.save()
        
        return Response({
            'message': 'Emails synced successfully',
            'emails_synced': emails_created,
            'total_emails': len(result['emails'])
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disconnect_account(request, account_id):
    """
    Disconnect an email account
    
    URL: DELETE /api/oauth/disconnect/{account_id}/
    """
    try:
        email_account = EmailAccount.objects.get(
            id=account_id,
            user=request.user
        )
        
        email_account.is_active = False
        email_account.sync_enabled = False
        email_account.save()
        
        return Response({
            'message': 'Email account disconnected successfully'
        })
        
    except EmailAccount.DoesNotExist:
        return Response(
            {'error': 'Email account not found'},
            status=status.HTTP_404_NOT_FOUND
        )
