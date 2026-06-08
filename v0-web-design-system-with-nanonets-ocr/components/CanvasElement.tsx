"use client";
import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectComponent, moveComponent, dragComponent, updateComponentStyle, updateComponent, setEditingId } from "@/store/slices/canvasSlice";
import { CanvasComponent } from "@/lib/types";

interface Props {
  component: CanvasComponent;
  isSelected: boolean;
}

export default function CanvasElement({ component, isSelected }: Props) {
  const dispatch = useAppDispatch();
  const { id, type, content, label, placeholder, x, y, style, attributes } = component;
  const { editingId, multiSelectedIds = [] } = useAppSelector((state) => state.canvas);
  
  const isMultiSelected = multiSelectedIds.includes(id);
  const isHighlighted = isSelected || isMultiSelected;
  const isEditing = editingId === id;
  const setIsEditing = (val: boolean) => {
    dispatch(setEditingId(val ? id : null));
  };

  // Convert width and height to numbers for Rnd
  const width = style.width ? parseInt(style.width, 10) : 120;
  const height = style.height ? parseInt(style.height, 10) : 40;

  const isLeaf = ["button", "input", "textarea", "image"].includes(type);

  const innerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    padding: style.padding,
    margin: style.margin,
    backgroundColor: isLeaf ? undefined : style.backgroundColor,
    color: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontFamily: style.fontFamily,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    borderRadius: isLeaf ? undefined : style.borderRadius,
    border: isLeaf ? undefined : style.border,
    boxShadow: isLeaf ? undefined : style.boxShadow,
    opacity: style.opacity ? parseFloat(style.opacity) : undefined,
    textAlign: style.textAlign as any,
    display: style.display || "flex",
    flexDirection: style.flexDirection as any,
    alignItems: style.alignItems || "center",
    justifyContent: style.justifyContent || "center",
    gap: style.gap,
    boxSizing: "border-box",
  };

  const textToDisplay = content || label || type;

  const [resizeMode, setResizeMode] = useState<"col" | "row" | null>(null);
  const [resizeTarget, setResizeTarget] = useState<HTMLElement | null>(null);
  const [initialPos, setInitialPos] = useState(0);
  const [initialSize, setInitialSize] = useState(0);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cell: HTMLElement } | null>(null);
  const [hoveredBoundary, setHoveredBoundary] = useState<{
    type: "col" | "row";
    x: number;
    y: number;
    size: number;
    rowIndex: number;
    cellIndex: number;
  } | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
    };
    if (contextMenu) {
      window.addEventListener("click", handleGlobalClick);
    }
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [contextMenu]);

  const insertRowAt = (rowIndex: number) => {
    const tableEl = document.getElementById(`table-container-${id}`)?.querySelector("table");
    if (!tableEl) return;
    const allRows = Array.from(tableEl.querySelectorAll("tr"));
    const referenceRow = allRows[rowIndex] || allRows[allRows.length - 1];
    if (referenceRow) {
      const newRow = referenceRow.cloneNode(true) as HTMLTableRowElement;
      Array.from(newRow.cells).forEach(c => {
        c.innerHTML = "Mới";
      });
      referenceRow.parentNode?.insertBefore(newRow, referenceRow.nextSibling);
      saveTableHtml(tableEl);
    }
  };

  const deleteRowAt = (rowIndex: number) => {
    const tableEl = document.getElementById(`table-container-${id}`)?.querySelector("table");
    if (!tableEl) return;
    const allRows = Array.from(tableEl.querySelectorAll("tr"));
    if (allRows.length > 1) {
      const rowToDelete = allRows[rowIndex];
      if (rowToDelete) {
        rowToDelete.parentNode?.removeChild(rowToDelete);
        saveTableHtml(tableEl);
      }
    }
  };

  const insertColAt = (colIndex: number) => {
    const tableEl = document.getElementById(`table-container-${id}`)?.querySelector("table");
    if (!tableEl) return;
    const allRows = Array.from(tableEl.querySelectorAll("tr"));
    allRows.forEach(r => {
      const cells = Array.from(r.cells);
      const refCell = cells[colIndex] || cells[cells.length - 1];
      if (refCell) {
        const newCell = refCell.cloneNode(true) as HTMLTableCellElement;
        newCell.innerHTML = "Mới";
        refCell.parentNode?.insertBefore(newCell, refCell.nextSibling);
      }
    });
    saveTableHtml(tableEl);
  };

  const deleteColAt = (colIndex: number) => {
    const tableEl = document.getElementById(`table-container-${id}`)?.querySelector("table");
    if (!tableEl) return;
    const allRows = Array.from(tableEl.querySelectorAll("tr"));
    allRows.forEach(r => {
      const cells = Array.from(r.cells);
      const cellToDelete = cells[colIndex] || cells[cells.length - 1];
      if (cellToDelete && cells.length > 1) {
        cellToDelete.parentNode?.removeChild(cellToDelete);
      }
    });
    saveTableHtml(tableEl);
  };

  const saveTableHtml = (tableEl: HTMLTableElement) => {
    dispatch(updateComponent({
      id,
      updates: {
        attributes: {
          ...attributes,
          html: tableEl.outerHTML
        }
      }
    }));
    setHoveredBoundary(null);
  };

  const handleTableContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    const cell = target.closest("td, th") as HTMLElement;
    if (cell) {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        cell: cell
      });
    }
  };

  const executeDirectTableAction = (cell: HTMLElement, action: 'insert-row-above' | 'insert-row-below' | 'delete-row' | 'insert-col-left' | 'insert-col-right' | 'delete-col') => {
    const row = cell.closest("tr");
    if (!row) return;
    const tableEl = row.closest("table");
    if (!tableEl) return;

    const allRows = Array.from(tableEl.querySelectorAll("tr"));
    const rowIndex = allRows.indexOf(row);
    const colIndex = Array.from(row.cells).indexOf(cell as HTMLTableCellElement);

    if (action === "insert-row-above" || action === "insert-row-below") {
      const newRow = row.cloneNode(true) as HTMLTableRowElement;
      Array.from(newRow.cells).forEach(c => {
        c.innerHTML = "Mới";
      });
      if (action === "insert-row-above") {
        row.parentNode?.insertBefore(newRow, row);
      } else {
        row.parentNode?.insertBefore(newRow, row.nextSibling);
      }
    } else if (action === "delete-row") {
      if (allRows.length > 1) {
        row.parentNode?.removeChild(row);
      }
    } else if (action === "insert-col-left" || action === "insert-col-right") {
      allRows.forEach(r => {
        const cells = Array.from(r.cells);
        const refCell = cells[colIndex] || cells[cells.length - 1];
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
      allRows.forEach(r => {
        const cells = Array.from(r.cells);
        const cellToDelete = cells[colIndex] || cells[cells.length - 1];
        if (cellToDelete && cells.length > 1) {
          cellToDelete.parentNode?.removeChild(cellToDelete);
        }
      });
    }

    const tableContainer = tableEl.parentElement;
    if (tableContainer) {
      dispatch(updateComponent({
        id,
        updates: {
          attributes: {
            ...attributes,
            html: tableContainer.innerHTML
          }
        }
      }));
    }
    setContextMenu(null);
  };

  const handleTableMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    
    if (resizeMode && resizeTarget) {
      const delta = (resizeMode === "col" ? e.clientX : e.clientY) - initialPos;
      const newSize = Math.max(30, initialSize + delta);
      if (resizeMode === "col") {
        resizeTarget.style.width = `${newSize}px`;
      } else {
        const row = resizeTarget.closest("tr");
        if (row) {
          row.style.height = `${newSize}px`;
        } else {
          resizeTarget.style.height = `${newSize}px`;
        }
      }
      return;
    }

    const target = e.target as HTMLElement;
    const cell = target.closest("td, th") as HTMLElement;

    // Canva-style boundary hover detection
    const tableEl = e.currentTarget.querySelector("table");
    if (tableEl) {
      const containerRect = e.currentTarget.getBoundingClientRect();
      const tableRect = tableEl.getBoundingClientRect();
      const cells = Array.from(tableEl.querySelectorAll("td, th")) as HTMLElement[];
      let foundBoundary = null;
      
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      
      for (const c of cells) {
        const cellRect = c.getBoundingClientRect();
        const relativeRight = cellRect.right - containerRect.left;
        const relativeBottom = cellRect.bottom - containerRect.top;
        
        const threshold = 12;
        
        // Check vertical boundary (right edge of cell)
        if (Math.abs(mouseX - relativeRight) < threshold && 
            mouseY >= (cellRect.top - containerRect.top) && 
            mouseY <= (cellRect.bottom - containerRect.top)) {
          const row = c.closest("tr");
          if (row) {
            const rowIndex = Array.from(tableEl.querySelectorAll("tr")).indexOf(row);
            const cellIndex = Array.from(row.cells).indexOf(c as HTMLTableCellElement);
            foundBoundary = {
              type: "col" as const,
              x: relativeRight,
              y: tableRect.top - containerRect.top,
              size: tableRect.height,
              rowIndex,
              cellIndex
            };
            break;
          }
        }
        
        // Check horizontal boundary (bottom edge of cell)
        if (Math.abs(mouseY - relativeBottom) < threshold && 
            mouseX >= (cellRect.left - containerRect.left) && 
            mouseX <= (cellRect.right - containerRect.left)) {
          const row = c.closest("tr");
          if (row) {
            const rowIndex = Array.from(tableEl.querySelectorAll("tr")).indexOf(row);
            const cellIndex = Array.from(row.cells).indexOf(c as HTMLTableCellElement);
            foundBoundary = {
              type: "row" as const,
              x: tableRect.left - containerRect.left,
              y: relativeBottom,
              size: tableRect.width,
              rowIndex,
              cellIndex
            };
            break;
          }
        }
      }
      setHoveredBoundary(foundBoundary);
    }

    if (!cell) {
      e.currentTarget.style.cursor = "default";
      return;
    }

    const rect = cell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const borderThreshold = 8;

    const isRightEdge = rect.width - x <= borderThreshold;
    const isBottomEdge = rect.height - y <= borderThreshold;

    if (isRightEdge) {
      e.currentTarget.style.cursor = "col-resize";
    } else if (isBottomEdge) {
      e.currentTarget.style.cursor = "row-resize";
    } else {
      e.currentTarget.style.cursor = "text";
    }
  };

  const handleTableMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;

    const target = e.target as HTMLElement;
    const cell = target.closest("td, th") as HTMLElement;
    if (!cell) return;

    const rect = cell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const borderThreshold = 8;

    const isRightEdge = rect.width - x <= borderThreshold;
    const isBottomEdge = rect.height - y <= borderThreshold;

    if (isRightEdge) {
      e.preventDefault();
      e.stopPropagation();
      setResizeMode("col");
      setResizeTarget(cell);
      setInitialPos(e.clientX);
      setInitialSize(rect.width);
    } else if (isBottomEdge) {
      e.preventDefault();
      e.stopPropagation();
      setResizeMode("row");
      setResizeTarget(cell);
      setInitialPos(e.clientY);
      const row = cell.closest("tr");
      setInitialSize(row ? row.getBoundingClientRect().height : rect.height);
    }
  };

  const handleTableMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (resizeMode && resizeTarget) {
      setResizeMode(null);
      setResizeTarget(null);
      
      const tableContainer = e.currentTarget;
      const updatedHtml = tableContainer.innerHTML;
      dispatch(updateComponent({
        id,
        updates: {
          attributes: {
            ...attributes,
            html: updatedHtml
          }
        }
      }));
    }
  };

  const handleTableMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    handleTableMouseUp(e);
    setHoveredBoundary(null);
  };

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }}
      disableDragging={isEditing}
      onDragStart={() => {
        if (!multiSelectedIds.includes(id)) {
          dispatch(selectComponent(id));
        }
      }}
      onDragStop={(e, d) => {
        dispatch(moveComponent({ id, x: d.x, y: d.y }));
      }}
      onDrag={(e, d) => {
        dispatch(dragComponent({ id, x: d.x, y: d.y }));
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        dispatch(moveComponent({ id, x: position.x, y: position.y }));
        dispatch(updateComponentStyle({
          id,
          style: { width: ref.style.width, height: ref.style.height }
        }));
      }}
      bounds="parent"
      className={`${isHighlighted ? (isSelected ? "ring-2 ring-indigo-500 shadow-xl" : "ring-2 ring-indigo-400/70 shadow-lg") : "hover:ring-1 hover:ring-indigo-300"} group`}
      dragHandleClassName="drag-handle"
      style={{ zIndex: isHighlighted ? 9999 : (style.zIndex ? parseInt(style.zIndex, 10) : 1) }}
    >
      <div 
        className={`w-full h-full ${isEditing ? "cursor-text" : "drag-handle cursor-grab active:cursor-grabbing"}`}
        style={innerStyle}
        onClick={(e) => {
          e.stopPropagation();
          const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
          dispatch(selectComponent({ id, isMultiSelect: isMulti }));
        }}
        onDoubleClick={(e) => {
          if (type === "table") {
            e.stopPropagation();
            setIsEditing(true);
          }
        }}
      >
        {type === "button" && (
          <button 
            className="w-full h-full" 
            style={{ 
              backgroundColor: style.backgroundColor || "#2563eb", 
              color: style.color || "#ffffff",
              borderRadius: style.borderRadius || "0.25rem",
              fontSize: style.fontSize || undefined,
              fontWeight: style.fontWeight || undefined,
              fontFamily: style.fontFamily || undefined,
              textAlign: style.textAlign as any || "center",
              border: style.border || undefined,
              boxShadow: style.boxShadow || undefined,
              lineHeight: style.lineHeight || undefined,
              letterSpacing: style.letterSpacing || undefined,
            }}
          >
            {textToDisplay}
          </button>
        )}
        
        {type === "input" && (
          <input 
            className="w-full h-full border px-3 rounded" 
            style={{
              fontSize: style.fontSize || undefined,
              fontWeight: style.fontWeight || undefined,
              fontFamily: style.fontFamily || undefined,
              color: style.color || undefined,
              backgroundColor: style.backgroundColor || "#ffffff",
              border: style.border || undefined,
              borderRadius: style.borderRadius || undefined,
              textAlign: style.textAlign as any,
            }}
            placeholder={placeholder || "Enter text..."} 
            type={attributes?.type || "text"}
            readOnly 
          />
        )}

        {type === "textarea" && (
          <textarea 
            className="w-full h-full border p-2 rounded resize-none" 
            style={{
              fontSize: style.fontSize || undefined,
              fontWeight: style.fontWeight || undefined,
              fontFamily: style.fontFamily || undefined,
              color: style.color || undefined,
              backgroundColor: style.backgroundColor || "#ffffff",
              border: style.border || undefined,
              borderRadius: style.borderRadius || undefined,
              textAlign: style.textAlign as any,
            }}
            placeholder={placeholder || "Enter text..."} 
            readOnly 
          />
        )}

        {type === "checkbox" && (
          <div className="flex items-center gap-2 w-full h-full">
            <input type="checkbox" id={`chk-${id}`} className="w-4 h-4 cursor-pointer" />
            <label htmlFor={`chk-${id}`} className="cursor-pointer select-none text-sm" style={{ color: style.color }}>
              {textToDisplay}
            </label>
          </div>
        )}

        {type === "image" && (
          <img 
            src={attributes?.src || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80"} 
            alt={attributes?.alt || "Image"} 
            className="w-full h-full object-cover pointer-events-none select-none" 
            draggable={false}
            style={{
              borderRadius: style.borderRadius || undefined,
              border: style.border || undefined,
              boxShadow: style.boxShadow || undefined,
            }}
          />
        )}

        {type === "heading" && (
          <h2 
            className="w-full" 
            style={{ 
              fontSize: style.fontSize || "1.25rem", 
              fontWeight: style.fontWeight || "bold",
              fontFamily: style.fontFamily || undefined,
              color: style.color || undefined,
              textAlign: style.textAlign as any,
              lineHeight: style.lineHeight || undefined,
              letterSpacing: style.letterSpacing || undefined,
            }}
          >
            {textToDisplay}
          </h2>
        )}

        {type === "text" && (
          <p 
            className="w-full" 
            style={{ 
              fontSize: style.fontSize || undefined, 
              fontWeight: style.fontWeight || undefined,
              fontFamily: style.fontFamily || undefined,
              color: style.color || undefined,
              textAlign: style.textAlign as any,
              lineHeight: style.lineHeight || undefined,
              letterSpacing: style.letterSpacing || undefined,
            }}
          >
            {textToDisplay}
          </p>
        )}
        
        {type === "table" && (
          <>
            <div 
              id={`table-container-${id}`}
              className="w-full h-full overflow-auto text-slate-800 focus:outline-none relative"
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onMouseMove={handleTableMouseMove}
              onMouseDown={handleTableMouseDown}
              onMouseUp={handleTableMouseUp}
              onMouseLeave={handleTableMouseLeave}
              onContextMenu={handleTableContextMenu}
              onBlur={(e) => {
                setIsEditing(false);
                const updatedHtml = e.currentTarget.innerHTML;
                dispatch(updateComponent({
                  id,
                  updates: {
                    attributes: {
                      ...attributes,
                      html: updatedHtml
                    }
                  }
                }));
              }}
              dangerouslySetInnerHTML={{ 
                __html: attributes?.html || `
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
                        <td class="px-4 py-2 text-sm text-green-600">Active</td>
                      </tr>
                      <tr>
                        <td class="px-4 py-2 text-sm text-slate-600">Trần Thị B</td>
                        <td class="px-4 py-2 text-sm text-slate-600">Designer</td>
                        <td class="px-4 py-2 text-sm text-green-600">Active</td>
                      </tr>
                    </tbody>
                  </table>
                `
              }}
            />
            {hoveredBoundary && (
              <>
                {/* Thin overlay line on hovered border */}
                <div 
                  className="absolute bg-indigo-500 transition-all pointer-events-none"
                  style={{
                    left: hoveredBoundary.x,
                    top: hoveredBoundary.y,
                    width: hoveredBoundary.type === "row" ? hoveredBoundary.size : "2px",
                    height: hoveredBoundary.type === "col" ? hoveredBoundary.size : "2px",
                    zIndex: 50
                  }}
                />
                {/* Circular "+" button for insertion */}
                <button
                  className="absolute bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 font-bold text-xs active:scale-95 transition-all"
                  style={{
                    left: hoveredBoundary.type === "col" ? hoveredBoundary.x : hoveredBoundary.x + hoveredBoundary.size / 2,
                    top: hoveredBoundary.type === "row" ? hoveredBoundary.y : hoveredBoundary.y + hoveredBoundary.size / 2,
                    zIndex: 51
                  }}
                  title={hoveredBoundary.type === "col" ? "Chèn cột mới" : "Chèn hàng mới"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hoveredBoundary.type === "col") {
                      insertColAt(hoveredBoundary.cellIndex);
                    } else {
                      insertRowAt(hoveredBoundary.rowIndex);
                    }
                  }}
                >
                  +
                </button>
                {/* Small "×" delete button */}
                <button
                  className="absolute bg-rose-600 hover:bg-rose-500 text-white rounded w-4 h-4 flex items-center justify-center shadow-md cursor-pointer transform -translate-x-1/2 -translate-y-1/2 text-[10px] active:scale-95 transition-all"
                  style={{
                    left: hoveredBoundary.type === "col" ? hoveredBoundary.x : hoveredBoundary.x - 14,
                    top: hoveredBoundary.type === "row" ? hoveredBoundary.y : hoveredBoundary.y - 14,
                    zIndex: 51
                  }}
                  title={hoveredBoundary.type === "col" ? "Xóa cột này" : "Xóa hàng này"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hoveredBoundary.type === "col") {
                      deleteColAt(hoveredBoundary.cellIndex);
                    } else {
                      deleteRowAt(hoveredBoundary.rowIndex);
                    }
                  }}
                >
                  ×
                </button>
              </>
            )}
            {contextMenu && (
              <div 
                className="fixed bg-slate-950/90 border border-white/10 backdrop-blur-md rounded-lg shadow-2xl p-1 z-[99999] text-xs text-slate-200 min-w-[150px] font-sans"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => executeDirectTableAction(contextMenu.cell, "insert-row-above")}
                  className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 rounded transition-colors cursor-pointer"
                >
                  Thêm hàng phía trên
                </button>
                <button 
                  onClick={() => executeDirectTableAction(contextMenu.cell, "insert-row-below")}
                  className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 rounded transition-colors cursor-pointer"
                >
                  Thêm hàng phía dưới
                </button>
                <hr className="border-white/10 my-1" />
                <button 
                  onClick={() => executeDirectTableAction(contextMenu.cell, "insert-col-left")}
                  className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 rounded transition-colors cursor-pointer"
                >
                  Thêm cột phía trái
                </button>
                <button 
                  onClick={() => executeDirectTableAction(contextMenu.cell, "insert-col-right")}
                  className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 rounded transition-colors cursor-pointer"
                >
                  Thêm cột phía phải
                </button>
                <hr className="border-white/10 my-1" />
                <button 
                  onClick={() => executeDirectTableAction(contextMenu.cell, "delete-row")}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-600 text-rose-200 rounded transition-colors cursor-pointer"
                >
                  Xóa hàng này
                </button>
                <button 
                  onClick={() => executeDirectTableAction(contextMenu.cell, "delete-col")}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-600 text-rose-200 rounded transition-colors cursor-pointer"
                >
                  Xóa cột này
                </button>
              </div>
            )}
          </>
        )}

        {["card", "container", "form"].includes(type) && (
          <div className="w-full h-full" />
        )}
      </div>
    </Rnd>
  );
}