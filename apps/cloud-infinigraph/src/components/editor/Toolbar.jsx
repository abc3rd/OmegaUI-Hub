import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Share2,
  Grid3X3,
  Layers,
  Eye,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Toolbar({
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onShare,
  selectedElement,
  onDelete,
  onDuplicate,
  onAlignH,
  onAlignV,
  showGrid,
  onToggleGrid,
  canUndo,
  canRedo,
  isSaving,
  showAIAssistant,
  onToggleAIAssistant
}) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onUndo}
                disabled={!canUndo}
                className="h-9 w-9"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onRedo}
                disabled={!canRedo}
                className="h-9 w-9"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {selectedElement && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <AlignLeft className="h-4 w-4" />
                  Align
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onAlignH('left')}>
                  <AlignLeft className="h-4 w-4 mr-2" /> Align Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAlignH('center')}>
                  <AlignCenter className="h-4 w-4 mr-2" /> Align Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAlignH('right')}>
                  <AlignRight className="h-4 w-4 mr-2" /> Align Right
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAlignV('top')}>
                  <AlignStartVertical className="h-4 w-4 mr-2" /> Align Top
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAlignV('middle')}>
                  <AlignCenterVertical className="h-4 w-4 mr-2" /> Align Middle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAlignV('bottom')}>
                  <AlignEndVertical className="h-4 w-4 mr-2" /> Align Bottom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-9 w-9">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onDelete} className="h-9 w-9 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete (Del)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-2" />
          </>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showGrid ? "secondary" : "ghost"} 
                size="icon" 
                onClick={onToggleGrid}
                className="h-9 w-9"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))} className="h-7 w-7">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(2, zoom + 0.25))} className="h-7 w-7">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" onClick={onSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExport('png')}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('jpg')}>
              Export as JPG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('svg')}>
              Export as SVG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onShare} className="gap-2 bg-slate-900 hover:bg-slate-800">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
}