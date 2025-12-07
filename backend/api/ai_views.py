"""
API Views for Gemini AI Features
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .gemini_service import get_gemini_service
from .models import Email


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_email_priority(request):
    """
    Detect email priority using Gemini AI
    
    POST /api/ai/detect-priority/
    Body: {
        "subject": "Email subject",
        "body": "Email body",
        "sender": "sender@email.com"
    }
    """
    try:
        subject = request.data.get('subject', '')
        body = request.data.get('body', '')
        sender = request.data.get('sender', '')
        
        if not subject and not body:
            return Response(
                {'error': 'Subject or body is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gemini = get_gemini_service()
        priority = gemini.detect_email_priority(subject, body, sender)
        
        return Response({
            'priority': priority,
            'message': f'Email priority detected as {priority}'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def summarize_email(request):
    """
    Generate AI summary of email
    
    POST /api/ai/summarize/
    Body: {
        "email_id": 123,  // Optional: if summarizing saved email
        "subject": "Email subject",  // Required if no email_id
        "body": "Email body",  // Required if no email_id
        "sender": "sender@email.com"
    }
    """
    try:
        email_id = request.data.get('email_id')
        
        # If email_id provided, fetch from database
        if email_id:
            try:
                email = Email.objects.get(id=email_id, user=request.user)
                subject = email.subject
                body = email.body
                sender = email.sender
            except Email.DoesNotExist:
                return Response(
                    {'error': 'Email not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Use provided data
            subject = request.data.get('subject', '')
            body = request.data.get('body', '')
            sender = request.data.get('sender', '')
            
            if not body:
                return Response(
                    {'error': 'Email body is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        gemini = get_gemini_service()
        summary = gemini.summarize_email(subject, body, sender)
        
        return Response({
            'summary': summary,
            'message': 'Email summarized successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_reply(request):
    """
    Generate AI reply to email
    
    POST /api/ai/generate-reply/
    Body: {
        "email_id": 123,  // Optional: if replying to saved email
        "subject": "Original subject",  // Required if no email_id
        "body": "Original body",  // Required if no email_id
        "sender": "sender@email.com",
        "tone": "professional",  // professional, friendly, formal, casual
        "context": "Additional context for reply"
    }
    """
    try:
        email_id = request.data.get('email_id')
        
        # If email_id provided, fetch from database
        if email_id:
            try:
                email = Email.objects.get(id=email_id, user=request.user)
                subject = email.subject
                body = email.body
                sender = email.sender
            except Email.DoesNotExist:
                return Response(
                    {'error': 'Email not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Use provided data
            subject = request.data.get('subject', '')
            body = request.data.get('body', '')
            sender = request.data.get('sender', '')
            
            if not body:
                return Response(
                    {'error': 'Original email body is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        tone = request.data.get('tone', 'professional')
        context = request.data.get('context', '')
        
        gemini = get_gemini_service()
        reply = gemini.generate_email_reply(
            original_subject=subject,
            original_body=body,
            original_sender=sender,
            reply_tone=tone,
            context=context
        )
        
        return Response({
            'reply': reply,
            'message': 'Reply generated successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def batch_analyze_priorities(request):
    """
    Analyze multiple emails for priority in batch
    
    POST /api/ai/batch-analyze/
    Body: {
        "emails": [
            {"id": 1, "subject": "...", "body": "...", "sender": "..."},
            {"id": 2, "subject": "...", "body": "...", "sender": "..."}
        ]
    }
    """
    try:
        emails = request.data.get('emails', [])
        
        if not emails:
            return Response(
                {'error': 'No emails provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gemini = get_gemini_service()
        analyzed = gemini.batch_analyze_emails(emails)
        
        return Response({
            'emails': analyzed,
            'message': f'Analyzed {len(analyzed)} emails'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
