"use client";

import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setOCRLoading,
  setOCRError,
  resetOCRState,
} from "@/store/slices/uiSlice";
import { loadComponents } from "@/store/slices/canvasSlice";
import { CanvasComponent, OCRResult } from "@/lib/types";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ocrAPI } from "@/lib/api-client";

export default function OCRUpload() {
  const dispatch = useAppDispatch();
  const { ocrLoading, ocrError } = useAppSelector((state) => state.ui);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(setOCRLoading(true));
    dispatch(setOCRError(null));
    setUploadSuccess(false);

    try {
      // Use centralized API client
      const result: OCRResult = await ocrAPI.analyzeImage(file);

      // Convert OCR results to canvas components
      const newComponents: CanvasComponent[] = result.detectedComponents
        .map((detected, index) => {
          // Support multiple possible bounding box field names from different mock/apis
          const bounds =
            (detected as any).bounds ||
            (detected as any).boundingBox ||
            (detected as any).bounding_box;

          if (!bounds) return null;

          return {
            id: `ocr-${index}-${Date.now()}`,
            type: detected.type,
            label: (detected as any).label || (detected as any).type || "ocr",
            style: {
              width: `${bounds.width}px`,
              height: `${bounds.height}px`,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
            },
            x: bounds.x,
            y: bounds.y,
            children: [],
          } as CanvasComponent;
        })
        .filter(Boolean) as CanvasComponent[];

      dispatch(loadComponents(newComponents));
      setUploadSuccess(true);

      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      dispatch(
        setOCRError(
          error instanceof Error ? error.message : "Unknown error occurred"
        )
      );
    } finally {
      dispatch(setOCRLoading(false));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Button */}
      <button
        onClick={handleClick}
        disabled={ocrLoading}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {ocrLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload Image for OCR
          </>
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={ocrLoading}
      />

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 size={18} className="text-green-600" />
          <p className="text-sm text-green-700">
            OCR completed! Components added to canvas.
          </p>
        </div>
      )}

      {/* Error Message */}
      {ocrError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Error</p>
            <p className="text-xs text-red-600 mt-1">{ocrError}</p>
            <button
              onClick={() => dispatch(setOCRError(null))}
              className="text-xs text-red-600 hover:text-red-700 underline mt-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-slate-500 text-center">
        Upload a screenshot of a web design to auto-detect UI components
      </p>
    </div>
  );
}
