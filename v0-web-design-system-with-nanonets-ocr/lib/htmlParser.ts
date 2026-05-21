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
export function htmlToCanvasComponents(html: string): CanvasComponent[] {
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

      // Bỏ qua các thẻ không có nội dung hiển thị
      if (['script', 'style', 'meta', 'link', 'head', 'noscript'].includes(tag)) continue;

      const text = (child as HTMLElement).innerText?.trim() || child.textContent?.trim() || '';
      if (!text && tag !== 'img') {
        // Có thể là wrapper div → đệ quy vào
        if (['div', 'section', 'header', 'footer', 'main', 'article'].includes(tag)) {
          walk(child);
        }
        continue;
      }

      // ── Headings ────────────────────────────────────────────────────────────
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

      // ── Paragraph ────────────────────────────────────────────────────────────
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

      // ── Image ────────────────────────────────────────────────────────────────
      if (tag === 'img') {
        const src = child.getAttribute('src') || '';
        const alt = child.getAttribute('alt') || 'Image';
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

      // ── Standalone button ────────────────────────────────────────────────────
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

      // ── Input ────────────────────────────────────────────────────────────────
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

      // ── Nav → nhóm anchor buttons hàng ngang ─────────────────────────────────
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
          walk(child); // nav không có anchor → đệ quy
        }
        continue;
      }

      // ── Anchor link standalone ───────────────────────────────────────────────
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

      // ── Div/Section container → đệ quy vào trong ────────────────────────────
      if (['div', 'section', 'header', 'footer', 'main', 'article', 'ul', 'form'].includes(tag)) {
        walk(child);
        continue;
      }
    }
  }

  walk(body);
  return components;
}
