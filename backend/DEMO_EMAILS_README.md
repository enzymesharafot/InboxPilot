# Demo Email Populator

This Django management command populates your InboxPilot database with awesome, realistic demo emails for demonstration purposes.

## Features

The demo emails include a variety of realistic scenarios:

- **🚨 High Priority Emails**
  - Urgent business meetings
  - Critical client issues
  - Security alerts

- **📧 Normal Priority Emails**
  - Project updates and newsletters
  - Meeting invitations
  - Collaboration requests
  - Team updates
  - Event invitations

- **📬 Low Priority Emails**
  - Social network notifications
  - Promotional offers
  - Order receipts

## Diversity of Content

The demo emails feature:
- Various sending times (from minutes ago to days ago)
- Different read/unread statuses
- Starred and unstarred emails
- Professional formatting with emojis
- Realistic sender email addresses
- Rich email body content with proper formatting

## Usage

To populate your database with demo emails, run:

```bash
# From the backend directory
cd backend

# Activate your virtual environment
source venv/bin/activate

# Run the command
python manage.py populate_demo_emails
```

## What It Does

1. Fetches the first user from the database (or creates a demo user if none exists)
2. Clears any existing emails for that user
3. Creates 12 diverse, realistic demo emails
4. Sets appropriate timestamps, priorities, and read/starred statuses

## Email Categories

The command creates:
- **3 High Priority emails** - Urgent business matters, client issues, security alerts
- **6 Normal Priority emails** - Regular business communications, updates, invitations
- **3 Low Priority emails** - Social notifications, promotional content, receipts

## Notes

- All emails are created with timezone-aware timestamps
- The command is safe to run multiple times (it clears existing emails first)
- Perfect for demos, testing, or development purposes
- Emails include realistic sender addresses and professional formatting

## Example Output

```
Cleared existing emails
Successfully created 12 awesome demo emails!
```

Enjoy your populated inbox! 📬✨
