import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scissors, Volume2, Gauge, Type, Palette, Move, Trash2, Plus } from 'lucide-react';

export default function Inspector({ 
  selectedElement,
  onElementUpdate,
  onElementRemove,
  aspectRatio,
  onAspectRatioChange,
}) {
  if (!selectedElement && !aspectRatio) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div className="text-gray-400">
          <Scissors className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm">Select a clip or text overlay to edit properties</p>
        </div>
      </div>
    );
  }

  // Reel settings (when nothing selected)
  if (!selectedElement) {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            Reel Settings
          </h3>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9:16">9:16 (Reels/TikTok)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Clip inspector
  if (selectedElement.type === 'video' || selectedElement.type === 'image') {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            Clip Properties
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onElementRemove?.(selectedElement.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Duration */}
        <div>
          <Label className="text-xs flex items-center gap-1 mb-2">
            <Scissors className="w-3 h-3" />
            Duration (seconds)
          </Label>
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={selectedElement.duration || 0}
            onChange={(e) => onElementUpdate({ ...selectedElement, duration: parseFloat(e.target.value) })}
          />
        </div>

        {/* Volume (video only) */}
        {selectedElement.type === 'video' && (
          <div>
            <Label className="text-xs flex items-center gap-1 mb-2">
              <Volume2 className="w-3 h-3" />
              Volume ({Math.round((selectedElement.volume || 1) * 100)}%)
            </Label>
            <Slider
              value={[(selectedElement.volume || 1) * 100]}
              onValueChange={(value) => onElementUpdate({ ...selectedElement, volume: value[0] / 100 })}
              max={100}
              step={1}
            />
          </div>
        )}

        {/* Speed */}
        <div>
          <Label className="text-xs flex items-center gap-1 mb-2">
            <Gauge className="w-3 h-3" />
            Speed ({selectedElement.speed || 1}x)
          </Label>
          <Slider
            value={[(selectedElement.speed || 1) * 100]}
            onValueChange={(value) => onElementUpdate({ ...selectedElement, speed: value[0] / 100 })}
            min={25}
            max={200}
            step={25}
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>0.25x</span>
            <span>1x</span>
            <span>2x</span>
          </div>
        </div>

        {/* Trim controls */}
        <div>
          <Label className="text-xs mb-2 block">Trim</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-gray-500">Start (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={selectedElement.trim_start || 0}
                onChange={(e) => onElementUpdate({ ...selectedElement, trim_start: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500">End (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={selectedElement.trim_end || selectedElement.duration}
                onChange={(e) => onElementUpdate({ ...selectedElement, trim_end: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Visual Filter */}
        <div>
          <Label className="text-xs">Visual Filter</Label>
          <Select 
            value={selectedElement.filter || 'none'} 
            onValueChange={(value) => onElementUpdate({ ...selectedElement, filter: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="blackwhite">Black & White</SelectItem>
              <SelectItem value="sepia">Sepia</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="cool">Cool Tone</SelectItem>
              <SelectItem value="warm">Warm Tone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transition */}
        <div>
          <Label className="text-xs">Transition</Label>
          <Select 
            value={selectedElement.transition?.type || 'none'} 
            onValueChange={(value) => onElementUpdate({ 
              ...selectedElement, 
              transition: { ...selectedElement.transition, type: value }
            })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide_left">Slide Left</SelectItem>
              <SelectItem value="slide_right">Slide Right</SelectItem>
              <SelectItem value="slide_up">Slide Up</SelectItem>
              <SelectItem value="slide_down">Slide Down</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="dissolve">Dissolve</SelectItem>
            </SelectContent>
          </Select>

          {selectedElement.transition?.type !== 'none' && (
            <div className="mt-2">
              <Label className="text-[10px] text-gray-500">Duration (s)</Label>
              <Input
                type="number"
                min="0.1"
                max="2"
                step="0.1"
                value={selectedElement.transition?.duration || 0.5}
                onChange={(e) => onElementUpdate({
                  ...selectedElement,
                  transition: { ...selectedElement.transition, duration: parseFloat(e.target.value) }
                })}
                className="mt-1"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Text overlay inspector
  if (selectedElement.type === 'text') {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text Properties
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onElementRemove?.(selectedElement.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div>
          <Label className="text-xs">Text Content</Label>
          <Input
            value={selectedElement.content || ''}
            onChange={(e) => onElementUpdate({ ...selectedElement, content: e.target.value })}
            placeholder="Enter text..."
            className="mt-1"
          />
        </div>

        {/* Font */}
        <div>
          <Label className="text-xs">Font</Label>
          <Select 
            value={selectedElement.font || 'Inter'} 
            onValueChange={(value) => onElementUpdate({ ...selectedElement, font: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Poppins">Poppins</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size */}
        <div>
          <Label className="text-xs">Font Size ({selectedElement.size || 24}px)</Label>
          <Slider
            value={[selectedElement.size || 24]}
            onValueChange={(value) => onElementUpdate({ ...selectedElement, size: value[0] })}
            min={12}
            max={72}
            step={2}
            className="mt-2"
          />
        </div>

        {/* Color */}
        <div>
          <Label className="text-xs flex items-center gap-1 mb-2">
            <Palette className="w-3 h-3" />
            Color
          </Label>
          <Input
            type="color"
            value={selectedElement.color || '#ffffff'}
            onChange={(e) => onElementUpdate({ ...selectedElement, color: e.target.value })}
            className="h-10"
          />
        </div>

        {/* Position */}
        <div>
          <Label className="text-xs flex items-center gap-1 mb-2">
            <Move className="w-3 h-3" />
            Position
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-gray-500">X (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={selectedElement.position?.x || 50}
                onChange={(e) => onElementUpdate({
                  ...selectedElement,
                  position: { ...selectedElement.position, x: parseFloat(e.target.value) }
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500">Y (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={selectedElement.position?.y || 50}
                onChange={(e) => onElementUpdate({
                  ...selectedElement,
                  position: { ...selectedElement.position, y: parseFloat(e.target.value) }
                })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Animation */}
        <div>
          <Label className="text-xs">Animation</Label>
          <Select 
            value={selectedElement.animation || 'fade'} 
            onValueChange={(value) => onElementUpdate({ ...selectedElement, animation: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="typewriter">Typewriter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timing */}
        <div>
          <Label className="text-xs mb-2 block">Timing</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-gray-500">Start (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={selectedElement.start_time || 0}
                onChange={(e) => onElementUpdate({ ...selectedElement, start_time: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500">End (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={selectedElement.end_time || 5}
                onChange={(e) => onElementUpdate({ ...selectedElement, end_time: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Keyframe Animation */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold">Keyframes</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const keyframes = selectedElement.keyframes || [];
                const currentTime = 0; // Would use actual current time
                keyframes.push({
                  time: currentTime,
                  x: selectedElement.position?.x || 50,
                  y: selectedElement.position?.y || 50,
                  scale: 1,
                  opacity: 1,
                });
                onElementUpdate({ ...selectedElement, keyframes });
              }}
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(selectedElement.keyframes || []).map((kf, index) => (
              <div key={index} className="bg-gray-50 rounded p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Frame @ {kf.time}s</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const keyframes = [...selectedElement.keyframes];
                      keyframes.splice(index, 1);
                      onElementUpdate({ ...selectedElement, keyframes });
                    }}
                    className="h-5 w-5 p-0 text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[9px]">X</Label>
                    <Input
                      type="number"
                      value={kf.x}
                      onChange={(e) => {
                        const keyframes = [...selectedElement.keyframes];
                        keyframes[index].x = parseFloat(e.target.value);
                        onElementUpdate({ ...selectedElement, keyframes });
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px]">Y</Label>
                    <Input
                      type="number"
                      value={kf.y}
                      onChange={(e) => {
                        const keyframes = [...selectedElement.keyframes];
                        keyframes[index].y = parseFloat(e.target.value);
                        onElementUpdate({ ...selectedElement, keyframes });
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px]">Scale</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={kf.scale}
                      onChange={(e) => {
                        const keyframes = [...selectedElement.keyframes];
                        keyframes[index].scale = parseFloat(e.target.value);
                        onElementUpdate({ ...selectedElement, keyframes });
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px]">Opacity</Label>
                    <Input
                      type="number"
                      step="0.1"
                      max="1"
                      value={kf.opacity}
                      onChange={(e) => {
                        const keyframes = [...selectedElement.keyframes];
                        keyframes[index].opacity = parseFloat(e.target.value);
                        onElementUpdate({ ...selectedElement, keyframes });
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!selectedElement.keyframes || selectedElement.keyframes.length === 0) && (
            <p className="text-xs text-gray-400 text-center py-4">
              No keyframes. Add keyframes for dynamic animations.
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}