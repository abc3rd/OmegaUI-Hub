
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Shuffle, Copy, Layers } from "lucide-react";
import { toast } from "sonner";

const ColorSwatch = ({ color, onClick, size = "w-12 h-12" }) => (
  <div
    className={`${size} rounded-lg cursor-pointer border-2 border-white shadow-md hover:scale-110 transition-transform duration-200`}
    style={{ backgroundColor: color }}
    onClick={() => onClick(color)}
    title={`Click to copy ${color}`}
  />
);

const generateColorPalette = (baseColor, isRandom = false) => {
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  if (isRandom) {
    return Array.from({ length: 8 }, () => 
      `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    );
  }

  const [h, s, l] = hexToHsl(baseColor);
  const palette = [];
  
  // Generate complementary and analogous colors
  for (let i = 0; i < 8; i++) {
    const newH = (h + (i * 45)) % 360;
    const newS = Math.max(20, Math.min(100, s + (i * 10 - 40)));
    const newL = Math.max(10, Math.min(90, l + (i * 15 - 60)));
    palette.push(hslToHex(newH, newS, newL));
  }

  return palette;
};

export default function DesignTools() {
  const [baseColor, setBaseColor] = useState('#667eea');
  const [palette, setPalette] = useState([]);
  const [gradientColor1, setGradientColor1] = useState('#667eea');
  const [gradientColor2, setGradientColor2] = useState('#764ba2');
  const [gradientDirection, setGradientDirection] = useState('135deg');
  const [gradientCSS, setGradientCSS] = useState('');

  const generatePalette = useCallback((isRandom = false) => {
    const newPalette = generateColorPalette(baseColor, isRandom);
    setPalette(newPalette);
  }, [baseColor]);
  
  const updateGradient = useCallback(() => {
    const css = `background: linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2});`;
    setGradientCSS(css);
  }, [gradientColor1, gradientColor2, gradientDirection]);

  useEffect(() => {
    generatePalette();
  }, [generatePalette]);

  useEffect(() => {
    updateGradient();
  }, [updateGradient]);

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const exportPalette = () => {
    const cssVars = palette.map((color, index) => 
      `  --color-${index + 1}: ${color};`
    ).join('\n');
    
    const css = `:root {\n${cssVars}\n}`;
    copyToClipboard(css, 'Palette CSS copied!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Design Tools</h1>
            <p className="text-slate-600">Create beautiful color palettes and gradients for your projects</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Color Palette Generator */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Palette className="w-5 h-5" />
                Color Palette Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseColor">Base Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      id="baseColor"
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-16 h-16 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <Input
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="font-mono"
                      placeholder="#667eea"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => generatePalette(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Generate Palette
                  </Button>
                  <Button 
                    onClick={() => generatePalette(true)}
                    variant="outline"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Random Colors
                  </Button>
                </div>
              </div>

              {palette.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {palette.map((color, index) => (
                      <div key={index} className="space-y-2">
                        <ColorSwatch 
                          color={color}
                          onClick={copyToClipboard}
                          size="w-full aspect-square"
                        />
                        <p className="text-xs font-mono text-center text-slate-600">
                          {color.toUpperCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={exportPalette}
                    variant="outline" 
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Export as CSS Variables
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gradient Generator */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Layers className="w-5 h-5" />
                Gradient Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradientColor1">Color 1</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="gradientColor1"
                        type="color"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
                      />
                      <Input
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradientColor2">Color 2</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="gradientColor2"
                        type="color"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
                      />
                      <Input
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradientDirection">Direction</Label>
                  <Select value={gradientDirection} onValueChange={setGradientDirection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to right">Left to Right</SelectItem>
                      <SelectItem value="to left">Right to Left</SelectItem>
                      <SelectItem value="to bottom">Top to Bottom</SelectItem>
                      <SelectItem value="to top">Bottom to Top</SelectItem>
                      <SelectItem value="45deg">Diagonal (45°)</SelectItem>
                      <SelectItem value="135deg">Diagonal (135°)</SelectItem>
                      <SelectItem value="to top right">To Top Right</SelectItem>
                      <SelectItem value="to bottom left">To Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div 
                  className="w-full h-32 rounded-lg border border-slate-200 shadow-inner"
                  style={{ background: `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})` }}
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>CSS Code</Label>
                    <Button
                      onClick={() => copyToClipboard(gradientCSS, 'CSS copied!')}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg border">
                    <code className="text-sm font-mono text-slate-700">
                      {gradientCSS}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
