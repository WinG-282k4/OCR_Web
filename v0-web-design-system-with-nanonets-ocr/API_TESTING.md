# API Testing Guide

## Quick Start with Mock API

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start Mock API (Terminal 1)
```bash
pnpm mock-api
# Mock API running on http://localhost:3001/api
```

### 3. Start Next.js Dev (Terminal 2)
```bash
pnpm dev
# App running on http://localhost:3000
```

---

## Testing All Endpoints with cURL

### Health Check
```bash
curl -X GET http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-19T10:00:00Z",
  "version": "1.0.0"
}
```

---

## OCR Endpoints

### Upload Image for Component Detection

**Note:** Create a test image file first:
```bash
# Using a test image
curl -X POST http://localhost:3001/api/ocr \
  -F "image=@test-image.png" \
  -F "confidence=0.5"
```

**Expected Response:**
```json
{
  "success": true,
  "imageId": "img_123abc",
  "detectedComponents": [
    {
      "id": "comp_1",
      "type": "button",
      "confidence": 0.95,
      "boundingBox": {
        "x": 100,
        "y": 150,
        "width": 120,
        "height": 40
      },
      "text": "Click Me",
      "suggestedContent": "Submit Button"
    },
    {
      "id": "comp_2",
      "type": "heading",
      "confidence": 0.98,
      "boundingBox": {
        "x": 100,
        "y": 50,
        "width": 300,
        "height": 80
      },
      "text": "Welcome",
      "suggestedContent": "Main Heading"
    },
    {
      "id": "comp_3",
      "type": "image",
      "confidence": 0.92,
      "boundingBox": {
        "x": 50,
        "y": 200,
        "width": 400,
        "height": 300
      },
      "text": "Hero Image",
      "suggestedContent": "Banner Image"
    }
  ],
  "totalDetected": 3,
  "processingTime": 1250,
  "layout": "flex"
}
```

---

## Components API

### Get All Components

```bash
curl -X GET http://localhost:3001/api/components
```

**Query Parameters:**
- `category` - Filter: layout, form, content, media, interactive
- `search` - Search by name

**Examples:**
```bash
# Get form components
curl -X GET "http://localhost:3001/api/components?category=form"

# Search for button
curl -X GET "http://localhost:3001/api/components?search=button"
```

**Expected Response:**
```json
{
  "success": true,
  "components": [
    {
      "id": "comp_button",
      "name": "Button",
      "category": "interactive",
      "description": "Clickable button component",
      "icon": "button-icon",
      "defaultContent": "Click Me",
      "defaultStyles": {
        "backgroundColor": "#3b82f6",
        "textColor": "#ffffff",
        "fontSize": 14,
        "fontWeight": 600,
        "borderRadius": 6,
        "padding": 12
      },
      "previewImage": "/components/button.png"
    },
    {
      "id": "comp_text",
      "name": "Text",
      "category": "content",
      "description": "Text content block",
      "icon": "text-icon",
      "defaultContent": "Sample Text",
      "defaultStyles": {
        "fontSize": 14,
        "textColor": "#000000",
        "fontWeight": 400
      }
    },
    {
      "id": "comp_input",
      "name": "Input",
      "category": "form",
      "description": "Text input field",
      "icon": "input-icon",
      "defaultContent": "Enter text...",
      "defaultStyles": {
        "backgroundColor": "#ffffff",
        "borderRadius": 4,
        "padding": 10,
        "border": "1px solid #e5e7eb"
      }
    }
  ],
  "totalCount": 3,
  "categories": ["layout", "form", "content", "media", "interactive"]
}
```

### Get Component Details

```bash
curl -X GET http://localhost:3001/api/components/comp_button
```

**Expected Response:**
```json
{
  "id": "comp_button",
  "name": "Button",
  "category": "interactive",
  "description": "Clickable button component",
  "icon": "button-icon",
  "defaultContent": "Click Me",
  "defaultStyles": {
    "backgroundColor": "#3b82f6",
    "textColor": "#ffffff",
    "fontSize": 14,
    "fontWeight": 600,
    "borderRadius": 6,
    "padding": 12
  },
  "previewImage": "/components/button.png",
  "variants": [
    {
      "name": "Primary",
      "styles": {
        "backgroundColor": "#3b82f6"
      }
    },
    {
      "name": "Secondary",
      "styles": {
        "backgroundColor": "#e5e7eb"
      }
    }
  ],
  "documentation": "A clickable button for user actions",
  "examples": []
}
```

---

## Projects API

### Create New Project

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website Design",
    "description": "Landing page for my startup",
    "canvasWidth": 1920,
    "canvasHeight": 1080,
    "backgroundColor": "#ffffff"
  }'
