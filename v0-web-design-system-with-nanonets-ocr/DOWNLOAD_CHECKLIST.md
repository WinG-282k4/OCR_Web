# Download & Setup Checklist

## Pre-Download Checklist

- [ ] You have at least 500MB free disk space
- [ ] You have npm or pnpm installed (check: `npm -v` or `pnpm -v`)
- [ ] You have Node.js 18+ installed (check: `node -v`)
- [ ] You have a code editor (VS Code recommended)
- [ ] You have 2 terminal windows/tabs available

---

## Download Checklist

### Step 1: Download ZIP
- [ ] Click 3 dots (...) button in top right
- [ ] Select "Download ZIP"
- [ ] Wait for download to complete
- [ ] File saved as `project.zip` (or similar)

### Step 2: Extract Files
- [ ] Use proper tool to extract:
  - [ ] **Windows**: 7-Zip or WinRAR (NOT built-in)
  - [ ] **Mac**: Double-click (auto-extract) or Terminal
  - [ ] **Linux**: `unzip project.zip`
- [ ] Extract to a known location (Desktop, Documents, etc.)
- [ ] Wait for extraction to complete

### Step 3: Verify Files
- [ ] Open project folder
- [ ] Can see `/app` folder
- [ ] Can see `/components` folder
- [ ] Can see `package.json` file
- [ ] Can see `schema.yaml` file
- [ ] Can see documentation .md files
- [ ] If not, see: `IF_FILES_MISSING.md`

---

## Setup Checklist

### Step 1: Open in Code Editor
- [ ] Open VS Code (or your editor)
- [ ] File → Open Folder
- [ ] Select the extracted project folder
- [ ] Wait for editor to load all files
- [ ] Can see full file tree in Explorer

### Step 2: Install Dependencies
- [ ] Open Terminal in VS Code
- [ ] Run: `npm install`
- [ ] Wait 3-5 minutes for completion
- [ ] Should end with: `added XXX packages in XXX`

### Step 3: Setup Environment
- [ ] Create file: `.env.local`
- [ ] Copy content from `.env.example`
- [ ] Make sure it contains: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api`

### Step 4: Start Mock API (Terminal 1)
- [ ] Run: `npm run mock-api`
- [ ] Should show:
  ```
  ✓ Prism is listening on http://localhost:3001/api
  ```
- [ ] Leave this terminal running

### Step 5: Start Dev Server (Terminal 2)
- [ ] Open NEW terminal (keep first one running)
- [ ] Run: `npm run dev`
- [ ] Should show:
  ```
  ▲ Next.js 16.0.0
    ✓ Ready in 2.5s at http://localhost:3000
  ```

### Step 6: Open in Browser
- [ ] Open browser
- [ ] Visit: `http://localhost:3000`
- [ ] Should see Landing Page with features
- [ ] Click "Launch Editor" button
- [ ] Should see design editor interface

---

## Verification Checklist

After setup, verify everything works:

### Landing Page
- [ ] Can see hero section
- [ ] Can see features section
- [ ] Can see "How It Works" section
- [ ] "Launch Editor" button is clickable

### Design Editor
- [ ] Left sidebar shows component palette
- [ ] Center shows white canvas
- [ ] Right panel shows properties
- [ ] Header has mode toggle and buttons

### Functionality Test
- [ ] Can click "Heading" component to add it
- [ ] New component appears on canvas
- [ ] Can click component to select it
- [ ] Properties panel updates
- [ ] Can change text in properties
- [ ] Can click Export mode
- [ ] Can see Preview, Code, and Download tabs

### Backend Test
- [ ] API mock server running without errors
- [ ] Dev server running without errors
- [ ] No console errors in browser (F12)

---

## Success Checklist

If ALL of these are checked, you're ready to go:

- [ ] Project extracted successfully
- [ ] npm install completed (no errors)
- [ ] .env.local created
- [ ] Mock API running on port 3001
- [ ] Dev server running on port 3000
- [ ] Landing page visible in browser
- [ ] Can launch editor
- [ ] Can add components
- [ ] Can see real-time updates
- [ ] Export functionality works

---

## Troubleshooting Checklist

If something doesn't work:

- [ ] Read `SETUP.md` - Most common issues covered
- [ ] Read `IF_FILES_MISSING.md` - If files are missing
- [ ] Read `API_TESTING.md` - If API doesn't work
- [ ] Check terminal for error messages
- [ ] Check browser console (F12) for errors
- [ ] Try restarting servers (Ctrl+C, then run again)
- [ ] Try clearing npm cache: `npm cache clean --force`

---

## Next Steps After Success

- [ ] Explore the landing page
- [ ] Try adding different components
- [ ] Test the properties panel
- [ ] Try uploading an image (mock)
- [ ] Try exporting HTML
- [ ] Read `ARCHITECTURE.md` to understand code
- [ ] Start customizing for your needs
- [ ] Deploy when ready (see `DEPLOYMENT.md`)

---

## File Organization After Download

You should have:

```
your-project-folder/
├── 00_READ_ME_FIRST.md ............. START HERE
├── DOWNLOAD_GUIDE.md ............... Setup instructions
├── DOWNLOAD_CHECKLIST.md ........... This file
├── IF_FILES_MISSING.md ............. Troubleshooting
├── FINAL_SUMMARY.txt ............... Complete overview
├── PROJECT_FILES_LIST.txt .......... All 80+ files
├── SETUP.md ........................ Installation
├── START_HERE.md ................... Quick start
├── app/ ............................ Next.js pages
├── components/ ..................... React components
├── store/ .......................... Redux state
├── lib/ ............................ Utilities
├── schema.yaml ..................... API spec
└── package.json .................... Dependencies
```

---

## Time Estimate

| Task | Estimated Time |
|------|----------------|
| Download ZIP | 2-5 min |
| Extract files | 1 min |
| Open in editor | 1 min |
| npm install | 3-5 min |
| Setup .env.local | 1 min |
| Start servers | 1 min |
| Test in browser | 2 min |
| **Total** | **12-16 min** |

---

## Support

If you get stuck:

1. First: Check this checklist
2. Then: Read the relevant .md file
3. Look for: Error messages in terminal/console
4. Finally: Try the troubleshooting section

---

## Ready to Start?

Follow this checklist from top to bottom, and you'll have a fully working web design builder in about 15 minutes!

**Let's go! 🚀**
