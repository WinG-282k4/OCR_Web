# UIBuilder Architecture

## Complete Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    UIBuilder Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             Landing Page (/)                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Header with Logo & "Launch Editor" Button         │  │   │
│  │  │ Hero Section                                       │  │   │
│  │  │ Features Showcase (3 columns)                      │  │   │
│  │  │ How It Works (3-step process)                      │  │   │
│  │  │ CTA Section                                        │  │   │
│  │  │ Footer                                             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Editor Page (/editor)                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Header (Logo, Mode Switcher, Action Buttons)      │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌──────────┐ ┌─────────────────┐ ┌──────────────────┐  │   │
│  │  │Component │ │    Canvas       │ │  Properties     │  │   │
│  │  │Palette   │ │  ┌───────────┐  │ │  Panel          │  │   │
│  │  │          │ │  │Draggable  │  │ │  ┌────────────┐ │  │   │
│  │  │- Button  │ │  │Components │  │ │  │Edit Text   │ │  │   │
│  │  │- Text    │ │  │ (w/ grid) │  │ │  │Edit Colors │ │  │   │
│  │  │- Image   │ │  │           │  │ │  │Edit Size   │ │  │   │
│  │  │- Input   │ │  └───────────┘  │ │  │Edit Space  │ │  │   │
│  │  │- Card    │ │  ┌───────────┐  │ │  └────────────┘ │  │   │
│  │  │- etc.    │ │  │OCR Upload │  │ │                 │  │   │
│  │  │          │ │  │Section    │  │ │                 │  │   │
│  │  │          │ │  └───────────┘  │ │                 │  │   │
│  │  └──────────┘ └─────────────────┘ └──────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Status Bar (Component count, tips)                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Redux Store                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────┐      ┌──────────────────────────┐  │
│  │  Canvas State           │      │  UI State                │  │
│  ├─────────────────────────┤      ├──────────────────────────┤  │
│  │ elements: {             │      │ mode: 'design'/'export'  │  │
│  │   id: CanvasElement     │      │ showPalette: boolean     │  │
│  │ }                       │      │ showProperties: boolean  │  │
│  │ order: string[]         │      │ ocrLoading: boolean      │  │
│  │ selected: string|null   │      │ ocrError: string|null    │  │
│  └─────────────────────────┘      └──────────────────────────┘  │
│           ↑ ↓                              ↑ ↓                    │
└──────────────────────────────────────────────────────────────────┘
     ↑              ↓                  ↑              ↓
     │              │                  │              │
┌────┴──────────────┴──────┐  ┌────────┴──────────────┴────┐
│    Canvas Component       │  │   EditorLayout              │
│  - Reads selected         │  │ - Manages mode switch       │
│  - Renders draggables     │  │ - Shows/hides sidebars      │
│  - Updates on drag        │  │ - Routes between modes      │
└───────────────────────────┘  └─────────────────────────────┘
         ↓                                   ↓
┌───────────────────────────┐  ┌─────────────────────────────┐
│  CanvasElement Component  │  │  PropertiesPanel Component  │
│  - Individual element     │  │  - Edit selected element    │
│  - Shows at position      │  │  - Text, color, size input  │
│  - Click to select        │  │  - Updates Redux            │
└───────────────────────────┘  └─────────────────────────────┘
         ↓                                   
┌───────────────────────────┐  
│  ComponentPalette         │  
│  - Sidebar with options   │  
│  - Drag to canvas         │  
│  - Click to add           │  
└───────────────────────────┘  
         ↓
┌───────────────────────────┐
│  OCRUpload Component      │
│  - File input             │
│  - POST to /api/ocr       │
│  - Parse response         │
│  - Add to Redux           │
└───────────────────────────┘
         ↓
┌───────────────────────────┐
│  HTMLExport Component     │
│  - Read canvas from Redux │
│  - Generate HTML/CSS      │
│  - Show preview           │
│  - Download/Copy          │
└───────────────────────────┘
```

## Redux Actions Flow

```
User Interaction          Redux Action                State Update
─────────────────────────────────────────────────────────────────

Click on Canvas
    ↓
    └→ selectElement(id)  →  state.selected = id

Edit Text                 ↓
    ↓                
    └→ updateElement()   →  elements[id].text = newText

Change Color              ↓
    ↓
    └→ updateElement()   →  elements[id].style.bg = color

Drag Component            ↓
    ↓
    └→ reorderElements() →  order = newOrder

Add Component             ↓
    ↓
    └→ addElement()      →  elements[newId] = component

Delete Component          ↓
    ↓
    └→ removeElement()   →  delete elements[id]

Upload Image              ↓
    ↓
    └→ ocrLoading = true
    └→ POST /api/ocr     →  Components Added
    └→ addElements()     →  Canvas Updated
    └→ ocrLoading = false

