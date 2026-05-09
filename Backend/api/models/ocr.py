"""
OCR Model - OCR Analysis results
Stores results from Nanonets OCR processing
"""

import uuid
from django.db import models


class OCRAnalysis(models.Model):
    """
    OCRAnalysis - Stores OCR image analysis results
    Links to project and creates screens automatically
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to project
    project = models.ForeignKey(
        'Project',
        on_delete=models.CASCADE,
        related_name='ocr_analyses'
    )
    
    # Image information
    image = models.ImageField(upload_to='ocr_uploads/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255)
    
    # OCR settings
    confidence_threshold = models.FloatField(default=0.5)
    
    # Results (JSON)
    detected_components = models.JSONField(default=dict, blank=True)
    # {
    #   "raw_response": { ... },  # Raw response from Nanonets
    #   "normalized_components": [  # Processed components
    #     {
    #       "type": "button",
    #       "content": "Submit",
    #       "position": {"x": 100, "y": 200},
    #       "style": { ... },
    #       "confidence": 0.95
    #     }
    #   ]
    # }
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    
    # Performance metrics
    processing_time = models.FloatField(null=True, blank=True)  # seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ocr_analyses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"OCR: {self.original_filename} - {self.status}"
    
    @property
    def component_count(self):
        """Return number of detected components"""
        if self.detected_components and 'normalized_components' in self.detected_components:
            return len(self.detected_components['normalized_components'])
        return 0
