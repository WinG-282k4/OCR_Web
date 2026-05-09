/**
 * Data Adapters: Convert between Frontend (CanvasComponent) ↔ Backend (BEComponent) formats
 *
 * FE flat:  { id, type, x, y, style.width, style.height, label/content }
 * BE nested: { id, type, position:{x,y}, size:{width,height}, properties:{text} }
 */

import { BEComponent, BEScreen, CanvasComponent, CanvasState, ComponentType } from './types';

// ─── BE → FE ────────────────────────────────────────────────────────────────

/**
 * Convert a single BE component → FE CanvasComponent
 */
export function beComponentToFe(comp: BEComponent): CanvasComponent {
  const { id, type, position, size, properties = {}, style = {} } = comp;

  return {
    id,
    type: (type as ComponentType) || 'container',
    label: properties.text || properties.alt || type,
    content: properties.text || '',
    placeholder: properties.placeholder || '',
    x: position?.x ?? 0,
    y: position?.y ?? 0,
    style: {
      width: size?.width ? `${size.width}px` : '120px',
      height: size?.height ? `${size.height}px` : '40px',
      backgroundColor: style.backgroundColor || properties.backgroundColor || '',
      color: style.color || properties.color || '',
      borderRadius: style.borderRadius || '',
      border: style.border || '',
      fontSize: style.fontSize || '',
      fontWeight: style.fontWeight || '',
      padding: style.padding || '',
      margin: style.margin || '',
      ...style,
    },
    attributes: {
      src: properties.src,
      alt: properties.alt,
      href: properties.href,
      variant: properties.variant,
    },
    events: {
      onClick: 'none',
    },
  };
}

/**
 * Convert entire BE screen → Redux CanvasState
 */
export function beScreenToCanvasState(screen: BEScreen): Omit<CanvasState, 'selectedId' | 'isDragging'> {
  const components: Record<string, CanvasComponent> = {};
  const order: string[] = [];

  const componentList: BEComponent[] = Array.isArray(screen.components)
    ? screen.components
    : Object.values(screen.components || {});

  componentList.forEach((comp) => {
    const feComp = beComponentToFe(comp);
    components[feComp.id] = feComp;
    order.push(feComp.id);
  });

  return { components, order };
}

// ─── FE → BE ────────────────────────────────────────────────────────────────

/**
 * Convert a single FE CanvasComponent → BE BEComponent
 */
export function feComponentToBe(comp: CanvasComponent): BEComponent {
  const width = comp.style?.width
    ? parseInt(comp.style.width, 10) || 120
    : 120;
  const height = comp.style?.height
    ? parseInt(comp.style.height, 10) || 40
    : 40;

  // Extract style without width/height (those go into size)
  const { width: _w, height: _h, ...restStyle } = comp.style || {};

  return {
    id: comp.id,
    type: comp.type,
    position: { x: comp.x, y: comp.y },
    size: { width, height },
    properties: {
      text: comp.content || comp.label || '',
      placeholder: comp.placeholder || '',
      variant: comp.attributes?.variant || '',
      src: comp.attributes?.src || '',
      alt: comp.attributes?.alt || '',
      href: comp.attributes?.href || '',
    },
    style: Object.fromEntries(
      Object.entries(restStyle).filter(([, v]) => v !== undefined && v !== '')
    ) as Record<string, string>,
  };
}

/**
 * Convert FE canvas components map + order → BE components array
 */
export function feCanvasStateToBe(
  components: Record<string, CanvasComponent>,
  order: string[]
): BEComponent[] {
  return order
    .map((id) => components[id])
    .filter(Boolean)
    .map(feComponentToBe);
}

// ─── OCR → FE ───────────────────────────────────────────────────────────────

/**
 * Convert BE OCR normalized component → FE CanvasComponent
 * BE OCR components share BEComponent format
 */
export function ocrComponentToFe(comp: any, index: number): CanvasComponent {
  const id = comp.id || `ocr-${index}-${Date.now()}`;
  const type = (comp.type as ComponentType) || 'container';
  const position = comp.position || { x: 50 + index * 10, y: 50 + index * 10 };
  const size = comp.size || { width: 120, height: 40 };
  const properties = comp.properties || {};
  const content = properties.text || comp.content || type;

  return {
    id,
    type,
    label: content,
    content,
    placeholder: properties.placeholder || '',
    x: position.x,
    y: position.y,
    style: {
      width: `${size.width}px`,
      height: `${size.height}px`,
      backgroundColor: properties.backgroundColor || '',
      color: properties.color || '',
    },
    attributes: {
      src: properties.src || '',
      alt: properties.alt || '',
      href: properties.href || '',
      variant: properties.variant || '',
    },
    events: { onClick: 'none' },
  };
}
