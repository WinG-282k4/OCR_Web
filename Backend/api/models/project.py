"""
Project Models - Project, ProjectMember, Screen, ScreenVersion
Handles project structure, collaboration, and screens
"""

import uuid
from django.db import models
from django.conf import settings


class Project(models.Model):
    """
    Project - Container for multiple screens
    Supports collaboration with multiple users
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Owner & collaboration
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_projects'
    )
    # members via ProjectMember model (many-to-many)
    
    # Basic information
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Theme settings (JSON)
    theme = models.JSONField(default=dict, blank=True)
    # {
    #   "primaryColor": "#0070f3",
    #   "secondaryColor": "#ff0080",
    #   "fontFamily": "Inter, sans-serif",
    #   "spacing": "8px"
    # }
    
    # Metadata
    thumbnail = models.ImageField(upload_to='project_thumbnails/', blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['-updated_at']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def screen_count(self):
        """Return number of screens in project"""
        return self.screens.count()
    
    @property
    def member_count(self):
        """Return number of members including owner"""
        return self.members.count()


class ProjectMember(models.Model):
    """
    ProjectMember - Many-to-Many relationship between User and Project
    Enables collaboration with role-based permissions
    """
    
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='project_memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # Invitation metadata
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invited_members'
    )
    
    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_members'
        unique_together = ['project', 'user']
        ordering = ['-joined_at']
        indexes = [
            models.Index(fields=['project', 'user']),
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.project.name} ({self.role})"
    
    @property
    def can_edit(self):
        """Check if member can edit project"""
        return self.role in ['owner', 'editor']
    
    @property
    def can_delete(self):
        """Check if member can delete project"""
        return self.role == 'owner'
    
    @property
    def can_invite(self):
        """Check if member can invite others"""
        return self.role == 'owner'


class ScreenQuerySet(models.QuerySet):
    """Custom QuerySet for Screen with helpful annotations"""
    
    def annotate_component_count(self):
        """Annotate queryset with component count"""
        from django.db.models import Value, IntegerField
        return self.annotate(component_count=Value(0, output_field=IntegerField()))


class Screen(models.Model):
    """
    Screen - Individual page/screen within a project
    Contains UI components and canvas settings
    """
    
    SCREEN_TYPES = [
        ('page', 'Web Page'),
        ('component', 'Component'),
        ('modal', 'Modal/Dialog'),
        ('section', 'Section'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to project
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='screens'
    )
    
    # Screen information
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    screen_type = models.CharField(max_length=20, choices=SCREEN_TYPES, default='page')
    
    # Order in project
    order = models.IntegerField(default=0)
    
    # Canvas settings
    width = models.IntegerField(default=1920)
    height = models.IntegerField(default=1080)
    background_color = models.CharField(max_length=20, default='#ffffff')
    background_image = models.ImageField(upload_to='screen_backgrounds/', blank=True, null=True)
    
    # UI Components (JSON) - Array of component objects
    components = models.JSONField(default=list, blank=True)
    # [
    #   {
    #     "id": "comp-uuid-1",
    #     "type": "button",
    #     "position": {"x": 100, "y": 200},
    #     "size": {"width": 120, "height": 40},
    #     "properties": {"text": "Submit", ...}
    #   }
    # ]
    
    # Thumbnail
    thumbnail = models.ImageField(upload_to='screen_thumbnails/', blank=True, null=True)
    
    # OCR tracking
    created_from_ocr = models.BooleanField(default=False)
    ocr_analysis = models.ForeignKey(
        'OCRAnalysis',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='screens'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_saved_at = models.DateTimeField(auto_now=True)
    
    # Custom manager
    objects = ScreenQuerySet.as_manager()
    
    class Meta:
        db_table = 'screens'
        ordering = ['project', 'order']
        unique_together = ['project', 'order']
        indexes = [
            models.Index(fields=['project', 'order']),
            models.Index(fields=['-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.project.name} - {self.name}"
    
    @property
    def component_count(self):
        """Return number of components in screen"""
        if isinstance(self.components, list):
            return len(self.components)
        return 0
    
    @property
    def current_version_number(self):
        """Return current version number"""
        last_version = self.versions.order_by('-version_number').first()
        return last_version.version_number if last_version else 0
    
    def save_version(self, change_type='MANUAL_EDIT', description='', changed_components=None, created_by=None):
        """Create a version snapshot of current screen state"""
        latest_version = self.versions.order_by('-version_number').first()
        next_version_number = (latest_version.version_number + 1) if latest_version else 1
        
        ScreenVersion.objects.create(
            screen=self,
            version_number=next_version_number,
            components=self.components,
            change_type=change_type,
            description=description,
            changed_components=changed_components or [],
            created_by=created_by
        )
        
        return next_version_number


class ScreenVersion(models.Model):
    """
    ScreenVersion - Version history for screens
    Uses delta-based versioning to save storage
    - Version 1: Full snapshot (base)
    - Version 2+: Mostly deltas (changes only)
    - Every Nth version: Base snapshot (to limit delta chain length)
    """
    
    # Create base version every N versions (to optimize reconstruction)
    BASE_VERSION_INTERVAL = 20
    
    CHANGE_TYPES = [
        ('OCR_IMPORT', 'OCR Import'),
        ('MANUAL_EDIT', 'Manual Edit'),
        ('AUTO_SAVE', 'Auto Save'),
        ('RESTORE', 'Restored'),
        ('DUPLICATE', 'Duplicated'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    screen = models.ForeignKey(
        Screen,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    
    version_number = models.IntegerField()
    
    # Version type
    is_base_version = models.BooleanField(default=False)
    # True for v1 (full snapshot), False for v2+ (delta only)
    
    # Data storage
    components = models.JSONField(default=list, blank=True, null=True)
    # For base version: full components list
    # For delta version: NULL (use changes_delta instead)
    
    changes_delta = models.JSONField(default=dict, blank=True, null=True)
    # For delta versions only:
    # {
    #   "added": [{"id": "comp-1", "type": "button", ...}],
    #   "modified": [{"id": "comp-2", "changes": {"position": {"x": 100}}}],
    #   "removed": ["comp-3-id", "comp-4-id"]
    # }
    
    thumbnail = models.ImageField(upload_to='version_thumbnails/', blank=True, null=True)
    
    # Change metadata
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES, default='MANUAL_EDIT')
    description = models.TextField(blank=True)
    changed_components = models.JSONField(default=list, blank=True)
    # List of component IDs that were changed: ["comp-uuid-1", "comp-uuid-2"]
    
    # Creator
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='screen_versions'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'screen_versions'
        ordering = ['-version_number']
        unique_together = ['screen', 'version_number']
        indexes = [
            models.Index(fields=['screen', '-version_number']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['screen', 'is_base_version']),
        ]
    
    def __str__(self):
        version_type = "BASE" if self.is_base_version else "DELTA"
        return f"{self.screen.name} - v{self.version_number} ({version_type})"
    
    @staticmethod
    def should_create_base_version(version_number):
        """
        Determine if a version should be a base version
        - v1: Always base
        - Every BASE_VERSION_INTERVAL versions: Base (v20, v40, v60...)
        - Others: Delta
        """
        if version_number == 1:
            return True
        return version_number % ScreenVersion.BASE_VERSION_INTERVAL == 0
    
    def get_full_components(self):
        """
        Reconstruct full component list by applying deltas
        Returns: List of components
        """
        if self.is_base_version:
            # Base version has full components
            return self.components or []
        
        # For delta version, reconstruct from base + all deltas up to this version
        base_version = self.screen.versions.filter(
            is_base_version=True,
            version_number__lt=self.version_number
        ).order_by('-version_number').first()
        
        if not base_version:
            # Fallback: if no base found, return empty
            return []
        
        # Start with base components
        components = list(base_version.components or [])
        components_dict = {c['id']: c for c in components}
        
        # Apply all deltas from base to current version
        delta_versions = self.screen.versions.filter(
            version_number__gt=base_version.version_number,
            version_number__lte=self.version_number,
            is_base_version=False
        ).order_by('version_number')
        
        for delta_version in delta_versions:
            delta = delta_version.changes_delta or {}
            
            # Apply removed
            for removed_id in delta.get('removed', []):
                if removed_id in components_dict:
                    del components_dict[removed_id]
            
            # Apply modified
            for modified_comp in delta.get('modified', []):
                comp_id = modified_comp.get('id')
                if comp_id in components_dict:
                    # Deep merge changes
                    self._deep_merge(components_dict[comp_id], modified_comp.get('changes', {}))
            
            # Apply added
            for added_comp in delta.get('added', []):
                components_dict[added_comp['id']] = added_comp
        
        return list(components_dict.values())
    
    @staticmethod
    def _deep_merge(target, source):
        """Deep merge source dict into target dict"""
        for key, value in source.items():
            if isinstance(value, dict) and key in target and isinstance(target[key], dict):
                ScreenVersion._deep_merge(target[key], value)
            else:
                target[key] = value
    
    @staticmethod
    def calculate_delta(old_components, new_components):
        """
        Calculate diff between two component lists
        Returns: Delta dict with added/modified/removed
        """
        old_dict = {c['id']: c for c in (old_components or [])}
        new_dict = {c['id']: c for c in (new_components or [])}
        
        added = []
        modified = []
        removed = []
        
        # Find removed and modified
        for comp_id, old_comp in old_dict.items():
            if comp_id not in new_dict:
                removed.append(comp_id)
            else:
                new_comp = new_dict[comp_id]
                changes = ScreenVersion._get_component_changes(old_comp, new_comp)
                if changes:
                    modified.append({
                        'id': comp_id,
                        'changes': changes
                    })
        
        # Find added
        for comp_id, new_comp in new_dict.items():
            if comp_id not in old_dict:
                added.append(new_comp)
        
        return {
            'added': added,
            'modified': modified,
            'removed': removed
        }
    
    @staticmethod
    def _get_component_changes(old_comp, new_comp):
        """Get changes between two component objects"""
        changes = {}
        
        for key, new_value in new_comp.items():
            if key not in old_comp:
                changes[key] = new_value
            elif old_comp[key] != new_value:
                if isinstance(new_value, dict) and isinstance(old_comp[key], dict):
                    # Recursively get nested changes
                    nested_changes = ScreenVersion._get_component_changes(old_comp[key], new_value)
                    if nested_changes:
                        changes[key] = nested_changes
                else:
                    changes[key] = new_value
        
        return changes
