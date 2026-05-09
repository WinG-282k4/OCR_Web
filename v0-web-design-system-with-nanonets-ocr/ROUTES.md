# Application Routes & Navigation

## Route Structure

```
UIBuilder Web App
│
├── / (Landing Page)
│   ├── Component: LandingPage
│   ├── File: app/page.tsx
│   └── Layout: RootLayout
│
├── /editor (Design Editor)
│   ├── Component: EditorLayout
│   ├── File: app/editor/page.tsx
│   └── Layout: RootLayout
│
└── /api/ocr (API Endpoint)
    ├── Method: POST
    ├── File: app/api/ocr/route.ts
    └── Purpose: Nanonets OCR Processing
```

## Detailed Route Documentation

### Route 1: Landing Page

**URL**: `/`
**File**: `app/page.tsx`
**Component**: `LandingPage.tsx`
**Type**: Public, Entry Point

**Purpose**: 
- Showcase product value
- Educate users about features
- Drive traffic to editor

**Content Sections**:
1. **Navigation Bar** (sticky)
   - Logo (clickable → home)
   - "Start Building" button (links to /editor)

2. **Hero Section**
   - Main headline
   - Subheading with value proposition
   - Two CTAs: "Launch Editor" & "See How It Works"

3. **Features Grid** (3 columns)
   - AI Image Recognition
   - Drag & Drop Editor
   - Export HTML

4. **How It Works** (3-step process)
   - Step 1: Upload Design Image
   - Step 2: AI Analyzes & Creates Components
   - Step 3: Customize & Export

5. **Call-to-Action Section**
   - Final CTA button "Launch Editor Now"
   - Links to /editor

6. **Footer**
   - Copyright info
   - Brand name

**Navigation Links**:
- Logo → /
- "Launch Editor" → /editor (2x)
- "Start Building" → /editor
- "See How It Works" → #how-it-works (anchor)

**Responsive Behavior**:
- Mobile: Single column, hamburger menu
- Tablet: Optimized 2-column layout
- Desktop: Full 3-column features grid

---

### Route 2: Editor Page

**URL**: `/editor`
**File**: `app/editor/page.tsx`
**Component**: `EditorLayout.tsx`
**Type**: Application Page

**Purpose**: 
- Provide design workspace
- Enable component editing
- Support image OCR upload
- Export designs as HTML

**Layout Structure**:

```
┌────────────────────────────────────────┐
│         Header (Navigation)             │
│  Logo | "Home" | Mode Switch | Actions │
└────────────────────────────────────────┘
┌──────────┬──────────────────┬──────────┐
│Component │      Canvas      │Properties│
│Palette   │  - Grid Bg       │ Panel    │
│(Left)    │  - Draggables    │(Right)   │
│          │  - OCR Upload    │          │
└──────────┴──────────────────┴──────────┘
┌────────────────────────────────────────┐
│         Status Bar (Footer)             │
│        Component Count & Tips           │
└────────────────────────────────────────┘
```

**Editor Modes**:

#### Design Mode (default)
```
Components visible:
├── Left Sidebar: Component Palette
│   ├─ Button
│   ├─ Text
│   ├─ Image
│   ├─ Input
│   ├─ Textarea
│   ├─ Checkbox
│   ├─ Card
│   ├─ Container
│   ├─ Heading
│   └─ Label
│
├── Center: Canvas
│   ├─ OCR Upload Section (top)
│   │   └─ "Upload Image for OCR"
│   └─ Canvas Area
│       ├─ Grid background
│       ├─ Draggable components
│       └─ Click to select
│
└── Right Sidebar: Properties Panel
    ├─ Text Editor
    ├─ Color Pickers
    │  ├─ Background color
    │  └─ Text color
    ├─ Size Controls
    │  ├─ Width
    │  └─ Height
    ├─ Spacing Controls
    │  ├─ Padding
    │  └─ Margin
    ├─ Border Style
    ├─ Font Properties
    └─ Delete Button
```

#### Export Mode
```
Components visible:
├── Tabs Navigation
│   ├─ Preview Tab (default)
│   └─ Code Tab
│
├── Tab Content
│   ├─ Preview: Live HTML rendering
│   ├─ Code: Syntax-highlighted HTML
│   ├─ Download Button
│   └─ Copy Code Button
│
└── Export Options
    ├─ Download as HTML file
    └─ Copy to clipboard
```

**Header Actions**:

**Desktop Actions**:
```
Home Button → /
├─ Icon + Label
├─ Hover effect
└─ Navigates to landing

Mode Switcher (toggle)
├─ Design / Export buttons
├─ Active indicator
└─ Switches view

Visibility Toggles (Design mode only)
├─ Show/Hide Palette
├─ Show/Hide Properties
├─ Clear Canvas

Mobile Menu Button (hamburger)
└─ Shows all actions in dropdown
```

**Mobile Navigation**:
```
Menu Button (hamburger icon)
├─ Home
├─ Design Mode
├─ Export Mode
├─ Show/Hide Palette
├─ Show/Hide Properties
└─ Clear Canvas
```

**Navigation Back to Home**:
- Click logo/brand name → /
- Click "Home" button → /
- Mobile menu → Home link → /

---

### Route 3: OCR API Endpoint

**URL**: `/api/ocr`
**File**: `app/api/ocr/route.ts`
**Method**: POST
**Type**: Server API

**Purpose**: 
- Process image uploads
- Interface with Nanonets API
- Return detected components
- Handle errors gracefully

**Request Format**:
```typescript
// Form data
{
  image: File  // JPEG, PNG
}
```

