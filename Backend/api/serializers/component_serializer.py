"""
Component Template Serializers
Handles component template library
"""

from rest_framework import serializers
from api.models import ComponentTemplate


class ComponentTemplateSerializer(serializers.ModelSerializer):
    """Serializer for Component Templates"""
    
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ComponentTemplate
        fields = [
            'id', 'name', 'category', 'type', 'description',
            'template_data', 'thumbnail_url', 'tags',
            'is_system', 'is_public', 'is_active',
            'usage_count', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at', 'created_by']
    
    def get_created_by_name(self, obj):
        """Get creator username"""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return "System" if obj.is_system else "Unknown"


class ComponentTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating component templates"""
    
    class Meta:
        model = ComponentTemplate
        fields = [
            'name', 'category', 'type', 'description',
            'template_data', 'thumbnail_url', 'tags', 'is_public'
        ]
    
    def validate_template_data(self, value):
        """Validate template data structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("template_data must be an object")
        
        # Ensure basic structure
        if 'type' not in value:
            raise serializers.ValidationError("template_data must include 'type' field")
        
        return value
    
    def create(self, validated_data):
        """Create template with current user as creator"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ComponentTemplateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing templates"""
    
    class Meta:
        model = ComponentTemplate
        fields = [
            'id', 'name', 'category', 'type',
            'thumbnail_url', 'is_system', 'usage_count'
        ]
