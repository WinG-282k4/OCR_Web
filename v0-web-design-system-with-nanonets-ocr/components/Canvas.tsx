"use client";
import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectComponent } from "@/store/slices/canvasSlice";
import CanvasElement from "./CanvasElement";

export default function Canvas() {
  const dispatch = useAppDispatch();
  const { components, order, selectedId } = useAppSelector((state) => state.canvas);
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className="flex-1 relative overflow-auto bg-slate-100/50 p-10 flex justify-center items-start"
      onClick={() => dispatch(selectComponent(null))}
    >
      {/* Canvas container scaled to a typical desktop size */}
      <div 
        ref={canvasRef} 
        className="bg-white shadow-sm ring-1 ring-slate-200 relative overflow-hidden"
        style={{ width: 1440, height: 900, flexShrink: 0 }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {order.map((id) => {
          const comp = components[id];
          if (!comp) return null;
          return (
            <CanvasElement
              key={id}
              component={comp}
              isSelected={id === selectedId}
            />
          );
        })}
      </div>
    </div>
  );
}