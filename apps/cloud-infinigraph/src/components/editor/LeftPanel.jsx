import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Type,
  Square,
  Circle,
  Minus,
  Image,
  LayoutTemplate,
  Shapes,
  BarChart3,
  Search,
  Upload,
  Star,
  Briefcase,
  Users,
  TrendingUp,
  Settings,
  Heart,
  Zap,
  Target,
  Award,
  Lightbulb,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';

const iconCategories = {
  business: [
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Target', icon: Target },
    { name: 'Award', icon: Award },
    { name: 'TrendingUp', icon: TrendingUp },
    { name: 'DollarSign', icon: DollarSign },
    { name: 'Percent', icon: Percent },
  ],
  social: [
    { name: 'Users', icon: Users },
    { name: 'Heart', icon: Heart },
    { name: 'Star', icon: Star },
    { name: 'Globe', icon: Globe },
    { name: 'Mail', icon: Mail },
    { name: 'Phone', icon: Phone },
  ],
  general: [
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'Rocket', icon: Rocket },
    { name: 'Zap', icon: Zap },
    { name: 'CheckCircle2', icon: CheckCircle2 },
    { name: 'Settings', icon: Settings },
    { name: 'Activity', icon: Activity },
  ],
  arrows: [
    { name: 'ArrowRight', icon: ArrowRight },
    { name: 'ArrowUp', icon: ArrowUp },
  ],
  time: [
    { name: 'Calendar', icon: Calendar },
    { name: 'Clock', icon: Clock },
    { name: 'MapPin', icon: MapPin },
  ],
  charts: [
    { name: 'BarChart3', icon: BarChart3 },
    { name: 'PieChart', icon: PieChart },
    { name: 'LineChart', icon: LineChart },
  ]
};

const shapes = [
  { name: 'Rectangle', shape: 'rectangle', icon: Square },
  { name: 'Circle', shape: 'circle', icon: Circle },
  { name: 'Line', shape: 'line', icon: Minus },
];

