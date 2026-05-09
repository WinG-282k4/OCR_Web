"""
Project Member Serializers
Handles collaboration and member management
"""

from rest_framework import serializers
from api.models import ProjectMember, User
from .auth_serializer import UserSerializer


class ProjectMemberSerializer(serializers.ModelSerializer):
    """Serializer for Project Members"""
    
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(write_only=True, required=False)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    can_edit = serializers.BooleanField(read_only=True)
    can_delete = serializers.BooleanField(read_only=True)
    can_invite = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ProjectMember
        fields = [
            'id', 'user', 'user_email', 'role',
            'invited_by', 'invited_by_name',
            'can_edit', 'can_delete', 'can_invite',
            'joined_at', 'last_activity'
        ]
        read_only_fields = ['id', 'invited_by', 'joined_at', 'last_activity']
    
    def validate_user_email(self, value):
        """Validate that user exists"""
        try:
            User.objects.get(email=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist")
    
    def validate(self, attrs):
        """Validate member addition"""
        project = self.context.get('project')
        user_email = attrs.get('user_email')
        
        if user_email:
            user = User.objects.get(email=user_email)
            
            # Check if user is already a member
            if ProjectMember.objects.filter(project=project, user=user).exists():
                raise serializers.ValidationError("User is already a member of this project")
            
            attrs['user'] = user
        
        return attrs
    
    def create(self, validated_data):
        """Create project member"""
        user_email = validated_data.pop('user_email', None)
        user = validated_data.pop('user', None)
        
        if not user and user_email:
            user = User.objects.get(email=user_email)
        
        member = ProjectMember.objects.create(
            user=user,
            invited_by=self.context['request'].user,
            **validated_data
        )
        
        return member


class UpdateMemberRoleSerializer(serializers.Serializer):
    """Serializer for updating member role"""
    
    role = serializers.ChoiceField(choices=['editor', 'viewer'])
    
    def validate_role(self, value):
        """Cannot change to owner via this endpoint"""
        if value == 'owner':
            raise serializers.ValidationError("Cannot set role to owner. Use transfer ownership endpoint.")
        return value


class TransferOwnershipSerializer(serializers.Serializer):
    """Serializer for transferring project ownership"""
    
    new_owner_id = serializers.UUIDField(required=True)
    
    def validate_new_owner_id(self, value):
        """Validate new owner exists and is a member"""
        project = self.context.get('project')
        
        try:
            member = ProjectMember.objects.get(project=project, user_id=value)
            if member.role == 'owner':
                raise serializers.ValidationError("User is already the owner")
            return value
        except ProjectMember.DoesNotExist:
            raise serializers.ValidationError("User is not a member of this project")
