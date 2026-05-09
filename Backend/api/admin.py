"""
Django Admin Configuration
"""

from django.contrib import admin
from api.models import (
    User,
    Project,
    ProjectMember,
    Screen,
    ScreenVersion,
    OCRAnalysis,
    ComponentTemplate,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description', 'owner__email']
    ordering = ['-updated_at']
    raw_id_fields = ['owner']


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['project__name', 'user__email']
    ordering = ['-joined_at']
    raw_id_fields = ['project', 'user', 'invited_by']


@admin.register(Screen)
class ScreenAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'width', 'height', 'order', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description', 'project__name']
    ordering = ['project', 'order']
    raw_id_fields = ['project']


@admin.register(ScreenVersion)
class ScreenVersionAdmin(admin.ModelAdmin):
    list_display = ['screen', 'version_number', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['screen__name', 'description']
    ordering = ['-created_at']
    raw_id_fields = ['screen', 'created_by']


@admin.register(OCRAnalysis)
class OCRAnalysisAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'project', 'status', 'confidence_threshold', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['original_filename', 'project__name']
    ordering = ['-created_at']
    raw_id_fields = ['project']


@admin.register(ComponentTemplate)
class ComponentTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'type', 'usage_count', 'created_at']
    list_filter = ['category', 'type', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-usage_count', 'name']
