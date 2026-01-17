import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const colorPresets = [
  // Neutrals
  '#000000', '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b',
  // Colors
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
];

const gradientPresets = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
];

export default function ColorPicker({ 
  value, 
  onChange, 
  showGradients = false,
  label,
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || '#000000');

  const handleColorSelect = (color) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      onChange(color);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start gap-3 h-10", className)}
        >
          <div
            className="w-5 h-5 rounded border border-slate-200"
            style={{ 
              background: value?.startsWith('linear-gradient') ? value : value || '#ffffff',
            }}
          />
          <span className="text-sm truncate flex-1 text-left">
            {label || value || 'Select color'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          {/* Color input */}
          <div className="flex gap-2">
            <div
              className="w-10 h-10 rounded-lg border border-slate-200"
              style={{ backgroundColor: customColor }}
            />
            <Input
              value={customColor}
              onChange={handleCustomChange}
              placeholder="#000000"
              className="flex-1"
            />
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>

          {/* Preset colors */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Colors</p>
            <div className="grid grid-cols-8 gap-1.5">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                    value === color ? "border-slate-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Gradient presets */}
          {showGradients && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Gradients</p>
              <div className="grid grid-cols-3 gap-2">
                {gradientPresets.map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(gradient)}
                    className={cn(
                      "h-10 rounded-lg border-2 transition-all hover:scale-105",
                      value === gradient ? "border-slate-900" : "border-transparent"
                    )}
                    style={{ background: gradient }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}