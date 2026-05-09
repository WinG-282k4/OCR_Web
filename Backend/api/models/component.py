"""
Component Template Model
Stores reusable component templates for the library
"""

import uuid
from django.db import models
from django.conf import settings


class ComponentTemplate(models.Model):
    """
    ComponentTemplate - Reusable component templates
    Used for the component library/palette
    """
    
    CATEGORY_CHOICES = [
        ('button', 'Button'),
        ('input', 'Input'),
        ('card', 'Card'),
        ('layout', 'Layout'),
        ('text', 'Text'),
        ('media', 'Media'),
        ('form', 'Form'),
        ('navigation', 'Navigation'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Template information
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=50)  # button, text, heading, input, etc.
    
    # Template data (JSON)
    template_data = models.JSONField(default=dict)
    # {
    #   "type": "button",
    #   "style": { ... },
    #   "attributes": { ... },
    #   "default_content": "Button"
    # }
    
    # Metadata
    thumbnail_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Ownership
    is_system = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='component_templates',
        null=True,
        blank=True
    )
    is_public = models.BooleanField(default=False)
    
    # Tags for filtering
    tags = models.JSONField(default=list, blank=True)
    
    # Usage tracking
    usage_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'component_templates'
        ordering = ['-usage_count', 'category', 'name']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['-usage_count']),
            models.Index(fields=['is_system', 'is_public']),
            models.Index(fields=['created_by']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.category})"
    
    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])
