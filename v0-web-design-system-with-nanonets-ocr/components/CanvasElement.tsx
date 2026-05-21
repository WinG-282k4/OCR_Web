"use client";
import React from "react";
import { Rnd } from "react-rnd";
import { useAppDispatch } from "@/store/hooks";
import { selectComponent, moveComponent, updateComponentStyle } from "@/store/slices/canvasSlice";
import { CanvasComponent } from "@/lib/types";

interface Props {
  component: CanvasComponent;
  isSelected: boolean;
}

export default function CanvasElement({ component, isSelected }: Props) {
  const dispatch = useAppDispatch();
  const { id, type, content, label, placeholder, x, y, style, attributes } = component;

  // Convert width and height to numbers for Rnd
  const width = style.width ? parseInt(style.width, 10) : 120;
  const height = style.height ? parseInt(style.height, 10) : 40;

  const innerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    padding: style.padding,
    margin: style.margin,
    backgroundColor: style.backgroundColor,
    color: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    borderRadius: style.borderRadius,
    border: style.border,
    textAlign: style.textAlign as any,
    display: style.display || "flex",
    flexDirection: style.flexDirection as any,
    alignItems: style.alignItems,
    justifyContent: style.justifyContent,
    gap: style.gap,
  };

  const textToDisplay = content || label || type;

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }}
      onDragStart={() => dispatch(selectComponent(id))}
      onDragStop={(e, d) => {
        dispatch(moveComponent({ id, x: d.x, y: d.y }));
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        dispatch(moveComponent({ id, x: position.x, y: position.y }));
        dispatch(updateComponentStyle({
          id,
          style: { width: ref.style.width, height: ref.style.height }
        }));
      }}
      bounds="parent"
      className={`${isSelected ? "ring-2 ring-indigo-500 shadow-xl z-50" : "hover:ring-1 hover:ring-indigo-300 z-10"} group`}
      dragHandleClassName="drag-handle"
    >
      <div 
        className="w-full h-full drag-handle cursor-grab active:cursor-grabbing" 
        style={innerStyle}
        onClick={(e) => {
          e.stopPropagation();
          dispatch(selectComponent(id));
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
              border: style.border || undefined
            }}
          >
            {textToDisplay}
          </button>
        )}
        {type === "input" && <input className="w-full h-full border px-2 rounded" placeholder={placeholder} readOnly />}
        {type === "image" && (
          <img 
            src={attributes?.src || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80"} 
            alt={attributes?.alt || "Image"} 
            className="w-full h-full object-cover rounded" 
          />
        )}
        {type === "heading" && (
          <h2 
            className="w-full" 
            style={{ 
              fontSize: style.fontSize || "1.25rem", 
              fontWeight: style.fontWeight || "bold",
              color: style.color || undefined,
              textAlign: style.textAlign as any
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
              color: style.color || undefined,
              textAlign: style.textAlign as any
            }}
          >
            {textToDisplay}
          </p>
        )}
        {["card", "container"].includes(type) && (
          <div className="w-full h-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
            {textToDisplay}
          </div>
        )}
      </div>
    </Rnd>
  );
}