"use client";

import React from "react";
import { useAppDispatch } from "@/store/hooks";
import { addComponent } from "@/store/slices/canvasSlice";
import { CanvasComponent, ComponentType } from "@/lib/types";
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
];

export default function ComponentPalette() {
  const dispatch = useAppDispatch();

  const handleAddComponent = (config: ComponentConfig) => {
    const newComponent: CanvasComponent = {
      id: `component-${Date.now()}`,
      type: config.type,
      label: config.label,
      content: config.content,
      style: config.defaultStyle,
      children: [],
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
    };

    dispatch(addComponent(newComponent));
  };

  return (
    <div className="w-80 flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Components</h2>
        <p className="text-xs text-slate-500 mt-1">
          Drag and drop or click to add
        </p>
      </div>

      {/* Component Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          {components.map((config) => (
            <button
              key={config.type}
              onClick={() => handleAddComponent(config)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="text-slate-600 group-hover:text-blue-600 mb-1">
                {config.icon}
              </div>
              <span className="text-xs font-medium text-slate-700 text-center group-hover:text-blue-700">
                {config.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
