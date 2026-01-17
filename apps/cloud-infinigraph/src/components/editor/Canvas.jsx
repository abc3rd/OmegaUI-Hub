import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";

export default function Canvas({ 
  elements, 
  selectedId, 
  onSelect, 
  onUpdate, 
  width = 800, 
  height = 1200,
  backgroundColor = '#ffffff',
  zoom = 1,
  canvasRef
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, element) => {
    e.stopPropagation();
    onSelect(element.id);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    });
    setIsDragging(true);
  };

  const handleResizeStart = (e, handle, element) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setInitialSize({ width: element.width || 100, height: element.height || 100 });
    setInitialPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && selectedId) {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top) / zoom - dragOffset.y;
      
      onUpdate(selectedId, { x: Math.max(0, x), y: Math.max(0, y) });
    }
    
    if (isResizing && selectedId) {
      const deltaX = (e.clientX - initialPos.x) / zoom;
      const deltaY = (e.clientY - initialPos.y) / zoom;
      
      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      
      if (resizeHandle.includes('e')) newWidth = Math.max(20, initialSize.width + deltaX);
      if (resizeHandle.includes('w')) newWidth = Math.max(20, initialSize.width - deltaX);
      if (resizeHandle.includes('s')) newHeight = Math.max(20, initialSize.height + deltaY);
      if (resizeHandle.includes('n')) newHeight = Math.max(20, initialSize.height - deltaY);
      
      onUpdate(selectedId, { width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, selectedId, dragOffset, initialPos, initialSize, resizeHandle, zoom, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const renderElement = (element) => {
    const isSelected = selectedId === element.id;
    const style = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width || 'auto',
      height: element.height || 'auto',
      transform: `rotate(${element.rotation || 0}deg)`,
      cursor: 'move',
      zIndex: element.zIndex || 1,
    };

    const content = () => {
      switch (element.type) {
        case 'text':
          return (
            <div
              style={{
                fontSize: element.fontSize || 16,
                fontWeight: element.fontWeight || 400,
                fontFamily: element.fontFamily || 'Inter',
                color: element.color || '#000000',
                textAlign: element.textAlign || 'left',
                lineHeight: element.lineHeight || 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                width: element.width || 'auto',
              }}
            >
              {element.content}
            </div>
          );
        
        case 'shape':
          if (element.shape === 'rectangle') {
            return (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.fill || '#3b82f6',
                  borderRadius: element.borderRadius || 0,
                  border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.stroke || '#000'}` : 'none',
                  opacity: element.opacity || 1,
                }}
              />
            );
          }
          if (element.shape === 'circle') {
            return (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.fill || '#3b82f6',
                  borderRadius: '50%',
                  border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.stroke || '#000'}` : 'none',
                  opacity: element.opacity || 1,
                }}
              />
            );
          }
          if (element.shape === 'line') {
            return (
              <div
                style={{
                  width: '100%',
                  height: element.strokeWidth || 2,
                  backgroundColor: element.stroke || '#000000',
                }}
              />
            );
          }
          return null;
        
        case 'icon':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                color: element.color || '#000000',
              }}
              dangerouslySetInnerHTML={{ __html: element.svgContent }}
            />
          );
        
        case 'image':
          return (
            <img
              src={element.src}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: element.objectFit || 'cover',
                borderRadius: element.borderRadius || 0,
              }}
              draggable={false}
            />
          );
        
        case 'chart':
          return (
            <div className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200 p-3">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 text-sm font-medium capitalize">{element.chartType} Chart</span>
                </div>
              </div>
            </div>
          );
        
        default:
          return null;
      }
    };

    return (
      <div
        key={element.id}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, element)}
        className={cn(
          "select-none",
          isSelected && "ring-2 ring-blue-500 ring-offset-1"
        )}
      >
        {content()}
        
        {isSelected && (
          <>
            {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((handle) => (
              <div
                key={handle}
                className={cn(
                  "absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm z-50",
                  handle === 'nw' && "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
                  handle === 'ne' && "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
                  handle === 'sw' && "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
                  handle === 'se' && "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
                  handle === 'n' && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize",
                  handle === 's' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize",
                  handle === 'e' && "top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize",
                  handle === 'w' && "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize"
                )}
                onMouseDown={(e) => handleResizeStart(e, handle, element)}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-200 p-8 flex items-start justify-center">
      <div
        ref={(node) => {
          containerRef.current = node;
          if (canvasRef) canvasRef.current = node;
        }}
        style={{
          width: width * zoom,
          height: height * zoom,
          backgroundColor,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          position: 'relative',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
        onClick={() => onSelect(null)}
        className="relative"
      >
        <div style={{ width, height, position: 'relative' }}>
          {elements.map(renderElement)}
        </div>
      </div>
    </div>
  );
}