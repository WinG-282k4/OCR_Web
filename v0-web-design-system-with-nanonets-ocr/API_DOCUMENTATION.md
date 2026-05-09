# Complete API Documentation Index

## 📚 Overview

This project includes a complete, production-ready API setup with:
- **OpenAPI 3.0 Schema** - Full API specification
- **Mock API Server** - Test without backend
- **API Client** - Ready-to-use TypeScript client
- **Complete Documentation** - Examples and guides

---

## 🎯 Start Here (Choose Your Path)

### I want to...

#### **Quickly test the app**
→ Read: [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- 2-minute quick start
- Essential commands
- Common code snippets

#### **Setup mock API**
→ Read: [MOCK_API_SETUP.md](./MOCK_API_SETUP.md)
- Installation steps
- Running mock API
- Configuration options

#### **Test all endpoints**
→ Read: [API_TESTING.md](./API_TESTING.md)
- cURL examples
- Response samples
- JavaScript examples

#### **Understand the schema**
→ Read: [schema.yaml](./schema.yaml)
- Complete OpenAPI spec
- All endpoints defined
- Request/response models

#### **Use in code**
→ Read: [lib/api-client.ts](./lib/api-client.ts)
- Pre-built API client
- All methods documented
- Copy-paste ready

---

## 📋 File Structure

```
UIBuilder/
├── schema.yaml                 # OpenAPI 3.0 specification
├── lib/
│   └── api-client.ts           # TypeScript API client
├── .env.example                # Environment template
├── package.json                # Scripts + dependencies
│
└── Documentation/
    ├── API_DOCUMENTATION.md    # This file
    ├── API_QUICK_REFERENCE.md  # Cheat sheet
    ├── API_TESTING.md          # Detailed examples
    └── MOCK_API_SETUP.md       # Setup guide
```

---

## 🚀 Quick Commands

### Setup
```bash
pnpm install
cp .env.example .env.local
```

### Run
```bash
# Terminal 1: Mock API
pnpm mock-api

# Terminal 2: Next.js App
pnpm dev
```

### Test
```bash
# Health check
curl http://localhost:3001/api/health

# List projects
curl http://localhost:3001/api/projects

# Create project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

---

## 📖 API Endpoints Summary

### 🏥 Health
- `GET /api/health` - Check API status

### 📸 OCR
- `POST /api/ocr` - Analyze images, detect UI components

### 🧩 Components
- `GET /api/components` - Get component library
- `GET /api/components/{id}` - Get component details

### 📁 Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/{id}` - Get project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### 💾 Export
- `POST /api/projects/{id}/export` - Export to HTML
- `POST /api/projects/{id}/preview` - Get preview

---

## 💡 Usage Examples

### In React Component
```typescript
import apiClient from '@/lib/api-client';

export function MyComponent() {
  const handleAnalyzeImage = async (file: File) => {
    const result = await apiClient.ocr.analyzeImage(file);
    console.log(result.detectedComponents);
  };

  return (
    <input 
      type="file" 
      onChange={(e) => e.target.files && handleAnalyzeImage(e.target.files[0])}
    />
  );
}
```

### In Redux Action
```typescript
import apiClient from '@/lib/api-client';

export const loadProjects = async () => {
  const response = await apiClient.projects.list();
  return response.projects;
};
```

### Direct Fetch
```typescript
// Simple fetch call
const response = await fetch('http://localhost:3001/api/health');
const data = await response.json();
```

---

## 🔄 Data Models

### CanvasElement
```typescript
{
  id: string;
  type: 'button' | 'text' | 'image' | 'input' | 'card' | ...;
  content: string;
  styles: StyleProperties;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  parentId?: string;
  children?: string[];
}
```

### Project
```typescript
{
  id: string;
  name: string;
  description?: string;
  canvasElements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### StyleProperties
```typescript
{
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  width?: number;
  height?: number;
  display?: string;
  position?: string;
}
```

---

## 🛠 Tools Included

### Stoplight Prism
- Mock API server
- Automatic validation
- Real-like responses
- OpenAPI compliant

### OpenAPI Codegen
- Auto-generate API clients
- TypeScript support
- Type-safe API calls

### Axios
- HTTP client (optional)
- Request/response interceptors
- Error handling

---

## 📚 Scripts in package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "mock-api": "prism mock schema.yaml -p 3001",
    "mock-api:watch": "prism mock schema.yaml -p 3001 --watch",
    "gen-api": "openapi-typescript-codegen --input ./schema.yaml --output ./src/api"
  }
}
```

---

## 🔐 Authentication (Future)

The schema includes JWT bearer authentication. When ready:

```typescript
// In lib/api-client.ts
const apiClient = axios.create({
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🌐 Environment Configuration

### Development (Mock API)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NODE_ENV=development
```

### Production (Real Backend)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NODE_ENV=production
NANONETS_API_KEY=your_production_key
```

---

## 🧪 Testing Checklist

- [ ] Mock API starts: `pnpm mock-api`
- [ ] Health check: `curl http://localhost:3001/api/health`
- [ ] App loads: `http://localhost:3000`
- [ ] Can create project in UI
- [ ] Can upload image for OCR
- [ ] Can export to HTML
- [ ] No console errors
- [ ] Redux store syncs with API

---

## 🚀 Deployment Workflow

1. **Development**
   - Use mock API for testing
   - All endpoints available locally
   - No backend needed

2. **Integration**
   - Backend team implements endpoints
   - Update `NEXT_PUBLIC_API_BASE_URL`
   - Run production build

3. **Production**
   - Deploy Next.js app to Vercel
   - Point to production API
   - Monitor API calls

---

## 📞 API Response Format

All responses follow this format:

### Success
```json
{
  "success": true,
  "data": { /* payload */ },
  "timestamp": "2024-02-19T10:00:00Z"
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-02-19T10:00:00Z"
}
```

---

## 🎯 Next Steps

### Immediate
1. ✅ Run `pnpm install`
2. ✅ Run `pnpm mock-api` in terminal 1
3. ✅ Run `pnpm dev` in terminal 2
4. ✅ Visit `http://localhost:3000`

### Short Term
1. Test all API endpoints
2. Integrate with Redux store
3. Test OCR upload
4. Test HTML export

### Medium Term
1. Backend team implements endpoints
2. Update API URLs
3. Add authentication
4. Add error handling

### Long Term
1. Add monitoring
2. Add caching
3. Add real-time updates
4. Scale infrastructure

---

## 📞 Support

### Documentation
- [schema.yaml](./schema.yaml) - Full API spec
- [MOCK_API_SETUP.md](./MOCK_API_SETUP.md) - Setup help
- [API_TESTING.md](./API_TESTING.md) - Testing guide
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - Quick ref

### Debugging
- Check mock API logs
- Verify environment variables
- Check Network tab in DevTools
- Test with cURL first

### Resources
- [OpenAPI Spec](https://spec.openapis.org/oas/v3.0.3)
- [Prism Docs](https://docs.stoplight.io/docs/prism/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Completion Status

| Component | Status | Location |
|-----------|--------|----------|
| OpenAPI Schema | ✅ | schema.yaml |
| Mock API | ✅ | Prism CLI |
| API Client | ✅ | lib/api-client.ts |
| Type Definitions | ✅ | schema.yaml |
| Examples | ✅ | API_TESTING.md |
| Quick Reference | ✅ | API_QUICK_REFERENCE.md |
| Setup Guide | ✅ | MOCK_API_SETUP.md |
| Testing Guide | ✅ | API_TESTING.md |
| Env Template | ✅ | .env.example |
| Package Scripts | ✅ | package.json |

---

**Last Updated:** February 19, 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
