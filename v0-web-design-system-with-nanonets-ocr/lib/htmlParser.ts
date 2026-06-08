/**
 * htmlParser.ts
 * Parse HTML string → CanvasComponent[]
 *
 * Hỗ trợ các thẻ phổ biến:
 *   h1-h6  → heading / text
 *   p       → text
 *   img     → image
 *   button, a → button
 *   input   → input
 *   div, section, header, footer, nav → container hoặc đệ quy
 *   nav     → nhóm buttons theo hàng ngang
 */

import { CanvasComponent, ComponentType } from './types';

const CANVAS_WIDTH = 1440;
const MARGIN_X = 80;            // lề trái / phải
const DEFAULT_CONTENT_WIDTH = CANVAS_WIDTH - MARGIN_X * 2;

let _idSeed = 0;
function uid() { return `hp-${Date.now()}-${_idSeed++}`; }

/** Lấy class Tailwind/inline đặc trưng để dịch màu */
function bgColor(el: Element): string {
  const cls = el.className || '';
  if (cls.includes('bg-gray-100') || cls.includes('bg-gray-50')) return '#f3f4f6';
  if (cls.includes('bg-white')) return '#ffffff';
  if (cls.includes('bg-gray-800') || cls.includes('bg-gray-900')) return '#1f2937';
  if (cls.includes('bg-blue') || cls.includes('bg-indigo')) return '#3b82f6';
  return '';
}

function textColor(el: Element): string {
  const cls = el.className || '';
  if (cls.includes('text-white')) return '#ffffff';
  if (cls.includes('text-gray-800') || cls.includes('text-gray-900')) return '#1f2937';
  if (cls.includes('text-gray-600')) return '#4b5563';
  if (cls.includes('text-gray-400')) return '#9ca3af';
  return '#1f2937';
}

function fontSizeFromHeading(tag: string): string {
  const map: Record<string, string> = {
    h1: '36px', h2: '30px', h3: '24px', h4: '20px', h5: '18px', h6: '16px',
  };
  return map[tag] || '24px';
}

interface ParseResult {
  components: CanvasComponent[];
  nextY: number;
}

/**
 * Chuyển chuỗi HTML → mảng CanvasComponent để load vào Canvas editor.
 * Chỉ chạy phía client (sử dụng DOMParser).
 */
function rgbToHex(color: string): string {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return '';
  
  // Handle rgba(...) and rgb(...)
  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
  if (!match) return color;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) : 1;
  
  if (a === 0) return ''; // transparent
  
  const hex = '#' + [r, g, b].map(x => {
    const hexStr = x.toString(16);
    return hexStr.length === 1 ? '0' + hexStr : hexStr;
  }).join('');
  
  return hex;
}

function isVisualContainer(el: Element, computed: CSSStyleDeclaration): boolean {
  const tag = el.tagName.toLowerCase();
  if (!['div', 'section', 'main', 'header', 'footer', 'nav', 'form', 'ul', 'ol', 'aside', 'article'].includes(tag)) {
    return false;
  }
  
  // Has a background color that is not transparent/white
  const bg = computed.backgroundColor;
  const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && rgbToHex(bg) !== '#ffffff';
  
  // Has a border
  const border = computed.border;
  const hasBorder = border && border !== 'none' && !border.startsWith('0px');
  
  // Has box shadow
  const shadow = computed.boxShadow;
  const hasShadow = shadow && shadow !== 'none';
  
  // Has special class name
  const className = el.className || '';
  const hasCardClass = className.includes('card') || className.includes('panel') || className.includes('container') || className.includes('bg-') || className.includes('border-');
  
  const rect = el.getBoundingClientRect();
  return !!((hasBg || hasBorder || hasShadow || hasCardClass) && rect.width > 40 && rect.height > 40);
}

/**
 * Chuyển chuỗi HTML → mảng CanvasComponent để load vào Canvas editor.
 * Sử dụng iframe sandboxed để load Tailwind CDN, giúp render chính xác kích thước và tọa độ thật.
 */
