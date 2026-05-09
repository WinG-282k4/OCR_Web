# Mock API Setup Guide

## Overview

This guide helps you setup mock APIs using Stoplight Prism to test the UIBuilder frontend without a backend server. The OpenAPI schema (`schema.yaml`) defines all API endpoints, request/response models, and mock data.

---

## Installation

### 1. Add Dependencies

First, install the mock API tools and TypeScript code generator:

```bash
pnpm add -D @stoplight/prism-cli openapi-typescript-codegen
```

### 2. Update package.json Scripts

The following scripts should already be in your `package.json`:

```json
{
  "scripts": {
    "mock-api": "prism mock schema.yaml -p 3001",
    "mock-api:watch": "prism mock schema.yaml -p 3001 --watch",
    "gen-api": "openapi-typescript-codegen --input ./schema.yaml --output ./src/api --client axios --exportCore true --exportServices true --exportModels true"
  }
}
```

---

## Quick Start

### Option 1: Run Mock API (Recommended for Testing)

```bash
# Terminal 1: Start mock API server on port 3001
pnpm mock-api

# Terminal 2: Start Next.js dev server (port 3000)
pnpm dev
```

Visit `http://localhost:3000` - the UI will connect to mock API at `http://localhost:3001`

### Option 2: Generate API Client Code

```bash
# Generate TypeScript API client from schema
pnpm gen-api

# This creates /src/api folder with:
# - API service classes
# - Request/response models
# - TypeScript types
```

---

## API Endpoints Available

### Health Check
- `GET /api/health` - API status

### OCR (Image Analysis)
- `POST /api/ocr` - Analyze image and detect components

### Components
- `GET /api/components` - Get component library
- `GET /api/components/{componentId}` - Get component details

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - List user projects
- `GET /api/projects/{projectId}` - Get project details
- `PUT /api/projects/{projectId}` - Update project
- `DELETE /api/projects/{projectId}` - Delete project

### Export
- `POST /api/projects/{projectId}/export` - Export to HTML
- `POST /api/projects/{projectId}/preview` - Get preview HTML

---

## Mock Data Examples

### POST /api/ocr Response

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
      "type": "text",
      "confidence": 0.98,
      "boundingBox": {
        "x": 100,
        "y": 50,
        "width": 300,
        "height": 80
      },
      "text": "Welcome to UIBuilder",
      "suggestedContent": "Main Heading"
    }
  ],
  "totalDetected": 2,
  "processingTime": 1250,
  "layout": "flex"
}
```

### POST /api/projects Response

```json
{
  "id": "proj_123",
  "name": "My Website Design",
  "description": "Landing page design",
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
  ],
  "canvasWidth": 1920,
  "canvasHeight": 1080,
  "backgroundColor": "#ffffff",
  "createdAt": "2024-02-19T10:00:00Z",
  "updatedAt": "2024-02-19T10:00:00Z",
  "version": 1
}
```

### POST /api/projects/{projectId}/export Response

```json
{
  "success": true,
  "html": "<!DOCTYPE html>\n<html>\n<head>\n<style>\n/* Generated CSS */\nbody { margin: 0; padding: 0; }\n.elem_1 { font-size: 32px; font-weight: 700; color: #000000; }\n</style>\n</head>\n<body>\n<div class=\"elem_1\">Welcome</div>\n</body>\n</html>",
  "css": "body { margin: 0; padding: 0; }\n.elem_1 { font-size: 32px; font-weight: 700; color: #000000; }",
  "fileName": "design-export.html",
  "fileSize": 2048,
  "exportedAt": "2024-02-19T10:05:00Z"
}
```

---

## Using Mock API with Next.js

### 1. Update Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NODE_ENV=development
```

### 2. Create API Client Service

Create `lib/api-client.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const ocr = {
  analyzeImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/ocr', formData);
  }
};

export const projects = {
  create: (data: any) => apiClient.post('/projects', data),
  list: () => apiClient.get('/projects'),
  get: (id: string) => apiClient.get(`/projects/${id}`),
  update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
  export: (id: string, options: any) => apiClient.post(`/projects/${id}/export`, options),
};

export const components = {
  list: () => apiClient.get('/components'),
  get: (id: string) => apiClient.get(`/components/${id}`),
};

export default apiClient;
```

### 3. Use in React Components

```typescript
import { useState } from 'react';
import { ocr } from '@/lib/api-client';

export function OCRUpload() {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const response = await ocr.analyzeImage(file);
      console.log('Detected components:', response.data.detectedComponents);
    } catch (error) {
      console.error('OCR failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      disabled={loading}
    />
  );
}
```

---

## Prism Mock API Features

### Dynamic Data
Prism automatically generates mock responses based on schema definitions:
- Unique IDs for each request
- Realistic data types (dates, colors, etc.)
- Valid array sizes and object structures

### Validation
The mock API validates incoming requests against the schema:
- Returns 400 for invalid requests
- Validates required fields
- Checks data types and ranges

### Dynamic Routes
All routes defined in `schema.yaml` work automatically:
- Path parameters are extracted
- Query parameters are respected
- Request body validation

---

## Advanced Configuration

### Custom Mock Response Rules

Create `.prism/prism.yaml` for advanced configuration:

```yaml
rules:
  - httpMethod: POST
    path: '/api/ocr'
    contentType: application/json
    response:
      statusCode: 200
      data:
        success: true
        detectedComponents:
          - id: comp_1
            type: button
            confidence: 0.95
```

### Run on Custom Port

```bash
pnpm exec prism mock schema.yaml -p 4000
```

---

## Testing Workflow

### 1. Start Mock API
```bash
pnpm mock-api
# Mock API running on http://localhost:3001
```

### 2. Test in Browser
```bash
# In another terminal
pnpm dev
# App running on http://localhost:3000
```

### 3. Test Specific Endpoint

```bash
# Test OCR endpoint
curl -X POST http://localhost:3001/api/ocr \
  -F "image=@screenshot.png"

# Test projects endpoint
curl http://localhost:3001/api/projects

# Test component library
curl http://localhost:3001/api/components
```

---

## Generate Production API Client

When you're ready to integrate with a real backend:

```bash
# Generate TypeScript API client
pnpm gen-api

# This creates /src/api with:
# - API service classes
# - Full TypeScript types
# - Auto-generated documentation
# - Ready for production use
```

---

## Troubleshooting

### Mock API Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Use different port
pnpm exec prism mock schema.yaml -p 3002
```

### CORS Issues
Update Next.js API routes to proxy mock API:

```typescript
// app/api/ocr/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await fetch('http://localhost:3001/api/ocr', {
    method: 'POST',
    body: formData,
  });
  return response;
}
```

### Mock Data Not Changing
Restart Prism mock server:
```bash
# Stop: Ctrl+C
# Restart
pnpm mock-api
```

---

## Next Steps

1. ✅ Run mock API: `pnpm mock-api`
2. ✅ Start dev server: `pnpm dev`
3. ✅ Test endpoints in browser
4. ✅ Update Redux store to use real API
5. ✅ When backend ready, switch API URL

---

## Resources

- [Stoplight Prism Docs](https://docs.stoplight.io/docs/prism/)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [OpenAPI TypeScript Codegen](https://github.com/ferdikoq/openapi-typescript-codegen)
