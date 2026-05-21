'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCurrentProject, setScreens, addScreen,
  removeScreen, setCurrentScreen, savingStart, savingSuccess, savingFailure,
} from '@/store/slices/sessionSlice';
import { loadComponents, clearCanvas, updateComponent } from '@/store/slices/canvasSlice';
import { projectsAPI, screensAPI, ocrAPI } from '@/lib/api-client';
import { beScreenToCanvasState, feCanvasStateToBe, ocrComponentToFe } from '@/lib/adapters';
import { generateTailwindHTML, downloadHTML } from '@/lib/htmlExport';
import { htmlToCanvasComponents } from '@/lib/htmlParser';
import type { BEScreen, CanvasComponent } from '@/lib/types';
import {
  ArrowLeft, Upload, Plus, Loader2, Layers, Image as ImageIcon,
  Download, Code2, Trash2, Eye, RefreshCw, Save, X, Monitor, CheckCircle2,
  AlertCircle, ChevronRight, PenTool
} from 'lucide-react';
import Canvas from '@/components/Canvas';
import ComponentPalette from '@/components/ComponentPalette';
import PropertiesPanel from '@/components/PropertiesPanel';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentProject, screens, currentScreen, isSaving, lastSavedAt } = useAppSelector((s) => s.session);
  const canvasState = useAppSelector((s) => s.canvas);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [ocrUploading, setOcrUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [viewMode, setViewMode] = useState<'design' | 'preview' | 'html'>('design');
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [screenToDelete, setScreenToDelete] = useState<BEScreen | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load project + screens ──────────────────────────────────────────────
  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  async function loadProjectData() {
    try {
      setIsLoading(true);
      const [project, screensRes] = await Promise.all([
        projectsAPI.get(projectId),
        screensAPI.list(projectId),
      ]);
      dispatch(setCurrentProject(project));
      dispatch(setScreens(screensRes.results));
    } catch (e: any) {
      setError(e.message || 'Không thể tải dự án');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Select screen → load into canvas ────────────────────────────────────
  function selectScreen(screen: BEScreen) {
    dispatch(setCurrentScreen(screen));
    const { components, order } = beScreenToCanvasState(screen);
    dispatch(loadComponents(Object.values(components)));

    // Neu screen co html_content (tu OCR), dung no lam Preview/HTML
    const storedHTML = extractHTMLContent(screen);
    if (storedHTML) {
      setGeneratedHTML(storedHTML);
    } else {
      regenerateHTML(components, order);
    }
  }

  /**
   * Lay html_content tu components[0].properties.html_content neu co
   * (screen duoc tao tu OCR se luu HTML goc vao day)
   */
  function extractHTMLContent(screen: BEScreen): string | null {
    if (!Array.isArray(screen.components)) return null;
    for (const comp of screen.components) {
      const html = comp?.properties?.html_content;
      if (html && typeof html === 'string' && html.trim().length > 0) {
        return html;
      }
    }
    return null;
  }

  function regenerateHTML(
    comps = canvasState.components,
    ord = canvasState.order
  ) {
    const html = generateTailwindHTML(comps, ord);
    setGeneratedHTML(html);
  }

  // ── Save screen components → BE ─────────────────────────────────────────
  async function handleSave() {
    if (!currentScreen) return;
    dispatch(savingStart());
    try {
      let componentsToSave = canvasState.components;
      let orderToSave = canvasState.order;

      // If we are in html mode on a non-OCR screen, parse before saving
      const hasOcrContainer = Object.values(canvasState.components).some(
        (c) => c.attributes && 'html_content' in c.attributes
      );
      if (!hasOcrContainer && viewMode === 'html') {
        try {
          const parsed = htmlToCanvasComponents(generatedHTML);
          if (parsed && parsed.length > 0) {
            dispatch(loadComponents(parsed));
            const compsMap: Record<string, CanvasComponent> = {};
            const ordArr: string[] = [];
            parsed.forEach((c) => {
              compsMap[c.id] = c;
              ordArr.push(c.id);
            });
            componentsToSave = compsMap;
            orderToSave = ordArr;
          }
        } catch (e) {
          console.error('Lỗi parse HTML khi lưu:', e);
        }
      }

      const beComponents = feCanvasStateToBe(componentsToSave, orderToSave);
      const res = await screensAPI.updateComponents(
        projectId,
        currentScreen.id,
        beComponents,
        'Manual save'
      );
      dispatch(savingSuccess());
      // Update the screen in list with updated component_count etc.
      if (res.screen) {
        const idx = screens.findIndex((s) => s.id === currentScreen.id);
        if (idx !== -1) {
          const updated = screens.map((s) =>
            s.id === currentScreen.id ? { ...s, component_count: beComponents.length } : s
          );
          dispatch(setScreens(updated));
        }
      }
    } catch (e: any) {
      dispatch(savingFailure(e.message || 'Lưu thất bại'));
    }
  }

  // ── Download HTML ────────────────────────────────────────────────────────
  function handleDownload() {
    downloadHTML(generatedHTML, `${currentScreen?.name || 'design'}.html`);
  }

  // ── HTML Edit Handlers ───────────────────────────────────────────────────
  function handleHTMLChange(newHTML: string) {
    setGeneratedHTML(newHTML);

    // Sync to Redux canvas state if it's an OCR screen containing html_content container
    const ocrContainer = Object.values(canvasState.components).find(
      (c) => c.attributes && 'html_content' in c.attributes
    );
    if (ocrContainer) {
      dispatch(
        updateComponent({
          id: ocrContainer.id,
          updates: {
            attributes: {
              ...ocrContainer.attributes,
              html_content: newHTML,
            },
          },
        })
      );
    }
  }

  function handleViewModeChange(mode: 'design' | 'preview' | 'html') {
    if (viewMode === 'html' && mode === 'design') {
      // Switching from HTML editor to Design view: parse if it's a non-OCR screen
      const hasOcrContainer = Object.values(canvasState.components).some(
        (c) => c.attributes && 'html_content' in c.attributes
      );
      if (!hasOcrContainer) {
        try {
          const parsed = htmlToCanvasComponents(generatedHTML);
          if (parsed && parsed.length > 0) {
            dispatch(loadComponents(parsed));
          }
        } catch (e) {
          console.error('Lỗi parse HTML khi chuyển tab:', e);
        }
      }
    }
    setViewMode(mode);
  }

  // ── OCR Upload ───────────────────────────────────────────────────────────
  async function handleOCRUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrUploading(true);
    setOcrProgress('Đang upload ảnh...');
    setError('');

    try {
      const screenName = file.name.replace(/\.[^.]+$/, '');
      const res = await ocrAPI.upload(projectId, file, screenName);
      setOcrProgress('OCR đang xử lý...');

      // If screen was auto-created, reload screens
      if (res.screen) {
        setOcrProgress('Đang tải screen mới...');
        const screensRes = await screensAPI.list(projectId);
        dispatch(setScreens(screensRes.results));

        // Auto-select the new screen
        const newScreen = screensRes.results.find((s) => s.id === res.screen!.id);
        if (newScreen) selectScreen(newScreen);

        setOcrProgress('✅ Screen đã được tạo!');
        setTimeout(() => setOcrProgress(''), 3000);
      }
    } catch (e: any) {
      setError(e.message || 'OCR thất bại');
    } finally {
      setOcrUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ── Delete screen ────────────────────────────────────────────────────────
  async function confirmDeleteScreen() {
    if (!screenToDelete) return;
    try {
      await screensAPI.delete(projectId, screenToDelete.id);
      dispatch(removeScreen(screenToDelete.id));
      if (currentScreen?.id === screenToDelete.id) {
        dispatch(setCurrentScreen(null));
        dispatch(clearCanvas());
        setGeneratedHTML('');
      }
    } catch (e: any) {
      setError(e.message || 'Xóa screen thất bại');
    } finally {
      setScreenToDelete(null);
    }
  }

  // ── Re-generate HTML whenever canvas changes ─────────────────────────────
  useEffect(() => {
    if (currentScreen) {
      // Neu screen co html_content goc (tu OCR), giu nguyen, khong ghi de
      const storedHTML = extractHTMLContent(currentScreen);
      if (!storedHTML) {
        regenerateHTML();
      }
    }
  }, [canvasState.components, canvasState.order]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50 h-14">
        <div className="max-w-full px-4 h-full flex items-center gap-3">
          <button
            onClick={() => { dispatch(setCurrentProject(null)); router.push('/projects'); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dự án</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded flex items-center justify-center">
              <Layers className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-medium text-sm truncate max-w-[180px]">
              {currentProject?.name}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* OCR upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleOCRUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrUploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-sm hover:bg-white/10 disabled:opacity-50 transition-all"
            >
              {ocrUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {ocrUploading ? (ocrProgress || 'Đang xử lý...') : 'Upload OCR'}
              </span>
            </button>

            {/* Save indicator */}
            {currentScreen && (
              <>
                {isSaving && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...
                  </span>
                )}
                {!isSaving && lastSavedAt && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã lưu
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* OCR progress bar */}
      {ocrUploading && (
        <div className="h-1 bg-indigo-600/20">
          <div className="h-full bg-indigo-500 animate-pulse w-1/2 rounded-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button className="ml-auto" onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main content: Screens grid + Right panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Screens grid ─────────────────────────────────────── */}
        <div className={`flex flex-col ${currentScreen ? (viewMode === 'design' ? 'hidden' : 'w-full md:w-1/2 lg:w-2/5') : 'w-full'} overflow-y-auto border-r border-white/10 transition-all duration-300`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">
                Screens
                <span className="ml-2 text-xs font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {screens.length}
                </span>
              </h2>
              <button
                onClick={async () => {
                  try {
                    const res = await screensAPI.create(projectId, {
                      name: `Screen ${screens.length + 1}`,
                      width: 1440,
                      height: 900,
                      components: [],
                    });
                    dispatch(addScreen(res.screen));
                    selectScreen(res.screen);
                  } catch (e: any) {
                    setError(e.message || 'Tạo screen thất bại');
                  }
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm screen
              </button>
            </div>

            {screens.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-7 h-7 text-indigo-400" />
                </div>
                <p className="text-slate-400 text-sm mb-2">Chưa có screen nào</p>
                <p className="text-slate-600 text-xs">Upload ảnh mockup để tạo screen tự động với AI</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {screens.map((screen) => (
                  <ScreenCard
                    key={screen.id}
                    screen={screen}
                    isSelected={currentScreen?.id === screen.id}
                    onClick={() => selectScreen(screen)}
                    onDelete={() => setScreenToDelete(screen)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Edit panel ───────────────────────────────────────── */}
        {currentScreen && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <ScreenEditPanel
              screen={currentScreen}
              generatedHTML={generatedHTML}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onDownload={handleDownload}
              onSave={handleSave}
              isSaving={isSaving}
              onRefreshHTML={() => regenerateHTML()}
              onHTMLChange={handleHTMLChange}
            />
          </div>
        )}
      </div>

      {/* Mobile: edit panel as bottom sheet */}
      {currentScreen && viewMode !== 'design' && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95">
          <ScreenEditPanel
            screen={currentScreen}
            generatedHTML={generatedHTML}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onDownload={handleDownload}
            onSave={handleSave}
            isSaving={isSaving}
            onRefreshHTML={() => regenerateHTML()}
            onHTMLChange={handleHTMLChange}
          />
        </div>
      )}

      {/* Delete confirm modal */}
      {screenToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-white font-semibold mb-2">Xóa screen?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Screen <span className="text-white font-medium">"{screenToDelete.name}"</span> sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setScreenToDelete(null)}
                className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={confirmDeleteScreen}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ScreenCard Component ─────────────────────────────────────────────────────

function ScreenCard({
  screen, isSelected, onClick, onDelete,
}: {
  screen: BEScreen;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  // Xây dựng URL thumbnail: thumbnail từ BE là relative path (e.g. "ocr_uploads/xxx/image.jpg")
  // Django serve qua MEDIA_URL=/media/ → http://localhost:8000/media/<path>
  const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api')
    .replace('/api', '');
  const thumbnailUrl = screen.thumbnail
    ? screen.thumbnail.startsWith('http')
      ? screen.thumbnail
      : `${API_ORIGIN}/media/${screen.thumbnail}`
    : null;

  return (
    <div
      className={`relative group rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-600/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
      }`}
      onClick={onClick}
    >
      {/* Screen preview: dùng thumbnail nếu có, fallback về gradient */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={screen.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Nếu ảnh lỗi → ẩn và hiện placeholder
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Monitor className="w-8 h-8 text-slate-600" />
          </div>
        )}

        {/* Overlay badges */}
        {screen.component_count !== undefined && screen.component_count > 0 && (
          <div className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            {screen.component_count} comp
          </div>
        )}
        {screen.created_from_ocr && (
          <div className="absolute top-2 left-2 bg-violet-600/80 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <Layers className="w-2.5 h-2.5" /> OCR
          </div>
        )}
      </div>

      <div className="p-2.5">
        <p className="text-white text-xs font-medium truncate">{screen.name}</p>
        <p className="text-slate-500 text-[10px] mt-0.5">
          {screen.width}×{screen.height}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 w-6 h-6 bg-red-600/80 text-white rounded-full items-center justify-center hidden group-hover:flex hover:bg-red-500 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {isSelected && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500" />
      )}
    </div>
  );
}


// ─── ScreenEditPanel Component ────────────────────────────────────────────────

function ScreenEditPanel({
  screen, generatedHTML, viewMode, onViewModeChange, onDownload, onSave, isSaving, onRefreshHTML, onHTMLChange,
}: {
  screen: BEScreen;
  generatedHTML: string;
  viewMode: 'design' | 'preview' | 'html';
  onViewModeChange: (mode: 'design' | 'preview' | 'html') => void;
  onDownload: () => void;
  onSave: () => void;
  isSaving: boolean;
  onRefreshHTML: () => void;
  onHTMLChange: (html: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(generatedHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/60">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
        <div className="flex items-center gap-2.5">
          <Monitor className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-white text-sm font-medium">{screen.name}</p>
            <p className="text-slate-500 text-xs">{screen.width}×{screen.height}px</p>
          </div>
        </div>

        {/* Tabs: Design / Preview / Code */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange('design')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
              viewMode === 'design' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Design
          </button>
          <button
            onClick={() => onViewModeChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
              viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={() => onViewModeChange('html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
              viewMode === 'html' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> HTML
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <button
          onClick={onRefreshHTML}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
          {copied ? 'Đã copy!' : 'Copy HTML'}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors ml-auto"
        >
          <Download className="w-3.5 h-3.5" /> Tải HTML
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {isSaving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex">
        {viewMode === 'design' && (
          <>
            <div className="w-64 border-r border-white/10 shrink-0">
              <ComponentPalette />
            </div>
            <div className="flex-1 overflow-hidden relative bg-slate-900">
              <Canvas />
            </div>
            <div className="w-80 border-l border-white/10 shrink-0">
              <PropertiesPanel />
            </div>
          </>
        )}

        {viewMode === 'preview' && (
          <div className="w-full h-full p-3 overflow-auto">
            {generatedHTML ? (
              <iframe
                srcDoc={generatedHTML}
                className="w-full h-full rounded-xl border border-white/10 bg-white"
                title="Preview"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Screen chưa có components
              </div>
            )}
          </div>
        )}

        {viewMode === 'html' && (
          <div className="w-full p-3 h-full">
            <textarea
              className="w-full h-full bg-slate-900/85 border border-white/10 rounded-xl p-4 text-xs text-slate-300 font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              value={generatedHTML}
              onChange={(e) => onHTMLChange(e.target.value)}
              placeholder="<!-- Nhập mã HTML tại đây -->"
            />
          </div>
        )}
      </div>
    </div>
  );
}
