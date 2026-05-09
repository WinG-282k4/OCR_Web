"""
OCR Service
Handles Nanonets API integration for UI component detection
"""

import requests
import time
from django.conf import settings


class OCRService:
    """Service for OCR analysis using Nanonets API"""
    
    NANONETS_API_URL = "https://app.nanonets.com/api/v2/OCR/Model"
    
    @classmethod
    def analyze_image(cls, ocr_analysis):
        """
        Analyze image using Nanonets OCR
        
        Args:
            ocr_analysis: OCRAnalysis model instance
            
        Returns:
            dict: Processing result with detected components
        """
        start_time = time.time()
        
        try:
            # Update status
            ocr_analysis.status = 'processing'
            ocr_analysis.save()
            
            # In production, you would call Nanonets API here
            # For now, we'll simulate with mock data
            if hasattr(settings, 'NANONETS_API_KEY') and settings.NANONETS_API_KEY:
                result = cls._call_nanonets_api(ocr_analysis.image.path)
            else:
                # Mock OCR result for development
                result = cls._mock_ocr_result(ocr_analysis)
            
            # Process and normalize the results
            normalized_components = cls._normalize_components(result)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Update OCR analysis
            ocr_analysis.detected_components = {
                'raw_response': result,
                'normalized_components': normalized_components
            }
            ocr_analysis.status = 'completed'
            ocr_analysis.processing_time = processing_time
            ocr_analysis.save()
            
            return {
                'status': 'completed',
                'normalized_components': normalized_components,
                'width': result.get('width', 1920),
                'height': result.get('height', 1080)
            }
            
        except Exception as e:
            ocr_analysis.status = 'failed'
            ocr_analysis.error_message = str(e)
            ocr_analysis.save()
            raise
    
    @classmethod
    def _call_nanonets_api(cls, image_path):
        """Call Nanonets API (production implementation)"""
        api_key = settings.NANONETS_API_KEY
        model_id = getattr(settings, 'NANONETS_MODEL_ID', 'your-model-id')
        
        url = f"{cls.NANONETS_API_URL}/{model_id}/LabelFile/"
        
        with open(image_path, 'rb') as image_file:
            response = requests.post(
                url,
                auth=requests.auth.HTTPBasicAuth(api_key, ''),
                files={'file': image_file}
            )
        
        response.raise_for_status()
        return response.json()
    
    @classmethod
    def _mock_ocr_result(cls, ocr_analysis):
        """Generate mock OCR result for development"""
        return {
            'width': 1920,
            'height': 1080,
            'predictions': [
                {
                    'label': 'button',
                    'xmin': 100,
                    'ymin': 100,
                    'xmax': 200,
                    'ymax': 150,
                    'score': 0.95
                },
                {
                    'label': 'input',
                    'xmin': 100,
                    'ymin': 200,
                    'xmax': 300,
                    'ymax': 240,
                    'score': 0.89
                },
                {
                    'label': 'text',
                    'xmin': 100,
                    'ymin': 50,
                    'xmax': 400,
                    'ymax': 80,
                    'score': 0.92
                },
            ]
        }
    
    @classmethod
    def _normalize_components(cls, raw_result):
        """
        Normalize Nanonets response to our component format
        
        Returns:
            list: Normalized component data
        """
        predictions = raw_result.get('predictions', [])
        normalized = []
        
        for idx, pred in enumerate(predictions):
            component = {
                'id': f"comp-{idx + 1}",
                'type': pred.get('label', 'unknown'),
                'position': {
                    'x': pred.get('xmin', 0),
                    'y': pred.get('ymin', 0)
                },
                'size': {
                    'width': pred.get('xmax', 0) - pred.get('xmin', 0),
                    'height': pred.get('ymax', 0) - pred.get('ymin', 0)
                },
                'confidence': pred.get('score', 0),
                'properties': cls._generate_default_properties(pred.get('label', 'unknown'))
            }
            normalized.append(component)
        
        return normalized
    
    @classmethod
    def _generate_default_properties(cls, component_type):
        """Generate default properties based on component type"""
        base_props = {
            'className': '',
            'style': {}
        }
        
        type_specific = {
            'button': {
                'text': 'Button',
                'variant': 'default',
                'size': 'medium'
            },
            'input': {
                'placeholder': 'Enter text',
                'type': 'text'
            },
            'text': {
                'content': 'Text content',
                'fontSize': '16px'
            },
            'image': {
                'src': '',
                'alt': 'Image'
            }
        }
        
        return {**base_props, **type_specific.get(component_type, {})}
