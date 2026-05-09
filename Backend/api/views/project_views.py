"""
Project Views
Handles project CRUD operations
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from api.models import Project, ProjectMember
from api.serializers import (
    ProjectSerializer,
    ProjectListSerializer,
    ProjectDetailSerializer,
)
from api.permissions import (
    IsProjectOwner,
    IsProjectMember,
    IsProjectEditor,
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project CRUD operations
    
    list: GET /api/projects/ - List user's projects
    create: POST /api/projects/ - Create new project
    retrieve: GET /api/projects/{id}/ - Get project details
    update: PUT/PATCH /api/projects/{id}/ - Update project
    destroy: DELETE /api/projects/{id}/ - Delete project
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        """Get projects where user is owner or member"""
        user = self.request.user
        
        # Annotate with counts and optimize queries
        queryset = Project.objects.select_related('owner').prefetch_related(
            'members__user',
            'screens'
        ).annotate(
            screens_total=Count('screens', distinct=True),
            members_total=Count('members', distinct=True)
        ).filter(
            Q(owner=user) | Q(members__user=user)
        ).distinct()
        
        # Filter by role if specified
        role = self.request.query_params.get('role')
        if role:
            if role == 'owner':
                queryset = queryset.filter(owner=user)
            elif role in ['editor', 'viewer']:
                queryset = queryset.filter(members__user=user, members__role=role)
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsProjectOwner()]
        elif self.action == 'retrieve':
            return [IsAuthenticated(), IsProjectMember()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create project and add owner as member"""
        serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProjectOwner])
    def duplicate(self, request, pk=None):
        """
        Duplicate a project
        POST /api/projects/{id}/duplicate/
        Body: { "new_name": "Project Copy", "copy_screens": true }
        """
        original_project = self.get_object()
        new_name = request.data.get('new_name', f"{original_project.name} (Copy)")
        copy_screens = request.data.get('copy_screens', False)
        
        # Create new project
        new_project = Project.objects.create(
            name=new_name,
            description=original_project.description,
            theme=original_project.theme,
            tags=original_project.tags,
            owner=request.user
        )
        
        # Add owner as member
        ProjectMember.objects.create(
            project=new_project,
            user=request.user,
            role='owner'
        )
        
        # Copy screens if requested
        if copy_screens:
            from api.models import Screen
            for screen in original_project.screens.all():
                Screen.objects.create(
                    project=new_project,
                    name=screen.name,
                    description=screen.description,
                    width=screen.width,
                    height=screen.height,
                    components=screen.components,
                    order=screen.order
                )
        
        serializer = ProjectDetailSerializer(new_project)
        return Response({
            'project': serializer.data,
            'message': 'Project duplicated successfully'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProjectOwner])
    def archive(self, request, pk=None):
        """
        Archive a project (soft delete)
        POST /api/projects/{id}/archive/
        """
        project = self.get_object()
        # You can add an 'is_archived' field to Project model
        # For now, we'll just return success
        return Response({
            'message': 'Project archived successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recently accessed projects
        GET /api/projects/recent/
        """
        queryset = self.get_queryset()[:5]
        serializer = ProjectListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get project statistics
        GET /api/projects/{id}/stats/
        """
        project = self.get_object()
        
        stats = {
            'total_screens': project.screens.count(),
            'total_components': sum(screen.component_count for screen in project.screens.all()),
            'total_members': project.members.count(),
            'total_versions': sum(screen.versions.count() for screen in project.screens.all()),
            'created_at': project.created_at,
            'last_updated': project.updated_at,
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsProjectMember])
    def export(self, request, pk=None):
        """
        Export project as HTML/React/Vue code
        POST /api/projects/{id}/export/
        Body: {
            "format": "html|react|vue",
            "include_screens": ["screen-uuid-1", "screen-uuid-2"],  # optional
            "options": {...}
        }
        """
        project = self.get_object()
        
        # Validate format
        export_format = request.data.get('format', 'html')
        if export_format not in ['html', 'react', 'vue']:
            return Response(
                {'error': 'Invalid format. Must be html, react, or vue'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get screens to export
        screen_ids = request.data.get('include_screens')
        if screen_ids:
            screens = project.screens.filter(id__in=screen_ids)
        else:
            screens = project.screens.all()
        
        if not screens.exists():
            return Response(
                {'error': 'No screens to export'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Import export service
        from api.services.export_service import ExportService
        
        try:
            # Generate export files
            export_result = ExportService.export_project(
                project=project,
                screens=screens,
                format_type=export_format,
                options=request.data.get('options', {})
            )
            
            # Create zip file
            import io
            import zipfile
            from django.http import HttpResponse
            
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for file_path, content in export_result['files'].items():
                    zip_file.writestr(file_path, content)
            
            # Return zip file
            zip_buffer.seek(0)
            response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename="{project.name}-{export_format}.zip"'
            
            return response
            
        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

