"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMode, toggleComponentPalette, togglePropertiesPanel } from "@/store/slices/uiSlice";
import { clearCanvas, undo, redo } from "@/store/slices/canvasSlice";
import ComponentPalette from "./ComponentPalette";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import HTMLExport from "./HTMLExport";
import OCRUpload from "./OCRUpload";
import { Menu, X, Download, Zap, LayoutTemplate, Home, Undo2, Redo2 } from "lucide-react";
import Link from "next/link";

export default function EditorLayout() {
  const dispatch = useAppDispatch();
  const { mode, showComponentPalette, showPropertiesPanel } = useAppSelector(
    (state) => state.ui
  );
  const { order, past, future } = useAppSelector((state) => state.canvas);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // States for properties panel resizing
  const [propertiesWidth, setPropertiesWidth] = useState(320);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const startResizingRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRight) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 260 && newWidth <= 600) {
        setPropertiesWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingRight(false);
    };

    if (isResizingRight) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingRight]);

  // Setup global keyboard shortcuts for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if editing an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch(undo());
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch(redo());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  const handleClearCanvas = () => {
    if (confirm("Are you sure you want to clear the canvas?")) {
      dispatch(clearCanvas());
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Invisible overlay to capture pointer events and prevent iframe blocking drag resizing */}
      {isResizingRight && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize select-none bg-transparent" />
      )}
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <LayoutTemplate size={24} className="text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Web Design Builder
              </h1>
              <p className="text-xs text-slate-500">
                Design, edit, and export responsive web interfaces
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors">
              <Home size={16} />
              Home
            </Link>

            {/* Undo / Redo buttons */}
            {mode === "design" && (
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 gap-0.5">
                <button
                  onClick={() => dispatch(undo())}
                  disabled={past.length === 0}
                  className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 cursor-pointer"
                  title="Hoàn tác (Ctrl + Z)"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={() => dispatch(redo())}
                  disabled={future.length === 0}
                  className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 cursor-pointer"
                  title="Làm lại (Ctrl + Y)"
                >
                  <Redo2 size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => dispatch(setMode("design"))}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  mode === "design"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap size={16} />
                Design
              </button>
              <button
                onClick={() => dispatch(setMode("export"))}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  mode === "export"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Download size={16} />
                Export
              </button>
            </div>

            {mode === "design" && (
              <>
                <button
                  onClick={() => dispatch(toggleComponentPalette())}
                  className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  title={
                    showComponentPalette ? "Hide palette" : "Show palette"
                  }
                >
                  {showComponentPalette ? "Hide" : "Show"} Palette
                </button>
                <button
                  onClick={() => dispatch(togglePropertiesPanel())}
                  className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  title={
                    showPropertiesPanel
                      ? "Hide properties"
                      : "Show properties"
                  }
                >
                  {showPropertiesPanel ? "Hide" : "Show"} Properties
                </button>
                <button
                  onClick={handleClearCanvas}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-slate-100 rounded"
          >
            {showMobileMenu ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200 space-y-2">
            <Link href="/" className="flex items-center gap-2 w-full px-4 py-2 hover:bg-slate-100 rounded">
              <Home size={16} />
              <span>Home</span>
            </Link>
            <div className="flex items-center gap-2 px-4 py-1.5 border border-slate-200 rounded-md w-fit bg-slate-50 mb-2">
              <button
                onClick={() => {
                  dispatch(undo());
                  setShowMobileMenu(false);
                }}
                disabled={past.length === 0}
                className="p-1 text-slate-600 hover:bg-white rounded disabled:opacity-30"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={() => {
                  dispatch(redo());
                  setShowMobileMenu(false);
                }}
                disabled={future.length === 0}
                className="p-1 text-slate-600 hover:bg-white rounded disabled:opacity-30"
              >
                <Redo2 size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                dispatch(setMode("design"));
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-4 py-2 rounded ${
                mode === "design"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-slate-100"
              }`}
            >
              Design Mode
            </button>
            <button
              onClick={() => {
                dispatch(setMode("export"));
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-4 py-2 rounded ${
                mode === "export"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-slate-100"
              }`}
            >
              Export Mode
            </button>
            {mode === "design" && (
              <>
                <button
                  onClick={() => {
                    dispatch(toggleComponentPalette());
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded text-sm"
                >
                  {showComponentPalette ? "Hide" : "Show"} Palette
                </button>
                <button
                  onClick={() => {
                    dispatch(togglePropertiesPanel());
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded text-sm"
                >
                  {showPropertiesPanel ? "Hide" : "Show"} Properties
                </button>
                <button
                  onClick={() => {
                    handleClearCanvas();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                >
                  Clear Canvas
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {mode === "design" ? (
          <>
            {/* Component Palette Sidebar with Collapse Handle */}
            <div className="relative hidden md:flex h-full flex-shrink-0 z-20">
              {showComponentPalette && (
                <div className="w-[260px] h-full overflow-hidden">
                  <ComponentPalette />
                </div>
              )}
              <button
                onClick={() => dispatch(toggleComponentPalette())}
                className="absolute top-1/2 -translate-y-1/2 right-[-12px] z-40 bg-slate-950 border border-white/10 hover:border-indigo-500 text-slate-300 hover:text-white w-[12px] h-[60px] rounded-r-md flex items-center justify-center cursor-pointer transition-all shadow-md"
                title={showComponentPalette ? "Thu gọn Sidebar" : "Mở rộng Sidebar"}
              >
                <span className="text-[9px] font-extrabold select-none">
                  {showComponentPalette ? "‹" : "›"}
                </span>
              </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* OCR Upload Section */}
              <div className="px-6 py-4 bg-white border-b border-slate-200">
                <OCRUpload />
              </div>

              {/* Canvas Area */}
              <Canvas />
            </div>

            {/* Properties Sidebar with Collapse Handle & Resizer */}
            <div 
              className="relative hidden lg:flex h-full flex-shrink-0 z-20"
              style={{ width: showPropertiesPanel ? propertiesWidth : 0 }}
            >
              <button
                onClick={() => dispatch(togglePropertiesPanel())}
                className="absolute top-1/2 -translate-y-1/2 left-[-12px] z-40 bg-slate-950 border border-white/10 hover:border-indigo-500 text-slate-300 hover:text-white w-[12px] h-[60px] rounded-l-md flex items-center justify-center cursor-pointer transition-all shadow-md"
                title={showPropertiesPanel ? "Thu gọn Sidebar" : "Mở rộng Sidebar"}
              >
                <span className="text-[9px] font-extrabold select-none">
                  {showPropertiesPanel ? "›" : "‹"}
                </span>
              </button>

              {/* Resize Handle Divider */}
              {showPropertiesPanel && (
                <div
                  onMouseDown={startResizingRight}
                  className="absolute left-[-3px] top-0 bottom-0 w-[6px] cursor-col-resize hover:bg-indigo-500/40 transition-all z-50 active:bg-indigo-500"
                />
              )}

              {showPropertiesPanel && (
                <div className="w-full h-full overflow-hidden">
                  <PropertiesPanel />
                </div>
              )}
            </div>
          </>
        ) : (
          // Export Mode
          <HTMLExport />
        )}
      </div>

      {/* Status Bar */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <div>
            {mode === "design" ? (
              <span>
                {order.length} component{order.length !== 1 ? "s" : ""} on
                canvas
              </span>
            ) : (
              <span>Ready to export</span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {mode === "design"
              ? "Use Nanonets OCR to auto-detect components or manually add from palette"
              : "Download your HTML or copy code to clipboard"}
          </div>
        </div>
      </footer>
    </div>
  );
}
