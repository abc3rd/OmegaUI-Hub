
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Grid3X3, Move } from "lucide-react";
import { toast } from "sonner";

export default function CSSGenerators() {
  const [gridColumns, setGridColumns] = useState(3);
  const [gridRows, setGridRows] = useState(2);
  const [gridGap, setGridGap] = useState(20);
  const [gridCSS, setGridCSS] = useState('');

  const [flexDirection, setFlexDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('center');
  const [alignItems, setAlignItems] = useState('center');
  const [flexCSS, setFlexCSS] = useState('');

  const generateGridCSS = useCallback(() => {
    const css = `.grid-container {
  display: grid;
  grid-template-columns: repeat(${gridColumns}, 1fr);
  grid-template-rows: repeat(${gridRows}, 1fr);
  gap: ${gridGap}px;
}

.grid-item {
  padding: 20px;
  background: #f3f4f6;
  border-radius: 8px;
  text-align: center;
}`;
    setGridCSS(css);
  }, [gridColumns, gridRows, gridGap]);

  const generateFlexCSS = useCallback(() => {
    const css = `.flex-container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  gap: 16px;
}

.flex-item {
  padding: 20px;
  background: #f3f4f6;
  border-radius: 8px;
  text-align: center;
}`;
    setFlexCSS(css);
  }, [flexDirection, justifyContent, alignItems]);

  useEffect(() => {
    generateGridCSS();
  }, [generateGridCSS]);

  useEffect(() => {
    generateFlexCSS();
  }, [generateFlexCSS]);

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const GridPreview = () => (
    <div 
      className="w-full border border-slate-200 rounded-lg p-4 bg-white"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        gap: `${gridGap}px`,
        minHeight: '200px'
      }}
    >
      {Array.from({ length: gridColumns * gridRows }, (_, i) => (
        <div
          key={i}
          className="bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center text-blue-800 font-medium"
        >
          {i + 1}
        </div>
      ))}
    </div>
  );

  const FlexPreview = () => (
    <div 
      className="w-full border border-slate-200 rounded-lg p-4 bg-white"
      style={{
        display: 'flex',
        flexDirection: flexDirection,
        justifyContent: justifyContent,
        alignItems: alignItems,
        gap: '16px',
        minHeight: '200px'
      }}
    >
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="bg-purple-100 border border-purple-200 rounded-lg px-6 py-4 text-purple-800 font-medium"
        >
          Item {i + 1}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">CSS Generators</h1>
            <p className="text-slate-600">Generate CSS Grid and Flexbox layouts with live preview</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* CSS Grid Generator */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Grid3X3 className="w-5 h-5" />
                CSS Grid Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gridColumns">Columns</Label>
                    <Input
                      id="gridColumns"
                      type="number"
                      min="1"
                      max="12"
                      value={gridColumns}
                      onChange={(e) => setGridColumns(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gridRows">Rows</Label>
                    <Input
                      id="gridRows"
                      type="number"
                      min="1"
                      max="12"
                      value={gridRows}
                      onChange={(e) => setGridRows(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gridGap">Gap (px)</Label>
                    <Input
                      id="gridGap"
                      type="number"
                      min="0"
                      max="100"
                      value={gridGap}
                      onChange={(e) => setGridGap(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Preview</Label>
                <GridPreview />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated CSS</Label>
                  <Button
                    onClick={() => copyToClipboard(gridCSS, 'Grid CSS copied!')}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-slate-100 p-4 rounded-lg border max-h-48 overflow-auto">
                  <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap">
                    {gridCSS}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flexbox Generator */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Move className="w-5 h-5" />
                Flexbox Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="flexDirection">Flex Direction</Label>
                    <Select value={flexDirection} onValueChange={setFlexDirection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Row</SelectItem>
                        <SelectItem value="row-reverse">Row Reverse</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="column-reverse">Column Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="justifyContent">Justify Content</Label>
                    <Select value={justifyContent} onValueChange={setJustifyContent}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Flex Start</SelectItem>
                        <SelectItem value="flex-end">Flex End</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                        <SelectItem value="space-evenly">Space Evenly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alignItems">Align Items</Label>
                    <Select value={alignItems} onValueChange={setAlignItems}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="flex-start">Flex Start</SelectItem>
                        <SelectItem value="flex-end">Flex End</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="baseline">Baseline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Preview</Label>
                <FlexPreview />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated CSS</Label>
                  <Button
                    onClick={() => copyToClipboard(flexCSS, 'Flexbox CSS copied!')}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-slate-100 p-4 rounded-lg border max-h-48 overflow-auto">
                  <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap">
                    {flexCSS}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