**Response Format - Success**:
```json
{
  "success": true,
  "components": [
    {
      "id": "ocr-1",
      "type": "button",
      "text": "Click Me",
      "x": 100,
      "y": 150,
      "width": 120,
      "height": 40,
      "style": {
        "bg": "#3b82f6",
        "fg": "#ffffff"
      }
    }
  ]
}
```

**Response Format - Error**:
```json
{
  "success": false,
  "error": "No API key provided"
}
```

**Error Handling**:
- Missing API key: 400
- Invalid file: 400
- File too large: 413
- Nanonets error: 500

**Integration Points**:
- Called from: `OCRUpload.tsx`
- Uses env var: `NANONETS_API_KEY`
- Updates Redux: `canvasSlice`

---

## Navigation Flow Diagram

```
START
  │
  ├─→ Landing Page (/)
  │   │
  │   ├─→ Click "Launch Editor"
  │   ├─→ Click "Start Building"
  │   └─→ Click "Launch Editor Now"
  │       └─→ Navigate to /editor
  │
  └─→ Editor Page (/editor)
      │
      ├─→ Design Mode (default)
      │   │
      │   ├─→ Option A: Upload Image
      │   │   ├─ Click "Upload Image"
      │   │   ├─ Select file
      │   │   ├─ POST to /api/ocr
      │   │   ├─ Components loaded
      │   │   └─ Edit on canvas
      │   │
      │   └─→ Option B: Manual Add
      │       ├─ Drag from Palette
      │       ├─ Component added
      │       ├─ Click to select
      │       ├─ Edit in Properties
      │       └─ Repeat
      │
      ├─→ Click "Export" button
      │   └─→ Export Mode
      │       │
      │       ├─→ View Preview Tab
      │       │   └─ See live rendering
      │       │
      │       └─→ View Code Tab
      │           ├─ See HTML source
      │           ├─ Click Download
      │           └─ File saved
      │
      └─→ Click "Home" / Logo
          └─→ Return to Landing Page (/)
```

## URL Patterns & Link Destinations

| Link/Button | Source | Destination | Purpose |
|-------------|--------|-------------|---------|
| Logo | Landing | / | Go home |
| "Start Building" | Landing header | /editor | Open editor |
| "Launch Editor" | Hero CTA | /editor | Open editor |
| "See How It Works" | Hero | #how-it-works | Scroll anchor |
| "Launch Editor Now" | Final CTA | /editor | Open editor |
| "Home" button | Editor header | / | Return home |
| Logo | Editor header | / | Return home |
| Mode switcher | Editor | /editor | Same route, state change |
| OCR Upload | Editor | /api/ocr | API call (no nav) |
| Download HTML | Editor | (download) | File download (no nav) |
| Copy Code | Editor | (clipboard) | Copy action (no nav) |

## Query Parameters

Currently, no query parameters are used. Future enhancements could include:
- `/editor?template=ecommerce` - Load template
- `/editor?id=xyz` - Load saved design
- `/?ref=partner` - Track referral source

## Deep Linking

Currently not implemented, but could enable:
- `/editor/designs/abc123` - Load specific design
- `/editor/templates/blog` - Load template
- `/share/abc123` - Share designs publicly

## Meta Information

### Landing Page
```
Title: "UIBuilder - AI-Powered Web Design Tool"
Description: "Design web interfaces with AI-powered component detection..."
Keywords: design, builder, UI, drag-drop, export HTML
```

### Editor Page
```
Title: "Web Design Editor | UIBuilder"
Description: "Design and build web interfaces with AI-powered component detection"
Keywords: editor, canvas, properties, export
```

## SEO Considerations

- Landing page is SEO-friendly (public)
- Editor page is not indexed (robot noindex could be added)
- Both pages have proper meta tags
- Open Graph tags ready for sharing

## Accessibility Routes

- All navigation is keyboard accessible
- Links have proper ARIA labels
- Form inputs are properly labeled
- Color contrast meets WCAG standards

## Route Protection & Auth

Currently no authentication is implemented. Future enhancements:
- Protect /editor with login
- Save designs per user
- Billing/subscription gates
- Team collaboration

## Mobile Deep Linking

The app supports mobile navigation:
- `/` works on mobile (responsive)
- `/editor` works on mobile (sidebar collapses)
- Forms are mobile-optimized
- Touch-friendly buttons (48px+ targets)

## Redirect Rules

Currently none, but could add:
- `/design` → `/editor`
- `/app` → `/editor`
- `/home` → `/`
- `/index.html` → `/`

---

## Testing Route Navigation

### Test Case 1: Landing → Editor
```
1. Visit /
2. See landing page
3. Click "Launch Editor"
4. Verify /editor loads
5. Verify design mode active
```

### Test Case 2: Editor → Home
```
1. Visit /editor
2. Click "Home" button
3. Verify / loads (landing page)
4. Verify design state cleared
```

### Test Case 3: OCR Upload
```
1. Visit /editor
2. Upload image
3. Verify POST /api/ocr called
4. Verify components appear
5. Verify no page navigation
```

### Test Case 4: Export Mode
```
1. Visit /editor
2. Click "Export" button
3. Verify export mode renders
4. Click download (no navigation)
5. File downloads successfully
```

### Test Case 5: Mobile Navigation
```
1. Visit / on mobile
2. Test responsive layout
3. Visit /editor on mobile
4. Test hamburger menu
5. Verify all routes work
```

---

## Conclusion

The application uses a simple, clean routing structure:
- **/** - Public landing page (discovery)
- **/editor** - Main application (interactive workspace)
- **/api/ocr** - Backend service (hidden from user)

Navigation between routes is intuitive, with clear CTAs and a persistent home button in the editor header.
