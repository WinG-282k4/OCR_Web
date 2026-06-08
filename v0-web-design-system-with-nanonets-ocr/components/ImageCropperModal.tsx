"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Crop, Move } from "lucide-react";

interface Props {
  imageSrc: string;
  onCropConfirm: (file: File) => void;
  onClose: () => void;
  fileName: string;
}

export default function ImageCropperModal({ imageSrc, onCropConfirm, onClose, fileName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [cropBox, setCropBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number; naturalWidth: number; naturalHeight: number } | null>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  // Reset when image changes
  useEffect(() => {
    setCropBox(null);
    setDragStart(null);
  }, [imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const size = {
      width: img.clientWidth,
      height: img.clientHeight,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    };
    setImageSize(size);
    
    // Default select center 50%
    const defaultW = size.width * 0.6;
    const defaultH = size.height * 0.6;
    setCropBox({
      left: (size.width - defaultW) / 2,
      top: (size.height - defaultH) / 2,
      width: defaultW,
      height: defaultH,
    });
  };

  // Resize listener to recalculate bounds if window resizes
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        const img = imageRef.current;
        setImageSize({
          width: img.clientWidth,
          height: img.clientHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRelativeCoords = (e: React.MouseEvent) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    const coords = getRelativeCoords(e);
    if (coords) {
      setDragStart(coords);
      setCropBox({
        left: coords.x,
        top: coords.y,
        width: 0,
        height: 0,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !imageSize) return;
    const coords = getRelativeCoords(e);
    if (coords) {
      const left = Math.min(dragStart.x, coords.x);
      const top = Math.min(dragStart.y, coords.y);
      const width = Math.abs(dragStart.x - coords.x);
      const height = Math.abs(dragStart.y - coords.y);
      
      setCropBox({ left, top, width, height });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleConfirm = () => {
    if (!cropBox || !imageSize || !imageRef.current) return;
    
    // Calculate scaling ratio
    const scaleX = imageSize.naturalWidth / imageSize.width;
    const scaleY = imageSize.naturalHeight / imageSize.height;

    const canvas = document.createElement("canvas");
    // Giữ nguyên kích thước độ phân giải của bức ảnh gốc
    canvas.width = imageSize.naturalWidth;
    canvas.height = imageSize.naturalHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tô nền trắng toàn bộ khung ảnh
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sourceImage = new Image();
    sourceImage.onload = () => {
      // Tính toán toạ độ pixel thực tế của vùng crop
      const sL = Math.round(cropBox.left * scaleX);
      const sT = Math.round(cropBox.top * scaleY);
      const sW = Math.round(cropBox.width * scaleX);
      const sH = Math.round(cropBox.height * scaleY);

      // Vẽ duy nhất vùng được cắt đè lên nền trắng tại đúng toạ độ gốc của nó
      ctx.drawImage(
        sourceImage,
        sL,
        sT,
        sW,
        sH,
        sL,
        sT,
        sW,
        sH
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], `cropped_${fileName || "component.png"}`, {
              type: "image/png",
            });
            onCropConfirm(croppedFile);
          }
        },
        "image/png",
        1.0
      );
    };
    sourceImage.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Crop className="text-indigo-400" size={20} />
            <h3 className="text-base font-semibold text-white">Cắt vùng Component cần nhận diện</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/40 relative min-h-[300px]">
          <div 
            ref={containerRef}
            className="relative select-none max-w-full max-h-[60vh] flex items-center justify-center"
            onMouseLeave={() => {
              setIsMouseOver(false);
              setDragStart(null);
            }}
            onMouseEnter={() => setIsMouseOver(true)}
          >
            {/* The base image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="To crop"
              onLoad={handleImageLoad}
              className="max-w-full max-h-[60vh] object-contain cursor-crosshair pointer-events-none"
              draggable={false}
            />

            {/* Drag & Draw overlay */}
            <div
              className="absolute inset-0 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            {/* Custom SVG Shading overlays and Cropbox outline */}
            {cropBox && imageSize && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ width: imageSize.width, height: imageSize.height }}
              >
                {/* Visual shade overlays (shading areas outside selection box) */}
                <div 
                  className="absolute bg-slate-950/65"
                  style={{ top: 0, left: 0, right: 0, height: cropBox.top }}
                />
                <div 
                  className="absolute bg-slate-950/65"
                  style={{ bottom: 0, left: 0, right: 0, height: imageSize.height - (cropBox.top + cropBox.height) }}
                />
                <div 
                  className="absolute bg-slate-950/65"
                  style={{ top: cropBox.top, left: 0, width: cropBox.left, height: cropBox.height }}
                />
                <div 
                  className="absolute bg-slate-950/65"
                  style={{ top: cropBox.top, right: 0, left: cropBox.left + cropBox.width, height: cropBox.height }}
                />

                {/* Highlight Crop Bounding Box Outline */}
                <div
                  className="absolute border border-indigo-500 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]"
                  style={{
                    left: cropBox.left,
                    top: cropBox.top,
                    width: cropBox.width,
                    height: cropBox.height,
                  }}
                >
                  {/* Outer corner drag visual clues */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-indigo-400" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-indigo-400" />
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-indigo-400" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-indigo-400" />
                  
                  {/* Grid lines layout aid */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 border-white pointer-events-none">
                    <div className="border-r border-b border-white border-dashed" />
                    <div className="border-r border-b border-white border-dashed" />
                    <div className="border-b border-white border-dashed" />
                    <div className="border-r border-b border-white border-dashed" />
                    <div className="border-r border-b border-white border-dashed" />
                    <div className="border-b border-white border-dashed" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/50">
          <span className="text-xs text-slate-400">
            Giữ chuột và kéo để vẽ khung bao quanh component
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!cropBox || cropBox.width < 10 || cropBox.height < 10}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
            >
              <Crop size={14} />
              Dựng Component (AI)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
