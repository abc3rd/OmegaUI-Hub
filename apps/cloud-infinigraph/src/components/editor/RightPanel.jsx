import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Palette,
  Type,
  Layers,
  Move,
  RotateCw,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from 'lucide-react';

const fonts = [
  'Inter',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Playfair Display',
  'Poppins',
];

const colorPresets = [
  '#000000', '#ffffff', '#f8fafc', '#64748b', '#0f172a',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
];

export default function RightPanel({
  selectedElement,
  onUpdateElement,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  onUpdateCanvas,
  onBringForward,
  onSendBackward,
}) {
  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Canvas Settings</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">Dimensions</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Width</Label>
                  <Input
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => onUpdateCanvas({ width: parseInt(e.target.value) || 800 })}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Height</Label>
                  <Input
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => onUpdateCanvas({ height: parseInt(e.target.value) || 1200 })}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">Preset Sizes</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUpdateCanvas({ width: 800, height: 1200 })}
                  className="h-9 text-xs"
                >
                  Poster (800×1200)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUpdateCanvas({ width: 1080, height: 1080 })}
                  className="h-9 text-xs"
                >
                  Square (1080×1080)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUpdateCanvas({ width: 1920, height: 1080 })}
                  className="h-9 text-xs"
                >
                  HD (1920×1080)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUpdateCanvas({ width: 1080, height: 1920 })}
                  className="h-9 text-xs"
                >
                  Story (1080×1920)
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-500 uppercase mb-2 block">Background</Label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateCanvas({ backgroundColor: color })}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      backgroundColor === color ? 'border-slate-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-10 h-10 rounded-lg border border-slate-200"
                  style={{ backgroundColor }}
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => onUpdateCanvas({ backgroundColor: e.target.value })}
                  className="flex-1 h-10"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  const updateValue = (key, value) => {
    onUpdateElement(selectedElement.id, { [key]: value });
  };

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col">
      <Tabs defaultValue="style" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="style"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-4 py-3"
          >
            Style
          </TabsTrigger>
          <TabsTrigger
            value="position"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-4 py-3"
          >
            Position
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Text Styles */}
              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Content</Label>
                    <textarea
                      value={selectedElement.content || ''}
                      onChange={(e) => updateValue('content', e.target.value)}
                      className="w-full h-24 p-3 border border-slate-200 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Font</Label>
                    <Select
                      value={selectedElement.fontFamily || 'Inter'}
                      onValueChange={(value) => updateValue('fontFamily', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Size</Label>
                      <Input
                        type="number"
                        value={selectedElement.fontSize || 16}
                        onChange={(e) => updateValue('fontSize', parseInt(e.target.value) || 16)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Weight</Label>
                      <Select
                        value={String(selectedElement.fontWeight || 400)}
                        onValueChange={(value) => updateValue('fontWeight', parseInt(value))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">Light</SelectItem>
                          <SelectItem value="400">Regular</SelectItem>
                          <SelectItem value="500">Medium</SelectItem>
                          <SelectItem value="600">Semibold</SelectItem>
                          <SelectItem value="700">Bold</SelectItem>
                          <SelectItem value="800">Extra Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Alignment</Label>
                    <div className="flex gap-1">
                      {[
                        { value: 'left', icon: AlignLeft },
                        { value: 'center', icon: AlignCenter },
                        { value: 'right', icon: AlignRight },
                      ].map(({ value, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={selectedElement.textAlign === value ? 'secondary' : 'ghost'}
                          size="icon"
                          onClick={() => updateValue('textAlign', value)}
                          className="h-9 w-9"
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Line Height</Label>
                    <Slider
                      value={[selectedElement.lineHeight || 1.5]}
                      onValueChange={([value]) => updateValue('lineHeight', value)}
                      min={1}
                      max={3}
                      step={0.1}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">{(selectedElement.lineHeight || 1.5).toFixed(1)}</span>
                  </div>
                </>
              )}

              {/* Shape Styles */}
              {selectedElement.type === 'shape' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Fill Color</Label>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateValue('fill', color)}
                          className={`w-full aspect-square rounded-lg border-2 transition-all ${
                            selectedElement.fill === color ? 'border-slate-900 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <div 
                        className="w-10 h-10 rounded-lg border border-slate-200"
                        style={{ backgroundColor: selectedElement.fill || '#3b82f6' }}
                      />
                      <Input
                        value={selectedElement.fill || '#3b82f6'}
                        onChange={(e) => updateValue('fill', e.target.value)}
                        className="flex-1 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Border</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1 block">Width</Label>
                        <Input
                          type="number"
                          value={selectedElement.strokeWidth || 0}
                          onChange={(e) => updateValue('strokeWidth', parseInt(e.target.value) || 0)}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Color</Label>
                        <Input
                          value={selectedElement.stroke || '#000000'}
                          onChange={(e) => updateValue('stroke', e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedElement.shape === 'rectangle' && (
                    <div>
                      <Label className="text-xs text-slate-500 uppercase mb-2 block">Corner Radius</Label>
                      <Slider
                        value={[selectedElement.borderRadius || 0]}
                        onValueChange={([value]) => updateValue('borderRadius', value)}
                        min={0}
                        max={50}
                        step={1}
                      />
                      <span className="text-xs text-slate-500 mt-1 block">{selectedElement.borderRadius || 0}px</span>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Opacity</Label>
                    <Slider
                      value={[(selectedElement.opacity || 1) * 100]}
                      onValueChange={([value]) => updateValue('opacity', value / 100)}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">{Math.round((selectedElement.opacity || 1) * 100)}%</span>
                  </div>
                </>
              )}

              {/* Icon/Image Color */}
              {(selectedElement.type === 'icon' || selectedElement.type === 'text') && (
                <div>
                  <Label className="text-xs text-slate-500 uppercase mb-2 block">Color</Label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateValue('color', color)}
                        className={`w-full aspect-square rounded-lg border-2 transition-all ${
                          selectedElement.color === color ? 'border-slate-900 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <div 
                      className="w-10 h-10 rounded-lg border border-slate-200"
                      style={{ backgroundColor: selectedElement.color || '#000000' }}
                    />
                    <Input
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => updateValue('color', e.target.value)}
                      className="flex-1 h-10"
                    />
                  </div>
                </div>
              )}

              {/* Image Styles */}
              {selectedElement.type === 'image' && (
                <>
                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Fit</Label>
                    <Select
                      value={selectedElement.objectFit || 'cover'}
                      onValueChange={(value) => updateValue('objectFit', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="fill">Fill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-500 uppercase mb-2 block">Corner Radius</Label>
                    <Slider
                      value={[selectedElement.borderRadius || 0]}
                      onValueChange={([value]) => updateValue('borderRadius', value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <span className="text-xs text-slate-500 mt-1 block">{selectedElement.borderRadius || 0}px</span>
                  </div>
                </>
              )}

              <Separator />

              {/* Layer Order */}
              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Layer Order</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onBringForward} className="flex-1 gap-2">
                    <ChevronUp className="h-4 w-4" />
                    Forward
                  </Button>
                  <Button variant="outline" size="sm" onClick={onSendBackward} className="flex-1 gap-2">
                    <ChevronDown className="h-4 w-4" />
                    Backward
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="position" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Position</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.x || 0)}
                      onChange={(e) => updateValue('x', parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.y || 0)}
                      onChange={(e) => updateValue('y', parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Size</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Width</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.width || 100)}
                      onChange={(e) => updateValue('width', parseFloat(e.target.value) || 100)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Height</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.height || 100)}
                      onChange={(e) => updateValue('height', parseFloat(e.target.value) || 100)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500 uppercase mb-2 block">Rotation</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[selectedElement.rotation || 0]}
                    onValueChange={([value]) => updateValue('rotation', value)}
                    min={0}
                    max={360}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={selectedElement.rotation || 0}
                    onChange={(e) => updateValue('rotation', parseFloat(e.target.value) || 0)}
                    className="w-20 h-9"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}