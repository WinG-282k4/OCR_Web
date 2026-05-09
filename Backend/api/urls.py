"""
API URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from api.views import (
    # Auth views
    RegisterView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    MeView,
    ChangePasswordView,
    UpdateProfileView,
    # ViewSets
    ProjectViewSet,
    ProjectMemberViewSet,
    ScreenViewSet,
    ScreenVersionViewSet,
    OCRAnalysisViewSet,
    ComponentTemplateViewSet,
)

# Import health views
from api.views.health_views import health_check, readiness_check, liveness_check

# Main router
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'components', ComponentTemplateViewSet, basename='component')

# Nested routers for project resources
projects_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
projects_router.register(r'members', ProjectMemberViewSet, basename='project-members')
projects_router.register(r'screens', ScreenViewSet, basename='project-screens')
projects_router.register(r'ocr', OCRAnalysisViewSet, basename='project-ocr')

# Nested router for screen versions
screens_router = routers.NestedDefaultRouter(projects_router, r'screens', lookup='screen')
screens_router.register(r'versions', ScreenVersionViewSet, basename='screen-versions')

# Auth URLs
auth_urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/', UpdateProfileView.as_view(), name='update-profile'),
]

# Main URL patterns
urlpatterns = [
    # Health checks
    path('health/', health_check, name='health'),
    path('ready/', readiness_check, name='readiness'),
    path('live/', liveness_check, name='liveness'),
    # Auth
    path('auth/', include(auth_urlpatterns)),
    # Resources
    path('', include(router.urls)),
    path('', include(projects_router.urls)),
    path('', include(screens_router.urls)),
]
