# UIBuilder - Web Design Tool with AI Component Detection

A complete Next.js 16 + Redux Toolkit web design builder that allows users to create responsive web interfaces through image upload and OCR analysis.

## Project Navigation Flow

```
Landing Page (/)
    ↓
    ├─→ "Launch Editor" Button
    │       ↓
    ├─→ Editor Page (/editor)
    │       ├─ Design Mode
    │       │   ├─ Upload Image → OCR Analysis
    │       │   ├─ Drag & Drop Canvas
    │       │   ├─ Component Palette (Left Sidebar)
    │       │   └─ Properties Panel (Right Sidebar)
    │       │
    │       └─ Export Mode
    │           ├─ Preview Tab
    │           ├─ Code Tab
    │           └─ Download Button
    │
    └─ Home Button (from Editor) → Back to Landing Page
```

## Pages & Routes

### 1. Landing Page (`/app/page.tsx` → `/components/LandingPage.tsx`)
- **Purpose**: Main entry point showcasing the product
- **Features**:
  - Hero section with CTA
  - Feature highlights (AI Recognition, Drag & Drop, HTML Export)
  - How-it-works section (3-step process)
  - Call-to-action section
  - Navigation links
- **Flow**: Users see the landing page first, can click "Launch Editor" to go to `/editor`

### 2. Editor Page (`/app/editor/page.tsx` → `/components/EditorLayout.tsx`)
- **Purpose**: Main application workspace
- **Modes**:
  - **Design Mode**: Create and edit components
  - **Export Mode**: Preview and export HTML
- **Components**:
  - Header with mode switcher and action buttons
  - Component Palette (left sidebar)
  - Canvas (center)
  - Properties Panel (right sidebar)
  - OCR Upload section
  - Status bar

## User Journey

### 1. Discovery & Entry
```
User visits app
    ↓
Sees landing page with features
    ↓
Clicks "Launch Editor" or "Start Building"
```

### 2. Design Workflow
```
Editor opens in Design Mode
    ↓
User chooses one of two paths:
    A) Upload Image Path:
        - Click "Upload Image"
        - Select design mockup/screenshot
        - Nanonets OCR analyzes components
        - Components appear on canvas
        - Edit each component
    
    B) Manual Path:
        - Browse Component Palette
        - Drag components to canvas
        - Edit properties for each
```

### 3. Component Editing
```
Click on component in canvas
    ↓
Properties Panel updates
    ↓
Edit properties:
    - Text content
    - Colors
    - Sizing
    - Spacing
    - Styling
    ↓
Changes reflected in real-time on canvas
```

### 4. Export Workflow
```
Click "Export" mode button
    ↓
Two options visible:
    - Preview Tab: See live HTML rendering
    - Code Tab: View HTML source code
    ↓
Click "Download HTML" to save file
OR
Click "Copy Code" to copy to clipboard
```

### 5. Return to Landing
```
Click "Home" button in header
    ↓
Back to landing page
```

## File Structure

```
app/
├── page.tsx                 # Landing page route
├── editor/
│   └── page.tsx            # Editor route
├── api/
│   └── ocr/
│       └── route.ts        # Nanonets OCR API
├── layout.tsx              # Root layout with Redux
└── globals.css             # Global styles

components/
├── LandingPage.tsx         # Landing page component
├── EditorLayout.tsx        # Main editor layout
├── Canvas.tsx              # Canvas area
├── CanvasElement.tsx       # Individual draggable element
├── ComponentPalette.tsx    # Component selector sidebar
├── PropertiesPanel.tsx     # Property editor
├── OCRUpload.tsx           # Image upload for OCR
├── HTMLExport.tsx          # HTML preview & export
└── ui/                     # shadcn/ui components

store/
├── index.ts                # Redux store configuration
├── hooks.ts                # Redux hooks (useAppDispatch, useAppSelector)
├── slices/
│   ├── canvasSlice.ts      # Canvas state management
│   └── uiSlice.ts          # UI state management
└── types.ts                # Redux type definitions

lib/
├── types.ts                # TypeScript interfaces
└── htmlExport.ts           # HTML generation utility

providers/
└── ReduxProvider.tsx       # Redux Provider wrapper
```

## Redux State Structure

### Canvas State (`canvasSlice`)
```typescript
{
  elements: {
    [id]: CanvasElement  // All components on canvas
  }
  order: string[]        // Layer order
  selected: string | null // Currently selected component
}
```

### UI State (`uiSlice`)
```typescript
{
  mode: 'design' | 'export'        // Current mode
  showComponentPalette: boolean    // Left sidebar visibility
  showPropertiesPanel: boolean     // Right sidebar visibility
  ocrLoading: boolean              // OCR processing status
  ocrError: string | null          // OCR error message
}
```

## Key Features

### 1. OCR Image Upload
- Endpoint: `POST /api/ocr`
- Accepts image file
- Returns detected components
- Requires: `NANONETS_API_KEY` env variable
- Response: Array of detected components with positions

### 2. Drag & Drop
- Built on `react-beautiful-dnd`
- Supports rearranging components
- Visual feedback during drag
- Nested droppable areas

### 3. Properties Editing
- Edit text content
- Color picker (background, text)
- Size inputs (width, height)
- Spacing controls (padding, margin)
- Border styling
- Font properties

### 4. HTML Export
- Full inline CSS
- Responsive design
- Production-ready HTML
- Download or copy options

## Environment Variables

```env
# Nanonets OCR API Key
NANONETS_API_KEY=your_api_key_here
```

Get your free API key at: https://nanonets.com

## Component Palette Available

- **Layout**: Container, Card
- **Text**: Heading, Text, Label
- **Input**: Input, Textarea
- **Selection**: Checkbox, Radio
- **Interactive**: Button, Link

## Styling System

- **Framework**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Design Tokens**: CSS custom properties in globals.css
- **Dark Mode**: Supported via Tailwind dark mode

## How It Works - Technical Flow

### Landing Page
1. User lands on `/`
2. Sees complete product showcase
3. Clicks "Launch Editor" → navigates to `/editor`

### Editor - Design Mode
1. User uploads image or selects components manually
2. If OCR upload:
   - Image sent to `/api/ocr` endpoint
   - Nanonets API analyzes components
   - Response parsed and added to Redux canvas state
3. Components appear as draggable elements on canvas
4. Clicking component updates Redux `selected` state
5. PropertiesPanel reads `selected` state and shows controls
6. Editing properties updates Redux element data
7. Canvas re-renders to show changes

### Editor - Export Mode
1. HTMLExport component reads canvas state from Redux
2. Generates complete HTML with inline CSS
3. User can preview or copy/download code

### Navigation
- Logo/Home button on header → returns to landing page
- All links use Next.js `Link` component for smooth navigation

## Technologies Used

- **Framework**: Next.js 16 (App Router)
- **State Management**: Redux Toolkit with React Redux
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Drag & Drop**: react-beautiful-dnd
- **OCR Service**: Nanonets API
- **Language**: TypeScript
- **Package Manager**: pnpm

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   cp .env.example .env.local
   # Add your NANONETS_API_KEY
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Deployment

The project is ready for Vercel deployment:
```bash
vercel deploy
```

Or push to GitHub and connect to Vercel for automatic deployments.
