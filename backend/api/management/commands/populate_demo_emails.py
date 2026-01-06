from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import Email
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Populates the database with awesome demo emails for demonstration'

    def handle(self, *args, **kwargs):
        # Get the first user or create a demo user
        try:
            user = User.objects.first()
            if not user:
                user = User.objects.create_user(
                    username='demo',
                    email='demo@example.com',
                    password='demo123'
                )
                self.stdout.write(self.style.SUCCESS('Created demo user'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error getting user: {e}'))
            return

        # Clear existing emails for this user (optional)
        Email.objects.filter(user=user).delete()
        self.stdout.write(self.style.WARNING('Cleared existing emails'))

        # Awesome demo emails with various scenarios
        demo_emails = [
            # High Priority - Urgent Business
            {
                'sender': 'ceo@techcorp.com',
                'recipient': user.email,
                'subject': '🚨 URGENT: Board Meeting Tomorrow - Preparation Required',
                'body': '''Hi Team,

We have an emergency board meeting scheduled for tomorrow at 9 AM. Please prepare the following:

1. Q4 Financial Reports
2. Product Roadmap Updates
3. Customer Acquisition Metrics
4. Competitive Analysis

This is CRITICAL for our funding round. Please prioritize this above all else.

Best regards,
Sarah Johnson
CEO, TechCorp''',
                'priority': 'high',
                'is_read': False,
                'is_starred': True,
                'received_at': timezone.now() - timedelta(hours=2)
            },
            
            # High Priority - Client Issue
            {
                'sender': 'support@megaclient.com',
                'recipient': user.email,
                'subject': 'RE: Production Issue - Service Down for 2000+ Users',
                'body': '''Hello,

We're experiencing a critical service outage affecting over 2000 of our enterprise users. The payment processing module has been down for the past 45 minutes.

Error Details:
- Error Code: 503 Service Unavailable
- Affected Module: Payment Gateway
- Time Started: 3:15 PM EST
- Impact: HIGH - Revenue generating functionality

We need immediate assistance to resolve this ASAP. Our SLA requires 99.9% uptime.

Please escalate to your senior engineering team.

Thanks,
Michael Chen
CTO, MegaClient Inc.''',
                'priority': 'high',
                'is_read': False,
                'is_starred': True,
                'received_at': timezone.now() - timedelta(minutes=45)
            },

            # Normal Priority - Project Update
            {
                'sender': 'jessica.martinez@designstudio.com',
                'recipient': user.email,
                'subject': '✨ New Website Design Mockups Ready for Review',
                'body': '''Hey there!

I'm excited to share the latest website redesign mockups with you! We've incorporated all the feedback from last week's meeting.

🎨 What's New:
• Modern, minimalist homepage layout
• Improved mobile responsiveness
• Enhanced color scheme with brand colors
• Interactive product showcase
• Streamlined checkout process

Please review at your convenience and let me know your thoughts. The design files are in the shared Figma workspace.

Looking forward to your feedback!

Cheers,
Jessica Martinez
Lead Designer, DesignStudio''',
                'priority': 'normal',
                'is_read': False,
                'is_starred': False,
                'received_at': timezone.now() - timedelta(hours=5)
            },

            # Normal Priority - Newsletter
            {
                'sender': 'newsletter@techinsights.com',
                'recipient': user.email,
                'subject': '📰 This Week in Tech: AI Breakthroughs & Startup News',
                'body': '''Welcome to This Week in Tech! 🚀

TOP STORIES:
━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI Revolution
Google announces breakthrough in quantum computing that could revolutionize AI training times by 1000x.

💰 Funding News
• FinTech startup SecurePay raises $150M Series C
• HealthTech company MediConnect acquires competitor for $2.3B
• Climate startup GreenEnergy secures $80M from top VCs

🔧 Developer Tools
New release: React 19 brings revolutionary server components and improved performance.

📈 Market Insights
Tech stocks surge as AI adoption accelerates across industries.

Read more at techinsights.com

Best regards,
TechInsights Team''',
                'priority': 'normal',
                'is_read': True,
                'is_starred': False,
                'received_at': timezone.now() - timedelta(days=1)
            },

            # Normal Priority - Meeting Invitation
            {
                'sender': 'david.park@innovation-labs.com',
                'recipient': user.email,
                'subject': '📅 Invitation: Product Strategy Planning Session - Next Week',
                'body': '''Hi there,

I'd like to invite you to our Product Strategy Planning Session for Q1 2024.

📆 Meeting Details:
• Date: Monday, January 15th
• Time: 2:00 PM - 4:00 PM EST
• Location: Conference Room B / Zoom (hybrid)
• Attendees: Product Team, Engineering Leads, Marketing

📋 Agenda:
1. Review Q4 Performance
2. Customer Feedback Analysis  
3. Feature Prioritization for Q1
4. Resource Allocation
5. Launch Timeline

Please confirm your attendance and review the attached pre-read materials before the meeting.

Best,
David Park
VP of Product, Innovation Labs''',
                'priority': 'normal',
                'is_read': False,
                'is_starred': True,
                'received_at': timezone.now() - timedelta(hours=8)
            },

            # Low Priority - Social Update
            {
                'sender': 'linkedin@notifications.linkedin.com',
                'recipient': user.email,
                'subject': '👥 You have 12 new connection requests',
                'body': '''Hi there,

Your network is growing! You have 12 new connection requests waiting for you.

Recent requests from:
• Emily Watson - Senior Software Engineer at Meta
• Robert Kim - Product Manager at Amazon
• Lisa Anderson - UX Designer at Apple
• James Brown - Tech Recruiter at Google
...and 8 more

View all connection requests: linkedin.com/mynetwork

Your profile also appeared in 45 searches this week!

Keep building your professional network.

The LinkedIn Team''',
                'priority': 'low',
                'is_read': True,
                'is_starred': False,
                'received_at': timezone.now() - timedelta(days=2)
            },

            # Low Priority - Promotional
            {
                'sender': 'deals@cloudservices.com',
                'recipient': user.email,
                'subject': '☁️ Special Offer: 50% OFF Cloud Storage - Limited Time!',
                'body': '''Don't Miss Out! 🎉

Get 50% OFF on all Cloud Storage plans for the next 48 hours!

💎 Premium Plans:
• Basic (100 GB) - $4.99/mo → $2.49/mo
• Pro (1 TB) - $9.99/mo → $4.99/mo  
• Enterprise (10 TB) - $49.99/mo → $24.99/mo

✨ Features:
✓ Military-grade encryption
✓ 99.99% uptime SLA
✓ 24/7 customer support
✓ Automatic backups
✓ File versioning
✓ Team collaboration tools

This exclusive offer expires in 48 hours. Upgrade now!

[CLAIM YOUR DISCOUNT]

Questions? Contact us at support@cloudservices.com

CloudServices Team''',
                'priority': 'low',
                'is_read': False,
                'is_starred': False,
                'received_at': timezone.now() - timedelta(hours=12)
            },

            # Normal Priority - Collaboration Request
            {
                'sender': 'amanda.foster@startupaccel.com',
                'recipient': user.email,
                'subject': '🤝 Partnership Opportunity: Co-hosting Tech Conference 2024',
                'body': '''Hello!

I hope this email finds you well. I'm reaching out to explore a potential partnership opportunity.

StartupAccel is organizing the Silicon Valley Tech Conference 2024, and we'd love to have your company as a co-host sponsor.

Event Overview:
• Date: March 15-17, 2024
• Expected Attendees: 5,000+ tech professionals
• Focus: AI, Web3, Future of Work
• Venue: San Francisco Convention Center

Partnership Benefits:
• Speaking slot at main stage
• Exhibition booth in premium location
• Logo placement on all marketing materials
• Access to investor networking sessions
• Post-event attendee data

Would you be interested in a call next week to discuss this further?

Best regards,
Amanda Foster
Partnership Director
StartupAccel''',
                'priority': 'normal',
                'is_read': False,
                'is_starred': False,
                'received_at': timezone.now() - timedelta(hours=20)
            },

            # Normal Priority - Team Update
            {
                'sender': 'alex.wong@yourcompany.com',
                'recipient': user.email,
                'subject': '🎯 Weekly Sprint Summary - Great Progress This Week!',
                'body': '''Hey Team! 

Another productive week in the books! Here's our sprint summary:

✅ COMPLETED:
• User authentication overhaul (finally!)
• Mobile app dark mode implementation
• API performance optimization (40% faster!)
• Bug fixes for payment processing

🚧 IN PROGRESS:
• Dashboard redesign (80% complete)
• Email notification system
• Advanced analytics module

📊 Metrics:
• Sprint Velocity: 85 story points
• Bugs Fixed: 23
• Code Review Turnaround: 4.2 hours avg
• Test Coverage: 87% (+3% from last week)

🎉 Shoutout to Sarah for the amazing work on the authentication system!

Next Week Focus:
• Launch dashboard redesign
• Complete email notifications
• Begin work on admin panel

Have a great weekend everyone! 🚀

Alex Wong
Engineering Manager''',
                'priority': 'normal',
                'is_read': True,
                'is_starred': True,
                'received_at': timezone.now() - timedelta(days=3)
            },

            # High Priority - Security Alert
            {
                'sender': 'security@yourcompany.com',
                'recipient': user.email,
                'subject': '🔒 SECURITY ALERT: Unusual Login Activity Detected',
                'body': '''ATTENTION REQUIRED

We detected unusual login activity on your account:

Login Details:
• Time: Today at 11:32 PM EST
• Location: Moscow, Russia
• Device: Windows PC, Chrome Browser
• IP Address: 185.220.101.XXX

Was this you? If you recognize this activity, you can safely ignore this email.

If this wasn't you, please take immediate action:
1. Change your password immediately
2. Review your recent account activity
3. Enable two-factor authentication
4. Check for any unauthorized changes

[SECURE MY ACCOUNT NOW]

For help, contact our security team at security@yourcompany.com

Stay safe,
Security Team''',
                'priority': 'high',
                'is_read': False,
                'is_starred': True,
                'received_at': timezone.now() - timedelta(minutes=15)
            },

            # Normal Priority - Event Invitation
            {
                'sender': 'events@techcommunity.org',
                'recipient': user.email,
                'subject': '🎤 You\'re Invited: Future of AI - Expert Panel Discussion',
                'body': '''Greetings!

You're cordially invited to our exclusive panel discussion on "The Future of AI in Business."

Event Details:
━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: Thursday, January 18th
⏰ Time: 6:00 PM - 8:30 PM
📍 Location: Tech Hub Downtown + Virtual Option
🎟️ FREE for community members

Featured Speakers:
• Dr. Sarah Chen - AI Research Lead, Stanford
• Marcus Thompson - VP of AI, Microsoft
• Priya Patel - Founder, AI Ethics Institute
• James Liu - CTO, TechInnovate

Topics:
• Generative AI in enterprise
• Ethical considerations in AI development
• Future job market and AI
• Practical AI implementation strategies

RSVP by January 10th (limited seats!)

[REGISTER NOW]

Light refreshments will be served.

Looking forward to seeing you there!

TechCommunity Events Team''',
                'priority': 'normal',
                'is_read': False,
                'is_starred': False,
                'received_at': timezone.now() - timedelta(hours=15)
            },

            # Low Priority - Receipt
            {
                'sender': 'receipts@amazon.com',
                'recipient': user.email,
                'subject': '📦 Your Amazon Order Has Been Delivered',
                'body': '''Hello,

Great news! Your package has been delivered.

Order #: 123-4567890-1234567
Delivered: Today at 2:45 PM
Location: Front porch

Items in this shipment:
• Logitech MX Master 3 Wireless Mouse (1x)
• USB-C Hub, 7-in-1 Adapter (1x)

Total: $129.98

Package was left at your front door. Photo confirmation available in your Amazon account.

How was your delivery? [Rate This Delivery]

Need to return something? You have until February 15th for free returns.

Thanks for shopping with Amazon!

Amazon Customer Service''',
                'priority': 'low',
                'is_read': True,
                'is_starred': False,
                'received_at': timezone.now() - timedelta(hours=4)
            },
        ]

        # Create the emails
        created_count = 0
        for email_data in demo_emails:
            try:
                Email.objects.create(
                    user=user,
                    **email_data
                )
                created_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating email: {e}'))

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} awesome demo emails!'
            )
        )
