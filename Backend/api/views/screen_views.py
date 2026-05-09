"""
Screen Views
Handles screen CRUD operations and component management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models

from api.models import Project, Screen, ScreenVersion
from api.serializers import (
    ScreenSerializer,
    ScreenListSerializer,
    ScreenDetailSerializer,
    UpdateComponentsSerializer,
    DuplicateScreenSerializer,
)
from api.permissions import IsProjectEditor, IsProjectMember


class ScreenViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Screen CRUD operations
    
    list: GET /api/projects/{project_id}/screens/ - List screens
    create: POST /api/projects/{project_id}/screens/ - Create screen
    retrieve: GET /api/projects/{project_id}/screens/{id}/ - Get screen details
    update: PUT/PATCH /api/projects/{project_id}/screens/{id}/ - Update screen
    destroy: DELETE /api/projects/{project_id}/screens/{id}/ - Delete screen
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'created_at', 'updated_at']
    ordering = ['order']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ScreenListSerializer
        elif self.action == 'retrieve':
            return ScreenDetailSerializer
        return ScreenSerializer
    
    def get_queryset(self):
        """Get screens for specific project"""
        project_id = self.kwargs.get('project_pk')
        return Screen.objects.select_related(
            'project',
            'ocr_analysis'
        ).prefetch_related(
            'versions'
        ).filter(project_id=project_id).annotate_component_count()
    
    def get_project(self):
        """Get project from URL"""
        project_id = self.kwargs.get('project_pk')
        return get_object_or_404(Project, id=project_id)
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'update_components']:
            return [IsAuthenticated(), IsProjectEditor()]
        return [IsAuthenticated(), IsProjectMember()]
    
    def create(self, request, *args, **kwargs):
        """
        Create a new screen
        POST /api/projects/{project_id}/screens/
        """
        project = self.get_project()
        self.check_object_permissions(request, project)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Auto-calculate order if not provided to prevent UNIQUE constraint failed
        order = request.data.get('order')
        if order is None:
            from django.db.models import Max
            max_order = Screen.objects.filter(project=project).aggregate(Max('order'))['order__max']
            order = (max_order + 1) if max_order is not None else 0
            
        screen = serializer.save(project=project, order=order)
        
        # Create initial version (BASE snapshot)
        ScreenVersion.objects.create(
            screen=screen,
            version_number=1,
            is_base_version=True,  # Version 1 is always full snapshot
            components=screen.components,
            change_type='MANUAL_EDIT',
            description="Initial version",
            created_by=request.user
        )
        
        return Response({
            'screen': ScreenDetailSerializer(screen).data,
            'message': 'Screen created successfully'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        Update screen metadata (not components)
        PUT/PATCH /api/projects/{project_id}/screens/{id}/
        """
        partial = kwargs.pop('partial', False)
        screen = self.get_object()
        
        serializer = self.get_serializer(screen, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'screen': ScreenDetailSerializer(screen).data,
            'message': 'Screen updated successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProjectEditor])
    def update_components(self, request, project_pk=None, pk=None):
        """
        Update screen components and optionally create version
        POST /api/projects/{project_id}/screens/{id}/update_components/
        Body: {
            "components": [...],
            "create_version": true,
            "version_description": "Updated button styles"
        }
        """
        screen = self.get_object()
        
        serializer = UpdateComponentsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_components = serializer.validated_data['components']
        create_version = serializer.validated_data.get('create_version', True)
        version_description = serializer.validated_data.get('version_description', 'Component update')
        
        # Get old components for delta calculation
        old_components = screen.components
        
        # Update screen components
        screen.components = new_components
        screen.save()
        
        # Create version if requested
        if create_version:
            last_version = screen.versions.order_by('-version_number').first()
            next_version = (last_version.version_number + 1) if last_version else 1
            
            # Determine if this should be a base version (periodic snapshots)
            is_base = ScreenVersion.should_create_base_version(next_version)
            
            if is_base:
                # Create base version (full snapshot)
                ScreenVersion.objects.create(
                    screen=screen,
                    version_number=next_version,
                    is_base_version=True,
                    components=new_components,  # Store full components
                    changes_delta=None,
                    change_type='MANUAL_EDIT',
                    description=f"{version_description} (Base snapshot)",
                    changed_components=[c['id'] for c in new_components],
                    created_by=request.user
                )
            else:
                # Create delta version (changes only)
                delta = ScreenVersion.calculate_delta(old_components, new_components)
                
                # Extract changed component IDs
                changed_ids = []
                changed_ids.extend([c['id'] for c in delta['added']])
                changed_ids.extend([c['id'] for c in delta['modified']])
                changed_ids.extend(delta['removed'])
                
                ScreenVersion.objects.create(
                    screen=screen,
                    version_number=next_version,
                    is_base_version=False,
                    components=None,  # Don't store full components
                    changes_delta=delta,  # Store only changes
                    change_type='MANUAL_EDIT',
                    description=version_description,
                    changed_components=changed_ids,
                    created_by=request.user
                )
        
        return Response({
            'screen': ScreenDetailSerializer(screen).data,
            'message': 'Components updated successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProjectEditor])
    def duplicate(self, request, project_pk=None, pk=None):
        """
        Duplicate a screen
        POST /api/projects/{project_id}/screens/{id}/duplicate/
        Body: { "new_name": "Screen Copy", "copy_versions": false }
        """
        original_screen = self.get_object()
        
        serializer = DuplicateScreenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_name = serializer.validated_data['new_name']
        copy_versions = serializer.validated_data.get('copy_versions', False)
        
        # Create new screen
        new_screen = Screen.objects.create(
            project=original_screen.project,
            name=new_name,
            description=original_screen.description,
            width=original_screen.width,
            height=original_screen.height,
            components=original_screen.components,
            order=original_screen.order + 1
        )
        
        # Copy versions if requested
        if copy_versions:
            for version in original_screen.versions.all():
                # Reconstruct full components for delta versions
                version_components = version.get_full_components() if not version.is_base_version else version.components
                
                ScreenVersion.objects.create(
                    screen=new_screen,
                    version_number=version.version_number,
                    is_base_version=version.is_base_version,
                    components=version_components if version.is_base_version else None,
                    changes_delta=version.changes_delta if not version.is_base_version else None,
                    change_type='DUPLICATE',
                    description=f"Copied from {original_screen.name}: {version.description}",
                    changed_components=version.changed_components,
                    created_by=request.user
                )
        else:
            # Create initial base version for duplicated screen
            ScreenVersion.objects.create(
                screen=new_screen,
                version_number=1,
                is_base_version=True,
                components=new_screen.components,
                change_type='DUPLICATE',
                description="Initial version (duplicated)",
                created_by=request.user
            )
        
        return Response({
            'screen': ScreenDetailSerializer(new_screen).data,
            'message': 'Screen duplicated successfully'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProjectEditor])
    def reorder(self, request, project_pk=None, pk=None):
        """
        Reorder screen
        POST /api/projects/{project_id}/screens/{id}/reorder/
        Body: { "new_order": 3 }
        """
        screen = self.get_object()
        new_order = request.data.get('new_order')
        
        if new_order is None:
            return Response({
                'error': 'new_order is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        old_order = screen.order
        screen.order = new_order
        screen.save()
        
        # Reorder other screens
        if new_order < old_order:
            Screen.objects.filter(
                project=screen.project,
                order__gte=new_order,
                order__lt=old_order
            ).exclude(id=screen.id).update(order=models.F('order') + 1)
        else:
            Screen.objects.filter(
                project=screen.project,
                order__gt=old_order,
                order__lte=new_order
            ).exclude(id=screen.id).update(order=models.F('order') - 1)
        
        return Response({
            'message': 'Screen reordered successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def export(self, request, project_pk=None, pk=None):
        """
        Export screen as HTML/React/Vue
        GET /api/projects/{project_id}/screens/{id}/export/?format=html
        """
        screen = self.get_object()
        export_format = request.query_params.get('format', 'html')
        
        # Import export service
        from api.services.export_service import ExportService
        
        try:
            exported_code = ExportService.export_screen(screen, export_format)
            
            return Response({
                'format': export_format,
                'code': exported_code,
                'filename': f"{screen.name}.{export_format}"
            }, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
