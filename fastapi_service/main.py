from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

app = FastAPI(
    title="InboxPilot FastAPI Service",
    description="High-performance email processing service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class EmailAnalysis(BaseModel):
    email_id: int
    sentiment: str
    priority: str
    category: str
    keywords: List[str]
    analyzed_at: datetime


class EmailProcessRequest(BaseModel):
    sender: EmailStr
    subject: str
    body: str


# Routes
@app.get("/")
async def root():
    return {
        "message": "InboxPilot FastAPI Service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "FastAPI service is running"
    }


@app.post("/analyze-email", response_model=EmailAnalysis)
async def analyze_email(email: EmailProcessRequest):
    """
    Analyze email for sentiment, priority, and category
    This is a mock implementation - replace with actual ML/AI logic
    """
    # Mock analysis logic
    analysis = EmailAnalysis(
        email_id=1,
        sentiment="neutral",
        priority="medium",
        category="general",
        keywords=["email", "inbox"],
        analyzed_at=datetime.now()
    )
    return analysis


@app.get("/statistics")
async def get_statistics():
    """
    Get email statistics
    """
    return {
        "total_emails": 0,
        "unread_emails": 0,
        "starred_emails": 0,
        "spam_emails": 0
    }
