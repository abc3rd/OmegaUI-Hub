import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wand2, Layers, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ToolPanel({
  onRemoveBackground,
  onAddGradient,
  onDownload,
  isProcessing,
  gradientState,
  setGradientState,
  hasImage,
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">AI Tools</h3>
        <Button onClick={onRemoveBackground} disabled={isProcessing || !hasImage} className="w-full">
          <Wand2 className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Remove Background'}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Background Effects</h3>
        <div className="space-y-2">
          <Label>Gradient Color 1</Label>
          <input
            type="color"
            value={gradientState.color1}
            onChange={(e) => setGradientState({ ...gradientState, color1: e.target.value })}
            className="w-full h-10 p-1 rounded-md border"
            disabled={!hasImage}
          />
        </div>
        <div className="space-y-2">
          <Label>Gradient Color 2</Label>
          <input
            type="color"
            value={gradientState.color2}
            onChange={(e) => setGradientState({ ...gradientState, color2: e.target.value })}
            className="w-full h-10 p-1 rounded-md border"
            disabled={!hasImage}
          />
        </div>
        <div className="space-y-2">
          <Label>Direction</Label>
          <Select
            value={gradientState.direction}
            onValueChange={(value) => setGradientState({ ...gradientState, direction: value })}
            disabled={!hasImage}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="to right">Left to Right</SelectItem>
              <SelectItem value="to bottom">Top to Bottom</SelectItem>
              <SelectItem value="45deg">Diagonal (45°)</SelectItem>
              <SelectItem value="135deg">Diagonal (135°)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddGradient} variant="outline" disabled={!hasImage} className="w-full">
          <Layers className="w-4 h-4 mr-2" />
          Apply Gradient
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Export</h3>
        <Button onClick={onDownload} variant="secondary" disabled={!hasImage} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download Image
        </Button>
      </div>
    </div>
  );
}