Switch Mode               ↓
    ↓
    └→ setMode('export') →  state.mode = 'export'

Export HTML               ↓
    ↓
    └→ generateHTML()    →  HTML Generated
    └→ Download/Copy     →  File Processed
```

## Component Hierarchy

```
RootLayout (with ReduxProvider)
│
└── Page (Landing or Editor Route)
    │
    ├── LandingPage (if /)
    │   ├── Header
    │   ├── Hero Section
    │   ├── Features Grid
    │   ├── How It Works
    │   ├── CTA Section
    │   └── Footer
    │
    └── EditorLayout (if /editor)
        ├── Header
        │   ├── Logo (Link home)
        │   ├── Mode Switcher
        │   └── Action Buttons
        │
        ├── Main Content (flex-1)
        │   │
        │   ├── Design Mode (if mode === 'design')
        │   │   ├── ComponentPalette (left sidebar)
        │   │   │   └── List of draggable components
        │   │   │
        │   │   ├── Canvas Area (center)
        │   │   │   ├── OCRUpload Section
        │   │   │   │   └── File input & upload button
        │   │   │   │
        │   │   │   └── Canvas
        │   │   │       ├── Grid background
        │   │   │       └── CanvasElements (draggable)
        │   │   │           └── Individual Component Renderers
        │   │   │
        │   │   └── PropertiesPanel (right sidebar)
        │   │       ├── Text Editor
        │   │       ├── Color Pickers
        │   │       ├── Size Inputs
        │   │       ├── Spacing Controls
        │   │       └── Delete Button
        │   │
        │   └── Export Mode (if mode === 'export')
        │       ├── HTMLExport Component
        │       │   ├── Tabs (Preview, Code)
        │       │   ├── HTML Preview Area
        │       │   ├── Code Display
        │       │   ├── Download Button
        │       │   └── Copy Button
        │       └── Status Info
        │
        └── Status Bar
            └── Component count & tips
```

## API Endpoint

### POST `/api/ocr`

**Request:**
```typescript
{
  image: File  // Uploaded image
}
```

**Processing:**
1. Convert image to Base64
2. Send to Nanonets API
3. Parse response
4. Extract component locations and types
5. Map to CanvasElement objects

**Response:**
```typescript
{
  success: boolean
  components: {
    id: string
    type: ComponentType
    text: string
    x: number
    y: number
    width: number
    height: number
  }[]
  error?: string
}
```

## Supported Component Types

| Type | Default Content | Editable Properties |
|------|-----------------|-------------------|
| Button | "Click me" | text, bg, fg, size |
| Text | "Your text here" | text, fg, size, weight |
| Heading | "Heading" | text, fg, size |
| Input | - | placeholder, size, border |
| Textarea | - | placeholder, size, rows |
| Image | [Image] | src, width, height |
| Card | Content | bg, border, padding |
| Container | [Content] | bg, padding, border |
| Checkbox | - | label, checked |
| Label | "Label" | text, fg |

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 | Server/Client rendering, routing |
| **State** | Redux Toolkit | Centralized state management |
| **UI** | React 19.2 | Component framework |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Components** | shadcn/ui | Pre-built UI components |
| **Icons** | Lucide React | Icon library |
| **DnD** | react-beautiful-dnd | Drag & drop functionality |
| **OCR** | Nanonets API | Component detection |
| **Language** | TypeScript | Type safety |

## Deployment Path

```
Local Development
    ↓ (npm run dev)
    
Development Server (http://localhost:3000)
    ↓ (Push to GitHub)
    
GitHub Repository
    ↓ (Connect to Vercel)
    
Vercel Deployment
    ├─ Landing page (/)
    ├─ Editor page (/editor)
    └─ API routes (/api/*)
```

## Security Considerations

1. **API Key**: Nanonets key stored in environment variables (server-side only)
2. **File Upload**: Validate file type and size before processing
3. **CORS**: API calls from next middleware (server-side)
4. **Content Security**: Sanitize user input before rendering

## Performance Optimizations

1. **Code Splitting**: Next.js automatic route splitting
2. **Image Optimization**: Next.js Image component ready
3. **State Selectors**: Redux selectors for preventing unnecessary renders
4. **Lazy Loading**: Components loaded on demand
5. **CSS**: Tailwind purges unused classes

## Future Enhancement Ideas

- [ ] Collaborative editing (real-time multiplayer)
- [ ] Component templates/presets
- [ ] CSS framework export (Bootstrap, Tailwind, etc.)
- [ ] Responsive preview
- [ ] Undo/Redo history
- [ ] Component libraries
- [ ] Design system tokens
- [ ] Custom components
- [ ] Mobile-first mode
- [ ] Export to React/Vue/Svelte code
