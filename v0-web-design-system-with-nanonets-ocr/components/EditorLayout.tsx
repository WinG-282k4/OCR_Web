"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMode, toggleComponentPalette, togglePropertiesPanel } from "@/store/slices/uiSlice";
import { clearCanvas } from "@/store/slices/canvasSlice";
import ComponentPalette from "./ComponentPalette";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import HTMLExport from "./HTMLExport";
import OCRUpload from "./OCRUpload";
import { Menu, X, Download, Zap, LayoutTemplate, Home } from "lucide-react";
import Link from "next/link";

export default function EditorLayout() {
  const dispatch = useAppDispatch();
  const { mode, showComponentPalette, showPropertiesPanel } = useAppSelector(
    (state) => state.ui
  );
  const { order } = useAppSelector((state) => state.canvas);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleClearCanvas = () => {
    if (confirm("Are you sure you want to clear the canvas?")) {
      dispatch(clearCanvas());
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
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
            {/* Component Palette Sidebar */}
            {showComponentPalette && (
              <div className="hidden md:block overflow-hidden">
                <ComponentPalette />
              </div>
            )}

            {/* Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* OCR Upload Section */}
              <div className="px-6 py-4 bg-white border-b border-slate-200">
                <OCRUpload />
              </div>

              {/* Canvas Area */}
              <Canvas />
            </div>

            {/* Properties Sidebar */}
            {showPropertiesPanel && (
              <div className="hidden lg:block overflow-hidden">
                <PropertiesPanel />
              </div>
            )}
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
