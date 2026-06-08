"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addComponent } from "@/store/slices/canvasSlice";
import { CanvasComponent, ComponentType } from "@/lib/types";
import { ocrAPI } from "@/lib/api-client";
import { htmlToCanvasComponents } from "@/lib/htmlParser";
import ImageCropperModal from "./ImageCropperModal";
import {
  Type,
  Image,
  Square,
  FormInput,
  MessageSquare,
  CheckSquare2,
  LayoutGrid,
  Layers,
  Zap,
  Copy,
  Table,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

interface ComponentConfig {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
  defaultStyle: Record<string, string>;
  content?: string;
}

const components: ComponentConfig[] = [
  {
    type: "heading",
    label: "Heading",
    icon: <Type size={20} />,
    defaultStyle: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#000",
      width: "auto",
      height: "auto",
    },
    content: "Your Heading",
  },
  {
    type: "text",
    label: "Text",
    icon: <Type size={20} />,
    defaultStyle: {
      fontSize: "14px",
      color: "#333",
      width: "auto",
      height: "auto",
    },
    content: "Your text goes here",
  },
  {
    type: "button",
    label: "Button",
    icon: <Zap size={20} />,
    defaultStyle: {
      padding: "10px 20px",
      backgroundColor: "#2563eb",
      color: "#fff",
      borderRadius: "4px",
      width: "auto",
      height: "auto",
    },
    content: "Click me",
  },
  {
    type: "image",
    label: "Image",
    icon: <Image size={20} />,
    defaultStyle: {
      width: "200px",
      height: "200px",
      borderRadius: "4px",
    },
    content: "/placeholder-image.jpg",
  },
  {
    type: "input",
    label: "Input Field",
    icon: <FormInput size={20} />,
    defaultStyle: {
      width: "250px",
      height: "40px",
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
  },
  {
    type: "textarea",
    label: "Text Area",
    icon: <MessageSquare size={20} />,
    defaultStyle: {
      width: "300px",
      height: "120px",
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: <CheckSquare2 size={20} />,
    defaultStyle: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "auto",
      height: "auto",
    },
    content: "I agree",
  },
  {
    type: "container",
    label: "Container",
    icon: <Square size={20} />,
    defaultStyle: {
      width: "300px",
      height: "300px",
      padding: "16px",
      backgroundColor: "#f3f4f6",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
  },
  {
    type: "card",
    label: "Card",
    icon: <LayoutGrid size={20} />,
    defaultStyle: {
      width: "280px",
      height: "auto",
      padding: "16px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
  },
  {
    type: "form",
    label: "Form",
    icon: <Layers size={20} />,
    defaultStyle: {
      width: "350px",
      height: "auto",
      padding: "24px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  },
  {
    type: "table",
    label: "Table",
    icon: <Table size={20} />,
    defaultStyle: {
      width: "500px",
      height: "240px",
      backgroundColor: "#ffffff",
      borderRadius: "6px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
  },
];

export default function ComponentPalette() {
  const dispatch = useAppDispatch();
  const { currentProjectId } = useAppSelector((state) => state.session);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = React.useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = React.useState<string>("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddComponent = (config: ComponentConfig) => {
    const newComponent: CanvasComponent = {
      id: `component-${Date.now()}`,
      type: config.type,
      label: config.label,
      content: config.content,
      style: config.defaultStyle,
      attributes: config.type === "table" ? {
        html: `
<table class="min-w-full divide-y divide-slate-200">
  <thead class="bg-slate-50">
    <tr>
      <th class="px-4 py-2 text-left text-xs font-semibold text-slate-700">Tên</th>
      <th class="px-4 py-2 text-left text-xs font-semibold text-slate-700">Vai trò</th>
      <th class="px-4 py-2 text-left text-xs font-semibold text-slate-700">Trạng thái</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-slate-200 bg-white">
    <tr>
      <td class="px-4 py-2 text-sm text-slate-600">Nguyễn Văn A</td>
      <td class="px-4 py-2 text-sm text-slate-600">Developer</td>
      <td class="px-4 py-2 text-sm text-green-600 font-semibold">Hoạt động</td>
    </tr>
    <tr>
      <td class="px-4 py-2 text-sm text-slate-600">Trần Thị B</td>
      <td class="px-4 py-2 text-sm text-slate-600">Designer</td>
      <td class="px-4 py-2 text-sm text-green-600 font-semibold">Hoạt động</td>
    </tr>
  </tbody>
</table>
        `.trim()
      } : {},
      children: [],
      events: { onClick: "none" },
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
    };

    dispatch(addComponent(newComponent));
  };

  const handleAIComponentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentProjectId) {
      setAiError("Vui lòng chọn một dự án trước khi sử dụng AI.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropperSrc(event.target.result as string);
        setCropperFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = async (croppedFile: File) => {
    setCropperSrc(null);
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await ocrAPI.upload(currentProjectId!, croppedFile, cropperFileName, 0.7, false);
      const detected = res.ocr_analysis.detected_components;
      const rawHtml = detected?.raw_response?.html || 
                      detected?.normalized_components?.[0]?.properties?.html_content;

      let parsedComponents: CanvasComponent[] = [];

      if (rawHtml) {
        // Trường hợp 1: Có dữ liệu HTML, parse thông thường
        parsedComponents = await htmlToCanvasComponents(rawHtml);
      } else if (detected?.normalized_components && detected.normalized_components.length > 0) {
        // Trường hợp 2: Trực tiếp lấy danh sách component được cấu trúc (Ví dụ: khi dùng Fallback/Nanonets)
        const beComponents = detected.normalized_components;
        parsedComponents = beComponents.map((comp: any, index: number) => ({
          id: comp.id || `ocr-${index}-${Date.now()}`,
          type: (comp.type as CanvasComponent["type"]) || "container",
          label: comp.properties?.text || comp.type || "ocr",
          content: comp.properties?.text || comp.properties?.content,
          placeholder: comp.properties?.placeholder,
          x: comp.position?.x ?? 0,
          y: comp.position?.y ?? 0,
          style: {
            width: comp.size?.width ? `${comp.size.width}px` : "100px",
            height: comp.size?.height ? `${comp.size.height}px` : "40px",
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
            html: comp.properties?.html_content || comp.properties?.html,
          },
          events: { onClick: "none" },
          children: [],
        }));
      }

      if (parsedComponents.length === 0) {
        throw new Error("Không thể trích xuất HTML hoặc danh sách component từ kết quả AI.");
      }

      let minX = Infinity;
      let minY = Infinity;
      parsedComponents.forEach((c) => {
        if (c.x < minX) minX = c.x;
        if (c.y < minY) minY = c.y;
      });

      const offsetX = 100 - (minX === Infinity ? 0 : minX);
      const offsetY = 100 - (minY === Infinity ? 0 : minY);

      parsedComponents.forEach((c) => {
        dispatch(
          addComponent({
            ...c,
            x: c.x + offsetX,
            y: c.y + offsetY,
          })
        );
      });
    } catch (err: any) {
      setAiError(err.message || "Lỗi xử lý AI.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-950/40 backdrop-blur-md border-r border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Components</h2>
        <p className="text-xs text-slate-400 mt-1">
          Kéo thả hoặc click để thêm
        </p>
      </div>

      {/* Upload Zone Section */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex flex-col gap-2.5">
        {/* Detect Component (AI) */}
        <div className="relative flex flex-col items-center justify-center border border-dashed border-indigo-500/20 hover:border-indigo-500/60 rounded-xl p-4 cursor-pointer transition-all hover:bg-indigo-600/5 group">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleAIComponentUpload}
            disabled={aiLoading}
          />
          {aiLoading ? (
            <>
              <Loader2 size={24} className="text-indigo-400 animate-spin mb-1.5" />
              <span className="text-xs font-semibold text-indigo-300">Đang phân tách UI...</span>
            </>
          ) : (
            <>
              <Sparkles size={24} className="text-indigo-400 group-hover:text-indigo-300 mb-1.5 transition-colors" />
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">Nhận diện Component (AI)</span>
              <span className="text-[10px] text-slate-500 text-center mt-0.5">Tự động dựng code từ ảnh chụp</span>
            </>
          )}
        </div>

        {/* Error message */}
        {aiError && (
          <div className="text-[10px] text-red-400 px-2 py-1 bg-red-950/30 border border-red-500/20 rounded-lg">
            {aiError}
          </div>
        )}

        {/* Upload design image to create component */}
        <div className="relative flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-3 cursor-pointer transition-all hover:bg-white/5 group">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    const newComponent: CanvasComponent = {
                      id: `component-${Date.now()}`,
                      type: "image",
                      label: file.name.split(".")[0] || "Ảnh thiết kế",
                      content: "",
                      style: {
                        width: "350px",
                        height: "250px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      },
                      attributes: {
                        src: event.target.result as string,
                        alt: file.name,
                      },
                      children: [],
                      events: { onClick: "none" },
                      x: 100 + Math.random() * 100,
                      y: 100 + Math.random() * 100,
                    };
                    dispatch(addComponent(newComponent));
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <Image size={20} className="text-slate-400 group-hover:text-indigo-400 mb-1 transition-colors" />
          <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">Tải lên ảnh tĩnh</span>
        </div>
      </div>

      {/* Component Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          {components.map((config) => (
            <button
              key={config.type}
              onClick={() => handleAddComponent(config)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all group cursor-pointer"
            >
              <div className="text-slate-400 group-hover:text-indigo-400 mb-1.5 transition-colors">
                {config.icon}
              </div>
              <span className="text-[11px] font-medium text-slate-300 text-center group-hover:text-white transition-colors">
                {config.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {mounted && cropperSrc && createPortal(
        <ImageCropperModal
          imageSrc={cropperSrc}
          fileName={cropperFileName}
          onCropConfirm={handleCropConfirm}
          onClose={() => setCropperSrc(null)}
        />,
        document.body
      )}
    </div>
  );
}
