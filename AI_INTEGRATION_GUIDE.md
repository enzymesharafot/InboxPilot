# 🤖 Gemini AI Integration Guide

## Overview
InboxPilot now includes Google Gemini AI integration for three powerful features:
1. **Email Priority Detection** - Automatically classify emails as high, normal, or low priority
2. **AI Email Summarizer** - Generate intelligent summaries with key points and action items
3. **AI Reply Writer** - Generate context-aware email replies with customizable tone

---

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key (it starts with `AIza...`)

---

## ⚙️ Setup Instructions

### 1. Add API Key to Backend

Add the following line to your `/backend/.env` file:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Example:**
```bash
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Install Dependencies

The `google-generativeai` package is already added to `requirements.txt`.

**If using Docker:** The package will be installed automatically when you rebuild:
```bash
docker-compose down
docker-compose up --build
```

**If running locally:** Install in your virtual environment:
```bash
cd backend
source venv/bin/activate  # or your virtual environment
pip install -r requirements.txt
```

### 3. Restart Backend Server

After adding the API key, restart your backend:
```bash
# If using Docker:
docker-compose restart backend

# If running locally:
cd backend
python manage.py runserver
```

---

## 📚 API Endpoints

### 1. Detect Email Priority
**Endpoint:** `POST /api/ai/detect-priority/`

**Request Body:**
```json
{
  "subject": "Urgent: Server Down",
  "body": "Our production server is currently experiencing issues...",
  "sender": "admin@company.com"
}
```

**Response:**
```json
{
  "priority": "high",
  "message": "Email priority detected as high"
}
```

### 2. Summarize Email
**Endpoint:** `POST /api/ai/summarize/`

**Request Body (Option 1 - Using email_id):**
```json
{
  "email_id": 123
}
```

**Request Body (Option 2 - Using raw data):**
```json
{
  "subject": "Q4 Project Update",
  "body": "Here's a detailed update on our Q4 projects...",
  "sender": "manager@company.com"
}
```

**Response:**
```json
{
  "summary": {
    "summary": "Brief overview of the email content...",
    "key_points": [
      "First important point",
      "Second important point"
    ],
    "action_items": [
      "Task 1 to complete",
      "Task 2 to complete"
    ]
  },
  "message": "Email summarized successfully"
}
```

### 3. Generate Email Reply
**Endpoint:** `POST /api/ai/generate-reply/`

**Request Body:**
```json
{
  "subject": "Meeting Request",
  "body": "Can we schedule a meeting to discuss the project?",
  "sender": "colleague@company.com",
  "tone": "professional",
  "context": "I am available next week"
}
```

**Available tones:** `professional`, `friendly`, `formal`, `casual`

**Response:**
```json
{
  "reply": {
    "subject": "Re: Meeting Request",
    "body": "Thank you for reaching out. I would be happy to discuss..."
  },
  "message": "Reply generated successfully"
}
```

### 4. Batch Analyze Priorities
**Endpoint:** `POST /api/ai/batch-analyze/`

**Request Body:**
```json
{
  "emails": [
    {
      "id": 1,
      "subject": "Urgent: Server Issue",
      "body": "Server is down...",
      "sender": "admin@company.com"
    },
    {
      "id": 2,
      "subject": "Team Lunch",
      "body": "Anyone interested in lunch?",
      "sender": "colleague@company.com"
    }
  ]
}
```

**Response:**
```json
{
  "emails": [
    {
      "id": 1,
      "subject": "Urgent: Server Issue",
      "body": "Server is down...",
      "sender": "admin@company.com",
      "ai_priority": "high"
    },
    {
      "id": 2,
      "subject": "Team Lunch",
      "body": "Anyone interested in lunch?",
      "sender": "colleague@company.com",
      "ai_priority": "low"
    }
  ],
  "message": "Analyzed 2 emails"
}
```

---

## 🎨 Frontend Integration

### Import AI Service
```javascript
import { aiService } from '../utils/api';
```

### Example: Summarize Email
```javascript
const handleSummarize = async (email) => {
  try {
    const response = await aiService.summarizeEmail({
      subject: email.subject,
      body: email.body,
      sender: email.sender
    });
    
    console.log(response.summary);
    // Display summary to user
  } catch (error) {
    console.error('Summarization failed:', error);
  }
};
```

### Example: Generate Reply
```javascript
const handleGenerateReply = async (email, tone = 'professional') => {
  try {
    const response = await aiService.generateReply({
      subject: email.subject,
      body: email.body,
      sender: email.sender,
      tone: tone,
      context: 'Additional context about the situation'
    });
    
    console.log(response.reply);
    // Pre-fill compose form with generated reply
  } catch (error) {
    console.error('Reply generation failed:', error);
  }
};
```

### Example: Detect Priority
```javascript
const handleDetectPriority = async (email) => {
  try {
    const response = await aiService.detectPriority({
      subject: email.subject,
      body: email.body,
      sender: email.sender
    });
    
    return response.priority; // 'high', 'normal', or 'low'
  } catch (error) {
    console.error('Priority detection failed:', error);
    return 'normal'; // fallback
  }
};
```

---

## 🧪 Testing

### 1. Test Priority Detection
```bash
curl -X POST http://localhost:8000/api/ai/detect-priority/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "URGENT: Critical Bug",
    "body": "We need to fix this immediately",
    "sender": "dev@company.com"
  }'
