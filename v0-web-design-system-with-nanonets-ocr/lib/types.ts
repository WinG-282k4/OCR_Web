// ─── Frontend Types (Canvas) ────────────────────────────────────────────────

export type ComponentType =
  | "button" | "text" | "heading" | "input" | "textarea"
  | "checkbox" | "card" | "container" | "image" | "form" | "label" | "link";

export interface ComponentStyle {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  display?: string;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  border?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  [key: string]: string | undefined;
}

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  label: string;
  content?: string;
  placeholder?: string;
  x: number;
  y: number;
  style: ComponentStyle;
  attributes: {
    src?: string;
    alt?: string;
    href?: string;
    variant?: string;
    [key: string]: any;
  };
  events: {
    onClick?: "none" | "alert" | "navigate";
  };
  children?: string[];
}

export interface CanvasState {
  components: Record<string, CanvasComponent>;
  order: string[];
  selectedId: string | null;
  isDragging: boolean;
}

// ─── Backend (Django) Types ──────────────────────────────────────────────────

export interface BEComponentPosition {
  x: number;
  y: number;
}

export interface BEComponentSize {
  width: number;
  height: number;
}

export interface BEComponentProperties {
  text?: string;
  variant?: string;
  placeholder?: string;
  src?: string;
  alt?: string;
  href?: string;
  [key: string]: any;
}

export interface BEComponent {
  id: string;
  type: string;
  position: BEComponentPosition;
  size: BEComponentSize;
  properties: BEComponentProperties;
  style?: Record<string, string>;
}

export interface BEScreen {
  id: string;
  name: string;
  description?: string;
  screen_type: string;
  order: number;
  width: number;
  height: number;
  background_color: string;
  components: BEComponent[];
  component_count?: number;
  thumbnail?: string | null;
  created_from_ocr: boolean;
  created_at: string;
  updated_at: string;
  last_saved_at?: string;
  current_version_number?: number;
}

export interface BEProject {
  id: string;
  name: string;
  description?: string;
  theme?: Record<string, string>;
  tags?: string[];
  thumbnail?: string | null;
  screen_count?: number;
  member_count?: number;
  created_at: string;
  updated_at: string;
  screens?: BEScreen[];
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  bio?: string;
  date_joined?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

// ─── OCR Types ───────────────────────────────────────────────────────────────

export interface OCRResult {
  detectedComponents: Array<{
    id?: string;
    type: string;
    label: string;
    confidence: number;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
}

export interface BEOCRAnalysis {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  original_filename: string;
  processing_time?: number;
  created_at: string;
}

// ─── Export Types ────────────────────────────────────────────────────────────

export interface ExportOptions {
  format?: 'html' | 'react' | 'vue';
  include_css?: boolean;
  include_tailwind?: boolean;
  minify?: boolean;
}