```

**Expected Response:**
```json
{
  "id": "proj_123abc",
  "name": "My Website Design",
  "description": "Landing page for my startup",
  "thumbnail": null,
  "canvasElements": [],
  "canvasWidth": 1920,
  "canvasHeight": 1080,
  "backgroundColor": "#ffffff",
  "createdAt": "2024-02-19T10:00:00Z",
  "updatedAt": "2024-02-19T10:00:00Z",
  "version": 1,
  "metadata": {}
}
```

### List All Projects

```bash
curl -X GET "http://localhost:3001/api/projects?limit=10&offset=0"
```

**Expected Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "proj_1",
      "name": "Website Design",
      "description": "Landing page",
      "createdAt": "2024-02-19T10:00:00Z",
      "updatedAt": "2024-02-19T10:00:00Z"
    }
  ],
  "totalCount": 1,
  "limit": 10,
  "offset": 0
}
```

### Get Project Details

```bash
curl -X GET http://localhost:3001/api/projects/proj_123abc
```

### Update Project

```bash
curl -X PUT http://localhost:3001/api/projects/proj_123abc \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Website Design",
    "canvasElements": [
      {
        "id": "elem_1",
        "type": "heading",
        "content": "Welcome",
        "styles": {
          "fontSize": 32,
          "fontWeight": 700,
          "textColor": "#000000",
          "backgroundColor": "#ffffff"
        },
        "x": 0,
        "y": 0,
        "width": 400,
        "height": 60,
        "zIndex": 1
      }
    ]
  }'
```

### Delete Project

```bash
curl -X DELETE http://localhost:3001/api/projects/proj_123abc
```

**Expected Response:**
```json
{
  "message": "Project deleted successfully"
}
```

---

## Export API

### Export to HTML

```bash
curl -X POST http://localhost:3001/api/projects/proj_123abc/export \
  -H "Content-Type: application/json" \
  -d '{
    "includeCSS": true,
    "includeTailwind": false,
    "responsive": true,
    "minify": false,
    "format": "html"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<style>\nbody {\n  margin: 0;\n  padding: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}\n.elem_1 {\n  font-size: 32px;\n  font-weight: 700;\n  color: #000000;\n  background-color: #ffffff;\n  width: 400px;\n  height: 60px;\n  padding: 0;\n}\n</style>\n</head>\n<body>\n<div class=\"elem_1\">Welcome</div>\n</body>\n</html>",
  "css": "body {\n  margin: 0;\n  padding: 0;\n}\n.elem_1 {\n  font-size: 32px;\n  font-weight: 700;\n  color: #000000;\n}",
  "fileName": "design-export.html",
  "fileSize": 2048,
  "exportedAt": "2024-02-19T10:05:00Z"
}
```

### Get Preview HTML

```bash
curl -X POST http://localhost:3001/api/projects/proj_123abc/preview
```

**Expected Response:** Raw HTML that can be displayed in browser

---

## Testing in JavaScript/TypeScript

### Using fetch API

```javascript
import apiClient from '@/lib/api-client';

// Test OCR
const file = new File(['...'], 'test.png', { type: 'image/png' });
const ocrResult = await apiClient.ocr.analyzeImage(file);
console.log('Detected components:', ocrResult.detectedComponents);

// Test Projects
const project = await apiClient.projects.create({
  name: 'Test Project',
  description: 'Testing the API'
});
console.log('Created project:', project.id);

// Test Export
const exported = await apiClient.export.toHTML(project.id);
console.log('Exported HTML:', exported.html);
```

### Using React Hook

```typescript
import { useState } from 'react';
import apiClient from '@/lib/api-client';

export function TestComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await apiClient.health.check();
      setResult(response);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleTest} disabled={loading}>
      {loading ? 'Testing...' : 'Test API'}
    </button>
  );
}
```

---

## Troubleshooting

### Mock API Won't Start
```bash
# Check port 3001 availability
lsof -i :3001

# Kill process using port
kill -9 <PID>

# Start on different port
pnpm exec prism mock schema.yaml -p 3002
```

### CORS Issues
If you see CORS errors, the mock API needs proper headers:

```bash
# The mock API should handle CORS automatically
# If not, check Prism logs for configuration issues
```

### Invalid Response Format
- Verify schema.yaml is valid
- Check request body matches schema
- Verify all required fields are present

### Test with Postman

1. Import schema.yaml into Postman
2. Postman will auto-generate all endpoints
3. Test each endpoint directly
4. Save requests for team

---

## Next Steps

1. ✅ Run mock API: `pnpm mock-api`
2. ✅ Test endpoints with cURL
3. ✅ Use API client in components
4. ✅ When backend ready, update `NEXT_PUBLIC_API_BASE_URL`
5. ✅ Deploy to production

---

## Files Reference

- **schema.yaml** - OpenAPI 3.0 specification
- **lib/api-client.ts** - Ready-to-use API client
- **MOCK_API_SETUP.md** - Setup instructions
- **API_TESTING.md** - This file
