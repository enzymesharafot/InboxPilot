"""
Social Authentication views for Gmail OAuth
Handles login/signup via Google OAuth without requiring prior authentication
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.conf import settings
from .oauth_services import GmailOAuthService


@api_view(['GET'])
@permission_classes([AllowAny])  # Override default authentication requirement
def gmail_social_authorize(request):
    """
    Step 1: Get Gmail OAuth authorization URL for social login
    
    PUBLIC endpoint (no authentication required)
    Returns the URL to redirect user to Google's consent screen
    """
    try:
        # Redirect URI for social auth callback
        redirect_uri = f"{settings.FRONTEND_URL}/auth/callback/gmail"
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
@permission_classes([AllowAny])  # Override default authentication requirement
def gmail_social_callback(request):
    """
    Step 2: Handle Gmail OAuth callback for social login
    
    PUBLIC endpoint (no authentication required)
    
    - Creates new user if email doesn't exist
    - Logs in existing user
    - Returns JWT tokens for authentication
    
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
        
        # Redirect URI must match the one used in authorize
        redirect_uri = f"{settings.FRONTEND_URL}/auth/callback/gmail"
        
        # Exchange code for tokens and get user info
        tokens = GmailOAuthService.exchange_code_for_tokens(code, redirect_uri)
        
        email = tokens.get('email')
        if not email:
            return Response(
                {'error': 'Failed to get email from Google'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or get user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],  # Use email prefix as username
                'first_name': tokens.get('given_name', ''),
                'last_name': tokens.get('family_name', ''),
            }
        )
        
        # If user exists but username is different, we still log them in
        # But we don't update their existing username
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'created': created,  # True if new user was created
            'message': 'Account created successfully' if created else 'Login successful'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
