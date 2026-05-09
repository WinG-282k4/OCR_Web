"""
Screen Version Views
Handles version control for screens
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from api.models import Screen, ScreenVersion
from api.serializers import (
    ScreenVersionSerializer,
    RestoreVersionSerializer,
    CompareVersionsSerializer,
)
from api.permissions import IsProjectEditor, IsProjectMember


class ScreenVersionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Screen Version operations
    
    list: GET /api/projects/{project_id}/screens/{screen_id}/versions/ - List versions
    retrieve: GET /api/projects/{project_id}/screens/{screen_id}/versions/{id}/ - Get version details
    """
    
    serializer_class = ScreenVersionSerializer
    permission_classes = [IsAuthenticated, IsProjectMember]
    
    def get_queryset(self):
        """Get versions for specific screen"""
        screen_id = self.kwargs.get('screen_pk')
        return ScreenVersion.objects.filter(screen_id=screen_id).select_related('created_by').order_by('-version_number')
    
    def get_screen(self):
        """Get screen from URL"""
        screen_id = self.kwargs.get('screen_pk')
        return get_object_or_404(Screen, id=screen_id)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProjectEditor])
    def restore(self, request, project_pk=None, screen_pk=None, pk=None):
        """
        Restore screen to this version
        POST /api/projects/{project_id}/screens/{screen_id}/versions/{id}/restore/
        Body: {
            "create_new_version": true,
            "description": "Restored from version 3"
        }
        """
        version = self.get_object()
        screen = version.screen
        
        serializer = RestoreVersionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        create_new_version = serializer.validated_data.get('create_new_version', True)
        description = serializer.validated_data.get('description', f"Restored from version {version.version_number}")
        
        # Get full components from version (handles both base and delta)
        restored_components = version.get_full_components()
        
        # Store old components for delta calculation
        old_components = screen.components
        
        # Update screen components
        screen.components = restored_components
        screen.save()
        
        # Create new version if requested
        if create_new_version:
            last_version = screen.versions.order_by('-version_number').first()
            next_version = (last_version.version_number + 1) if last_version else 1
            
            # Determine if this should be a base version (periodic snapshots)
            is_base = ScreenVersion.should_create_base_version(next_version)
            
            if is_base:
                # Create base version (full snapshot)
                new_version = ScreenVersion.objects.create(
                    screen=screen,
                    version_number=next_version,
                    is_base_version=True,
                    components=restored_components,  # Store full components
                    changes_delta=None,
                    change_type='RESTORE',
                    description=f"{description} (Base snapshot)",
                    changed_components=[c['id'] for c in restored_components],
                    created_by=request.user
                )
            else:
                # Create delta version (changes only)
                delta = ScreenVersion.calculate_delta(old_components, restored_components)
                
                # Extract changed component IDs
                changed_ids = []
                changed_ids.extend([c['id'] for c in delta['added']])
                changed_ids.extend([c['id'] for c in delta['modified']])
                changed_ids.extend(delta['removed'])
                
                new_version = ScreenVersion.objects.create(
                    screen=screen,
                    version_number=next_version,
                    is_base_version=False,
                    components=None,
                    changes_delta=delta,
                    change_type='RESTORE',
                    description=description,
                    changed_components=changed_ids,
                    created_by=request.user
                )
            
            return Response({
                'message': 'Version restored and new version created',
                'version': ScreenVersionSerializer(new_version).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Version restored successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsProjectMember])
    def compare(self, request, project_pk=None, screen_pk=None):
        """
        Compare two versions
        POST /api/projects/{project_id}/screens/{screen_id}/versions/compare/
        Body: { "version_a": 1, "version_b": 3 }
        """
        screen = self.get_screen()
        
        serializer = CompareVersionsSerializer(
            data=request.data,
            context={'screen': screen}
        )
        serializer.is_valid(raise_exception=True)
        
        version_a_num = serializer.validated_data['version_a']
        version_b_num = serializer.validated_data['version_b']
        
        version_a = screen.versions.get(version_number=version_a_num)
        version_b = screen.versions.get(version_number=version_b_num)
        
        # Get full components (handles both base and delta versions)
        components_a = version_a.get_full_components()
        components_b = version_b.get_full_components()
        
        # Calculate actual differences between the two versions
        delta = ScreenVersion.calculate_delta(components_a, components_b)
        
        comparison = {
            'version_a': {
                'version_number': version_a.version_number,
                'storage_type': 'Base Version' if version_a.is_base_version else 'Delta Version',
                'component_count': len(components_a),
                'created_at': version_a.created_at,
            },
            'version_b': {
                'version_number': version_b.version_number,
                'storage_type': 'Base Version' if version_b.is_base_version else 'Delta Version',
                'component_count': len(components_b),
                'created_at': version_b.created_at,
            },
            'differences': {
                'component_count_diff': len(components_b) - len(components_a),
                'components_added': len(delta['added']),
                'components_modified': len(delta['modified']),
                'components_removed': len(delta['removed']),
                'added_components': delta['added'],
                'modified_components': delta['modified'],
                'removed_component_ids': delta['removed'],
            }
        }
        
        return Response(comparison, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsProjectEditor])
    def delete_version(self, request, project_pk=None, screen_pk=None, pk=None):
        """
        Delete a specific version (keep at least 1 version)
        DELETE /api/projects/{project_id}/screens/{screen_id}/versions/{id}/
        """
        version = self.get_object()
        screen = version.screen
        
        # Check if this is the last version
        if screen.versions.count() <= 1:
            return Response({
                'error': 'Cannot delete the last version. Screen must have at least one version.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        version.delete()
        
        return Response({
            'message': 'Version deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
