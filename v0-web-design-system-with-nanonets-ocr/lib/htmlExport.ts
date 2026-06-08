/**
 * HTML Export Utility — Using TailwindCSS CDN
 *
 * Maps CanvasComponent → Tailwind-styled HTML elements
 * The generated HTML matches the design editor canvas identically.
 */

import { CanvasComponent, ComponentStyle } from './types';

/**
 * Convert ComponentStyle object to inline CSS string
 */
function styleToInline(style: Record<string, string | undefined>): string {
  const props: string[] = [];

  for (const [key, value] of Object.entries(style)) {
    if (value === undefined || value === null || value === '') continue;
    // Convert camelCase to kebab-case
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    props.push(`${cssKey}: ${value}`);
  }

  return props.length > 0 ? ` style="${props.join('; ')}"` : '';
}

/**
 * Convert single CanvasComponent to HTML string matching the canvas renderer
 */
function componentToHtml(
  component: CanvasComponent,
  allComponents: Record<string, CanvasComponent>
): string {
  const { type, content, label, placeholder, style, attributes } = component;
  const textToDisplay = content || label || type;

  switch (type) {
    case 'button':
      return `<button 
        class="w-full h-full cursor-pointer flex items-center justify-center" 
        style="background-color: ${style.backgroundColor || '#2563eb'}; color: ${style.color || '#ffffff'}; border-radius: ${style.borderRadius || '0.25rem'}; font-size: ${style.fontSize || 'inherit'}; font-weight: ${style.fontWeight || 'normal'}; border: ${style.border || 'none'}; box-shadow: ${style.boxShadow || 'none'}; line-height: ${style.lineHeight || 'normal'}; letter-spacing: ${style.letterSpacing || 'normal'}; text-align: ${style.textAlign || 'center'}; font-family: ${style.fontFamily || 'inherit'};">
        ${textToDisplay}
      </button>`;

    case 'input':
      return `<input 
        type="${attributes?.type || 'text'}" 
        placeholder="${placeholder || 'Enter text...'}" 
        class="w-full h-full border px-3 rounded" 
        style="font-size: ${style.fontSize || 'inherit'}; font-weight: ${style.fontWeight || 'normal'}; font-family: ${style.fontFamily || 'inherit'}; color: ${style.color || 'inherit'}; background-color: ${style.backgroundColor || '#ffffff'}; border: ${style.border || '1px solid #ccc'}; border-radius: ${style.borderRadius || '4px'}; text-align: ${style.textAlign || 'left'};" 
        readonly />`;

    case 'textarea':
      return `<textarea 
        placeholder="${placeholder || 'Enter text...'}" 
        class="w-full h-full border p-2 rounded resize-none" 
        style="font-size: ${style.fontSize || 'inherit'}; font-weight: ${style.fontWeight || 'normal'}; font-family: ${style.fontFamily || 'inherit'}; color: ${style.color || 'inherit'}; background-color: ${style.backgroundColor || '#ffffff'}; border: ${style.border || '1px solid #ccc'}; border-radius: ${style.borderRadius || '4px'}; text-align: ${style.textAlign || 'left'};" 
        readonly></textarea>`;

    case 'checkbox':
      return `<div class="flex items-center gap-2 w-full h-full">
        <input type="checkbox" class="w-4 h-4 cursor-pointer" />
        <span style="color: ${style.color || 'inherit'}; font-size: ${style.fontSize || '14px'}; font-family: ${style.fontFamily || 'inherit'}; font-weight: ${style.fontWeight || 'normal'};">${textToDisplay}</span>
      </div>`;

    case 'image':
      return `<img 
        src="${attributes?.src || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80'}" 
        alt="${attributes?.alt || 'Image'}" 
        class="w-full h-full object-cover" 
        style="border-radius: ${style.borderRadius || '0'}; border: ${style.border || 'none'}; box-shadow: ${style.boxShadow || 'none'};" />`;

    case 'heading':
      return `<h2 
        class="w-full m-0" 
        style="font-size: ${style.fontSize || '1.25rem'}; font-weight: ${style.fontWeight || 'bold'}; font-family: ${style.fontFamily || 'inherit'}; color: ${style.color || 'inherit'}; text-align: ${style.textAlign || 'left'}; line-height: ${style.lineHeight || 'normal'}; letter-spacing: ${style.letterSpacing || 'normal'};">
        ${textToDisplay}
      </h2>`;

    case 'text':
      return `<p 
        class="w-full m-0" 
        style="font-size: ${style.fontSize || 'inherit'}; font-weight: ${style.fontWeight || 'normal'}; font-family: ${style.fontFamily || 'inherit'}; color: ${style.color || 'inherit'}; text-align: ${style.textAlign || 'left'}; line-height: ${style.lineHeight || 'normal'}; letter-spacing: ${style.letterSpacing || 'normal'};">
        ${textToDisplay}
      </p>`;

    case 'link':
      return `<a 
        href="${attributes?.href || '#'}" 
        target="${attributes?.target || '_self'}"
        class="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors w-full"
        style="font-size: ${style.fontSize || 'inherit'}; font-weight: ${style.fontWeight || 'normal'}; font-family: ${style.fontFamily || 'inherit'}; color: ${style.color || 'inherit'}; text-align: ${style.textAlign || 'left'};">
        ${textToDisplay}
      </a>`;

    case 'table':
      return attributes?.html || `
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-700">Tên</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-700">Vai trò</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-slate-700">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr>
              <td class="px-4 py-2 text-sm text-slate-600">Nguyễn Văn A</td>
              <td class="px-4 py-2 text-sm text-slate-600">Developer</td>
              <td class="px-4 py-2 text-sm text-green-600">Active</td>
            </tr>
          </tbody>
        </table>
      `;

    case 'card':
    case 'container':
    case 'form': {
      const tag = type === 'form' ? 'form' : 'div';
      const children = (component.children || [])
        .map((childId) => {
          const child = allComponents[childId];
          return child ? componentToHtml(child, allComponents) : '';
        })
        .join('\n        ');
      
      return `<${tag} class="w-full h-full flex flex-col" style="justify-content: ${style.justifyContent || 'flex-start'}; align-items: ${style.alignItems || 'stretch'};">
        ${children}
      </${tag}>`;
    }

    default:
      return `<div class="w-full h-full">${textToDisplay}</div>`;
  }
}

