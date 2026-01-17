import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Type,
  Square,
  Circle,
  Minus,
  Image,
  BarChart3,
  Star,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
} from 'lucide-react';

export default function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onDelete,
  onReorder,
  onToggleVisibility,
  onToggleLock,
}) {
  const getIcon = (element) => {
    switch (element.type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'shape':
        if (element.shape === 'circle') return <Circle className="h-4 w-4" />;
        if (element.shape === 'line') return <Minus className="h-4 w-4" />;
        return <Square className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'icon':
        return <Star className="h-4 w-4" />;
      case 'chart':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const getLabel = (element) => {
    switch (element.type) {
      case 'text':
        return element.content?.slice(0, 20) || 'Text';
      case 'shape':
        return element.shape?.charAt(0).toUpperCase() + element.shape?.slice(1) || 'Shape';
      case 'image':
        return 'Image';
      case 'icon':
        return element.name || 'Icon';
      case 'chart':
        return `${element.chartType} Chart`;
      default:
        return 'Element';
    }
  };

  const sortedElements = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  return (
    <div className="h-48 bg-white border-t border-slate-200">
      <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Layers</h3>
        <span className="text-xs text-slate-500">{elements.length} elements</span>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2 space-y-1">
          {sortedElements.map((element, index) => (
            <div
              key={element.id}
              onClick={() => onSelect(element.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group",
                selectedId === element.id
                  ? "bg-slate-100"
                  : "hover:bg-slate-50"
              )}
            >
              <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
              <span className="text-slate-500">{getIcon(element)}</span>
              <span className="flex-1 text-sm truncate">{getLabel(element)}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(element.id);
                  }}
                >
                  {element.hidden ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(element.id);
                  }}
                >
                  {element.locked ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Unlock className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(element.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {elements.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No elements yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}