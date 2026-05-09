# Download & Setup Guide

## Step-by-Step Download Instructions

### Step 1: Download ZIP File

1. Click the **3 dots (...)** button in the top right corner of this v0 chat
2. Select **"Download ZIP"**
3. Your browser will download `project.zip` file
4. Wait for download to complete (100%)

**Typical file size**: 5-8 MB

---

### Step 2: Extract the ZIP File

#### **Windows**
1. Right-click on `project.zip`
2. Select **"Extract All..."** (or use 7-Zip/WinRAR)
3. Choose destination folder
4. Wait for extraction (usually 10-20 seconds)

#### **Mac**
1. Double-click `project.zip`
2. macOS will auto-extract to same folder
3. Or use Terminal:
   ```bash
   unzip project.zip
   ```

#### **Linux**
```bash
unzip project.zip
```

---

### Step 3: Open Project in Code Editor

#### **VS Code (Recommended)**
1. Open VS Code
2. File → Open Folder
3. Select the extracted project folder
4. Click **Explorer** icon (left sidebar)
5. Now you can see all files

#### **Other Editors**
- WebStorm, IntelliJ: File → Open Project
- Sublime: File → Open Folder
- Vim: `vim /path/to/project`

---

### Step 4: Verify All Files

In your code editor, you should see:

```
your-project/
├── app/                    ✓
├── components/             ✓ (8 main + 40 UI)
├── store/                  ✓
├── lib/                    ✓
├── providers/              ✓
├── hooks/                  ✓
├── SETUP.md                ✓
├── README.md               ✓
├── schema.yaml             ✓
├── package.json            ✓
├── 00_READ_ME_FIRST.md     ✓
└── ... 60+ more files      ✓
```

**Total: 80+ files** should be visible

If you only see a few files, see: `IF_FILES_MISSING.md`

---

### Step 5: Install Dependencies

Open Terminal in your project folder and run:

```bash
npm install
```

Or if using pnpm:

```bash
pnpm install
```

Wait 2-5 minutes for all dependencies to install.

---

### Step 6: Setup Environment File

Create `.env.local` file in project root:

```bash
# Copy from template
cp .env.example .env.local
```

Edit `.env.local`:

```env
# For mock API (development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# For real Nanonets OCR (optional)
NANONETS_API_KEY=your_key_here
```

---

### Step 7: Start the Project

You need **two terminal windows**:

**Terminal 1 - Mock API Server:**
```bash
npm run mock-api
```
You should see:
```
✓ Prism is listening on http://localhost:3001/api
```

**Terminal 2 - Development Server:**
```bash
npm run dev
```
You should see:
```
▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

---

### Step 8: Open in Browser

Visit: **http://localhost:3000**

You should see:
1. **Landing Page** - With features and CTA button
2. Click **"Launch Editor"** 
3. **Design Editor** - Full Figma-like interface

---

## Troubleshooting

### Problem: npm install fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

### Problem: Port 3000 or 3001 already in use

**Solution:**
```bash
# For port 3000 (different dev port)
npm run dev -- -p 3001

# For port 3001 (different mock API port)
npm run mock-api -- -p 3002
```

### Problem: Can't find files after extract

**Solution:**
Read: `IF_FILES_MISSING.md` in project root

---

## What You Get

✓ **Complete Next.js 16 App** - Production ready  
✓ **Landing Page** - Marketing site  
✓ **Design Editor** - Figma-like UI  
✓ **Component Library** - 50+ UI components  
✓ **Redux State** - Full state management  
✓ **API Specification** - OpenAPI 3.0 schema  
✓ **Mock API** - No backend needed  
✓ **Documentation** - 16+ guide files  

---

## Project Structure

```
src/
├── app/                - Next.js app routes
├── components/         - React components
├── store/              - Redux state
├── lib/                - Utilities
├── providers/          - Context providers
└── schema.yaml         - API specification
```

---

## Commands You'll Use

```bash
npm run dev            # Start development
npm run build          # Build for production
npm start              # Run production build
npm run mock-api       # Start mock API server
npm run lint           # Run linter
```

---

## Next Steps After Setup

1. **Explore Landing Page** - See the intro
2. **Click "Launch Editor"** - Enter design mode
3. **Try Drag & Drop** - Add components
4. **Upload Image** - Test OCR (with mock data)
5. **Export HTML** - Download your design

---

## Support

If you have issues:

1. Check `SETUP.md` - Detailed setup guide
2. Check `IF_FILES_MISSING.md` - Missing files help
3. Check `API_TESTING.md` - Testing API
4. Read `README.md` - Full overview

---

## Estimated Time

| Task | Time |
|------|------|
| Download ZIP | 2-5 min |
| Extract | 1 min |
| npm install | 3-5 min |
| Setup .env.local | 1 min |
| Start servers | 1 min |
| **Total** | **10-15 min** |

---

**You're all set! Happy building! 🚀**
