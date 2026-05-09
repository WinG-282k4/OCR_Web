"""
Screen Version Serializers
Handles version control for screens
"""

from rest_framework import serializers
from api.models import ScreenVersion
from .auth_serializer import UserSerializer


class ScreenVersionSerializer(serializers.ModelSerializer):
    """Serializer for Screen Versions with delta support"""
    
    created_by = UserSerializer(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    component_count = serializers.SerializerMethodField()
    full_components = serializers.SerializerMethodField()
    changes_summary = serializers.SerializerMethodField()
    storage_type = serializers.SerializerMethodField()
    
    class Meta:
        model = ScreenVersion
        fields = [
            'id', 'version_number', 'description', 'change_type',
            'is_base_version', 'storage_type',
            'components', 'changes_delta', 'full_components',
            'changed_components', 'changes_summary',
            'thumbnail', 'created_by', 'created_by_name',
            'component_count', 'created_at'
        ]
        read_only_fields = ['id', 'version_number', 'created_by', 'created_at']
    
    def get_component_count(self, obj):
        """Count components in this version"""
        full_components = obj.get_full_components()
        return len(full_components) if full_components else 0
    
    def get_full_components(self, obj):
        """
        Get full reconstructed components
        For base: return components directly
        For delta: reconstruct from base + deltas
        """
        # Only return full components if explicitly requested
        request = self.context.get('request')
        if request and request.query_params.get('include_components') == 'true':
            return obj.get_full_components()
        return None  # Don't send large data by default
    
    def get_changes_summary(self, obj):
        """Summary of changes in this version"""
        if obj.is_base_version:
            return {
                'type': 'base',
                'total_components': len(obj.components or [])
            }
        
        delta = obj.changes_delta or {}
        return {
            'type': 'delta',
            'added': len(delta.get('added', [])),
            'modified': len(delta.get('modified', [])),
            'removed': len(delta.get('removed', []))
        }
    
    def get_storage_type(self, obj):
        """Return storage type for UI display"""
        return 'Full Snapshot' if obj.is_base_version else 'Delta (Changes Only)'
    
    def create(self, validated_data):
        """Create new version"""
        screen = self.context.get('screen')
        user = self.context['request'].user
        
        # Get next version number
        last_version = screen.versions.order_by('-version_number').first()
        next_version = (last_version.version_number + 1) if last_version else 1
        
        version = ScreenVersion.objects.create(
            screen=screen,
            version_number=next_version,
            created_by=user,
            **validated_data
        )
        
        return version


class RestoreVersionSerializer(serializers.Serializer):
    """Serializer for restoring a version"""
    
    create_new_version = serializers.BooleanField(default=True)
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        default="Restored from previous version"
    )


class CompareVersionsSerializer(serializers.Serializer):
    """Serializer for comparing two versions"""
    
    version_a = serializers.IntegerField(required=True, min_value=1)
    version_b = serializers.IntegerField(required=True, min_value=1)
    
    def validate(self, attrs):
        """Validate version numbers"""
        screen = self.context.get('screen')
        
        for version_num in [attrs['version_a'], attrs['version_b']]:
            if not screen.versions.filter(version_number=version_num).exists():
                raise serializers.ValidationError(f"Version {version_num} does not exist")
        
        return attrs
