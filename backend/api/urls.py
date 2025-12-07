from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmailViewSet, LabelViewSet, UserPreferenceViewSet, 
    EmailAccountViewSet, health_check, register, get_current_user, update_profile_picture
)
from .oauth_views import (
    gmail_authorize, gmail_callback,
    outlook_authorize, outlook_callback,
    sync_emails, disconnect_account
)
from .ai_views import (
    detect_email_priority, summarize_email,
    generate_reply, batch_analyze_priorities
)

router = DefaultRouter()
router.register(r'emails', EmailViewSet, basename='email')
router.register(r'labels', LabelViewSet, basename='label')
router.register(r'preferences', UserPreferenceViewSet, basename='preference')
router.register(r'accounts', EmailAccountViewSet, basename='account')

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/register/', register, name='register'),
    path('auth/me/', get_current_user, name='current_user'),
    path('auth/profile-picture/', update_profile_picture, name='update_profile_picture'),
    
    # OAuth endpoints
    path('oauth/gmail/authorize/', gmail_authorize, name='gmail_authorize'),
    path('oauth/gmail/callback/', gmail_callback, name='gmail_callback'),
    path('oauth/outlook/authorize/', outlook_authorize, name='outlook_authorize'),
    path('oauth/outlook/callback/', outlook_callback, name='outlook_callback'),
    path('oauth/sync/<int:account_id>/', sync_emails, name='sync_emails'),
    path('oauth/disconnect/<int:account_id>/', disconnect_account, name='disconnect_account'),
    
    # AI endpoints
    path('ai/detect-priority/', detect_email_priority, name='detect_priority'),
    path('ai/summarize/', summarize_email, name='summarize_email'),
    path('ai/generate-reply/', generate_reply, name='generate_reply'),
    path('ai/batch-analyze/', batch_analyze_priorities, name='batch_analyze'),
    
    path('', include(router.urls)),
]
