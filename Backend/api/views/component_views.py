"""
Component Template Views
API for component template library
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q

from api.models import ComponentTemplate
from api.serializers.component_serializer import (
    ComponentTemplateSerializer,
    ComponentTemplateCreateSerializer,
    ComponentTemplateListSerializer
)


class ComponentTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Component Templates
    
    Endpoints:
    - GET /api/components/ - List templates (with filters)
    - POST /api/components/ - Create user template
    - GET /api/components/{id}/ - Get template detail
    - PUT/PATCH /api/components/{id}/ - Update template (owner only)
    - DELETE /api/components/{id}/ - Delete template (owner only)
    """
    
    queryset = ComponentTemplate.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'list':
            return ComponentTemplateListSerializer
        elif self.action == 'create':
            return ComponentTemplateCreateSerializer
        return ComponentTemplateSerializer
    
    def get_queryset(self):
        """
        Filter templates based on user access
        - System templates: visible to all
        - Public templates: visible to all
        - User's own templates: visible to creator
        """
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by type
        template_type = self.request.query_params.get('type')
        if template_type:
            queryset = queryset.filter(type=template_type)
        
        # Filter by tags
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag.strip()])
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Access control: show system + public + user's own templates
        user = self.request.user
        queryset = queryset.filter(
            Q(is_system=True) | 
            Q(is_public=True) | 
            Q(created_by=user)
        )
        
        return queryset
    
    def perform_create(self, serializer):
        """Create template with current user"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Only allow owner to update"""
        from rest_framework.exceptions import PermissionDenied
        
        template = self.get_object()
        if template.is_system:
            raise PermissionDenied('Cannot modify system templates')
        if template.created_by != self.request.user:
            raise PermissionDenied('You can only modify your own templates')
        serializer.save()
    
    def perform_destroy(self, instance):
        """Soft delete by marking inactive"""
        from rest_framework.exceptions import PermissionDenied
        
        if instance.is_system:
            raise PermissionDenied('Cannot delete system templates')
        if instance.created_by != self.request.user:
            raise PermissionDenied('You can only delete your own templates')
        instance.is_active = False
        instance.save()
    
    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        """
        Increment usage count when template is used
        POST /api/components/{id}/use/
        """
        template = self.get_object()
        template.increment_usage()
        
        return Response({
            'message': 'Usage recorded',
            'usage_count': template.usage_count
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get list of available categories
        GET /api/components/categories/
        """
        categories = ComponentTemplate.CATEGORY_CHOICES
        return Response({
            'categories': [
                {'value': value, 'label': label}
                for value, label in categories
            ]
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular templates (most used)
        GET /api/components/popular/
        """
        popular_templates = self.get_queryset().order_by('-usage_count')[:10]
        serializer = ComponentTemplateListSerializer(popular_templates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
