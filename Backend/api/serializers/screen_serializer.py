"""
Screen Serializers
Handles screen CRUD and component management
"""

from rest_framework import serializers
from api.models import Screen
from .version_serializer import ScreenVersionSerializer


class ScreenSerializer(serializers.ModelSerializer):
    """Base Screen serializer"""
    
    component_count = serializers.IntegerField(read_only=True)
    version_count = serializers.SerializerMethodField()
    current_version = serializers.IntegerField(source='current_version_number', read_only=True)
    
    class Meta:
        model = Screen
        fields = [
            'id', 'name', 'description', 'width', 'height',
            'components', 'thumbnail', 'order',
            'component_count', 'version_count', 'current_version',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_version_count(self, obj):
        """Get total version count"""
        return obj.versions.count()
    
    def validate_components(self, value):
        """Validate components JSON structure"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Components must be an array")
        
        for idx, component in enumerate(value):
            if not isinstance(component, dict):
                raise serializers.ValidationError(f"Component at index {idx} must be an object")
            
            # Validate required fields
            required_fields = ['id', 'type']
            for field in required_fields:
                if field not in component:
                    raise serializers.ValidationError(f"Component at index {idx} missing required field: {field}")
            
            # Validate position and size if present
            if 'position' in component:
                if not isinstance(component['position'], dict):
                    raise serializers.ValidationError(f"Component {idx}: position must be an object")
                if 'x' not in component['position'] or 'y' not in component['position']:
                    raise serializers.ValidationError(f"Component {idx}: position must have x and y")
            
            if 'size' in component:
                if not isinstance(component['size'], dict):
                    raise serializers.ValidationError(f"Component {idx}: size must be an object")
                if 'width' not in component['size'] or 'height' not in component['size']:
                    raise serializers.ValidationError(f"Component {idx}: size must have width and height")
        
        return value
    
    def validate(self, attrs):
        """Validate screen data"""
        width = attrs.get('width', 1920)
        height = attrs.get('height', 1080)
        
        if width < 320 or width > 7680:
            raise serializers.ValidationError({"width": "Width must be between 320 and 7680"})
        
        if height < 240 or height > 4320:
            raise serializers.ValidationError({"height": "Height must be between 240 and 4320"})
        
        return attrs


class ScreenListSerializer(serializers.ModelSerializer):
    """Simplified screen serializer for lists"""
    
    component_count = serializers.IntegerField(read_only=True)
    current_version = serializers.IntegerField(source='current_version_number', read_only=True)
    
    class Meta:
        model = Screen
        fields = [
            'id', 'name', 'description', 'thumbnail',
            'width', 'height', 'order',
            'component_count', 'current_version',
            'updated_at'
        ]


class ScreenDetailSerializer(serializers.ModelSerializer):
    """Detailed screen serializer with versions"""
    
    component_count = serializers.IntegerField(read_only=True)
    versions = ScreenVersionSerializer(many=True, read_only=True)
    current_version = serializers.IntegerField(source='current_version_number', read_only=True)
    
    class Meta:
        model = Screen
        fields = [
            'id', 'name', 'description', 'width', 'height',
            'components', 'thumbnail', 'order',
            'component_count', 'versions', 'current_version',
            'created_at', 'updated_at'
        ]


class UpdateComponentsSerializer(serializers.Serializer):
    """Serializer for updating screen components"""
    
    components = serializers.ListField(required=True)
    create_version = serializers.BooleanField(default=True)
    version_description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_components(self, value):
        """Validate components structure"""
        serializer = ScreenSerializer()
        return serializer.validate_components(value)


class DuplicateScreenSerializer(serializers.Serializer):
    """Serializer for duplicating a screen"""
    
    new_name = serializers.CharField(required=True, max_length=255)
    copy_versions = serializers.BooleanField(default=False)
