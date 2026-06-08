"use client";

import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setOCRLoading,
  setOCRError,
} from "@/store/slices/uiSlice";
import { loadComponents } from "@/store/slices/canvasSlice";
import type { CanvasComponent } from "@/lib/types";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ocrAPI, screensAPI } from "@/lib/api-client";

export default function OCRUpload() {
  const dispatch = useAppDispatch();
  const { ocrLoading, ocrError } = useAppSelector((state) => state.ui);
  const { currentProjectId } = useAppSelector((state) => state.session);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentProjectId) {
      dispatch(setOCRError("Vui lòng chọn một dự án trước khi upload ảnh."));
      return;
    }

    dispatch(setOCRLoading(true));
    dispatch(setOCRError(null));
    setUploadSuccess(false);

    try {
      // FE gửi lên BE → BE gọi Nanonets → BE trả kết quả về FE
      const screenName = file.name.includes(".")
        ? file.name.substring(0, file.name.lastIndexOf("."))
        : file.name;

      const result = await ocrAPI.upload(
        currentProjectId,
        file,
        screenName,
        0.7
      );

      // Nếu BE đã tự tạo screen (auto_create_screen=true), fetch components của screen đó
      if (result.screen?.id) {
        const screenData = await screensAPI.get(currentProjectId, result.screen.id);
        const beComponents = screenData.components ?? [];

        // Convert BEComponent (position/size) → CanvasComponent (x/y/style)
        const canvasComponents: CanvasComponent[] = beComponents.map((comp, index) => ({
          id: comp.id || `ocr-${index}-${Date.now()}`,
          type: (comp.type as CanvasComponent["type"]) || "container",
          label: comp.properties?.text || comp.type || "ocr",
          content: comp.properties?.text,
          placeholder: comp.properties?.placeholder,
          x: comp.position?.x ?? 0,
          y: comp.position?.y ?? 0,
          style: {
            width: `${comp.size?.width ?? 100}px`,
            height: `${comp.size?.height ?? 40}px`,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            ...comp.style,
          },
          attributes: {
            src: comp.properties?.src,
            alt: comp.properties?.alt,
            href: comp.properties?.href,
            variant: comp.properties?.variant,
          },
          events: {},
          children: [],
        }));

        dispatch(loadComponents(canvasComponents));
      }

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      dispatch(
        setOCRError(
          error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
        )
      );
    } finally {
      dispatch(setOCRLoading(false));
      // Reset file input để có thể upload lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* No project warning */}
      {!currentProjectId && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Chưa có dự án nào được chọn. AI sẽ không hoạt động.
          </p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleClick}
        disabled={ocrLoading || !currentProjectId}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {ocrLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload ảnh để nhận diện UI
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
            Hoàn tất! Các component đã được thêm vào canvas.
          </p>
        </div>
      )}

      {/* Error Message */}
      {ocrError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Lỗi</p>
            <p className="text-xs text-red-600 mt-1">{ocrError}</p>
            <button
              onClick={() => dispatch(setOCRError(null))}
              className="text-xs text-red-600 hover:text-red-700 underline mt-2"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-slate-500 text-center">
        Upload ảnh chụp màn hình giao diện web để tự động nhận diện các UI component
      </p>
    </div>
  );
}
