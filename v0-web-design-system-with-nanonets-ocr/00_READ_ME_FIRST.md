# 📖 UIBuilder - Read Me First

## Quick Navigation

**Project hiện đã hoàn thành 100% với tất cả file cần thiết.**

### 1️⃣ **First Time Setup**
- File: `SETUP.md` - Hướng dẫn cài đặt từng bước
- Hoặc: `START_HERE.md` - Quick start nhanh

### 2️⃣ **API & Mock Server**
- File: `schema.yaml` - OpenAPI specification
- File: `API_QUICK_REFERENCE.md` - API cheat sheet
- File: `MOCK_API_SETUP.md` - Setup mock server
- File: `API_TESTING.md` - Testing examples

### 3️⃣ **Project Structure**
- File: `ROUTES.md` - URL routing structure
- File: `PROJECT_FLOW.md` - User journey
- File: `ARCHITECTURE.md` - Technical architecture
- File: `FILES_MANIFEST.md` - Tất cả file được tạo

### 4️⃣ **Deployment**
- File: `DEPLOYMENT.md` - Production deployment
- File: `BUILD_SUMMARY.md` - Build checklist

---

## Essential Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup environment file
cp .env.example .env.local

# 3. Terminal 1: Start mock API server
npm run mock-api

# 4. Terminal 2: Start development server
npm run dev

# 5. Open browser
http://localhost:3000
```

---

## Project Structure

```
/app                    - Next.js pages & API routes
  /api/ocr/route.ts     - OCR API endpoint
  /editor/page.tsx      - Editor page
  page.tsx              - Landing page
  layout.tsx            - Root layout

/components             - React components
  Canvas.tsx            - Main canvas
  ComponentPalette.tsx  - Component library
  PropertiesPanel.tsx   - Properties editor
  OCRUpload.tsx         - Image upload
  HTMLExport.tsx        - HTML export
  EditorLayout.tsx      - Editor layout
  LandingPage.tsx       - Landing page

/store                  - Redux Toolkit
  canvasSlice.ts        - Canvas state
  uiSlice.ts            - UI state

/lib                    - Utilities
  types.ts              - Type definitions
  api-client.ts         - API client service
  htmlExport.ts         - HTML export utility

schema.yaml             - OpenAPI specification
```

---

## What's Included

✅ **Full UI Design System** - Landing + Editor  
✅ **Redux State Management** - Canvas & UI states  
✅ **Drag & Drop** - Component manipulation  
✅ **Mock API** - For testing without backend  
✅ **OpenAPI Schema** - 15 fully defined endpoints  
✅ **Image OCR** - Nanonets integration ready  
✅ **HTML Export** - Download or copy designs  
✅ **Type Safe** - Full TypeScript support  
✅ **Responsive UI** - Mobile friendly design  
✅ **Documentation** - 15+ guide files  

---

## Troubleshooting

**Q: I only see schema.yaml after download**
A: This is a display issue. All files are there. Try:
- Open the project in your code editor (VS Code)
- The files will appear in the explorer

**Q: Files missing after extracting ZIP?**
A: Extract using:
- Mac/Linux: `unzip project.zip`
- Windows: Use 7-Zip or WinRAR (not built-in)

**Q: npm install fails?**
A: Try:
```bash
rm -rf node_modules pnpm-lock.yaml
npm install
```

**Q: Mock API won't start?**
A: Install globally:
```bash
npm install -g @stoplight/prism-cli
pnpm mock-api
```

---

## Next Steps

1. **Read**: `SETUP.md` (5 mins)
2. **Install**: Run npm install (2 mins)
3. **Setup**: Copy .env.example → .env.local
4. **Start**: Run mock-api + dev server
5. **Build**: Start customizing!

---

## Support Files

All documentation is in markdown (.md files):
- `README.md` - Full project overview
- `START_HERE.md` - Quick start guide
- `SETUP.md` - Installation steps
- `API_DOCUMENTATION.md` - API details
- Plus 11 more guides for everything!

---

**Everything you need is in this project. Enjoy! 🚀**
