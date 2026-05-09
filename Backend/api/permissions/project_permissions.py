"""
Project-related permission classes
Controls access based on project membership and roles
"""

from rest_framework import permissions
from api.models import ProjectMember, Project


class IsProjectOwner(permissions.BasePermission):
    """
    Permission to check if user is the project owner
    """
    
    message = "Only project owner can perform this action"
    
    def has_object_permission(self, request, view, obj):
        """Check if user is owner of the project"""
        # Get project from different object types
        if isinstance(obj, Project):
            project = obj
        elif hasattr(obj, 'project'):
            project = obj.project
        else:
            return False
        
        return project.owner == request.user


class IsProjectEditor(permissions.BasePermission):
    """
    Permission to check if user is an editor or owner
    Editors can modify project content but not settings
    """
    
    message = "You must be a project owner or editor to perform this action"
    
    def has_object_permission(self, request, view, obj):
        """Check if user is owner or editor"""
        # Get project from different object types
        if isinstance(obj, Project):
            project = obj
        elif hasattr(obj, 'project'):
            project = obj.project
        else:
            return False
        
        # Owner always has access
        if project.owner == request.user:
            return True
        
        # Check if user is an editor
        try:
            member = ProjectMember.objects.get(
                project=project,
                user=request.user
            )
            return member.can_edit
        except ProjectMember.DoesNotExist:
            return False


class IsProjectMember(permissions.BasePermission):
    """
    Permission to check if user is any member of the project
    Members can view project content
    """
    
    message = "You must be a project member to access this resource"
    
    def has_object_permission(self, request, view, obj):
        """Check if user is a member"""
        # Get project from different object types
        if isinstance(obj, Project):
            project = obj
        elif hasattr(obj, 'project'):
            project = obj.project
        else:
            return False
        
        # Check if user is owner or member
        return (
            project.owner == request.user or
            ProjectMember.objects.filter(
                project=project,
                user=request.user
            ).exists()
        )


class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to allow read access to members but write access only to owner
    """
    
    def has_object_permission(self, request, view, obj):
        """Check permissions based on HTTP method"""
        # Get project from different object types
        if isinstance(obj, Project):
            project = obj
        elif hasattr(obj, 'project'):
            project = obj.project
        else:
            return False
        
        # Read permissions for any member
        if request.method in permissions.SAFE_METHODS:
            return (
                project.owner == request.user or
                ProjectMember.objects.filter(
                    project=project,
                    user=request.user
                ).exists()
            )
        
        # Write permissions only for owner
        return project.owner == request.user


class CanInviteMembers(permissions.BasePermission):
    """
    Permission to check if user can invite members
    Only owners and editors can invite
    """
    
    message = "Only project owners and editors can invite members"
    
    def has_object_permission(self, request, view, obj):
        """Check if user can invite"""
        project = obj if isinstance(obj, Project) else obj.project
        
        # Owner can always invite
        if project.owner == request.user:
            return True
        
        # Check if editor
        try:
            member = ProjectMember.objects.get(
                project=project,
                user=request.user
            )
            return member.can_invite
        except ProjectMember.DoesNotExist:
            return False


class CanManageVersions(permissions.BasePermission):
    """
    Permission to check if user can manage versions
    Only owners and editors can create versions
    """
    
    message = "Only project owners and editors can manage versions"
    
    def has_object_permission(self, request, view, obj):
        """Check if user can manage versions"""
        from api.models import Screen, ScreenVersion
        
        # Get project from object
        if isinstance(obj, Screen):
            project = obj.project
        elif isinstance(obj, ScreenVersion):
            project = obj.screen.project
        elif isinstance(obj, Project):
            project = obj
        else:
            return False
        
        # Owner can always manage
        if project.owner == request.user:
            return True
        
        # Check if editor
        try:
            member = ProjectMember.objects.get(
                project=project,
                user=request.user
            )
            return member.can_edit
        except ProjectMember.DoesNotExist:
            return False
