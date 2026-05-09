"""
Project Member Views
Handles member management and collaboration
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from api.models import Project, ProjectMember
from api.serializers import (
    ProjectMemberSerializer,
    UpdateMemberRoleSerializer,
    TransferOwnershipSerializer,
)
from api.permissions import IsProjectOwner, IsProjectMember as IsMember


class ProjectMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project Member management
    
    list: GET /api/projects/{project_id}/members/ - List members
    create: POST /api/projects/{project_id}/members/ - Invite member
    retrieve: GET /api/projects/{project_id}/members/{id}/ - Get member details
    update: PUT/PATCH /api/projects/{project_id}/members/{id}/ - Update member role
    destroy: DELETE /api/projects/{project_id}/members/{id}/ - Remove member
    """
    
    serializer_class = ProjectMemberSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get members for specific project"""
        project_id = self.kwargs.get('project_pk')
        return ProjectMember.objects.filter(project_id=project_id).select_related('user', 'invited_by')
    
    def get_project(self):
        """Get project from URL"""
        project_id = self.kwargs.get('project_pk')
        return get_object_or_404(Project, id=project_id)
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsProjectOwner()]
        return [IsAuthenticated(), IsMember()]
    
    def create(self, request, *args, **kwargs):
        """
        Invite a new member to project
        POST /api/projects/{project_id}/members/
        Body: { "user_email": "user@example.com", "role": "editor" }
        """
        project = self.get_project()
        
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request, 'project': project}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project)
        
        return Response({
            'member': serializer.data,
            'message': 'Member invited successfully'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        Update member role
        PUT/PATCH /api/projects/{project_id}/members/{id}/
        Body: { "role": "editor" }
        """
        member = self.get_object()
        
        # Prevent changing owner role
        if member.role == 'owner':
            return Response({
                'error': 'Cannot change owner role. Use transfer ownership endpoint.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UpdateMemberRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        member.role = serializer.validated_data['role']
        member.save()
        
        return Response({
            'member': ProjectMemberSerializer(member).data,
            'message': 'Member role updated successfully'
        }, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """
        Remove member from project
        DELETE /api/projects/{project_id}/members/{id}/
        """
        member = self.get_object()
        
        # Prevent removing owner
        if member.role == 'owner':
            return Response({
                'error': 'Cannot remove project owner. Transfer ownership first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        member.delete()
        
        return Response({
            'message': 'Member removed successfully'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsProjectOwner])
    def transfer_ownership(self, request, project_pk=None):
        """
        Transfer project ownership
        POST /api/projects/{project_id}/members/transfer_ownership/
        Body: { "new_owner_id": "uuid" }
        """
        project = self.get_project()
        self.check_object_permissions(request, project)
        
        serializer = TransferOwnershipSerializer(
            data=request.data,
            context={'project': project}
        )
        serializer.is_valid(raise_exception=True)
        
        new_owner_id = serializer.validated_data['new_owner_id']
        new_member = ProjectMember.objects.get(project=project, user_id=new_owner_id)
        
        # Update old owner to editor
        old_owner_member = ProjectMember.objects.get(project=project, user=project.owner)
        old_owner_member.role = 'editor'
        old_owner_member.save()
        
        # Update new owner
        new_member.role = 'owner'
        new_member.save()
        
        # Update project owner
        project.owner = new_member.user
        project.save()
        
        return Response({
            'message': 'Ownership transferred successfully',
            'new_owner': ProjectMemberSerializer(new_member).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, project_pk=None, pk=None):
        """
        Leave project (member removes themselves)
        POST /api/projects/{project_id}/members/{id}/leave/
        """
        member = self.get_object()
        
        # Check if user is leaving their own membership
        if member.user != request.user:
            return Response({
                'error': 'You can only leave your own membership'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent owner from leaving
        if member.role == 'owner':
            return Response({
                'error': 'Project owner cannot leave. Transfer ownership first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        member.delete()
        
        return Response({
            'message': 'You have left the project'
        }, status=status.HTTP_200_OK)
