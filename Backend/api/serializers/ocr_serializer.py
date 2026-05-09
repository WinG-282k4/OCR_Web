"""
OCR Analysis Serializers
Handles OCR upload and analysis
"""

from rest_framework import serializers
from api.models import OCRAnalysis


class OCRAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for OCR Analysis results"""
    
    component_count = serializers.SerializerMethodField()
    
    class Meta:
        model = OCRAnalysis
        fields = [
            'id', 'image', 'original_filename',
            'detected_components', 'confidence_threshold',
            'status', 'error_message', 'processing_time',
            'component_count', 'created_at'
        ]
        read_only_fields = [
            'id', 'detected_components', 'status',
            'error_message', 'processing_time', 'created_at'
        ]
    
    def get_component_count(self, obj):
        """Count detected components"""
        if isinstance(obj.detected_components, dict):
            normalized = obj.detected_components.get('normalized_components', [])
            if isinstance(normalized, list):
                return len(normalized)
        return 0


class OCRUploadSerializer(serializers.Serializer):
    """Serializer for uploading image for OCR analysis"""
    
    image = serializers.ImageField(required=True)
    confidence_threshold = serializers.FloatField(
        default=0.7,
        min_value=0.0,
        max_value=1.0
    )
    auto_create_screen = serializers.BooleanField(default=True)
    screen_name = serializers.CharField(required=False, max_length=255)
    
    def validate_image(self, value):
        """Validate image file"""
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("Image file too large. Maximum size is 10MB")
        
        # Check image format
        allowed_formats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if value.content_type not in allowed_formats:
            raise serializers.ValidationError(
                f"Invalid image format. Allowed formats: {', '.join(allowed_formats)}"
            )
        
        return value
    
    def validate(self, attrs):
        """Validate OCR upload data"""
        auto_create = attrs.get('auto_create_screen', True)
        screen_name = attrs.get('screen_name')
        
        if auto_create and not screen_name:
            # Generate default screen name from filename
            image_name = attrs['image'].name
            attrs['screen_name'] = image_name.rsplit('.', 1)[0]
        
        return attrs


class CreateScreenFromOCRSerializer(serializers.Serializer):
    """Serializer for creating screen from OCR analysis"""
    
    ocr_analysis_id = serializers.UUIDField(required=True)
    screen_name = serializers.CharField(required=True, max_length=255)
    screen_description = serializers.CharField(required=False, allow_blank=True)
    confidence_filter = serializers.FloatField(
        default=0.7,
        min_value=0.0,
        max_value=1.0,
        required=False
    )
    
    def validate_ocr_analysis_id(self, value):
        """Validate OCR analysis exists and is successful"""
        try:
            ocr = OCRAnalysis.objects.get(id=value)
            
            if ocr.status != 'completed':
                raise serializers.ValidationError("OCR analysis is not completed yet")
            
            if ocr.status == 'failed':
                raise serializers.ValidationError("OCR analysis failed. Cannot create screen.")
            
            # Store OCR object for later use
            self.ocr_analysis = ocr
            return value
            
        except OCRAnalysis.DoesNotExist:
            raise serializers.ValidationError("OCR analysis not found")


class OCRStatusSerializer(serializers.Serializer):
    """Serializer for OCR status check"""
    
    status = serializers.CharField()
    progress = serializers.IntegerField()
    message = serializers.CharField(required=False)
    component_count = serializers.IntegerField(required=False)
