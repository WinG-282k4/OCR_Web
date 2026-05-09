"""
Health Check Views
API endpoint to check service health
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.conf import settings
import time


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint
    GET /api/health/
    
    Returns:
        - status: healthy/unhealthy
        - database: connected/error
        - timestamp: current server time
    """
    health_status = {
        'status': 'healthy',
        'timestamp': time.time(),
        'version': getattr(settings, 'API_VERSION', '1.0.0'),
        'checks': {}
    }
    
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        health_status['checks']['database'] = 'connected'
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['checks']['database'] = f'error: {str(e)}'
    
    # Storage check (optional)
    try:
        from django.core.files.storage import default_storage
        health_status['checks']['storage'] = 'available'
    except Exception as e:
        health_status['checks']['storage'] = f'warning: {str(e)}'
    
    # Return appropriate status code
    status_code = status.HTTP_200_OK if health_status['status'] == 'healthy' else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return Response(health_status, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    """
    Readiness check for Kubernetes/container orchestration
    GET /api/ready/
    """
    try:
        # Check if database is ready
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return Response({'status': 'ready'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'status': 'not ready', 'error': str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def liveness_check(request):
    """
    Liveness check for Kubernetes/container orchestration
    GET /api/live/
    """
    return Response({'status': 'alive'}, status=status.HTTP_200_OK)
