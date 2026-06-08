"use client";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateComponentStyle, updateComponent, removeComponent, selectComponent, updateOrder, setEditingId } from "@/store/slices/canvasSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Layout, Type, Palette, Move, Download, Layers, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

export default function PropertiesPanel() {
  const dispatch = useAppDispatch();
  const { components, order, selectedId, editingId } = useAppSelector((state) => state.canvas);
  const selected = selectedId ? components[selectedId] : null;

  const [downloadFormat, setDownloadFormat] = React.useState("png");
  const [activeTab, setActiveTab] = React.useState("layers");
  const [draggedOverIndex, setDraggedOverIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!selectedId) {
      setActiveTab("layers");
    }
  }, [selectedId]);

  const setStyle = (key: string, value: string) => {
    if (selectedId) {
      dispatch(updateComponentStyle({ id: selectedId, style: { [key]: value } }));
    }
  };

  const handleAttributeChange = (key: string, value: any) => {
    if (selectedId && selected) {
      dispatch(
        updateComponent({
          id: selectedId,
          updates: {
            attributes: {
              ...selected.attributes,
              [key]: value,
            },
          },
        })
      );
    }
  };

  const handleTableAction = (action: 'insert-row-above' | 'insert-row-below' | 'delete-row' | 'insert-col-left' | 'insert-col-right' | 'delete-col') => {
    if (!selectedId || !selected || selected.type !== "table") return;

    const selection = window.getSelection();
    let targetCell: HTMLTableCellElement | null = null;

    if (selection && selection.rangeCount > 0) {
      let node: Node | null = selection.getRangeAt(0).startContainer;
      while (node) {
        if (node.nodeName === "TD" || node.nodeName === "TH") {
          targetCell = node as HTMLTableCellElement;
          break;
        }
        if (node.nodeName === "TABLE" || (node instanceof HTMLElement && node.classList.contains("canvas-element-wrapper"))) {
          break;
        }
        node = node.parentNode;
      }
    }

    const htmlString = selected.attributes?.html || "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const table = doc.querySelector("table");
    if (!table) return;

    let colIndex = 0;
    let rowIndex = 0;
    
    if (targetCell) {
      const row = targetCell.closest("tr");
      if (row) {
        const tableEl = row.closest("table");
        if (tableEl) {
          const allRows = Array.from(tableEl.querySelectorAll("tr"));
          rowIndex = allRows.indexOf(row);
          colIndex = Array.from(row.cells).indexOf(targetCell);
        }
      }
    }

    const parsedRows = Array.from(table.querySelectorAll("tr"));
    if (parsedRows.length === 0) return;

    if (action === "insert-row-above" || action === "insert-row-below") {
      const referenceRow = parsedRows[rowIndex] || parsedRows[parsedRows.length - 1];
      const newRow = referenceRow.cloneNode(true) as HTMLTableRowElement;
      Array.from(newRow.cells).forEach(cell => {
        cell.innerHTML = "Mới";
      });
      
      if (action === "insert-row-above") {
        referenceRow.parentNode?.insertBefore(newRow, referenceRow);
      } else {
        referenceRow.parentNode?.insertBefore(newRow, referenceRow.nextSibling);
      }
    } else if (action === "delete-row") {
      if (parsedRows.length > 1) {
        const rowToDelete = parsedRows[rowIndex] || parsedRows[parsedRows.length - 1];
        rowToDelete.parentNode?.removeChild(rowToDelete);
      }
    } else if (action === "insert-col-left" || action === "insert-col-right") {
      const refColIndex = colIndex;
      parsedRows.forEach(row => {
        const cells = Array.from(row.cells);
        const refCell = cells[refColIndex] || cells[cells.length - 1];
        if (refCell) {
          const newCell = refCell.cloneNode(true) as HTMLTableCellElement;
          newCell.innerHTML = "Mới";
          if (action === "insert-col-left") {
            refCell.parentNode?.insertBefore(newCell, refCell);
          } else {
            refCell.parentNode?.insertBefore(newCell, refCell.nextSibling);
          }
        }
      });
    } else if (action === "delete-col") {
      const refColIndex = colIndex;
      parsedRows.forEach(row => {
        const cells = Array.from(row.cells);
        const cellToDelete = cells[refColIndex] || cells[cells.length - 1];
        if (cellToDelete && cells.length > 1) {
          cellToDelete.parentNode?.removeChild(cellToDelete);
        }
      });
    }

    handleAttributeChange("html", table.outerHTML);
  };

  const handleDeleteComponent = () => {
    if (selectedId) {
      dispatch(removeComponent(selectedId));
      dispatch(selectComponent(null));
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDraggedOverIndex(null);
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (sourceIndex === targetIndex) return;

    const actualSourceIndex = order.length - 1 - sourceIndex;
    const actualTargetIndex = order.length - 1 - targetIndex;

    const newOrder = [...order];
    const [movedId] = newOrder.splice(actualSourceIndex, 1);
    newOrder.splice(actualTargetIndex, 0, movedId);

    dispatch(updateOrder(newOrder));
  };

  const moveLayerIndex = (id: string, direction: "up" | "down") => {
    const idx = order.indexOf(id);
    if (idx === -1) return;

    const newOrder = [...order];
    if (direction === "up" && idx < order.length - 1) {
      newOrder[idx] = newOrder[idx + 1];
      newOrder[idx + 1] = id;
    } else if (direction === "down" && idx > 0) {
      newOrder[idx] = newOrder[idx - 1];
      newOrder[idx - 1] = id;
    }

    dispatch(updateOrder(newOrder));
  };

  const handleDownloadImage = async (srcUrl: string, format: string) => {
    if (!srcUrl) return;
    
    // Check if it's already a data URL (base64)
    if (srcUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = srcUrl;
      link.download = `downloaded-image.${format === "jpeg" ? "jpg" : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      // Try to fetch it first to avoid canvas tainting
      const response = await fetch(srcUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `downloaded-image.${format === "jpeg" ? "jpg" : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download image via fetch, falling back to canvas", error);
      // Fallback to the canvas method
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`;
            const dataUrl = canvas.toDataURL(mimeType);
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `downloaded-image.${format === "jpeg" ? "jpg" : format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (canvasErr) {
          console.error("Canvas download failed", canvasErr);
          // Last fallback: open in new tab
          window.open(srcUrl, "_blank");
        }
      };
      img.onerror = () => {
        window.open(srcUrl, "_blank");
      };
      img.src = srcUrl;
    }
  };

  return (
    <div className="w-full border-l border-white/10 bg-slate-950/60 backdrop-blur-md h-full flex flex-col overflow-hidden text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${selected ? "bg-indigo-500" : "bg-slate-500"}`}></span>
          <span className="font-bold text-xs uppercase text-slate-300 tracking-wider">
            {selected ? `Cấu hình: ${selected.type}` : "Quản lý Lớp (Layers)"}
          </span>
        </div>
      </div>

      {/* Download component image at the top of configuration */}
      {selected?.type === "image" && selected.attributes?.src && (
        <div className="p-4 border-b border-white/10 bg-indigo-600/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Tải ảnh của component này:</span>
          </div>
          <div className="flex gap-2">
            <Select 
              value={downloadFormat} 
              onValueChange={setDownloadFormat}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white col-span-1">
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPG</SelectItem>
                <SelectItem value="webp">WEBP</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => handleDownloadImage(selected.attributes?.src || "", downloadFormat)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all h-8"
            >
              <Download size={14} />
              Tải về
            </button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col min-h-0">
        <TabsList className="grid grid-cols-3 mx-4 my-3 bg-white/5 border border-white/10 p-0.5 rounded-lg shrink-0">
          <TabsTrigger 
            value="content" 
            disabled={!selectedId}
            className="text-xs py-1.5 rounded-md transition-all text-slate-400 hover:text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Type size={13} />
            Nội dung
          </TabsTrigger>
          <TabsTrigger 
            value="styles" 
            disabled={!selectedId}
            className="text-xs py-1.5 rounded-md transition-all text-slate-400 hover:text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Palette size={13} />
            Giao diện
          </TabsTrigger>
          <TabsTrigger 
            value="layers" 
            className="text-xs py-1.5 rounded-md transition-all text-slate-400 hover:text-white data-[state=active]:bg-indigo-600 data-[state=active]:text-white cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Layers size={13} />
            Lớp vẽ
          </TabsTrigger>
        </TabsList>

        {/* ==================== CONTENT TAB ==================== */}
        <TabsContent value="content" className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 space-y-4 min-h-0">
          {!selected ? (
            <div className="text-center text-slate-500 italic py-8">Chọn component để sửa nội dung</div>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-xs text-slate-400 font-medium">Tên hiển thị (Label)</Label>
                <Input 
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" 
                  value={selected.label} 
                  onChange={(e) => dispatch(updateComponent({ id: selectedId!, updates: { label: e.target.value } }))} 
                />
              </div>

              {/* Text/Content inputs for readable components */}
              {["heading", "text", "button", "link", "checkbox", "label"].includes(selected.type) && (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400 font-medium">Nội dung văn bản</Label>
                  <textarea 
                    className="w-full min-h-[80px] p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y"
                    value={selected.content || ""} 
                    onChange={(e) => dispatch(updateComponent({ id: selectedId!, updates: { content: e.target.value } }))} 
                  />
                </div>
              )}

              {selected.type === "table" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 font-medium">Mã HTML của Table (Custom Table HTML)</Label>
                    <textarea 
                      className="w-full min-h-[180px] p-2 font-mono bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y"
                      value={selected.attributes?.html || ""} 
                      onChange={(e) => handleAttributeChange("html", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1 bg-white/5 p-2 rounded-lg border border-white/5">
                    <button
                      onClick={() => dispatch(setEditingId(editingId === selectedId ? null : selectedId))}
                      className={`w-full py-2 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                        editingId === selectedId 
                          ? "bg-emerald-600 hover:bg-emerald-500 animate-pulse" 
                          : "bg-indigo-600 hover:bg-indigo-500"
                      }`}
                    >
                      {editingId === selectedId 
                        ? "Đang chỉnh sửa - Bấm để Tắt (Quay lại Kéo thả)" 
                        : "Bật chỉnh sửa trực tiếp trên thiết kế"
                      }
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1 italic text-center">
                      {editingId === selectedId
                        ? "Bạn có thể click trực tiếp vào chữ trong các ô trên Canvas để sửa."
                        : "Bật chế độ này để vô hiệu hóa kéo thả và cho phép nhấp đúp vào ô để sửa chữ."
                      }
                    </p>
                  </div>

                  {editingId === selectedId && (
                    <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/5">
                      <Label className="text-xs text-slate-300 font-semibold block mb-2">Công cụ cấu trúc bảng (Excel Tools)</Label>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleTableAction("insert-row-above")}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded transition-all cursor-pointer border border-white/5"
                        >
                          Thêm hàng trên
                        </button>
                        <button
                          onClick={() => handleTableAction("insert-row-below")}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded transition-all cursor-pointer border border-white/5"
                        >
                          Thêm hàng dưới
                        </button>
                        <button
                          onClick={() => handleTableAction("insert-col-left")}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded transition-all cursor-pointer border border-white/5"
                        >
                          Thêm cột trái
                        </button>
                        <button
                          onClick={() => handleTableAction("insert-col-right")}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded transition-all cursor-pointer border border-white/5"
                        >
                          Thêm cột phải
                        </button>
                        <button
                          onClick={() => handleTableAction("delete-row")}
                          className="px-2 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 text-[11px] rounded transition-all cursor-pointer border border-rose-500/20 col-span-1"
                        >
                          Xóa hàng
                        </button>
                        <button
                          onClick={() => handleTableAction("delete-col")}
                          className="px-2 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 text-[11px] rounded transition-all cursor-pointer border border-rose-500/20 col-span-1"
                        >
                          Xóa cột
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-indigo-400 mt-1 italic">
                        * Mẹo: Click chọn/đặt con trỏ vào ô bạn muốn làm mốc trước khi bấm các nút trên.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Form Input fields */}
              {["input", "textarea"].includes(selected.type) && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 font-medium">Placeholder</Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500/50" 
                      value={selected.placeholder || ""} 
                      onChange={(e) => dispatch(updateComponent({ id: selectedId!, updates: { placeholder: e.target.value } }))} 
                    />
                  </div>
                  {selected.type === "input" && (
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400 font-medium">Loại dữ liệu (Type)</Label>
                      <Select 
                        value={selected.attributes?.type || "text"} 
                        onValueChange={(val) => handleAttributeChange("type", val)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="text">Văn bản (Text)</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="password">Mật khẩu</SelectItem>
                          <SelectItem value="number">Số (Number)</SelectItem>
                          <SelectItem value="tel">Số điện thoại</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Image properties */}
              {selected.type === "image" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 font-medium">Đường dẫn ảnh (URL/Src)</Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500/50" 
                      value={selected.attributes?.src || ""} 
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => handleAttributeChange("src", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 font-medium">Tải lên từ máy tính (Upload Local)</Label>
                    <div className="relative flex items-center justify-center border border-dashed border-white/20 hover:border-indigo-500/50 rounded-lg p-3 bg-white/5 group cursor-pointer transition-all">
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
                                handleAttributeChange("src", event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center gap-1 text-center pointer-events-none">
                        <span className="text-xs font-medium text-slate-300 group-hover:text-indigo-400">Chọn ảnh hoặc Kéo thả</span>
                        <span className="text-[10px] text-slate-500">PNG, JPG, WEBP, SVG</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 font-medium">Mô tả ảnh (Alt)</Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500/50" 
                      value={selected.attributes?.alt || ""} 
                      placeholder="Alt text"
                      onChange={(e) => handleAttributeChange("alt", e.target.value)} 
                    />
                  </div>
                </div>
              )}

              {/* Link / Button URL options */}
              {["link", "button"].includes(selected.type) && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 font-medium">Đường dẫn liên kết (Href)</Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500/50" 
                      value={selected.attributes?.href || ""} 
                      placeholder="e.g. /home or https://..."
                      onChange={(e) => handleAttributeChange("href", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 font-medium">Kiểu mở trang</Label>
                    <Select 
                      value={selected.attributes?.target || "_self"} 
                      onValueChange={(val) => handleAttributeChange("target", val)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="_self">Mở trong tab hiện tại</SelectItem>
                        <SelectItem value="_blank">Mở tab mới (_blank)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ==================== STYLE TAB ==================== */}
        <TabsContent value="styles" className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-10 space-y-5 min-h-0">
          {!selected ? (
            <div className="text-center text-slate-500 italic py-8">Chọn component để sửa giao diện</div>
          ) : (
            <>
              {/* Typography */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-white/5 pb-1">Chữ & Căn Lề (Typography)</h3>
                
                {/* Text Align Toolbar */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-slate-300">Căn lề chữ (Text Align)</Label>
                  <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg w-fit gap-1">
                    {[
                      { value: "left", icon: <AlignLeft size={16} /> },
                      { value: "center", icon: <AlignCenter size={16} /> },
                      { value: "right", icon: <AlignRight size={16} /> },
                      { value: "justify", icon: <AlignJustify size={16} /> }
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setStyle("textAlign", item.value)}
                        className={`p-1.5 rounded-md hover:text-white transition-all cursor-pointer ${selected.style.textAlign === item.value ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5"}`}
                        title={`Căn ${item.value}`}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Cỡ chữ (CSS size)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.fontSize || ""} placeholder="e.g. 16px, 1.5rem" onChange={(e) => setStyle("fontSize", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Độ dày (Weight)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.fontWeight || ""} placeholder="e.g. 400, 600, bold" onChange={(e) => setStyle("fontWeight", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Màu chữ (Color)</Label>
                    <div className="flex gap-1 h-8">
                      <Input type="color" className="w-8 h-8 p-0.5 bg-white/5 border-white/10 cursor-pointer animate-none" value={selected.style.color || "#000000"} onChange={(e) => setStyle("color", e.target.value)} />
                      <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500/50 flex-1 h-8 text-[11px] px-1.5" value={selected.style.color || ""} placeholder="#000000" onChange={(e) => setStyle("color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Font Family</Label>
                    <Select 
                      value={selected.style.fontFamily || "default"} 
                      onValueChange={(val) => setStyle("fontFamily", val === "default" ? "" : val)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                        <SelectValue placeholder="Mặc định" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="default">Mặc định (Sans-serif)</SelectItem>
                        <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                        <SelectItem value="'Outfit', sans-serif">Outfit</SelectItem>
                        <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Giãn dòng (Line Height)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.lineHeight || ""} placeholder="e.g. 1.5, 24px" onChange={(e) => setStyle("lineHeight", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Giãn chữ (Letter Spac.)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.letterSpacing || ""} placeholder="e.g. 0.05em, 1px" onChange={(e) => setStyle("letterSpacing", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Kích thước & Box Model */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-white/5 pb-1">Kích thước & Căn lề (Box Model)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 font-medium">Chiều rộng (Width)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.width || ""} placeholder="e.g. 100%, 300px" onChange={(e) => setStyle("width", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 font-medium">Chiều cao (Height)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.height || ""} placeholder="e.g. auto, 120px" onChange={(e) => setStyle("height", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Đệm trong (Padding)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.padding || ""} placeholder="e.g. 10px 20px" onChange={(e) => setStyle("padding", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Khoảng cách (Margin)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.margin || ""} placeholder="e.g. 0 auto, 10px" onChange={(e) => setStyle("margin", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Màu nền, Viền, Bóng */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-white/5 pb-1">Nền & Viền (Background & Borders)</h3>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Màu nền (Background)</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-10 h-10 p-1 bg-white/5 border-white/10 cursor-pointer animate-none" value={selected.style.backgroundColor || "#ffffff"} onChange={(e) => setStyle("backgroundColor", e.target.value)} />
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 flex-1" value={selected.style.backgroundColor || ""} placeholder="transparent hoặc #ffffff" onChange={(e) => setStyle("backgroundColor", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Bo góc (Border radius)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.borderRadius || ""} placeholder="e.g. 8px, 9999px" onChange={(e) => setStyle("borderRadius", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Độ mờ (Opacity)</Label>
                    <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-8 text-xs" value={selected.style.opacity || ""} placeholder="0 -> 1" onChange={(e) => setStyle("opacity", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300 font-medium">Thứ tự lớp (Layer / Z-Index)</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="number" 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500/50 h-8 text-xs flex-1" 
                      value={selected.style.zIndex || "1"} 
                      placeholder="1" 
                      onChange={(e) => setStyle("zIndex", e.target.value)} 
                    />
                    <button
                      onClick={() => {
                        const current = parseInt(selected.style.zIndex || "1", 10);
                        setStyle("zIndex", (current + 1).toString());
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded border border-white/10 cursor-pointer h-8"
                      title="Đưa lên trên"
                    >
                      Lên (+1)
                    </button>
                    <button
                      onClick={() => {
                        const current = parseInt(selected.style.zIndex || "1", 10);
                        setStyle("zIndex", Math.max(1, current - 1).toString());
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded border border-white/10 cursor-pointer h-8"
                      title="Xuống (-1)"
                    >
                      Xuống (-1)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300 font-medium">Đường viền (Border CSS)</Label>
                  <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.style.border || ""} placeholder="e.g. 1px solid #d1d5db" onChange={(e) => setStyle("border", e.target.value)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300 font-medium">Bóng đổ (Box Shadow)</Label>
                  <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.style.boxShadow || ""} placeholder="e.g. 0 4px 6px -1px rgba(0,0,0,0.1)" onChange={(e) => setStyle("boxShadow", e.target.value)} />
                </div>
              </div>

              {/* Bố cục nâng cao (Flexbox Layout) */}
              {["container", "card", "form"].includes(selected.type) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <Move size={13} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Bố cục Flexbox</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-400">Kiểu hiển thị</Label>
                      <Select 
                        value={selected.style.display || "flex"} 
                        onValueChange={(val) => setStyle("display", val)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="flex">Flexbox (Mặc định)</SelectItem>
                          <SelectItem value="block">Block</SelectItem>
                          <SelectItem value="none">Ẩn (None)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selected.style.display !== "block" && selected.style.display !== "none" && (
                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-400">Hướng Flex</Label>
                        <Select 
                          value={selected.style.flexDirection || "column"} 
                          onValueChange={(val) => setStyle("flexDirection", val)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="column">Dọc (Column)</SelectItem>
                            <SelectItem value="row">Ngang (Row)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {selected.style.display !== "block" && selected.style.display !== "none" && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-400">Căn hàng ngang (Justify)</Label>
                          <Select 
                            value={selected.style.justifyContent || "flex-start"} 
                            onValueChange={(val) => setStyle("justifyContent", val)}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              <SelectItem value="flex-start">Trái (Start)</SelectItem>
                              <SelectItem value="center">Giữa (Center)</SelectItem>
                              <SelectItem value="flex-end">Phải (End)</SelectItem>
                              <SelectItem value="space-between">Giãn đều (Between)</SelectItem>
                              <SelectItem value="space-around">Giãn xung quanh</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-400">Căn hàng dọc (Align)</Label>
                          <Select 
                            value={selected.style.alignItems || "stretch"} 
                            onValueChange={(val) => setStyle("alignItems", val)}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              <SelectItem value="stretch">Kéo giãn (Stretch)</SelectItem>
                              <SelectItem value="flex-start">Trên (Start)</SelectItem>
                              <SelectItem value="center">Giữa (Center)</SelectItem>
                              <SelectItem value="flex-end">Dưới (End)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-300 font-medium">Khoảng cách giữa các phần tử (Gap)</Label>
                        <Input className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50" value={selected.style.gap || ""} placeholder="e.g. 16px, 1rem" onChange={(e) => setStyle("gap", e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ==================== LAYERS TAB ==================== */}
        <TabsContent value="layers" className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 space-y-3 min-h-0">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Danh sách lớp (Từ trên xuống)</span>
            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{order.length} phần tử</span>
          </div>

          {order.length === 0 ? (
            <div className="text-center text-slate-500 italic py-8">Chưa có component nào trên canvas</div>
          ) : (
            <div className="space-y-2">
              {[...order].reverse().map((id, idx) => {
                const comp = components[id];
                if (!comp) return null;
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => dispatch(selectComponent(id))}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none group/item ${
                      selectedId === id
                        ? "bg-indigo-600/20 border-indigo-500/80 text-white"
                        : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300"
                    } ${draggedOverIndex === idx ? "border-dashed border-indigo-400 scale-[1.02] bg-indigo-950/20" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="cursor-grab text-slate-500 hover:text-slate-300 shrink-0 touch-none">
                        <GripVertical size={14} />
                      </span>
                      <span className="text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-400 shrink-0">
                        {comp.type}
                      </span>
                      <span className="text-xs truncate font-medium">
                        {comp.label || comp.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayerIndex(id, "up");
                        }}
                        disabled={idx === 0}
                        className="p-1 hover:text-white text-slate-500 disabled:opacity-30 rounded hover:bg-white/5 transition-colors"
                        title="Đưa lên trên 1 lớp (Mang lại trước)"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayerIndex(id, "down");
                        }}
                        disabled={idx === order.length - 1}
                        className="p-1 hover:text-white text-slate-500 disabled:opacity-30 rounded hover:bg-white/5 transition-colors"
                        title="Đưa xuống dưới 1 lớp (Gửi ra sau)"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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