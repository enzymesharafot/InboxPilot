from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User


class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows users to login with either
    their username or email address.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        
        user = None
        
        try:
            # First, try exact username match
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # If username doesn't exist, try email (only if it looks like an email)
            if '@' in username:
                try:
                    user = User.objects.get(email=username)
                except User.DoesNotExist:
                    pass
                except User.MultipleObjectsReturned:
                    # If multiple users have this email, we can't determine which one
                    # For security, we don't reveal this information
                    User().set_password(password)  # Timing attack prevention
                    return None
        
        if user is None:
            # Run the default password hasher once to reduce timing attacks
            User().set_password(password)
            return None
        
        # Check the password
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