```

### 2. Test Email Summarization
```bash
curl -X POST http://localhost:8000/api/ai/summarize/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Quarterly Report",
    "body": "Here is our detailed quarterly performance report...",
    "sender": "cfo@company.com"
  }'
```

### 3. Test Reply Generation
```bash
curl -X POST http://localhost:8000/api/ai/generate-reply/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Meeting Request",
    "body": "Can we meet tomorrow?",
    "sender": "colleague@company.com",
    "tone": "friendly",
    "context": "I am available after 2pm"
  }'
```

---

## 🔒 Security Notes

- ✅ All AI endpoints require JWT authentication
- ✅ API key is stored securely in `.env` file (never commit this!)
- ✅ Error messages don't expose sensitive information
- ✅ Failed AI requests fall back to default values

---

## 🐛 Troubleshooting

### Error: "API key not configured"
**Solution:** Make sure you've added `GEMINI_API_KEY` to your `.env` file and restarted the backend server.

### Error: "Please login first"
**Solution:** Ensure you're sending the JWT token in the Authorization header:
```javascript
Authorization: Bearer YOUR_JWT_TOKEN
```

### Error: Module 'google.generativeai' not found
**Solution:** Install the package:
```bash
pip install google-generativeai==0.3.2
```

### AI responses are slow
**Note:** Gemini API calls typically take 2-5 seconds. Consider:
- Adding loading indicators in the UI
- Using batch analysis for multiple emails
- Caching results when appropriate

---

## 📈 Usage Tips

### 1. Priority Detection
- Best used on inbox load to automatically classify all emails
- Run batch analysis to process multiple emails efficiently
- Update email models to store AI-detected priority

### 2. Summarization
- Ideal for long emails (>200 words)
- Displays key points in email preview
- Helps users quickly triage their inbox

### 3. Reply Generation
- Use different tones based on sender relationship
- Add context to make replies more specific
- Users should review and edit before sending

---

## 🎯 Next Steps

1. ✅ Add `GEMINI_API_KEY` to `/backend/.env`
2. ✅ Restart backend server
3. ✅ Test API endpoints with curl or Postman
4. 🔄 Update Dashboard.jsx to use real AI instead of mocks
5. 🔄 Add loading states and error handling in UI
6. 🔄 Implement batch priority analysis on inbox load

---

## 📖 Resources

- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get API keys
- [Gemini API Documentation](https://ai.google.dev/docs) - Official docs
- [InboxPilot API Docs](./backend/API_DOCUMENTATION.md) - Our API reference

---

**Happy Coding! 🚀**
