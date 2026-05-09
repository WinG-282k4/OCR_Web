"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateComponentStyle, updateComponent, removeComponent, selectComponent } from "@/store/slices/canvasSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

export default function PropertiesPanel() {
  const dispatch = useAppDispatch();
  const { components, selectedId } = useAppSelector((state) => state.canvas);
  const selected = selectedId ? components[selectedId] : null;

  if (!selected) return <div className="w-80 p-8 text-center text-slate-400 italic">Select a component</div>;

  const setStyle = (key: string, value: string) => {
    dispatch(updateComponentStyle({ id: selectedId!, style: { [key]: value } }));
  };

  const handleDeleteComponent = () => {
    if (selectedId) {
      dispatch(removeComponent(selectedId));
      dispatch(selectComponent(null));
    }
  };

  return (
    <div className="w-80 border-l bg-white h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b font-bold text-xs uppercase text-slate-500">Properties</div>
      <Tabs defaultValue="styles" className="flex-1 overflow-y-auto p-4">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="styles">Style Tag</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Label</Label>
            <Input value={selected.label} onChange={(e) => dispatch(updateComponent({ id: selectedId!, updates: { label: e.target.value } }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Content</Label>
            <Input value={selected.content || ""} onChange={(e) => dispatch(updateComponent({ id: selectedId!, updates: { content: e.target.value } }))} />
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4 pb-10">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-[10px]">Width</Label><Input value={selected.style.width || ""} onChange={(e) => setStyle("width", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-[10px]">Height</Label><Input value={selected.style.height || ""} onChange={(e) => setStyle("height", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-[10px]">Padding</Label><Input value={selected.style.padding || ""} onChange={(e) => setStyle("padding", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-[10px]">Margin</Label><Input value={selected.style.margin || ""} onChange={(e) => setStyle("margin", e.target.value)} /></div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Background Color</Label>
            <div className="flex gap-2">
              <Input type="color" className="w-10 h-10 p-1" value={selected.style.backgroundColor || "#ffffff"} onChange={(e) => setStyle("backgroundColor", e.target.value)} />
              <Input value={selected.style.backgroundColor || ""} onChange={(e) => setStyle("backgroundColor", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-[10px]">Font Size</Label><Input value={selected.style.fontSize || ""} onChange={(e) => setStyle("fontSize", e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-[10px]">Font Weight</Label><Input value={selected.style.fontWeight || ""} onChange={(e) => setStyle("fontWeight", e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Border Radius</Label><Input value={selected.style.borderRadius || ""} onChange={(e) => setStyle("borderRadius", e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Border (CSS)</Label><Input value={selected.style.border || ""} placeholder="1px solid #000" onChange={(e) => setStyle("border", e.target.value)} /></div>
        </TabsContent>
      </Tabs>
    {selectedId && (
        <button
          onClick={handleDeleteComponent}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          Delete
        </button>
      )}
    </div>
  );
}