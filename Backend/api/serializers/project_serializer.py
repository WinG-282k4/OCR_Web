"""
Project Serializers
Handles project CRUD operations
"""

from rest_framework import serializers
from api.models import Project, ProjectMember
from .auth_serializer import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    """Base Project serializer"""
    
    owner = UserSerializer(read_only=True)
    screen_count = serializers.IntegerField(source='screens_total', read_only=True)
    member_count = serializers.IntegerField(source='members_total', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'theme', 'tags',
            'thumbnail', 'owner', 'screen_count', 'member_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create project and add owner as member"""
        user = self.context['request'].user
        project = Project.objects.create(owner=user, **validated_data)
        
        # Create ProjectMember for owner
        ProjectMember.objects.create(
            project=project,
            user=user,
            role='owner'
        )
        
        return project


class ProjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for project list"""
    
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    screen_count = serializers.IntegerField(source='screens_total', read_only=True)
    member_count = serializers.IntegerField(source='members_total', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'thumbnail',
            'owner_name', 'screen_count', 'member_count',
            'tags', 'updated_at'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed project serializer with screens"""
    
    owner = UserSerializer(read_only=True)
    screens = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    screen_count = serializers.IntegerField(source='screens_total', read_only=True)
    member_count = serializers.IntegerField(source='members_total', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'theme', 'tags', 'thumbnail',
            'owner', 'screens', 'members', 'screen_count', 'member_count',
            'created_at', 'updated_at'
        ]
    
    def get_screens(self, obj):
        """Get simplified screen list"""
        from .screen_serializer import ScreenListSerializer
        screens = obj.screens.all()[:10]  # Limit to 10 for performance
        return ScreenListSerializer(screens, many=True).data
    
    def get_members(self, obj):
        """Get project members"""
        from .member_serializer import ProjectMemberSerializer
        members = obj.members.select_related('user').all()[:20]
        return ProjectMemberSerializer(members, many=True).data
