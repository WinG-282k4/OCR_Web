"""
OCR Analysis Views
Handles OCR upload and analysis with Nanonets
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from api.models import Project, OCRAnalysis, Screen, ScreenVersion
from api.serializers import (
    OCRAnalysisSerializer,
    OCRUploadSerializer,
    CreateScreenFromOCRSerializer,
    OCRStatusSerializer,
)
from api.permissions import IsProjectEditor


class OCRAnalysisViewSet(viewsets.ModelViewSet):
    """
    ViewSet for OCR Analysis operations
    
    list: GET /api/projects/{project_id}/ocr/ - List OCR analyses
    create: POST /api/projects/{project_id}/ocr/upload/ - Upload image for OCR
    retrieve: GET /api/projects/{project_id}/ocr/{id}/ - Get OCR analysis details
    """
    
    serializer_class = OCRAnalysisSerializer
    permission_classes = [IsAuthenticated, IsProjectEditor]
    
    def get_queryset(self):
        """Get OCR analyses for specific project"""
        project_id = self.kwargs.get('project_pk')
        return OCRAnalysis.objects.select_related(
            'project'
        ).filter(project_id=project_id).order_by('-created_at')
    
    def get_project(self):
        """Get project from URL"""
        project_id = self.kwargs.get('project_pk')
        return get_object_or_404(Project, id=project_id)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsProjectEditor])
    def upload(self, request, project_pk=None):
        """
        Upload image for OCR analysis
        POST /api/projects/{project_id}/ocr/upload/
        """
        project = self.get_project()
        self.check_object_permissions(request, project)
        
        serializer = OCRUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        image = serializer.validated_data['image']
        confidence_threshold = serializer.validated_data.get('confidence_threshold', 0.7)
        auto_create_screen = serializer.validated_data.get('auto_create_screen', True)
        screen_name = serializer.validated_data.get('screen_name', image.name.rsplit('.', 1)[0])
        
        # Create OCR analysis record
        ocr_analysis = OCRAnalysis.objects.create(
            project=project,
            image=image,
            original_filename=image.name,
            confidence_threshold=confidence_threshold,
            status='pending'
        )
        
        # Import OCR service
        from api.services.ocr_service import OCRService
        
        # Process OCR asynchronously (in real app, use Celery)
        try:
            result = OCRService.analyze_image(ocr_analysis)
            
            # Auto-create screen if requested
            if auto_create_screen and result.get('status') == 'completed':
                screen = Screen.objects.create(
                    project=project,
                    name=screen_name,
                    description=f"Auto-generated from OCR analysis",
                    components=result.get('normalized_components', []),
                    width=result.get('width', 1920),
                    height=result.get('height', 1080)
                )
                
                # Create initial version
                ScreenVersion.objects.create(
                    screen=screen,
                    version_number=1,
                    components=screen.components,
                    description="Auto-generated from OCR",
                    created_by=request.user
                )
                
                return Response({
                    'ocr_analysis': OCRAnalysisSerializer(ocr_analysis).data,
                    'screen': {
                        'id': screen.id,
                        'name': screen.name
                    },
                    'message': 'OCR analysis completed and screen created'
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'ocr_analysis': OCRAnalysisSerializer(ocr_analysis).data,
                'message': 'OCR analysis completed'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            ocr_analysis.status = 'failed'
            ocr_analysis.error_message = str(e)
            ocr_analysis.save()
            
            return Response({
                'error': 'OCR analysis failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def status(self, request, project_pk=None, pk=None):
        """
        Check OCR analysis status
        GET /api/projects/{project_id}/ocr/{id}/status/
        """
        ocr_analysis = self.get_object()
        
        status_data = {
            'status': ocr_analysis.status,
            'progress': 100 if ocr_analysis.status == 'completed' else 50 if ocr_analysis.status == 'processing' else 0,
        }
        
        if ocr_analysis.status == 'completed':
            component_count = 0
            if isinstance(ocr_analysis.detected_components, dict):
                normalized = ocr_analysis.detected_components.get('normalized_components', [])
                component_count = len(normalized) if isinstance(normalized, list) else 0
            
            status_data['message'] = 'OCR analysis completed'
            status_data['component_count'] = component_count
        elif ocr_analysis.status == 'failed':
            status_data['message'] = ocr_analysis.error_message or 'OCR analysis failed'
        else:
            status_data['message'] = 'OCR analysis in progress'
        
        serializer = OCRStatusSerializer(status_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsProjectEditor])
    def create_screen(self, request, project_pk=None):
        """
        Create screen from existing OCR analysis
        POST /api/projects/{project_id}/ocr/create_screen/
        Body: {
            "ocr_analysis_id": "uuid",
            "screen_name": "Login Screen",
            "confidence_filter": 0.8
        }
        """
        project = self.get_project()
        self.check_object_permissions(request, project)
        
        serializer = CreateScreenFromOCRSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ocr_analysis = serializer.ocr_analysis
        screen_name = serializer.validated_data['screen_name']
        screen_description = serializer.validated_data.get('screen_description', '')
        confidence_filter = serializer.validated_data.get('confidence_filter', 0.7)
        
        # Get normalized components
        components = []
        if isinstance(ocr_analysis.detected_components, dict):
            normalized = ocr_analysis.detected_components.get('normalized_components', [])
            if isinstance(normalized, list):
                # Filter by confidence
                components = [
                    comp for comp in normalized
                    if comp.get('confidence', 0) >= confidence_filter
                ]
        
        # Create screen
        screen = Screen.objects.create(
            project=project,
            name=screen_name,
            description=screen_description or f"Created from OCR analysis",
            components=components,
            width=1920,  # Default width
            height=1080  # Default height
        )
        
        # Create initial version
        ScreenVersion.objects.create(
            screen=screen,
            version_number=1,
            components=components,
            description="Created from OCR analysis",
            created_by=request.user
        )
        
        return Response({
            'screen': {
                'id': screen.id,
                'name': screen.name,
                'component_count': len(components)
            },
            'message': 'Screen created from OCR analysis'
        }, status=status.HTTP_201_CREATED)