export async function htmlToCanvasComponents(html: string): Promise<CanvasComponent[]> {
  if (typeof window === 'undefined') return [];

  return new Promise<CanvasComponent[]>((resolve) => {
    // 1. Tạo iframe ẩn để tính toán layout
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '1440px';
    iframe.style.height = '3000px'; // Chiều cao đủ lớn để tránh bị cuộn dọc
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      if (iframe.parentNode) document.body.removeChild(iframe);
      resolve(fallbackParser(html));
      return;
    }

    // 2. Viết cấu trúc HTML và load Tailwind CSS CDN
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: transparent;
            }
          </style>
        </head>
        <body>
          <div id="tailwind-parse-container">${html}</div>
        </body>
      </html>
    `);
    doc.close();

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      if (iframe.parentNode) document.body.removeChild(iframe);
      resolve(fallbackParser(html));
      return;
    }

    // 3. Đợi Tailwind biên dịch CSS xong (MutationObserver hoặc kiểm tra style tag)
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      checkCount++;
      const hasTailwindStyles = doc.getElementById('tailwindcss') || doc.querySelector('style');
      if (hasTailwindStyles || checkCount > 30) {
        clearInterval(checkInterval);
        
        // Chờ thêm 50ms nữa cho render hoàn tất các thuộc tính layout
        setTimeout(() => {
          try {
            const components: CanvasComponent[] = [];
            const container = doc.getElementById('tailwind-parse-container') || doc.body;
            
            _idSeed = 0;
            
            function walk(el: Element) {
              const tag = el.tagName.toLowerCase();
              if (['script', 'style', 'meta', 'link', 'head', 'noscript', 'br'].includes(tag)) return;
              if (el.id === 'tailwind-parse-container') {
                for (const child of Array.from(el.children)) {
                  walk(child);
                }
                return;
              }

              const rect = el.getBoundingClientRect();
              if (rect.width <= 0 || rect.height <= 0) {
                for (const child of Array.from(el.children)) {
                  walk(child);
                }
                return;
              }

              const computed = iframeWindow!.getComputedStyle(el);
              const textContent = (el as HTMLElement).innerText?.trim() || el.textContent?.trim() || '';

              // Nhận diện component
              let type: ComponentType | null = null;
              let label = textContent || tag;
              let content = textContent;
              let placeholder = '';
              let attributes: Record<string, string> = {};

              if (tag === 'table') {
                type = 'table';
                attributes = { html: el.outerHTML };
                label = 'Table Component';
                content = '';
              } else if (tag === 'img') {
                type = 'image';
                let src = el.getAttribute('src') || '';
                const alt = el.getAttribute('alt') || 'Image';
                
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                  const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) || 'http://localhost:8000/api';
                  const origin = apiBase.replace('/api', '');
                  const path = src.startsWith('/media/') ? src : `/media/${src}`;
                  src = `${origin}${path}`;
                }
                
                attributes = { src, alt };
                label = alt;
                content = alt;
              } else if (tag === 'input' || tag === 'textarea' || tag === 'select') {
                type = 'input';
                placeholder = el.getAttribute('placeholder') || '';
                label = placeholder || el.getAttribute('type') || 'input';
                content = '';
              } else if (tag === 'button' || tag === 'a' || computed.cursor === 'pointer' || el.getAttribute('role') === 'button') {
                type = 'button';
                if (tag === 'a') {
                  attributes = { href: el.getAttribute('href') || '#' };
                }
              } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
                type = 'heading';
              } else if (textContent && el.children.length === 0) {
                const fSize = parseFloat(computed.fontSize);
                const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 600;
                if (fSize >= 20 && isBold) {
                  type = 'heading';
                } else {
                  type = 'text';
                }
              } else if (isVisualContainer(el, computed)) {
                type = 'container';
              }

              if (type) {
                const borderVal = computed.border;
                const hasBorder = borderVal && borderVal !== 'none' && !borderVal.startsWith('0px');
                const shadowVal = computed.boxShadow;
                const hasShadow = shadowVal && shadowVal !== 'none';
                
                const canvasStyle: Record<string, string> = {
                  width: `${Math.round(rect.width)}px`,
                  height: `${Math.round(rect.height)}px`,
                };

                if (computed.zIndex && computed.zIndex !== 'auto') {
                  canvasStyle.zIndex = computed.zIndex;
                }

                // Common typography styles for text-containing elements
                if (['heading', 'text', 'button', 'input'].includes(type)) {
                  canvasStyle.fontSize = computed.fontSize;
                  canvasStyle.fontWeight = computed.fontWeight;
                  canvasStyle.color = rgbToHex(computed.color) || '#1f2937';
                  canvasStyle.fontFamily = computed.fontFamily;
                  canvasStyle.textAlign = computed.textAlign;
                  if (computed.lineHeight && computed.lineHeight !== 'normal') {
                    canvasStyle.lineHeight = computed.lineHeight;
                  }
                  if (computed.letterSpacing && computed.letterSpacing !== 'normal') {
                    canvasStyle.letterSpacing = computed.letterSpacing;
                  }
                }

                if (type === 'button') {
                  canvasStyle.backgroundColor = rgbToHex(computed.backgroundColor) || '#3b82f6';
                  canvasStyle.borderRadius = computed.borderRadius !== '0px' ? computed.borderRadius : '6px';
                  if (hasBorder) canvasStyle.border = borderVal;
                  if (hasShadow) canvasStyle.boxShadow = shadowVal;
                } else if (type === 'input') {
                  canvasStyle.backgroundColor = rgbToHex(computed.backgroundColor) || '#ffffff';
                  canvasStyle.border = hasBorder ? borderVal : '1px solid #d1d5db';
                  canvasStyle.borderRadius = computed.borderRadius !== '0px' ? computed.borderRadius : '6px';
                  if (hasShadow) canvasStyle.boxShadow = shadowVal;
                } else if (type === 'image') {
                  canvasStyle.borderRadius = computed.borderRadius !== '0px' ? computed.borderRadius : '0px';
                  if (hasBorder) canvasStyle.border = borderVal;
                  if (hasShadow) canvasStyle.boxShadow = shadowVal;
                } else if (type === 'table') {
                  canvasStyle.backgroundColor = rgbToHex(computed.backgroundColor) || 'transparent';
                  if (hasBorder) canvasStyle.border = borderVal;
                  canvasStyle.borderRadius = computed.borderRadius !== '0px' ? computed.borderRadius : '0px';
                  if (hasShadow) canvasStyle.boxShadow = shadowVal;
                } else if (type === 'container') {
                  canvasStyle.backgroundColor = rgbToHex(computed.backgroundColor) || 'transparent';
                  if (hasBorder) canvasStyle.border = borderVal;
                  canvasStyle.borderRadius = computed.borderRadius !== '0px' ? computed.borderRadius : '0px';
                  if (hasShadow) canvasStyle.boxShadow = shadowVal;
                }

                components.push({
                  id: uid(),
                  type,
                  label: label.substring(0, 100),
                  content: content,
                  placeholder,
                  x: Math.round(rect.left),
                  y: Math.round(rect.top),
                  style: canvasStyle as any,
                  attributes,
                  events: { onClick: 'none' }
                });

                if (type === 'container') {
                  for (const child of Array.from(el.children)) {
                    walk(child);
                  }
                }
              } else {
                for (const child of Array.from(el.children)) {
                  walk(child);
                }
              }
            }

            walk(container);

            if (iframe.parentNode) document.body.removeChild(iframe);
            resolve(components);
          } catch (err) {
            console.error('Lỗi khi parse layout iframe:', err);
            if (iframe.parentNode) document.body.removeChild(iframe);
            resolve(fallbackParser(html));
          }
        }, 50);
      }
    }, 10);
  });
}

function fallbackParser(html: string): CanvasComponent[] {
  if (typeof window === 'undefined') return [];

  _idSeed = 0;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const components: CanvasComponent[] = [];
  let currentY = 40;

  function walk(parent: Element) {
    for (const child of Array.from(parent.children)) {
      const tag = child.tagName.toLowerCase();

      if (['script', 'style', 'meta', 'link', 'head', 'noscript'].includes(tag)) continue;

      const text = (child as HTMLElement).innerText?.trim() || child.textContent?.trim() || '';
      if (!text && tag !== 'img') {
        if (['div', 'section', 'header', 'footer', 'main', 'article'].includes(tag)) {
          walk(child);
        }
        continue;
      }

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        const comp: CanvasComponent = {
          id: uid(),
          type: 'heading',
          label: text,
          content: text,
          placeholder: '',
          x: MARGIN_X,
          y: currentY,
          style: {
            width: `${DEFAULT_CONTENT_WIDTH}px`,
            height: '60px',
            fontSize: fontSizeFromHeading(tag),
            fontWeight: 'bold',
            color: textColor(child),
            textAlign: 'center',
            justifyContent: 'center',
          },
          attributes: {},
          events: { onClick: 'none' },
        };
        components.push(comp);
        currentY += 72;
        continue;
      }

      if (tag === 'p') {
        const lineCount = Math.ceil(text.length / 90) + 1;
        const h = Math.max(40, lineCount * 24);
        const comp: CanvasComponent = {
          id: uid(),
          type: 'text',
          label: text,
          content: text,
          placeholder: '',
          x: MARGIN_X + 60,
          y: currentY,
          style: {
            width: `${DEFAULT_CONTENT_WIDTH - 120}px`,
            height: `${h}px`,
            fontSize: '16px',
            color: textColor(child),
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'flex-start',
          },
          attributes: {},
          events: { onClick: 'none' },
        };
        components.push(comp);
        currentY += h + 16;
        continue;
      }

      if (tag === 'img') {
        let src = child.getAttribute('src') || '';
        const alt = child.getAttribute('alt') || 'Image';
        
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) || 'http://localhost:8000/api';
          const origin = apiBase.replace('/api', '');
          const path = src.startsWith('/media/') ? src : `/media/${src}`;
          src = `${origin}${path}`;
        }
        
        const comp: CanvasComponent = {
          id: uid(),
          type: 'image',
          label: alt,
          content: alt,
          placeholder: '',
          x: CANVAS_WIDTH / 2 - 150,
          y: currentY,
          style: {
            width: '300px',
            height: '200px',
            borderRadius: '8px',
          },
          attributes: { src, alt },
          events: { onClick: 'none' },
        };
        components.push(comp);
        currentY += 220;
        continue;
      }

      if (tag === 'table') {
        const comp: CanvasComponent = {
          id: uid(),
          type: 'table',
          label: 'Table Component',
          content: '',
          placeholder: '',
          x: MARGIN_X,
          y: currentY,
          style: {
            width: `${DEFAULT_CONTENT_WIDTH}px`,
            height: '240px',
          },
          attributes: { html: child.outerHTML },
          events: { onClick: 'none' },
        };
        components.push(comp);
        currentY += 256;
        continue;
      }

      if (tag === 'button') {
        const comp: CanvasComponent = {
          id: uid(),
          type: 'button',
          label: text,
          content: text,
          placeholder: '',
          x: CANVAS_WIDTH / 2 - 60,
          y: currentY,
          style: {
            width: '120px',
            height: '40px',
            backgroundColor: bgColor(child) || '#3b82f6',
            color: textColor(child) || '#ffffff',
            borderRadius: '6px',
          },
          attributes: {},
          events: { onClick: 'none' },
        };
        components.push(comp);
        currentY += 56;
        continue;
      }

      if (tag === 'input') {
        const inputType = child.getAttribute('type') || 'text';
        const ph = child.getAttribute('placeholder') || '';
        const comp: CanvasComponent = {
          id: uid(),
          type: 'input',
          label: ph || inputType,
          content: '',
          placeholder: ph,
          x: MARGIN_X + 60,
          y: currentY,
          style: {
            width: `${DEFAULT_CONTENT_WIDTH - 120}px`,
            height: '48px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '0 12px',
          },
          attributes: {},
          events: { onClick: 'none' },
        };
        components.push(comp);
        currentY += 64;
        continue;
      }

      if (tag === 'nav') {
        const links = Array.from(child.querySelectorAll('a')).filter(
          (a) => (a.textContent?.trim() || '').length > 0
        );
        if (links.length > 0) {
          const btnW = 120;
          const gap = 12;
          const totalW = links.length * btnW + (links.length - 1) * gap;
          let startX = CANVAS_WIDTH / 2 - totalW / 2;
          for (const link of links) {
            const btnText = link.textContent?.trim() || 'Link';
            components.push({
              id: uid(),
              type: 'button',
              label: btnText,
              content: btnText,
              placeholder: '',
              x: startX,
              y: currentY,
              style: {
                width: `${btnW}px`,
                height: '40px',
                backgroundColor: bgColor(link) || '#6b7280',
                color: textColor(link) || '#ffffff',
                borderRadius: '4px',
              },
              attributes: { href: link.getAttribute('href') || '#' },
              events: { onClick: 'none' },
            });
            startX += btnW + gap;
          }
          currentY += 60;
        } else {
          walk(child);
        }
        continue;
      }

      if (tag === 'a' && text) {
        const comp: CanvasComponent = {
          id: uid(),
          type: 'button',
          label: text,
          content: text,
          placeholder: '',
          x: CANVAS_WIDTH / 2 - 60,
          y: currentY,
          style: {
            width: '120px',
            height: '40px',
            backgroundColor: bgColor(child) || '#6b7280',
            color: textColor(child) || '#ffffff',
            borderRadius: '4px',
          },
          attributes: { href: child.getAttribute('href') || '#' },
          events: { onClick: 'none' },
        };
        components.push(comp);
        currentY += 56;
        continue;
      }

      if (['div', 'section', 'header', 'footer', 'main', 'article', 'ul', 'form'].includes(tag)) {
        walk(child);
        continue;
      }
    }
  }

  walk(body);
  return components;
}
