from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth.models import User
from .models import Email, Label, UserPreference, EmailAccount
from .serializers import (
    EmailSerializer, LabelSerializer, UserPreferenceSerializer,
    EmailAccountSerializer, UserSerializer, UserRegistrationSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])  # Public endpoint
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'Django API is running'
    })


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow registration without auth
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'PUT'])
def get_current_user(request):
    """Get or update current authenticated user's information"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    # Handle PATCH/PUT for updating user profile
    serializer = UserSerializer(request.user, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'DELETE'])
def update_profile_picture(request):
    """Update or remove profile picture"""
    try:
        preferences = request.user.preferences
    except UserPreference.DoesNotExist:
        preferences = UserPreference.objects.create(user=request.user)
    
    if request.method == 'POST':
        profile_picture = request.data.get('profile_picture')
        if not profile_picture:
            return Response({'error': 'No profile picture provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate base64 image (optional, basic check)
        if not profile_picture.startswith('data:image/'):
            return Response({'error': 'Invalid image format'}, status=status.HTTP_400_BAD_REQUEST)
        
        preferences.profile_picture = profile_picture
        preferences.save()
        
        return Response({
            'message': 'Profile picture updated successfully',
            'profile_picture': profile_picture
        })
    
    elif request.method == 'DELETE':
        preferences.profile_picture = None
        preferences.save()
        return Response({'message': 'Profile picture removed successfully'})


class EmailViewSet(viewsets.ModelViewSet):
    """ViewSet for Email CRUD operations"""
    queryset = Email.objects.all()
    serializer_class = EmailSerializer

    def get_queryset(self):
        """PRIVACY: Users can ONLY see their own emails"""
        # Short-circuit for Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Email.objects.none()
        
        if not self.request.user.is_authenticated:
            return Email.objects.none()
            
        queryset = Email.objects.filter(user=self.request.user)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by archived status
        is_archived = self.request.query_params.get('is_archived', None)
        if is_archived is not None:
            queryset = queryset.filter(is_archived=is_archived.lower() == 'true')
        
        # Filter by trashed status
        is_trashed = self.request.query_params.get('is_trashed', None)
        if is_trashed is not None:
            queryset = queryset.filter(is_trashed=is_trashed.lower() == 'true')
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by starred
        is_starred = self.request.query_params.get('is_starred', None)
        if is_starred is not None:
            queryset = queryset.filter(is_starred=is_starred.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        """Auto-assign current user and detect priority on email creation"""
        email = serializer.save(user=self.request.user)
        if not email.priority or email.priority == 'normal':
            email.priority = email.detect_priority()
            email.save()
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive an email"""
        email = self.get_object()
        email.is_archived = True
        email.is_trashed = False
        email.save()
        return Response({
            'message': 'Email archived successfully',
            'email': EmailSerializer(email).data
        })
    
    @action(detail=True, methods=['post'])
    def trash(self, request, pk=None):
        """Move email to trash"""
        email = self.get_object()
        email.is_trashed = True
        email.is_archived = False
        email.trashed_at = timezone.now()
        email.save()
        return Response({
            'message': 'Email moved to trash',
            'email': EmailSerializer(email).data
        })
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore email from archive or trash"""
        email = self.get_object()
        email.is_archived = False
        email.is_trashed = False
        email.trashed_at = None
        email.save()
        return Response({
            'message': 'Email restored successfully',
            'email': EmailSerializer(email).data
        })
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """Permanently delete email"""
        email = self.get_object()
        email.delete()
        return Response({
            'message': 'Email permanently deleted'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def star(self, request, pk=None):
        """Toggle star status"""
        email = self.get_object()
        email.is_starred = not email.is_starred
        email.save()
        return Response({
            'message': f"Email {'starred' if email.is_starred else 'unstarred'}",
            'email': EmailSerializer(email).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark email as read"""
        email = self.get_object()
        email.is_read = True
        email.save()
        return Response({
            'message': 'Email marked as read',
            'email': EmailSerializer(email).data
        })
    
    @action(detail=False, methods=['post'])
    def send(self, request):
        """
        Send a new email
        POST /api/emails/send/
        Body: {
            "to": "recipient@email.com",
            "cc": "cc@email.com",  // optional
            "bcc": "bcc@email.com",  // optional
            "subject": "Email subject",
            "body": "Email body",
            "priority": "normal"  // optional: high, normal, low
        }
        """
        try:
            to = request.data.get('to')
            cc = request.data.get('cc', '')
            bcc = request.data.get('bcc', '')
            subject = request.data.get('subject')
            body = request.data.get('body')
            priority = request.data.get('priority', 'normal')
            
            if not to or not subject or not body:
                return Response(
                    {'error': 'To, subject, and body are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create email record in database (as sent item)
            email = Email.objects.create(
                user=request.user,
                sender=request.user.email or request.user.username,
                recipient=to,
                cc=cc,
                bcc=bcc,
                subject=subject,
                body=body,
                priority=priority,
                is_read=True,  # Sent emails are marked as read
                is_sent=True,  # Mark as sent
                received_at=timezone.now()
            )
            
            # TODO: Integrate with actual email sending service (Gmail API, Outlook API, etc.)
            # For now, we just store it in the database
            
            return Response({
                'message': f'Email sent successfully to {to}',
                'email': EmailSerializer(email).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LabelViewSet(viewsets.ModelViewSet):
    """ViewSet for Label CRUD operations"""
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    
    def get_queryset(self):
        """PRIVACY: Users can ONLY see their own labels"""
        # Short-circuit for Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Label.objects.none()
        
        if not self.request.user.is_authenticated:
            return Label.objects.none()
        return Label.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Auto-assign current user to label"""
        serializer.save(user=self.request.user)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for User Preferences"""
    queryset = UserPreference.objects.all()
    serializer_class = UserPreferenceSerializer
    
    def get_queryset(self):
        """PRIVACY: Users can ONLY see their own preferences"""
        # Short-circuit for Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return UserPreference.objects.none()
        
        if not self.request.user.is_authenticated:
            return UserPreference.objects.none()
        return UserPreference.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Get current user's preferences"""
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        preferences, created = UserPreference.objects.get_or_create(user=request.user)
        return Response(UserPreferenceSerializer(preferences).data)
    
    @action(detail=False, methods=['patch'])
    def update_preferences(self, request):
        """Update current user's preferences"""
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        preferences, created = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Preferences updated successfully',
                'preferences': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for Email Account Management"""
    queryset = EmailAccount.objects.all()
    serializer_class = EmailAccountSerializer
    
    def get_queryset(self):
        """Filter accounts by current user"""
        # Short-circuit for Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return EmailAccount.objects.none()
        
        if not self.request.user.is_authenticated:
            return EmailAccount.objects.none()
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Auto-assign user on account creation"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Trigger email sync for this account"""
        account = self.get_object()
        account.status = 'syncing'
        account.save()
        
        # TODO: Implement actual email sync logic
        # This would integrate with Gmail/Outlook APIs
        
        account.last_sync = timezone.now()
        account.status = 'active'
        account.save()
        
        return Response({
            'message': 'Sync started successfully',
            'account': EmailAccountSerializer(account).data
        })
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set this account as primary"""
        account = self.get_object()
        
        # Remove primary from all other accounts
        EmailAccount.objects.filter(user=request.user).update(is_primary=False)
        
        # Set this as primary
        account.is_primary = True
        account.save()
        
        return Response({
            'message': 'Primary account updated',
            'account': EmailAccountSerializer(account).data
        })