export default function LeftPanel({ onAddElement, templates, onApplyTemplate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIconCategory, setActiveIconCategory] = useState('business');

  const addText = (preset) => {
    const presets = {
      heading: { fontSize: 48, fontWeight: 700, content: 'Heading' },
      subheading: { fontSize: 32, fontWeight: 600, content: 'Subheading' },
      body: { fontSize: 16, fontWeight: 400, content: 'Body text goes here' },
      caption: { fontSize: 12, fontWeight: 400, content: 'Caption text' },
    };
    
    onAddElement({
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      ...presets[preset],
      color: '#000000',
      fontFamily: 'Inter',
    });
  };

  const addShape = (shape) => {
    onAddElement({
      type: 'shape',
      shape,
      x: 100,
      y: 100,
      width: shape === 'line' ? 200 : 100,
      height: shape === 'line' ? 2 : 100,
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 0,
      borderRadius: 0,
    });
  };

  const addIcon = (IconComponent, name) => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getIconPath(name)}</svg>`;
    
    onAddElement({
      type: 'icon',
      x: 100,
      y: 100,
      width: 48,
      height: 48,
      svgContent: svgString,
      color: '#000000',
      name,
    });
  };

  const getIconPath = (name) => {
    const paths = {
      Briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
      Target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      Award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
      TrendingUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
      Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
      Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      Globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
      Lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
      Rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
      Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      CheckCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
      Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
      DollarSign: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
      Percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
      Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
      Phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
      Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
      Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      MapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
      ArrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
      ArrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
      BarChart3: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
      PieChart: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
      LineChart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
      Activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    };
    return paths[name] || '';
  };

  const [isUploading, setIsUploading] = useState(false);
  
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Upload to server using base44 integration
        const { base44 } = await import('@/api/base44Client');
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        onAddElement({
          type: 'image',
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          src: file_url,
          objectFit: 'cover',
          borderRadius: 0,
        });
      } catch (error) {
        // Fallback to local data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          onAddElement({
            type: 'image',
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            src: event.target.result,
            objectFit: 'cover',
            borderRadius: 0,
          });
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="elements" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-4 py-3"
          >
            Elements
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-4 py-3"
          >
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Text */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Text</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => addText('heading')} className="justify-start gap-2 h-10">
                    <Type className="h-4 w-4" />
                    Heading
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addText('subheading')} className="justify-start gap-2 h-10">
                    <Type className="h-3 w-3" />
                    Subhead
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addText('body')} className="justify-start gap-2 h-10">
                    <Type className="h-3 w-3" />
                    Body
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addText('caption')} className="justify-start gap-2 h-10">
                    <Type className="h-2 w-2" />
                    Caption
                  </Button>
                </div>
              </div>

              {/* Shapes */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Shapes</h3>
                <div className="grid grid-cols-3 gap-2">
                  {shapes.map(({ name, shape, icon: Icon }) => (
                    <Button
                      key={shape}
                      variant="outline"
                      size="sm"
                      onClick={() => addShape(shape)}
                      className="h-16 flex-col gap-1"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Icons</h3>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search icons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex gap-1 flex-wrap mb-3">
                  {Object.keys(iconCategories).map((cat) => (
                    <Button
                      key={cat}
                      variant={activeIconCategory === cat ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveIconCategory(cat)}
                      className="h-7 text-xs capitalize"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {iconCategories[activeIconCategory]
                    .filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(({ name, icon: Icon }) => (
                      <Button
                        key={name}
                        variant="outline"
                        size="icon"
                        onClick={() => addIcon(Icon, name)}
                        className="h-12 w-12"
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Images</h3>
                <label className="cursor-pointer">
                  <div className={`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors ${isUploading ? 'opacity-50' : ''}`}>
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-2"></div>
                        <p className="text-sm text-slate-600">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">Upload Image</p>
                        <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Charts */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Charts</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onAddElement({
                      type: 'chart',
                      chartType: 'bar',
                      x: 100,
                      y: 100,
                      width: 300,
                      height: 200,
                      chartData: [
                        { name: 'Q1', value: 40 },
                        { name: 'Q2', value: 65 },
                        { name: 'Q3', value: 50 },
                        { name: 'Q4', value: 80 },
                      ],
                    })}
                    className="justify-start gap-2 h-10"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Bar Chart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAddElement({
                      type: 'chart',
                      chartType: 'pie',
                      x: 100,
                      y: 100,
                      width: 200,
                      height: 200,
                      chartData: [
                        { name: 'Category A', value: 35 },
                        { name: 'Category B', value: 25 },
                        { name: 'Category C', value: 20 },
                        { name: 'Category D', value: 20 },
                      ],
                    })}
                    className="justify-start gap-2 h-10"
                  >
                    <PieChart className="h-4 w-4" />
                    Pie Chart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAddElement({
                      type: 'chart',
                      chartType: 'line',
                      x: 100,
                      y: 100,
                      width: 300,
                      height: 200,
                      chartData: [
                        { name: 'Jan', value: 20 },
                        { name: 'Feb', value: 35 },
                        { name: 'Mar', value: 28 },
                        { name: 'Apr', value: 45 },
                        { name: 'May', value: 55 },
                      ],
                    })}
                    className="justify-start gap-2 h-10"
                  >
                    <LineChart className="h-4 w-4" />
                    Line Chart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAddElement({
                      type: 'chart',
                      chartType: 'pie',
                      donut: true,
                      x: 100,
                      y: 100,
                      width: 200,
                      height: 200,
                      chartData: [
                        { name: 'Segment 1', value: 40 },
                        { name: 'Segment 2', value: 30 },
                        { name: 'Segment 3', value: 30 },
                      ],
                    })}
                    className="justify-start gap-2 h-10"
                  >
                    <Activity className="h-4 w-4" />
                    Donut Chart
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search templates..." className="pl-9 h-9" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {templates?.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => onApplyTemplate(template)}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden mb-2 border border-slate-200 group-hover:border-slate-400 transition-colors">
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <LayoutTemplate className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate">{template.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{template.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}