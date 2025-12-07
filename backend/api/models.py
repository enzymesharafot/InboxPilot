from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Email(models.Model):
    """Email model for storing email messages"""
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('normal', 'Normal'),
        ('low', 'Low'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emails')
    sender = models.EmailField()
    recipient = models.EmailField()
    cc = models.TextField(blank=True, default='')  # Comma-separated CC recipients
    bcc = models.TextField(blank=True, default='')  # Comma-separated BCC recipients
    subject = models.CharField(max_length=500)
    body = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    is_read = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_trashed = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)  # True for sent emails
    trashed_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)  # When email was received
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'priority']),
            models.Index(fields=['user', 'is_trashed']),
        ]

    def __str__(self):
        return f"{self.subject} - {self.sender}"
    
    def detect_priority(self):
        """Auto-detect email priority based on keywords"""
        urgent_keywords = ['urgent', 'asap', 'important', 'critical', 'emergency', 'immediate']
        subject_lower = self.subject.lower()
        body_lower = self.body.lower()
        
        if any(keyword in subject_lower or keyword in body_lower for keyword in urgent_keywords):
            return 'high'
        return 'normal'


class Label(models.Model):
    """Label/Tag model for organizing emails"""
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='labels')
    color = models.CharField(max_length=7, default='#3b82f6')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'user']

    def __str__(self):
        return self.name


class EmailLabel(models.Model):
    """Many-to-many relationship between emails and labels"""
    email = models.ForeignKey(Email, on_delete=models.CASCADE)
    label = models.ForeignKey(Label, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['email', 'label']


class UserPreference(models.Model):
    """User preferences for UI and notification settings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    profile_picture = models.TextField(blank=True, null=True)  # Store base64 image data
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=50, default='PST', blank=True)
    dark_mode_preference = models.CharField(
        max_length=10, 
        choices=[('auto', 'Auto'), ('manual', 'Manual')], 
        default='auto'
    )
    dark_mode_enabled = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    desktop_notifications = models.BooleanField(default=False)
    weekly_digest = models.BooleanField(default=True)
    auto_archive_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"


class EmailAccount(models.Model):
    """Connected email accounts (Gmail, Outlook, etc.)"""
    PROVIDER_CHOICES = [
        ('gmail', 'Gmail'),
        ('outlook', 'Outlook'),
        ('yahoo', 'Yahoo'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('syncing', 'Syncing'),
        ('error', 'Error'),
        ('disconnected', 'Disconnected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_accounts')
    email_address = models.EmailField()
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_primary = models.BooleanField(default=False)
    access_token = models.TextField(blank=True, null=True)  # Encrypted OAuth token
    refresh_token = models.TextField(blank=True, null=True)  # Encrypted refresh token
    token_expires_at = models.DateTimeField(blank=True, null=True)
    last_sync = models.DateTimeField(blank=True, null=True)
    sync_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'email_address']
        ordering = ['-is_primary', '-created_at']

    def __str__(self):
        return f"{self.email_address} ({self.provider})"

