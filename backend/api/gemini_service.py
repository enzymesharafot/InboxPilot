"""
Google Gemini AI Integration Service
Provides email priority detection, summarization, and reply generation
"""
import google.generativeai as genai
from django.conf import settings
from typing import Dict, Optional


class GeminiAIService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini with API key from settings"""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured in settings")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Use gemini-2.0-flash - confirmed available model
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    def detect_email_priority(self, subject: str, body: str, sender: str = "") -> str:
        """
        Analyze email and detect priority level using AI
        
        Args:
            subject: Email subject line
            body: Email body content
            sender: Sender email/name (optional)
            
        Returns:
            Priority level: 'high', 'normal', or 'low'
        """
        prompt = f"""Analyze the following email and determine its priority level.
Consider urgency indicators, deadlines, importance keywords, tone, and context.

Sender: {sender}
Subject: {subject}
Body: {body[:1000]}  # Limit to first 1000 chars for efficiency

Priority Criteria:
- HIGH: Urgent requests, deadlines within 24-48 hours, critical issues, important stakeholders, words like "urgent", "asap", "critical", "emergency"
- NORMAL: Regular business correspondence, questions, updates, standard requests
- LOW: Newsletters, promotional emails, FYI messages, non-urgent updates

Respond with ONLY one word: high, normal, or low"""

        try:
            response = self.model.generate_content(prompt)
            priority = response.text.strip().lower()
            
            # Validate response
            if priority in ['high', 'normal', 'low']:
                return priority
            else:
                return 'normal'  # Default fallback
                
        except Exception as e:
            print(f"Gemini priority detection error: {e}")
            return 'normal'  # Fallback to normal on error
    
    def summarize_email(self, subject: str, body: str, sender: str = "") -> Dict[str, str]:
        """
        Generate an intelligent summary of email content
        
        Args:
            subject: Email subject line
            body: Email body content
            sender: Sender email/name (optional)
            
        Returns:
            Dictionary with summary, key_points, and action_items
        """
        prompt = f"""Analyze this email and provide a comprehensive summary.

From: {sender}
Subject: {subject}
Body: {body}

Provide:
1. A concise 2-3 sentence summary
2. Key points (bullet list)
3. Action items or next steps (if any)

Format your response as:
SUMMARY: [your summary here]
KEY_POINTS:
• [point 1]
• [point 2]
• [point 3]
ACTION_ITEMS:
• [action 1]
• [action 2]
(or "None" if no actions needed)"""

        try:
            response = self.model.generate_content(prompt)
            result = response.text.strip()
            
            # Parse the response
            summary_dict = {
                'full_summary': result,
                'sender': sender,
                'subject': subject
            }
            
            # Extract sections
            if 'SUMMARY:' in result:
                summary_part = result.split('KEY_POINTS:')[0].replace('SUMMARY:', '').strip()
                summary_dict['summary'] = summary_part
            
            if 'KEY_POINTS:' in result and 'ACTION_ITEMS:' in result:
                key_points = result.split('KEY_POINTS:')[1].split('ACTION_ITEMS:')[0].strip()
                summary_dict['key_points'] = key_points
                
                action_items = result.split('ACTION_ITEMS:')[1].strip()
                summary_dict['action_items'] = action_items if action_items.lower() != 'none' else 'No action required'
            
            return summary_dict
            
        except Exception as e:
            print(f"Gemini summarization error: {e}")
            return {
                'summary': f"Failed to generate summary: {str(e)}",
                'key_points': 'Unable to extract key points',
                'action_items': 'Unable to determine actions',
                'full_summary': f"Error: {str(e)}"
            }
    
    def generate_email_reply(
        self, 
        original_subject: str, 
        original_body: str, 
        original_sender: str = "",
        reply_tone: str = "professional",
        context: str = ""
    ) -> Dict[str, str]:
        """
        Generate an intelligent, contextual email reply
        
        Args:
            original_subject: Subject of email being replied to
            original_body: Body of original email
            original_sender: Original sender name/email
            reply_tone: Tone of reply (professional, friendly, formal, casual)
            context: Additional context or instructions for the reply
            
        Returns:
            Dictionary with suggested_subject and reply_body
        """
        tone_instructions = {
            'professional': 'professional and courteous',
            'friendly': 'warm and friendly while remaining professional',
            'formal': 'formal and respectful',
            'casual': 'casual and conversational'
        }
        
        tone_desc = tone_instructions.get(reply_tone, 'professional and courteous')
        
        prompt = f"""Generate a {tone_desc} reply to the following email.

Original Email:
From: {original_sender}
Subject: {original_subject}
Body: {original_body}

{f"Additional Context: {context}" if context else ""}

Generate a complete email reply that:
1. Acknowledges the original email
2. Addresses the key points or questions
3. Is {tone_desc}
4. Includes appropriate greeting and closing
5. Is concise but complete (2-4 paragraphs)

Format:
SUBJECT: [suggested reply subject]
BODY:
[complete email reply with greeting, body, and closing]"""

        try:
            response = self.model.generate_content(prompt)
            result = response.text.strip()
            
            # Parse response
            reply_dict = {}
            
            if 'SUBJECT:' in result and 'BODY:' in result:
                subject_part = result.split('BODY:')[0].replace('SUBJECT:', '').strip()
                body_part = result.split('BODY:')[1].strip()
                
                reply_dict['subject'] = subject_part
                reply_dict['body'] = body_part
            else:
                # Fallback if format not followed
                reply_dict['subject'] = f"Re: {original_subject}"
                reply_dict['body'] = result
            
            return reply_dict
            
        except Exception as e:
            print(f"Gemini reply generation error: {e}")
            return {
                'subject': f"Re: {original_subject}",
                'body': f"Error generating reply: {str(e)}\n\nPlease compose your reply manually."
            }
    
    def batch_analyze_emails(self, emails: list) -> list:
        """
        Analyze multiple emails for priority in batch
        
        Args:
            emails: List of email dicts with 'subject', 'body', 'sender'
            
        Returns:
            List of emails with added 'ai_priority' field
        """
        analyzed_emails = []
        
        for email in emails:
            try:
                priority = self.detect_email_priority(
                    subject=email.get('subject', ''),
                    body=email.get('body', ''),
                    sender=email.get('sender', '')
                )
                email['ai_priority'] = priority
                analyzed_emails.append(email)
            except Exception as e:
                print(f"Error analyzing email {email.get('id', 'unknown')}: {e}")
                email['ai_priority'] = 'normal'
                analyzed_emails.append(email)
        
        return analyzed_emails


# Singleton instance
_gemini_service = None

def get_gemini_service() -> GeminiAIService:
    """Get or create singleton Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiAIService()
    return _gemini_service
