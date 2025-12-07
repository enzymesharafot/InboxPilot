from django.contrib import admin
from .models import Email, Label, EmailLabel, UserPreference, EmailAccount


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ['subject', 'sender', 'recipient', 'priority', 'is_read', 'is_starred', 'is_archived', 'is_trashed', 'created_at']
    list_filter = ['is_read', 'is_starred', 'is_archived', 'is_trashed', 'priority', 'created_at']
    search_fields = ['subject', 'sender', 'recipient', 'body']
    date_hierarchy = 'created_at'
    actions = ['mark_as_read', 'archive_emails', 'trash_emails']
    
    def get_queryset(self, request):
        """PRIVACY: Users can only see their OWN emails, even in admin panel"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            # Even superusers only see their own emails for privacy
            return qs.filter(user=request.user)
        return qs.filter(user=request.user)
    
    def has_view_permission(self, request, obj=None):
        """Only allow viewing own emails"""
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_change_permission(self, request, obj=None):
        """Only allow editing own emails"""
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_delete_permission(self, request, obj=None):
        """Only allow deleting own emails"""
        if obj is not None:
            return obj.user == request.user
        return True
    
    def save_model(self, request, obj, form, change):
        """Auto-assign current user when creating email"""
        if not change:
            obj.user = request.user
        super().save_model(request, obj, form, change)
    
    def mark_as_read(self, request, queryset):
        # Only affect user's own emails
        queryset = queryset.filter(user=request.user)
        queryset.update(is_read=True)
        self.message_user(request, f"{queryset.count()} emails marked as read")
    mark_as_read.short_description = "Mark selected emails as read"
    
    def archive_emails(self, request, queryset):
        queryset = queryset.filter(user=request.user)
        queryset.update(is_archived=True, is_trashed=False)
        self.message_user(request, f"{queryset.count()} emails archived")
    archive_emails.short_description = "Archive selected emails"
    
    def trash_emails(self, request, queryset):
        queryset = queryset.filter(user=request.user)
        queryset.update(is_trashed=True, is_archived=False)
        self.message_user(request, f"{queryset.count()} emails moved to trash")
    trash_emails.short_description = "Move selected emails to trash"


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    
    def get_queryset(self, request):
        """PRIVACY: Users can only see their OWN labels"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.filter(user=request.user)
        return qs.filter(user=request.user)
    
    def has_view_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_change_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_delete_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(EmailLabel)
class EmailLabelAdmin(admin.ModelAdmin):
    list_display = ['email', 'label', 'created_at']
    list_filter = ['created_at']


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'dark_mode_preference', 'dark_mode_enabled', 'email_notifications', 'desktop_notifications', 'updated_at']
    list_filter = ['dark_mode_preference', 'email_notifications', 'desktop_notifications', 'created_at']
    search_fields = ['user__username', 'user__email']
    
    def get_queryset(self, request):
        """PRIVACY: Users can only see their OWN preferences"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.filter(user=request.user)
        return qs.filter(user=request.user)
    
    def has_view_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_change_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_delete_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True


@admin.register(EmailAccount)
class EmailAccountAdmin(admin.ModelAdmin):
    list_display = ['email_address', 'user', 'provider', 'status', 'is_primary', 'sync_enabled', 'last_sync', 'created_at']
    list_filter = ['provider', 'status', 'is_primary', 'sync_enabled', 'created_at']
    search_fields = ['email_address', 'user__username']
    readonly_fields = ['access_token', 'refresh_token']
    actions = ['enable_sync', 'disable_sync']
    
    def get_queryset(self, request):
        """PRIVACY: Users can only see their OWN email accounts"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.filter(user=request.user)
        return qs.filter(user=request.user)
    
    def has_view_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_change_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def has_delete_permission(self, request, obj=None):
        if obj is not None:
            return obj.user == request.user
        return True
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.user = request.user
        super().save_model(request, obj, form, change)
    
    def enable_sync(self, request, queryset):
        queryset = queryset.filter(user=request.user)
        queryset.update(sync_enabled=True, status='active')
        self.message_user(request, f"Sync enabled for {queryset.count()} accounts")
    enable_sync.short_description = "Enable sync for selected accounts"
    
    def disable_sync(self, request, queryset):
        queryset = queryset.filter(user=request.user)
        queryset.update(sync_enabled=False)
        self.message_user(request, f"Sync disabled for {queryset.count()} accounts")
    disable_sync.short_description = "Disable sync for selected accounts"

