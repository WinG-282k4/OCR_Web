"""
Export Service
Handles exporting screens to HTML/React/Vue code
"""


class ExportService:
    """Service for exporting screens to various formats"""
    
    @classmethod
    def export_screen(cls, screen, format_type='html'):
        """
        Export screen to specified format
        
        Args:
            screen: Screen model instance
            format_type: 'html', 'react', or 'vue'
            
        Returns:
            str: Generated code
        """
        if format_type == 'html':
            return cls._export_html(screen)
        elif format_type == 'react':
            return cls._export_react(screen)
        elif format_type == 'vue':
            return cls._export_vue(screen)
        else:
            raise ValueError(f"Unsupported export format: {format_type}")
    
    @classmethod
    def _export_html(cls, screen):
        """Export screen as HTML"""
        components = screen.components if isinstance(screen.components, list) else []
        
        html_parts = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '    <meta charset="UTF-8">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            f'    <title>{screen.name}</title>',
            '    <style>',
            '        * { margin: 0; padding: 0; box-sizing: border-box; }',
            f'        .container {{ width: {screen.width}px; height: {screen.height}px; position: relative; }}',
            '        .component { position: absolute; }',
            '    </style>',
            '</head>',
            '<body>',
            '    <div class="container">',
        ]
        
        # Add components
        for comp in components:
            html_parts.append(cls._component_to_html(comp))
        
        html_parts.extend([
            '    </div>',
            '</body>',
            '</html>'
        ])
        
        return '\n'.join(html_parts)
    
    @classmethod
    def _component_to_html(cls, component):
        """Convert component to HTML element"""
        comp_type = component.get('type', 'div')
        comp_id = component.get('id', '')
        position = component.get('position', {})
        size = component.get('size', {})
        props = component.get('properties', {})
        
        style = f"left: {position.get('x', 0)}px; top: {position.get('y', 0)}px; width: {size.get('width', 100)}px; height: {size.get('height', 50)}px;"
        
        if comp_type == 'button':
            text = props.get('text', 'Button')
            return f'        <button class="component" style="{style}">{text}</button>'
        elif comp_type == 'input':
            placeholder = props.get('placeholder', '')
            input_type = props.get('type', 'text')
            return f'        <input type="{input_type}" class="component" style="{style}" placeholder="{placeholder}">'
        elif comp_type == 'text':
            content = props.get('content', 'Text')
            return f'        <div class="component" style="{style}">{content}</div>'
        elif comp_type == 'image':
            src = props.get('src', '')
            alt = props.get('alt', 'Image')
            return f'        <img src="{src}" alt="{alt}" class="component" style="{style}">'
        else:
            return f'        <div class="component" style="{style}"></div>'
    
    @classmethod
    def _export_react(cls, screen):
        """Export screen as React component"""
        components = screen.components if isinstance(screen.components, list) else []
        component_name = screen.name.replace(' ', '')
        
        react_parts = [
            "import React from 'react';",
            "",
            f"const {component_name} = () => {{",
            "  return (",
            f"    <div style={{{{ width: '{screen.width}px', height: '{screen.height}px', position: 'relative' }}}}>",
        ]
        
        # Add components
        for comp in components:
            react_parts.append(cls._component_to_react(comp))
        
        react_parts.extend([
            "    </div>",
            "  );",
            "};",
            "",
            f"export default {component_name};"
        ])
        
        return '\n'.join(react_parts)
    
    @classmethod
    def _component_to_react(cls, component):
        """Convert component to React JSX"""
        comp_type = component.get('type', 'div')
        position = component.get('position', {})
        size = component.get('size', {})
        props = component.get('properties', {})
        
        style = f"{{ position: 'absolute', left: '{position.get('x', 0)}px', top: '{position.get('y', 0)}px', width: '{size.get('width', 100)}px', height: '{size.get('height', 50)}px' }}"
        
        if comp_type == 'button':
            text = props.get('text', 'Button')
            return f"      <button style={{{style}}}>{text}</button>"
        elif comp_type == 'input':
            placeholder = props.get('placeholder', '')
            return f"      <input type=\"text\" style={{{style}}} placeholder=\"{placeholder}\" />"
        elif comp_type == 'text':
            content = props.get('content', 'Text')
            return f"      <div style={{{style}}}>{content}</div>"
        else:
            return f"      <div style={{{style}}}></div>"
    
    @classmethod
    def _export_vue(cls, screen):
        """Export screen as Vue component"""
        components = screen.components if isinstance(screen.components, list) else []
        
        vue_parts = [
            "<template>",
            f"  <div class=\"container\" :style=\"{{ width: '{screen.width}px', height: '{screen.height}px' }}\">",
        ]
        
        # Add components
        for comp in components:
            vue_parts.append(cls._component_to_vue(comp))
        
        vue_parts.extend([
            "  </div>",
            "</template>",
            "",
            "<script>",
            "export default {",
            f"  name: '{screen.name}',",
            "};",
            "</script>",
            "",
            "<style scoped>",
            ".container { position: relative; }",
            ".component { position: absolute; }",
            "</style>"
        ])
        
        return '\n'.join(vue_parts)
    
    @classmethod
    def _component_to_vue(cls, component):
        """Convert component to Vue template"""
        comp_type = component.get('type', 'div')
        position = component.get('position', {})
        size = component.get('size', {})
        props = component.get('properties', {})
        
        style = f"left: {position.get('x', 0)}px; top: {position.get('y', 0)}px; width: {size.get('width', 100)}px; height: {size.get('height', 50)}px;"
        
        if comp_type == 'button':
            text = props.get('text', 'Button')
            return f"    <button class=\"component\" style=\"{style}\">{text}</button>"
        elif comp_type == 'input':
            placeholder = props.get('placeholder', '')
            return f"    <input type=\"text\" class=\"component\" style=\"{style}\" placeholder=\"{placeholder}\">"
        elif comp_type == 'text':
            content = props.get('content', 'Text')
            return f"    <div class=\"component\" style=\"{style}\">{content}</div>"
        else:
            return f"    <div class=\"component\" style=\"{style}\"></div>"
    
    @classmethod
    def export_project(cls, project, screens, format_type='html', options=None):
        """
        Export multiple screens as a project
        
        Args:
            project: Project model instance
            screens: QuerySet of Screen instances
            format_type: 'html', 'react', or 'vue'
            options: Dict of export options
            
        Returns:
            dict: {
                'files': {
                    'path/to/file.ext': 'file content',
                    ...
                },
                'metadata': {...}
            }
        """
        options = options or {}
        files = {}
        
        # Export each screen
        for screen in screens:
            code = cls.export_screen(screen, format_type)
            
            # Generate filename
            screen_name = screen.name.replace(' ', '_').lower()
            if format_type == 'html':
                filename = f'screens/{screen_name}.html'
            elif format_type == 'react':
                filename = f'screens/{screen_name}.jsx'
            elif format_type == 'vue':
                filename = f'screens/{screen_name}.vue'
            
            files[filename] = code
        
        # Add README
        readme = cls._generate_readme(project, screens, format_type)
        files['README.md'] = readme
        
        # Add package.json for React/Vue
        if format_type in ['react', 'vue']:
            package_json = cls._generate_package_json(project, format_type)
            files['package.json'] = package_json
        
        return {
            'files': files,
            'metadata': {
                'project_name': project.name,
                'screen_count': len(screens),
                'format': format_type
            }
        }
    
    @classmethod
    def _generate_readme(cls, project, screens, format_type):
        """Generate README for exported project"""
        screen_list = '\n'.join([f'- {screen.name}' for screen in screens])
        
        return f"""# {project.name}

{project.description or 'Exported from UIBuilder'}

## Screens
{screen_list}

## Format
{format_type.upper()}

## Usage
{'Open HTML files in browser' if format_type == 'html' else f'Run `npm install` and `npm start` to view {format_type} components'}

Generated by UIBuilder
"""
    
    @classmethod
    def _generate_package_json(cls, project, format_type):
        """Generate package.json for React/Vue projects"""
        import json
        
        if format_type == 'react':
            package = {
                "name": project.name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "description": project.description or "Exported from UIBuilder",
                "dependencies": {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0"
                },
                "scripts": {
                    "start": "react-scripts start",
                    "build": "react-scripts build"
                }
            }
        else:  # vue
            package = {
                "name": project.name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "description": project.description or "Exported from UIBuilder",
                "dependencies": {
                    "vue": "^3.3.0"
                },
                "scripts": {
                    "dev": "vite",
                    "build": "vite build"
                }
            }
        
        return json.dumps(package, indent=2)

