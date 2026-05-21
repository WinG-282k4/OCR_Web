/**
 * HTML Export Utility — Using TailwindCSS CDN
 *
 * Maps CanvasComponent → Tailwind-styled HTML elements
 * The generated HTML includes Tailwind CDN script for full styling support.
 */

import { CanvasComponent, ComponentStyle } from './types';

// ─── Component type → Tailwind class mapping ─────────────────────────────────

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
};

function resolveVariant(variant?: string): string {
  if (variant && VARIANT_CLASSES[variant]) return VARIANT_CLASSES[variant];
  return 'bg-blue-600 hover:bg-blue-700 text-white';
}

/**
 * Convert ComponentStyle object → inline style string
 * Only for properties not handled by Tailwind classes
 */
function styleToInline(style: ComponentStyle, excludeKeys: string[] = []): string {
  const props: string[] = [];
  const skip = new Set(excludeKeys);

  for (const [key, value] of Object.entries(style)) {
    if (!value || skip.has(key)) continue;
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    props.push(`${cssKey}: ${value}`);
  }

  return props.length > 0 ? ` style="${props.join('; ')}"` : '';
}

/**
 * Convert single CanvasComponent → HTML string with Tailwind classes
 */
function componentToHtml(
  component: CanvasComponent,
  allComponents: Record<string, CanvasComponent>
): string {
  const { type, content, label, placeholder, style, attributes } = component;
  const inlineStyle = styleToInline(style);
  const variant = attributes?.variant;

  switch (type) {
    case 'button':
      return `<button
        class="inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${resolveVariant(variant)}"${inlineStyle}>
        ${content || label || 'Click me'}
      </button>`;

    case 'text':
      return `<p class="text-gray-700 leading-relaxed"${inlineStyle}>
        ${content || label || 'Your text here'}
      </p>`;

    case 'heading':
      return `<h2 class="text-2xl font-bold text-gray-900 leading-tight"${inlineStyle}>
        ${content || label || 'Heading'}
      </h2>`;

    case 'label':
      return `<label class="text-sm font-medium text-gray-700"${inlineStyle}>
        ${content || label || 'Label'}
      </label>`;

    case 'input':
      return `<input
        type="text"
        placeholder="${placeholder || label || 'Enter text...'}"
        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"${inlineStyle} />`;

    case 'textarea':
      return `<textarea
        placeholder="${placeholder || label || 'Enter text...'}"
        rows="4"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"${inlineStyle}></textarea>`;

    case 'checkbox':
      return `<label class="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <span class="text-sm text-gray-700">${content || label || 'Checkbox'}</span>
      </label>`;

    case 'image':
      return `<img
        src="${attributes?.src || 'https://placehold.co/400x300?text=Image'}"
        alt="${attributes?.alt || label || 'Image'}"
        class="rounded-lg object-cover max-w-full"${inlineStyle} />`;

    case 'link':
      return `<a
        href="${attributes?.href || '#'}"
        class="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"${inlineStyle}>
        ${content || label || 'Link'}
      </a>`;

    case 'card': {
      const children = (component.children || [])
        .map((childId) => {
          const child = allComponents[childId];
          return child ? componentToHtml(child, allComponents) : '';
        })
        .join('\n        ');
      return `<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6"${inlineStyle}>
        ${children || `<p class="text-gray-400 text-sm">Card content</p>`}
      </div>`;
    }

    case 'container':
    case 'form': {
      const tag = type === 'form' ? 'form' : 'div';
      const children = (component.children || [])
        .map((childId) => {
          const child = allComponents[childId];
          return child ? componentToHtml(child, allComponents) : '';
        })
        .join('\n        ');
      return `<${tag} class="flex flex-col gap-4"${inlineStyle}>
        ${children || ''}
      </${tag}>`;
    }

    default:
      return `<div class="bg-gray-100 rounded-lg p-4 text-gray-600 text-sm"${inlineStyle}>
        ${content || label || type}
      </div>`;
  }
}

/**
 * Generate full HTML with Tailwind CDN
 */
export function generateTailwindHTML(
  components: Record<string, CanvasComponent>,
  order: string[]
): string {
  if (!order || order.length === 0) return '';

  const bodyContent = order
    .filter((id) => components[id])
    .map((id) => {
      const comp = components[id];
      // Add absolute positioning using x/y from canvas
      const posStyle = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
      const inner = componentToHtml(comp, components);
      return `  <div style="${posStyle}">\n    ${inner}\n  </div>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exported Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
    }
    .canvas-wrapper {
      position: relative;
      min-height: 100vh;
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

  const bodyContent = order
    .filter((id) => components[id])
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
 * Supports legacy downloadHTML(components, order, filename)
 * and new downloadHTML(htmlString, filename)
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
    html = generateLayoutHTML(components, order);
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
