from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Email, Label, EmailLabel, UserPreference, EmailAccount


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


class EmailSerializer(serializers.ModelSerializer):
    # Fix: Use correct related field path for labels
    
    class Meta:
        model = Email
        fields = [
            'id', 'sender', 'recipient', 'subject', 'body', 'priority',
            'is_read', 'is_starred', 'is_archived', 'is_trashed', 'trashed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'trashed_at']


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            'id', 'profile_picture', 'phone', 'company', 'timezone',
            'dark_mode_preference', 'dark_mode_enabled',
            'email_notifications', 'desktop_notifications', 
            'weekly_digest', 'auto_archive_read',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmailAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAccount
        fields = [
            'id', 'email_address', 'provider', 'status', 'is_primary',
            'last_sync', 'sync_enabled', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'last_sync', 'created_at', 'updated_at']
        extra_kwargs = {
            'access_token': {'write_only': True},
            'refresh_token': {'write_only': True},
        }


class UserSerializer(serializers.ModelSerializer):
    preferences = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'preferences']
        read_only_fields = ['id']
    
    def get_preferences(self, obj):
        """Get preferences, create if doesn't exist"""
        try:
            preferences = obj.preferences
        except UserPreference.DoesNotExist:
            preferences = UserPreference.objects.create(user=obj)
        return UserPreferenceSerializer(preferences).data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create default preferences
        UserPreference.objects.create(user=user)
        return user

