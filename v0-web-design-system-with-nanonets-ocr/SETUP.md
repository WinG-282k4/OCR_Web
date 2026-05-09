# Web Design Builder - Setup Guide

## Overview
A complete Next.js application for building, editing, and exporting web designs. Features:
- Drag-and-drop canvas interface
- Component palette with 10+ predefined components
- Real-time properties editor
- Nanonets OCR integration for auto-detecting UI components from images
- HTML export functionality
- Redux Toolkit state management

## Installation

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Nanonets API Configuration
NANONETS_API_KEY=your_nanonets_api_key_here
```

To get a Nanonets API key:
1. Visit https://nanonets.com
2. Sign up for a free account
3. Create an object detection model for UI components
4. Copy your API key from the dashboard

### 3. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

Navigate to `http://localhost:3000` to see the application.

## Architecture

### File Structure
```
/app
  /api
    /ocr
      route.ts          # OCR API endpoint
  layout.tsx            # Root layout with Redux provider
  page.tsx              # Main editor page
  globals.css           # Global styles

/components
  Canvas.tsx            # Main canvas component
  CanvasElement.tsx     # Individual draggable components
  ComponentPalette.tsx  # Component library sidebar
  PropertiesPanel.tsx   # Properties editor sidebar
  HTMLExport.tsx        # Export/preview view
  OCRUpload.tsx         # OCR upload interface
  EditorLayout.tsx      # Main layout with header/footer

/store
  index.ts              # Redux store configuration
  hooks.ts              # Custom Redux hooks
  /slices
    canvasSlice.ts      # Canvas state management
    uiSlice.ts          # UI state management

/lib
  types.ts              # TypeScript types
  htmlExport.ts         # HTML generation utilities
```

### Redux State Structure
```typescript
{
  canvas: {
    components: Record<id, CanvasComponent>,
    order: string[],           // Z-index ordering
    selectedId: string | null,
    isDragging: boolean
  },
  ui: {
    showComponentPalette: boolean,
    showPropertiesPanel: boolean,
    mode: "design" | "export",
    showOCRUpload: boolean,
    ocrLoading: boolean,
    ocrError: string | null
  }
}
```

## Component Types Supported

1. **Heading** - H2 heading element
2. **Text** - Paragraph/text content
3. **Button** - Clickable button
4. **Image** - Image element
5. **Input Field** - Text input
6. **Text Area** - Multi-line text input
7. **Checkbox** - Checkbox with label
8. **Container** - Flexbox container
9. **Card** - Styled card container
10. **Form** - Form wrapper

## Key Features

### 1. Canvas Editor (Design Mode)
- Drag components to position them
- Click to select and edit properties
- Delete selected components
- Visual grid background
- Real-time preview

### 2. Component Palette
- 10+ pre-configured component types
- Click to add to canvas
- Each component has sensible defaults
- Randomized starting positions

### 3. Properties Panel
- Edit component content/text
- Modify dimensions (width, height)
- Color picker for backgrounds and text
- Typography options (font size, weight)
- Spacing controls (padding, margin)
- Border and border-radius
- Live preview of changes

### 4. OCR Integration
- Upload image/screenshot of a web design
- Nanonets AI detects UI components
- Automatically adds detected components to canvas
- Maps detected elements to our component types
- Shows confidence scores for detections

### 5. HTML Export
- Two export modes:
  - **Download**: Save as `.html` file with inline CSS
  - **Copy**: Copy HTML code to clipboard
- **Preview Tab**: See rendered HTML in iframe
- **Code Tab**: View/edit raw HTML
- Complete standalone HTML file
- Responsive default styles included

## Usage Guide

### Adding Components
1. **Method 1 - Manual**:
   - Click component button in palette
   - Component appears on canvas at random position
   - Drag to desired location

2. **Method 2 - OCR**:
   - Click "Upload Image for OCR"
   - Select screenshot of web design
   - System auto-detects components
   - Components added at detected positions

### Editing Components
1. Click component on canvas to select
2. Edit properties in right panel:
   - Change text content
   - Modify dimensions
   - Update colors and fonts
   - Adjust spacing and borders
3. Changes apply in real-time

### Exporting Design
1. Switch to "Export" mode (top right)
2. View options:
   - **Show Preview**: See rendered HTML
   - **Copy Code**: Copy to clipboard
   - **Download HTML**: Save file
3. HTML includes:
   - Full HTML structure
   - Inline CSS styles
   - Responsive default styling
   - Ready to use anywhere

## API Endpoints

### POST /api/ocr
Upload image for component detection.

**Request:**
```
Content-Type: multipart/form-data
Body: image (File)
```

**Response:**
```json
{
  "detectedComponents": [
    {
      "type": "button",
      "label": "Click Button",
      "bounds": {
        "x": 100,
        "y": 50,
        "width": 120,
        "height": 40
      },
      "confidence": 0.95
    }
  ]
}
```

## Customization

### Adding New Component Types
1. Add type to `ComponentType` in `/lib/types.ts`
2. Add component config to `/components/ComponentPalette.tsx`
3. Add rendering logic to `/components/CanvasElement.tsx`
4. Update OCR mapping in `/app/api/ocr/route.ts`

### Styling
- Use Tailwind CSS for UI
- Component styles stored in Redux state
- Exported HTML uses inline CSS
- Modify default styles in `/lib/htmlExport.ts`

### Nanonets Configuration
- Update API endpoint in `/app/api/ocr/route.ts`
- Modify label-to-component mapping
- Adjust confidence thresholds as needed

## Troubleshooting

### OCR Not Working
- Check Nanonets API key in `.env.local`
- Verify image format is supported (JPG, PNG)
- Check browser console for error messages
- Ensure Nanonets model is properly trained

### Components Not Appearing
- Check Redux DevTools to see state
- Verify component IDs are unique
- Check browser console for errors
- Try clearing canvas and adding new component

### Export Not Working
- Ensure components are on canvas
- Check browser console for errors
- Try "Copy Code" instead of "Download"
- Verify HTML syntax in output

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers supported

## Performance Tips
- Keep under 50 components for optimal performance
- Use smaller images for OCR
- Clear canvas before large new projects
- Use Chrome DevTools Performance tab to monitor

## Future Enhancements
- Undo/redo functionality
- Component grouping/nesting
- Template library
- Responsive design editor
- Real-time collaboration
- More component types
- CSS-in-JS export options
- Design system integration

## License
MIT

## Support
For issues or questions, check the browser console for detailed error messages.