/**
 * Generate full HTML with Tailwind CDN using Absolute positioning matching the canvas editor
 */
export function generateTailwindHTML(
  components: Record<string, CanvasComponent>,
  order: string[]
): string {
  if (!order || order.length === 0) return '';

  // Find all components that are children of other container/card components
  const childIds = new Set<string>();
  Object.values(components).forEach((comp) => {
    if (comp.children) {
      comp.children.forEach((childId) => childIds.add(childId));
    }
  });

  const bodyContent = order
    .filter((id) => components[id] && !childIds.has(id))
    .map((id) => {
      const comp = components[id];
      const w = comp.style.width || '120px';
      const h = comp.style.height || '40px';
      
      // Mirror the Rnd box container style in the export wrapper
      const isLeaf = ['button', 'input', 'textarea', 'image'].includes(comp.type);
      const wrapperStyle: Record<string, string | undefined> = {
        position: 'absolute',
        left: `${comp.x}px`,
        top: `${comp.y}px`,
        width: w,
        height: h,
        padding: comp.style.padding,
        margin: comp.style.margin,
        'box-sizing': 'border-box',
        'background-color': isLeaf ? undefined : comp.style.backgroundColor,
        border: isLeaf ? undefined : comp.style.border,
        'border-radius': isLeaf ? undefined : comp.style.borderRadius,
        'box-shadow': isLeaf ? undefined : comp.style.boxShadow,
        opacity: comp.style.opacity,
        'z-index': comp.style.zIndex,
        display: comp.style.display || 'flex',
        'flex-direction': comp.style.flexDirection || 'column',
        'align-items': comp.style.alignItems || 'center',
        'justify-content': comp.style.justifyContent || 'center',
        gap: comp.style.gap,
      };

      const inlineStyle = styleToInline(wrapperStyle);
      const inner = componentToHtml(comp, components);

      return `  <div${inlineStyle}>\n    ${inner}\n  </div>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exported Design</title>
  <!-- Google Fonts Outfit & Montserrat -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 1520px; /* Force minimum width to trigger horizontal scrollbars on small viewports */
    }
    .canvas-wrapper {
      position: relative;
      width: 1440px;
      height: 900px;
      background-color: #ffffff;
      margin: 40px auto;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="canvas-wrapper">
${bodyContent}
  </div>
</body>
</html>`;
}

/**
 * Generate layout-mode HTML (flexbox/grid, not absolute positioned)
 * Better for real-world use
 */
export function generateLayoutHTML(
  components: Record<string, CanvasComponent>,
  order: string[]
): string {
  if (!order || order.length === 0) return '';

  // Find all components that are children of other container/card components
  const childIds = new Set<string>();
  Object.values(components).forEach((comp) => {
    if (comp.children) {
      comp.children.forEach((childId) => childIds.add(childId));
    }
  });

  const bodyContent = order
    .filter((id) => components[id] && !childIds.has(id))
    .map((id) => componentToHtml(components[id], components))
    .join('\n\n  ');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exported Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-white p-8">
  <div class="max-w-4xl mx-auto flex flex-col gap-6">
  ${bodyContent}
  </div>
</body>
</html>`;
}

/**
 * Download HTML as file.
 */
export function downloadHTML(
  htmlOrComponents: string | Record<string, CanvasComponent>,
  orderOrFilename: string[] | string = 'design.html',
  filename = 'design.html'
): void {
  let html = '';
  let finalFilename = 'design.html';

  if (typeof htmlOrComponents === 'string') {
    html = htmlOrComponents;
    finalFilename = typeof orderOrFilename === 'string' ? orderOrFilename : 'design.html';
  } else {
    const components = htmlOrComponents;
    const order = orderOrFilename as string[];
    html = generateTailwindHTML(components, order);
    finalFilename = filename;
  }

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Keep backward compatibility
export { generateTailwindHTML as generateHTML };
