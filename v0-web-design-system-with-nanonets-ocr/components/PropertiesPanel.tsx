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

  if (!selected) return <div className="w-full p-8 text-center text-slate-500 italic bg-slate-950/40 border-l border-white/10 h-full flex items-center justify-center">Chọn component để cấu hình</div>;

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
    <div className="w-full border-l border-white/10 bg-slate-950/40 backdrop-blur-md h-full flex flex-col overflow-hidden text-white">
      <div className="p-4 border-b border-white/10 font-bold text-xs uppercase text-slate-400 tracking-wider">Thuộc tính</div>
      <Tabs defaultValue="styles" className="flex-1 overflow-y-auto p-4">
        <TabsList className="grid grid-cols-2 mb-4 bg-white/5 border border-white/10 p-0.5 rounded-lg">
          <TabsTrigger value="content" className="text-xs py-1.5 rounded-md transition-all text-slate-400 hover:text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white cursor-pointer">Nội dung</TabsTrigger>
          <TabsTrigger value="styles" className="text-xs py-1.5 rounded-md transition-all text-slate-400 hover:text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white cursor-pointer">Giao diện (Style)</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-300">Tên Component</Label>
            <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.label} onChange={(e) => dispatch(updateComponent({ id: selectedId!, updates: { label: e.target.value } }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-300">Nội dung văn bản</Label>
            <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.content || ""} onChange={(e) => dispatch(updateComponent({ id: selectedId!, updates: { content: e.target.value } }))} />
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4 pb-10">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400">Chiều rộng</Label>
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.width || ""} onChange={(e) => setStyle("width", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400">Chiều cao</Label>
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.height || ""} onChange={(e) => setStyle("height", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400">Padding</Label>
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.padding || ""} onChange={(e) => setStyle("padding", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400">Margin</Label>
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.margin || ""} onChange={(e) => setStyle("margin", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-300">Màu nền</Label>
            <div className="flex gap-2">
              <Input type="color" className="w-10 h-10 p-1 bg-white/5 border-white/10 cursor-pointer" value={selected.style.backgroundColor || "#ffffff"} onChange={(e) => setStyle("backgroundColor", e.target.value)} />
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.style.backgroundColor || ""} onChange={(e) => setStyle("backgroundColor", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400 font-medium">Cỡ chữ (Font size)</Label>
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.fontSize || ""} onChange={(e) => setStyle("fontSize", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400 font-medium">Độ dày chữ</Label>
              <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.fontWeight || ""} onChange={(e) => setStyle("fontWeight", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-300">Bo góc (Border radius)</Label>
            <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.style.borderRadius || ""} onChange={(e) => setStyle("borderRadius", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-300">Viền (Border CSS)</Label>
            <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.style.border || ""} placeholder="e.g. 1px solid #ffffff" onChange={(e) => setStyle("border", e.target.value)} />
          </div>
        </TabsContent>
      </Tabs>
      {selectedId && (
        <button
          onClick={handleDeleteComponent}
          className="flex items-center justify-center gap-2 m-4 px-4 py-2.5 text-sm bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 size={16} />
          Xóa Component
        </button>
      )}
    </div>
  );
}