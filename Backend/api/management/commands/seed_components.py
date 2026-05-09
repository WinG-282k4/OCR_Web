"""
Management command to seed system component templates
Usage: python manage.py seed_components
"""

from django.core.management.base import BaseCommand
from api.models import ComponentTemplate


class Command(BaseCommand):
    help = 'Seed system component templates into database'
    
    def handle(self, *args, **options):
        self.stdout.write('Seeding system component templates...')
        
        templates = [
            # Buttons
            {
                'name': 'Primary Button',
                'category': 'button',
                'type': 'button',
                'description': 'Standard primary action button',
                'is_system': True,
                'is_public': True,
                'tags': ['button', 'primary', 'action'],
                'template_data': {
                    'type': 'button',
                    'defaultSize': {'width': 120, 'height': 40},
                    'properties': {
                        'text': 'Button',
                        'variant': 'primary',
                        'fontSize': '14px',
                        'backgroundColor': '#0070f3',
                        'color': '#ffffff',
                        'borderRadius': '4px',
                        'cursor': 'pointer'
                    }
                }
            },
            {
                'name': 'Secondary Button',
                'category': 'button',
                'type': 'button',
                'description': 'Secondary action button',
                'is_system': True,
                'is_public': True,
                'tags': ['button', 'secondary'],
                'template_data': {
                    'type': 'button',
                    'defaultSize': {'width': 120, 'height': 40},
                    'properties': {
                        'text': 'Button',
                        'variant': 'secondary',
                        'fontSize': '14px',
                        'backgroundColor': '#ffffff',
                        'color': '#333333',
                        'border': '1px solid #cccccc',
                        'borderRadius': '4px'
                    }
                }
            },
            
            # Inputs
            {
                'name': 'Text Input',
                'category': 'input',
                'type': 'input',
                'description': 'Standard text input field',
                'is_system': True,
                'is_public': True,
                'tags': ['input', 'form', 'text'],
                'template_data': {
                    'type': 'input',
                    'defaultSize': {'width': 200, 'height': 36},
                    'properties': {
                        'inputType': 'text',
                        'placeholder': 'Enter text...',
                        'fontSize': '14px',
                        'padding': '8px 12px',
                        'border': '1px solid #cccccc',
                        'borderRadius': '4px'
                    }
                }
            },
            {
                'name': 'Email Input',
                'category': 'input',
                'type': 'input',
                'description': 'Email input with validation',
                'is_system': True,
                'is_public': True,
                'tags': ['input', 'form', 'email'],
                'template_data': {
                    'type': 'input',
                    'defaultSize': {'width': 200, 'height': 36},
                    'properties': {
                        'inputType': 'email',
                        'placeholder': 'email@example.com',
                        'fontSize': '14px',
                        'padding': '8px 12px',
                        'border': '1px solid #cccccc',
                        'borderRadius': '4px'
                    }
                }
            },
            
            # Text
            {
                'name': 'Heading H1',
                'category': 'text',
                'type': 'text',
                'description': 'Large heading text',
                'is_system': True,
                'is_public': True,
                'tags': ['text', 'heading', 'h1'],
                'template_data': {
                    'type': 'text',
                    'defaultSize': {'width': 200, 'height': 40},
                    'properties': {
                        'content': 'Heading',
                        'tag': 'h1',
                        'fontSize': '32px',
                        'fontWeight': 'bold',
                        'color': '#333333'
                    }
                }
            },
            {
                'name': 'Paragraph',
                'category': 'text',
                'type': 'text',
                'description': 'Standard paragraph text',
                'is_system': True,
                'is_public': True,
                'tags': ['text', 'paragraph'],
                'template_data': {
                    'type': 'text',
                    'defaultSize': {'width': 300, 'height': 60},
                    'properties': {
                        'content': 'Lorem ipsum dolor sit amet...',
                        'tag': 'p',
                        'fontSize': '14px',
                        'lineHeight': '1.5',
                        'color': '#666666'
                    }
                }
            },
            
            # Images
            {
                'name': 'Image Placeholder',
                'category': 'image',
                'type': 'image',
                'description': 'Image placeholder component',
                'is_system': True,
                'is_public': True,
                'tags': ['image', 'media'],
                'template_data': {
                    'type': 'image',
                    'defaultSize': {'width': 200, 'height': 150},
                    'properties': {
                        'src': 'https://via.placeholder.com/200x150',
                        'alt': 'Placeholder image',
                        'objectFit': 'cover',
                        'borderRadius': '4px'
                    }
                }
            },
            
            # Containers
            {
                'name': 'Flex Container',
                'category': 'container',
                'type': 'container',
                'description': 'Flexible container with flexbox',
                'is_system': True,
                'is_public': True,
                'tags': ['container', 'flex', 'layout'],
                'template_data': {
                    'type': 'container',
                    'defaultSize': {'width': 400, 'height': 200},
                    'properties': {
                        'display': 'flex',
                        'flexDirection': 'row',
                        'alignItems': 'center',
                        'justifyContent': 'flex-start',
                        'gap': '16px',
                        'padding': '16px',
                        'backgroundColor': '#f5f5f5',
                        'borderRadius': '8px'
                    }
                }
            },
            {
                'name': 'Card Container',
                'category': 'card',
                'type': 'card',
                'description': 'Card with shadow and padding',
                'is_system': True,
                'is_public': True,
                'tags': ['card', 'container'],
                'template_data': {
                    'type': 'card',
                    'defaultSize': {'width': 300, 'height': 200},
                    'properties': {
                        'padding': '24px',
                        'backgroundColor': '#ffffff',
                        'borderRadius': '8px',
                        'boxShadow': '0 2px 8px rgba(0,0,0,0.1)',
                        'border': '1px solid #eeeeee'
                    }
                }
            },
            
            # Navigation
            {
                'name': 'Navigation Bar',
                'category': 'navigation',
                'type': 'navigation',
                'description': 'Horizontal navigation bar',
                'is_system': True,
                'is_public': True,
                'tags': ['navigation', 'navbar', 'menu'],
                'template_data': {
                    'type': 'navigation',
                    'defaultSize': {'width': 800, 'height': 60},
                    'properties': {
                        'display': 'flex',
                        'alignItems': 'center',
                        'justifyContent': 'space-between',
                        'padding': '0 24px',
                        'backgroundColor': '#ffffff',
                        'boxShadow': '0 1px 3px rgba(0,0,0,0.1)'
                    }
                }
            },
            
            # Forms
            {
                'name': 'Form Group',
                'category': 'form',
                'type': 'form',
                'description': 'Form group with label and input',
                'is_system': True,
                'is_public': True,
                'tags': ['form', 'input', 'label'],
                'template_data': {
                    'type': 'form',
                    'defaultSize': {'width': 300, 'height': 80},
                    'properties': {
                        'display': 'flex',
                        'flexDirection': 'column',
                        'gap': '8px',
                        'label': 'Label',
                        'labelFontSize': '14px',
                        'labelFontWeight': '500'
                    }
                }
            },
            
            # Lists
            {
                'name': 'List Item',
                'category': 'list',
                'type': 'list',
                'description': 'List item component',
                'is_system': True,
                'is_public': True,
                'tags': ['list', 'item'],
                'template_data': {
                    'type': 'list',
                    'defaultSize': {'width': 300, 'height': 50},
                    'properties': {
                        'display': 'flex',
                        'alignItems': 'center',
                        'padding': '12px 16px',
                        'borderBottom': '1px solid #eeeeee',
                        'cursor': 'pointer',
                        'hoverBackgroundColor': '#f5f5f5'
                    }
                }
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for template_data in templates:
            template, created = ComponentTemplate.objects.update_or_create(
                name=template_data['name'],
                category=template_data['category'],
                defaults=template_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {template.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'↻ Updated: {template.name}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created {created_count}, Updated {updated_count} templates.'
        ))
