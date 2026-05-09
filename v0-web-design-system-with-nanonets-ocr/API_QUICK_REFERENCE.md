# API Quick Reference Card

## 🚀 Quick Start (2 minutes)

```bash
# Terminal 1: Start mock API
pnpm mock-api

# Terminal 2: Start app
pnpm dev

# Visit http://localhost:3000
```

---

## 📊 All Available Endpoints

### Health
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Check API status |

### OCR (Image Analysis)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ocr` | Analyze image, detect components |

### Components
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/components` | Get all components |
| GET | `/api/components/{id}` | Get component details |

### Projects
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/{id}` | Get project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |

### Export
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/projects/{id}/export` | Export to HTML |
| POST | `/api/projects/{id}/preview` | Get preview HTML |

---

## 💻 Using API Client

### Import
```typescript
import apiClient from '@/lib/api-client';
```

### Health Check
```typescript
await apiClient.health.check();
```

### OCR Analysis
```typescript
const result = await apiClient.ocr.analyzeImage(file, 0.5);
```

### Project Operations
```typescript
// Create
const proj = await apiClient.projects.create({
  name: 'My Project',
  description: 'Test'
});

// List
const list = await apiClient.projects.list(10, 0);

// Get
const proj = await apiClient.projects.get('proj_123');

// Update
await apiClient.projects.update('proj_123', {
  name: 'Updated',
  canvasElements: []
});

// Delete
await apiClient.projects.delete('proj_123');
```

### Components
```typescript
// List all
const comps = await apiClient.components.list();

// With filter
const forms = await apiClient.components.list('form');

// Get one
const btn = await apiClient.components.get('comp_button');
```

### Export
```typescript
// Export HTML
const exported = await apiClient.export.toHTML('proj_123', {
  includeCSS: true,
  responsive: true
});

// Get preview
const html = await apiClient.export.getPreview('proj_123');
```

---

## 🧪 Quick Test Commands

```bash
# Health check
curl http://localhost:3001/api/health

# List components
curl http://localhost:3001/api/components

# Create project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# List projects
curl http://localhost:3001/api/projects
```

---

## 📝 Request/Response Examples

### POST /api/projects (Create)
**Request:**
```json
{
  "name": "My Design",
  "description": "Landing page",
  "canvasWidth": 1920,
  "canvasHeight": 1080,
  "backgroundColor": "#ffffff"
}
```

**Response:**
```json
{
  "id": "proj_123",
  "name": "My Design",
  "canvasElements": [],
  "createdAt": "2024-02-19T10:00:00Z"
}
```

### POST /api/ocr (Analyze Image)
**Request:** FormData with image file
```
image: <File>
confidence: 0.5
```

**Response:**
```json
{
  "success": true,
  "detectedComponents": [
    {
      "id": "comp_1",
      "type": "button",
      "confidence": 0.95,
      "boundingBox": { "x": 100, "y": 150, "width": 120, "height": 40 },
      "text": "Click Me"
    }
  ],
  "totalDetected": 1
}
```

### PUT /api/projects/{id} (Update)
**Request:**
```json
{
  "name": "Updated Design",
  "canvasElements": [
    {
      "id": "elem_1",
      "type": "heading",
      "content": "Welcome",
      "x": 0,
      "y": 0,
      "width": 400,
      "height": 60
    }
  ]
}
```

---

## 🔧 Configuration

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NANONETS_API_KEY=your_key_here
NODE_ENV=development
```

### Change API URL
```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
```

---

## ⚡ Common Tasks

### Task: Use OCR to detect components
```typescript
const file = /* File from input */;
const result = await apiClient.ocr.analyzeImage(file);
// result.detectedComponents contains detected UI elements
```

### Task: Save design as project
```typescript
const project = await apiClient.projects.create({
  name: 'My Design'
});
// Use project.id to save elements
```

### Task: Export design to HTML
```typescript
const exported = await apiClient.export.toHTML(projectId);
// exported.html contains the HTML code
// Download or save to database
```

### Task: Update component properties
```typescript
await apiClient.projects.update(projectId, {
  canvasElements: [
    {
      id: 'elem_1',
      type: 'button',
      content: 'Updated',
      styles: { fontSize: 16 }
    }
  ]
});
```

---

## 🐛 Debugging

### Check if mock API is running
```bash
curl http://localhost:3001/api/health
```

### See API request logs
Enable in browser DevTools → Network tab

### Test with Postman
1. File → Import → schema.yaml
2. Auto-generated endpoints appear
3. Click endpoint to test

### Clear mock data
Restart mock API server (Ctrl+C, then restart)

---

## 📚 Full Documentation

- **schema.yaml** - Complete API spec
- **MOCK_API_SETUP.md** - Setup guide
- **API_TESTING.md** - Detailed examples
- **lib/api-client.ts** - Source code

---

## 🚀 Production Switch

When connecting real backend:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
   ```

2. Add authentication if needed:
   ```typescript
   // In apiCall function
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

3. Stop mock API, use real backend

---

**Ready? Start with: `pnpm mock-api` + `pnpm dev`**
