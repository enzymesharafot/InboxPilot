"""
Test cases for InboxPilot API
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from api.models import Email, EmailAccount, UserPreference
import json


class AuthenticationTestCase(APITestCase):
    """Test user authentication endpoints"""
    
    def setUp(self):
        """Set up test client and test user"""
        self.client = Client()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        
    def test_user_registration_success(self):
        """Test successful user registration"""
        payload = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.json())
        print("✅ Test Passed: User registration successful")
        
    def test_user_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='Pass123!'
        )
        payload = {
            'username': 'existinguser',
            'email': 'new@example.com',
            'password': 'NewPass123!'
        }
        response = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        print("✅ Test Passed: Duplicate username rejected")
        
    def test_user_login_valid_credentials(self):
        """Test login with valid credentials"""
        # Create user first
        User.objects.create_user(
            username='loginuser',
            email='login@example.com',
            password='LoginPass123!'
        )
        payload = {
            'username': 'loginuser',
            'password': 'LoginPass123!'
        }
        response = self.client.post(
            self.login_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.json())
        print("✅ Test Passed: User login successful with valid credentials")
        
    def test_user_login_invalid_password(self):
        """Test login with invalid password"""
        User.objects.create_user(
            username='wrongpassuser',
            email='wrong@example.com',
            password='CorrectPass123!'
        )
        payload = {
            'username': 'wrongpassuser',
            'password': 'WrongPassword!'
        }
        response = self.client.post(
            self.login_url,
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        print("✅ Test Passed: Invalid password rejected")


class EmailModelTestCase(TestCase):
    """Test Email model and database operations"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='emailtestuser',
            email='emailtest@example.com',
            password='TestPass123!'
        )
        self.email_account = EmailAccount.objects.create(
            user=self.user,
            email_address='test@gmail.com',
            provider='gmail',
            status='active',
            sync_enabled=True
        )
        
    def test_email_creation(self):
        """Test creating an email entry"""
        email = Email.objects.create(
            user=self.user,
            subject='Test Email Subject',
            body='This is a test email body',
            sender='sender@example.com',
            recipient='recipient@example.com',
            priority='high',
            is_read=False
        )
        self.assertEqual(email.subject, 'Test Email Subject')
        self.assertEqual(email.priority, 'high')
        self.assertFalse(email.is_read)
        print("✅ Test Passed: Email created successfully in database")
        
    def test_email_archive(self):
        """Test archiving an email"""
        email = Email.objects.create(
            user=self.user,
            subject='Archive Test',
            body='Testing archive functionality',
            sender='sender@example.com',
            recipient='recipient@example.com',
            priority='medium'
        )
        email.is_archived = True
        email.save()
        
        archived_email = Email.objects.get(subject='Archive Test')
        self.assertTrue(archived_email.is_archived)
        print("✅ Test Passed: Email archived successfully")
        
    def test_email_priority_classification(self):
        """Test email priority levels"""
        priorities = ['high', 'medium', 'low']
        for priority in priorities:
            email = Email.objects.create(
                user=self.user,
                subject=f'{priority.capitalize()} Priority Email',
                body='Test body',
                sender='sender@example.com',
                recipient='recipient@example.com',
                priority=priority
            )
            self.assertEqual(email.priority, priority)
        print("✅ Test Passed: All priority levels (high, medium, low) working correctly")


class UserPreferenceTestCase(TestCase):
    """Test user preferences and settings"""
    
    def setUp(self):
        """Set up test user"""
        self.user = User.objects.create_user(
            username='prefuser',
            email='pref@example.com',
            password='TestPass123!'
        )
        
    def test_user_preference_creation(self):
        """Test creating user preferences"""
        preference = UserPreference.objects.create(
            user=self.user,
            dark_mode_enabled=True,
            dark_mode_preference='dark',
            email_notifications=True,
            timezone='UTC'
        )
        self.assertTrue(preference.dark_mode_enabled)
        self.assertEqual(preference.timezone, 'UTC')
        print("✅ Test Passed: User preferences created successfully")
        
    def test_dark_mode_toggle(self):
        """Test dark mode preference toggle"""
        preference = UserPreference.objects.create(
            user=self.user,
            dark_mode_enabled=False
        )
        # Toggle dark mode
        preference.dark_mode_enabled = True
        preference.save()
        
        updated_pref = UserPreference.objects.get(user=self.user)
        self.assertTrue(updated_pref.dark_mode_enabled)
        print("✅ Test Passed: Dark mode toggle working correctly")


class EmailOperationsTestCase(TestCase):
    """Test email CRUD operations"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='cruduser',
            email='crud@example.com',
            password='TestPass123!'
        )
        self.email_account = EmailAccount.objects.create(
            user=self.user,
            email_address='crud@gmail.com',
            provider='gmail',
            status='active',
            sync_enabled=True
        )
        
    def test_email_star_unstar(self):
        """Test starring and unstarring emails"""
        email = Email.objects.create(
            user=self.user,
            subject='Star Test Email',
            body='Testing star functionality',
            sender='sender@example.com',
            recipient='recipient@example.com',
            is_starred=False
        )
        
        # Star the email
        email.is_starred = True
        email.save()
        self.assertTrue(Email.objects.get(subject='Star Test Email').is_starred)
        
        # Unstar the email
        email.is_starred = False
        email.save()
        self.assertFalse(Email.objects.get(subject='Star Test Email').is_starred)
        print("✅ Test Passed: Star/Unstar functionality working correctly")
        
    def test_email_delete_restore(self):
        """Test deleting and restoring emails"""
        email = Email.objects.create(
            user=self.user,
            subject='Delete Test Email',
            body='Testing delete functionality',
            sender='sender@example.com',
            recipient='recipient@example.com',
            is_trashed=False
        )
        
        # Delete email
        email.is_trashed = True
        email.save()
        self.assertTrue(Email.objects.get(subject='Delete Test Email').is_trashed)
        
        # Restore email
        email.is_trashed = False
        email.save()
        self.assertFalse(Email.objects.get(subject='Delete Test Email').is_trashed)
        print("✅ Test Passed: Delete/Restore functionality working correctly")
        
    def test_email_filtering_by_priority(self):
        """Test filtering emails by priority"""
        # Create emails with different priorities
        Email.objects.create(
            user=self.user,
            subject='High Priority 1', body='Test', sender='s@ex.com',
            recipient='r@ex.com', priority='high'
        )
        Email.objects.create(
            user=self.user,
            subject='Medium Priority 1', body='Test', sender='s@ex.com',
            recipient='r@ex.com', priority='medium'
        )
        Email.objects.create(
            user=self.user,
            subject='Low Priority 1', body='Test', sender='s@ex.com',
            recipient='r@ex.com', priority='low'
        )
        
        high_priority_emails = Email.objects.filter(priority='high')
        self.assertEqual(high_priority_emails.count(), 1)
        print("✅ Test Passed: Email filtering by priority working correctly")
