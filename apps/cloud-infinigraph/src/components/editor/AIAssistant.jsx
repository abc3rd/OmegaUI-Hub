import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Sparkles,
  Palette,
  Layout,
  FileText,
  Loader2,
  Check,
  Copy,
  Wand2,
} from 'lucide-react';

export default function AIAssistant({ 
  onApplyColors, 
  onApplyLayout, 
  onApplyContent,
  currentBackgroundColor 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [colorResult, setColorResult] = useState(null);
  const [layoutResult, setLayoutResult] = useState(null);
  const [contentResult, setContentResult] = useState(null);
  
  const [colorSettings, setColorSettings] = useState({
    baseColor: currentBackgroundColor || '#3b82f6',
  });
  
  const [layoutSettings, setLayoutSettings] = useState({
    contentType: 'statistics',
    dataPoints: 5,
    categories: '',
  });
  
  const [contentSettings, setContentSettings] = useState({
    topic: '',
    style: 'professional',
    tone: 'informative',
  });

  const suggestColors = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('aiDesignAssist', {
        action: 'suggest_colors',
        data: colorSettings,
      });
      setColorResult(response.data.palette);
      toast.success('Color palette generated!');
    } catch (error) {
      toast.error('Failed to generate colors');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestLayout = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('aiDesignAssist', {
        action: 'suggest_layout',
        data: {
          ...layoutSettings,
          categories: layoutSettings.categories.split(',').map(c => c.trim()).filter(Boolean),
        },
      });
      setLayoutResult(response.data.layout);
      toast.success('Layout suggestions ready!');
    } catch (error) {
      toast.error('Failed to generate layout');
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async () => {
    if (!contentSettings.topic) {
      toast.error('Please enter a topic');
      return;
    }
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('aiDesignAssist', {
        action: 'generate_content',
        data: contentSettings,
      });
      setContentResult(response.data.content);
      toast.success('Content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-4 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Design Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger value="colors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-4 py-2 text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="layout" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-4 py-2 text-xs">
              <Layout className="h-3 w-3 mr-1" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-4 py-2 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Content
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-80">
            <TabsContent value="colors" className="p-4 space-y-4 mt-0">
              <div>
                <Label className="text-xs">Base Color</Label>
                <div className="flex gap-2 mt-1">
                  <div 
                    className="w-10 h-10 rounded border" 
                    style={{ backgroundColor: colorSettings.baseColor }}
                  />
                  <Input
                    value={colorSettings.baseColor}
                    onChange={(e) => setColorSettings({ ...colorSettings, baseColor: e.target.value })}
                    className="flex-1 h-10"
                  />
                </div>
              </div>

              <Button 
                onClick={suggestColors} 
                disabled={isLoading}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate Palette
              </Button>

              {colorResult && (
                <div className="space-y-3 pt-4 border-t">
                  <p className="text-xs font-medium text-slate-500">Generated Palette</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[colorResult.primary, colorResult.secondary, colorResult.accent, colorResult.background, colorResult.text].map((color, i) => (
                      <button
                        key={i}
                        onClick={() => copyToClipboard(color)}
                        className="group aspect-square rounded-lg border hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        <Copy className="h-3 w-3 mx-auto text-white opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                  {colorResult.chartColors && (
                    <>
                      <p className="text-xs text-slate-500">Chart Colors</p>
                      <div className="flex gap-1">
                        {colorResult.chartColors.map((color, i) => (
                          <button
                            key={i}
                            onClick={() => copyToClipboard(color)}
                            className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onApplyColors?.(colorResult)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Apply Palette
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="layout" className="p-4 space-y-4 mt-0">
              <div>
                <Label className="text-xs">Content Type</Label>
                <Select
                  value={layoutSettings.contentType}
                  onValueChange={(v) => setLayoutSettings({ ...layoutSettings, contentType: v })}
                >
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statistics">Statistics</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="comparison">Comparison</SelectItem>
                    <SelectItem value="process">Process Flow</SelectItem>
                    <SelectItem value="hierarchy">Hierarchy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Number of Data Points</Label>
                <Input
                  type="number"
                  value={layoutSettings.dataPoints}
                  onChange={(e) => setLayoutSettings({ ...layoutSettings, dataPoints: parseInt(e.target.value) || 5 })}
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs">Categories (comma-separated)</Label>
                <Input
                  value={layoutSettings.categories}
                  onChange={(e) => setLayoutSettings({ ...layoutSettings, categories: e.target.value })}
                  placeholder="e.g., sales, marketing, support"
                  className="mt-1 h-9"
                />
              </div>

              <Button 
                onClick={suggestLayout} 
                disabled={isLoading}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Suggest Layout
              </Button>

              {layoutResult && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-medium">{layoutResult.layoutType}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Recommended: {layoutResult.recommendedWidth}×{layoutResult.recommendedHeight}
                    </p>
                  </div>
                  {layoutResult.tips && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">Tips</p>
                      {layoutResult.tips.map((tip, i) => (
                        <p key={i} className="text-xs text-slate-600">• {tip}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="p-4 space-y-4 mt-0">
              <div>
                <Label className="text-xs">Topic</Label>
                <Input
                  value={contentSettings.topic}
                  onChange={(e) => setContentSettings({ ...contentSettings, topic: e.target.value })}
                  placeholder="e.g., Company growth in 2024"
                  className="mt-1 h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Style</Label>
                  <Select
                    value={contentSettings.style}
                    onValueChange={(v) => setContentSettings({ ...contentSettings, style: v })}
                  >
                    <SelectTrigger className="mt-1 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Tone</Label>
                  <Select
                    value={contentSettings.tone}
                    onValueChange={(v) => setContentSettings({ ...contentSettings, tone: v })}
                  >
                    <SelectTrigger className="mt-1 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="inspiring">Inspiring</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateContent} 
                disabled={isLoading}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate Content
              </Button>

              {contentResult && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Headline</p>
                      <p className="font-semibold text-sm">{contentResult.headline}</p>
                      <Button variant="ghost" size="sm" className="h-6 px-2 mt-1" onClick={() => copyToClipboard(contentResult.headline)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {contentResult.subheadline && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Subheadline</p>
                        <p className="text-sm">{contentResult.subheadline}</p>
                        <Button variant="ghost" size="sm" className="h-6 px-2 mt-1" onClick={() => copyToClipboard(contentResult.subheadline)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {contentResult.keyPoints && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-500">Key Points</p>
                        {contentResult.keyPoints.map((point, i) => (
                          <div key={i} className="bg-slate-50 rounded-lg p-2 text-xs">
                            <p className="font-medium">{point.title}</p>
                            {point.statistic && <p className="text-purple-600">{point.statistic}</p>}
                            <p className="text-slate-500">{point.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}