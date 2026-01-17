
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Palette, RefreshCw, Download, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function ColorPalette() {
    const [currentPalette, setCurrentPalette] = useState([]);
    const [baseColor, setBaseColor] = useState('#282361');
    const [paletteType, setPaletteType] = useState('complementary');
    const [savedPalettes, setSavedPalettes] = useState([]);

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
            }
            h /= 6;
        }
        
        return [h * 360, s * 100, l * 100];
    };

    const hslToHex = (h, s, l) => {
        h /= 360; s /= 100; l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const r = hue2rgb(p, q, h + 1/3);
        const g = hue2rgb(p, q, h);
        const b = hue2rgb(p, q, h - 1/3);
        
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const generatePalette = useCallback(() => {
        const [h, s, l] = hexToHsl(baseColor);
        let colors = [baseColor];
        
        switch (paletteType) {
            case 'complementary':
                colors.push(hslToHex((h + 180) % 360, s, l));
                colors.push(hslToHex(h, s * 0.7, l * 1.2));
                colors.push(hslToHex((h + 180) % 360, s * 0.7, l * 1.2));
                colors.push(hslToHex(h, s * 0.5, l * 0.8));
                break;
            case 'triadic':
                colors.push(hslToHex((h + 120) % 360, s, l));
                colors.push(hslToHex((h + 240) % 360, s, l));
                colors.push(hslToHex(h, s * 0.6, l * 1.1));
                colors.push(hslToHex((h + 120) % 360, s * 0.6, l * 1.1));
                break;
            case 'analogous':
                colors.push(hslToHex((h + 30) % 360, s, l));
                colors.push(hslToHex((h - 30 + 360) % 360, s, l));
                colors.push(hslToHex((h + 60) % 360, s * 0.8, l));
                colors.push(hslToHex((h - 60 + 360) % 360, s * 0.8, l));
                break;
            case 'monochromatic':
                colors.push(hslToHex(h, s, Math.max(l - 20, 10)));
                colors.push(hslToHex(h, s, Math.max(l - 40, 5)));
                colors.push(hslToHex(h, s, Math.min(l + 20, 90)));
                colors.push(hslToHex(h, s, Math.min(l + 40, 95)));
                break;
        }
        
        setCurrentPalette(colors);
    }, [baseColor, paletteType]); // Dependencies for useCallback

    useEffect(() => {
        generatePalette();
    }, [generatePalette]); // Now generatePalette is a stable function reference

    const copyColor = (color) => {
        navigator.clipboard.writeText(color);
        toast.success(`Copied ${color} to clipboard!`);
    };

    const savePalette = () => {
        const newPalette = {
            id: Date.now(),
            colors: currentPalette,
            type: paletteType,
            baseColor: baseColor
        };
        setSavedPalettes([...savedPalettes, newPalette]);
        toast.success('Palette saved!');
    };

    const exportPalette = () => {
        const paletteData = {
            colors: currentPalette,
            type: paletteType,
            baseColor: baseColor
        };
        const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Color Palette Generator</h1>
                    <p className="text-muted-foreground">Create beautiful color schemes for your designs</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Palette Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Base Color</label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        type="color"
                                        value={baseColor}
                                        onChange={(e) => setBaseColor(e.target.value)}
                                        className="w-16 h-10 p-1"
                                    />
                                    <Input
                                        type="text"
                                        value={baseColor}
                                        onChange={(e) => setBaseColor(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Palette Type</label>
                                <select 
                                    value={paletteType}
                                    onChange={(e) => setPaletteType(e.target.value)}
                                    className="w-full mt-1 p-2 border border-border rounded bg-input text-foreground"
                                >
                                    <option value="complementary">Complementary</option>
                                    <option value="triadic">Triadic</option>
                                    <option value="analogous">Analogous</option>
                                    <option value="monochromatic">Monochromatic</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={generatePalette} variant="outline" className="flex-1">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate
                                </Button>
                                <Button onClick={savePalette} variant="outline">
                                    <Heart className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Export Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={exportPalette} variant="outline" className="w-full">
                                <Download className="w-4 h-4 mr-2" />
                                Export JSON
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Palette */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Current Palette
                                <Badge variant="outline" className="capitalize">{paletteType}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-4 mb-6">
                                {currentPalette.map((color, index) => (
                                    <div key={index} className="text-center">
                                        <div
                                            className="w-full h-24 rounded-lg cursor-pointer transition-transform hover:scale-105 shadow-lg"
                                            style={{ backgroundColor: color }}
                                            onClick={() => copyColor(color)}
                                        />
                                        <p className="text-xs font-mono mt-2 text-muted-foreground">{color}</p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyColor(color)}
                                            className="mt-1 h-6 text-xs"
                                        >
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copy
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Saved Palettes */}
                            {savedPalettes.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium mb-3">Saved Palettes</h3>
                                    <div className="space-y-3">
                                        {savedPalettes.slice(-3).map((palette) => (
                                            <div key={palette.id} className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {palette.colors.slice(0, 5).map((color, index) => (
                                                        <div
                                                            key={index}
                                                            className="w-6 h-6 rounded cursor-pointer"
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => copyColor(color)}
                                                        />
                                                    ))}
                                                </div>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {palette.type}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
