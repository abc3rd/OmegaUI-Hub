
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Type, Copy, RefreshCw, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function FontMatcher() {
    const [primaryFont, setPrimaryFont] = useState('Inter');
    const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');
    const [fontPairs, setFontPairs] = useState([]);
    const [savedPairs, setSavedPairs] = useState([]);

    const googleFonts = [
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Source Sans Pro',
        'Oswald', 'Montserrat', 'Raleway', 'PT Sans', 'Lora', 'Noto Sans',
        'Nunito Sans', 'Playfair Display', 'Merriweather', 'Georgia', 'Times New Roman',
        'Arial', 'Helvetica', 'Verdana', 'Trebuchet MS', 'Crimson Text'
    ];

    const fontCategories = {
        'Inter': 'Sans-serif',
        'Roboto': 'Sans-serif',
        'Open Sans': 'Sans-serif',
        'Lato': 'Sans-serif',
        'Poppins': 'Sans-serif',
        'Source Sans Pro': 'Sans-serif',
        'Oswald': 'Sans-serif',
        'Montserrat': 'Sans-serif',
        'Raleway': 'Sans-serif',
        'PT Sans': 'Sans-serif',
        'Lora': 'Serif',
        'Noto Sans': 'Sans-serif',
        'Nunito Sans': 'Sans-serif',
        'Playfair Display': 'Serif',
        'Merriweather': 'Serif',
        'Georgia': 'Serif',
        'Times New Roman': 'Serif',
        'Arial': 'Sans-serif',
        'Helvetica': 'Sans-serif',
        'Verdana': 'Sans-serif',
        'Trebuchet MS': 'Sans-serif',
        'Crimson Text': 'Serif'
    };

    const generateFontPairs = useCallback(() => {
        const primaryCategory = fontCategories[primaryFont];
        const complementaryFonts = googleFonts.filter(font => {
            const category = fontCategories[font];
            return font !== primaryFont && (
                (primaryCategory === 'Sans-serif' && category === 'Serif') ||
                (primaryCategory === 'Serif' && category === 'Sans-serif') ||
                (category === primaryCategory && Math.random() > 0.7)
            );
        });

        const pairs = complementaryFonts.slice(0, 6).map(secondaryFont => ({
            id: Date.now() + Math.random(),
            primary: primaryFont,
            secondary: secondaryFont,
            primaryCategory: fontCategories[primaryFont],
            secondaryCategory: fontCategories[secondaryFont],
            contrast: fontCategories[primaryFont] !== fontCategories[secondaryFont] ? 'High' : 'Medium'
        }));

        setFontPairs(pairs);
    }, [primaryFont]); // `googleFonts` and `fontCategories` are constants and don't need to be dependencies.

    useEffect(() => {
        generateFontPairs();
    }, [generateFontPairs]);

    const copyFontPair = (pair) => {
        const cssCode = `/* Font Pairing */
.heading {
  font-family: '${pair.primary}', ${pair.primaryCategory === 'Serif' ? 'serif' : 'sans-serif'};
}

.body-text {
  font-family: '${pair.secondary}', ${pair.secondaryCategory === 'Serif' ? 'serif' : 'sans-serif'};
}

/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=${pair.primary.replace(' ', '+')}:wght@300;400;600;700&family=${pair.secondary.replace(' ', '+')}:wght@300;400;600;700&display=swap');`;

        navigator.clipboard.writeText(cssCode);
        toast.success('Font pair CSS copied to clipboard!');
    };

    const saveFontPair = (pair) => {
        setSavedPairs([...savedPairs, { ...pair, savedAt: Date.now() }]);
        toast.success('Font pair saved!');
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Type className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Font Matcher</h1>
                    <p className="text-muted-foreground">Find perfect font combinations for your designs</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Controls */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Font Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Primary Font (Headings)</label>
                                <select 
                                    value={primaryFont}
                                    onChange={(e) => setPrimaryFont(e.target.value)}
                                    className="w-full mt-1 p-2 border border-border rounded bg-input text-foreground"
                                >
                                    {googleFonts.map(font => (
                                        <option key={font} value={font}>{font}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Sample Text</label>
                                <Input
                                    value={sampleText}
                                    onChange={(e) => setSampleText(e.target.value)}
                                    placeholder="Enter your sample text"
                                    className="mt-1"
                                />
                            </div>

                            <Button onClick={generateFontPairs} variant="outline" className="w-full">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate New Pairs
                            </Button>
                        </CardContent>
                    </Card>

                    {savedPairs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Saved Pairs ({savedPairs.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {savedPairs.slice(-3).map((pair, index) => (
                                    <div key={index} className="p-2 border border-border rounded text-xs">
                                        <div className="font-medium">{pair.primary}</div>
                                        <div className="text-muted-foreground">+ {pair.secondary}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Font Pairs Grid */}
                <div className="lg:col-span-3">
                    <div className="grid md:grid-cols-2 gap-6">
                        {fontPairs.map((pair) => (
                            <Card key={pair.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Badge variant="outline">{pair.contrast} Contrast</Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {pair.primaryCategory} + {pair.secondaryCategory}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => saveFontPair(pair)}
                                            >
                                                <Heart className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyFontPair(pair)}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Primary Font Preview */}
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">
                                            Heading - {pair.primary}
                                        </div>
                                        <div 
                                            className="text-xl font-semibold"
                                            style={{ fontFamily: `'${pair.primary}', ${pair.primaryCategory === 'Serif' ? 'serif' : 'sans-serif'}` }}
                                        >
                                            {sampleText.split(' ').slice(0, 4).join(' ')}
                                        </div>
                                    </div>

                                    {/* Secondary Font Preview */}
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">
                                            Body Text - {pair.secondary}
                                        </div>
                                        <div 
                                            className="text-sm leading-relaxed text-muted-foreground"
                                            style={{ fontFamily: `'${pair.secondary}', ${pair.secondaryCategory === 'Serif' ? 'serif' : 'sans-serif'}` }}
                                        >
                                            {sampleText}
                                        </div>
                                    </div>

                                    {/* Combined Preview */}
                                    <div className="pt-2 border-t border-border">
                                        <div 
                                            className="text-lg font-medium mb-2"
                                            style={{ fontFamily: `'${pair.primary}', ${pair.primaryCategory === 'Serif' ? 'serif' : 'sans-serif'}` }}
                                        >
                                            Perfect Typography
                                        </div>
                                        <div 
                                            className="text-sm text-muted-foreground"
                                            style={{ fontFamily: `'${pair.secondary}', ${pair.secondaryCategory === 'Serif' ? 'serif' : 'sans-serif'}` }}
                                        >
                                            This font pairing creates excellent readability and visual hierarchy.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
