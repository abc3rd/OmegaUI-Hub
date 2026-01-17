import React, { useState, useEffect, useRef } from 'react';
import { MindMap } from '@/entities/MindMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Plus, 
  Save, 
  Layers, 
  Palette,
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MIND_MAP_TEMPLATES = {
  business: {
    name: 'Business Strategy',
    icon: Target,
    color: '#2563eb',
    description: 'Strategic planning and business development',
    nodes: [
      { id: 'root', text: 'Business Strategy', x: 0, y: 0, z: 50, level: 0, color: '#2563eb', shape: 'hexagon', size: 120, animation: 'glow' },
      { id: 'market', text: 'Market Analysis', x: -300, y: -200, z: 30, level: 1, color: '#059669', shape: 'rectangle', parent_id: 'root', animation: 'pulse' },
      { id: 'product', text: 'Product Development', x: 300, y: -200, z: 30, level: 1, color: '#dc2626', shape: 'rectangle', parent_id: 'root' },
      { id: 'finance', text: 'Financial Planning', x: 0, y: 300, z: 30, level: 1, color: '#7c3aed', shape: 'rectangle', parent_id: 'root' },
      { id: 'team', text: 'Team Structure', x: -300, y: 200, z: 30, level: 1, color: '#ea580c', shape: 'rectangle', parent_id: 'root' }
    ]
  },
  creative: {
    name: 'Creative Project',
    icon: Lightbulb,
    color: '#ec4899',
    description: 'Brainstorming and creative ideation',
    nodes: [
      { id: 'root', text: 'Creative Vision', x: 0, y: 0, z: 40, level: 0, color: '#ec4899', shape: 'star', size: 130, animation: 'rotate' },
      { id: 'inspiration', text: 'Inspiration', x: -250, y: -250, z: 20, level: 1, color: '#8b5cf6', shape: 'circle', parent_id: 'root', animation: 'bounce' },
      { id: 'concepts', text: 'Concepts', x: 250, y: -250, z: 20, level: 1, color: '#06b6d4', shape: 'circle', parent_id: 'root' },
      { id: 'execution', text: 'Execution', x: 250, y: 250, z: 20, level: 1, color: '#10b981', shape: 'circle', parent_id: 'root' },
      { id: 'feedback', text: 'Feedback', x: -250, y: 250, z: 20, level: 1, color: '#f59e0b', shape: 'circle', parent_id: 'root' }
    ]
  },
  project: {
    name: 'Project Planning',
    icon: Zap,
    color: '#059669',
    description: 'Project management and workflow',
    nodes: [
      { id: 'root', text: 'Project Hub', x: 0, y: 0, z: 60, level: 0, color: '#059669', shape: 'hexagon', size: 140, animation: 'glow' },
      { id: 'planning', text: 'Planning Phase', x: -350, y: -150, z: 40, level: 1, color: '#2563eb', shape: 'rectangle', parent_id: 'root' },
      { id: 'development', text: 'Development', x: 0, y: -300, z: 40, level: 1, color: '#dc2626', shape: 'rectangle', parent_id: 'root' },
      { id: 'testing', text: 'Testing & QA', x: 350, y: -150, z: 40, level: 1, color: '#7c3aed', shape: 'rectangle', parent_id: 'root' },
      { id: 'launch', text: 'Launch', x: 0, y: 300, z: 40, level: 1, color: '#ea580c', shape: 'diamond', parent_id: 'root', animation: 'pulse' }
    ]
  },
  learning: {
    name: 'Learning Path',
    icon: Brain,
    color: '#7c3aed',
    description: 'Educational content and skill development',
    nodes: [
      { id: 'root', text: 'Learning Journey', x: 0, y: 0, z: 35, level: 0, color: '#7c3aed', shape: 'circle', size: 125, animation: 'glow' },
      { id: 'basics', text: 'Fundamentals', x: -280, y: -180, z: 25, level: 1, color: '#059669', shape: 'circle', parent_id: 'root' },
      { id: 'intermediate', text: 'Intermediate', x: 0, y: -280, z: 25, level: 1, color: '#2563eb', shape: 'circle', parent_id: 'root' },
      { id: 'advanced', text: 'Advanced', x: 280, y: -180, z: 25, level: 1, color: '#dc2626', shape: 'circle', parent_id: 'root' },
      { id: 'mastery', text: 'Mastery', x: 0, y: 280, z: 25, level: 1, color: '#f59e0b', shape: 'star', parent_id: 'root', animation: 'rotate' }
    ]
  }
};

const THEMES = {
  modern: {
    name: 'Modern',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    nodeColor: '#ffffff',
    textColor: '#1f2937'
  },
  neon: {
    name: 'Neon Cyber',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
    nodeColor: '#00ff88',
    textColor: '#ffffff'
  },
  nature: {
    name: 'Nature',
    background: 'linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #a78bfa 100%)',
    nodeColor: '#ffffff',
    textColor: '#065f46'
  },
  corporate: {
    name: 'Corporate',
    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    nodeColor: '#ffffff',
    textColor: '#1e3a8a'
  }
};

export default function MindMaps() {
  const [mindMaps, setMindMaps] = useState([]);
  const [currentMindMap, setCurrentMindMap] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('business');
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [isCreating, setIsCreating] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState('');
  const canvasRef = useRef(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadMindMaps();
  }, []);

  const loadMindMaps = async () => {
    try {
      const maps = await MindMap.list('-created_date');
      setMindMaps(maps);
    } catch (error) {
      console.error('Error loading mind maps:', error);
    }
  };

  const createFromTemplate = async () => {
    if (!newMapTitle.trim()) return;
    
    const template = MIND_MAP_TEMPLATES[selectedTemplate];
    const newMindMap = {
      title: newMapTitle,
      template: selectedTemplate,
      theme: selectedTheme,
      nodes: template.nodes.map(node => ({
        ...node,
        id: `${Date.now()}_${node.id}`
      })),
      connections: template.nodes.slice(1).map(node => ({
        from: `${Date.now()}_${node.parent_id}`,
        to: `${Date.now()}_${node.id}`,
        style: 'curved',
        color: '#6b7280',
        width: 2
      })),
      canvas_settings: {
        width: 2000,
        height: 1500,
        background: THEMES[selectedTheme].background,
        perspective: 1000
      }
    };

    try {
      const created = await MindMap.create(newMindMap);
      setCurrentMindMap(created);
      setIsCreating(false);
      setNewMapTitle('');
      loadMindMaps();
    } catch (error) {
      console.error('Error creating mind map:', error);
    }
  };

  const getNodeStyle = (node) => {
    const theme = THEMES[currentMindMap?.theme || 'modern'];
    const baseStyle = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate3d(${node.x}px, ${node.y}px, ${node.z || 0}px) translate(-50%, -50%)`,
      width: `${node.size || 100}px`,
      height: `${node.size || 100}px`,
      backgroundColor: node.color || theme.nodeColor,
      color: theme.textColor,
      borderRadius: node.shape === 'circle' ? '50%' : 
                   node.shape === 'diamond' ? '0' : '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'grab',
      userSelect: 'none',
      fontSize: `${Math.max(12, (node.size || 100) / 8)}px`,
      fontWeight: '600',
      textAlign: 'center',
      padding: '8px',
      boxShadow: `0 ${node.z || 0}px ${Math.max(20, (node.z || 0) * 2)}px rgba(0,0,0,0.3)`,
      transition: 'all 0.3s ease',
      zIndex: 10 + (node.level || 0)
    };

    if (node.shape === 'diamond') {
      baseStyle.transform += ' rotate(45deg)';
    }
    
    if (node.shape === 'star') {
      baseStyle.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    }

    if (node.animation === 'pulse') {
      baseStyle.animation = 'mindMapPulse 2s infinite';
    } else if (node.animation === 'glow') {
      baseStyle.animation = 'mindMapGlow 3s infinite alternate';
      baseStyle.boxShadow += ', 0 0 20px rgba(59, 130, 246, 0.5)';
    } else if (node.animation === 'rotate') {
      baseStyle.animation = 'mindMapRotate 4s linear infinite';
    } else if (node.animation === 'bounce') {
      baseStyle.animation = 'mindMapBounce 2s infinite';
    }

    return baseStyle;
  };

  const renderCanvas = () => {
    if (!currentMindMap) return null;

    const theme = THEMES[currentMindMap.theme];
    
    return (
      <div 
        ref={canvasRef}
        className="relative w-full h-full overflow-hidden rounded-lg"
        style={{
          background: theme.background,
          perspective: currentMindMap.canvas_settings?.perspective || 1000
        }}
      >
        <style>{`
          @keyframes mindMapPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes mindMapGlow {
            0% { filter: brightness(1) drop-shadow(0 0 5px rgba(59, 130, 246, 0.3)); }
            100% { filter: brightness(1.2) drop-shadow(0 0 15px rgba(59, 130, 246, 0.8)); }
          }
          @keyframes mindMapRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes mindMapBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>

        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {currentMindMap.connections?.map((connection, index) => {
            const fromNode = currentMindMap.nodes.find(n => n.id === connection.from);
            const toNode = currentMindMap.nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;
            
            const centerX = canvasRef.current?.clientWidth / 2 || 0;
            const centerY = canvasRef.current?.clientHeight / 2 || 0;
            
            const x1 = centerX + fromNode.x;
            const y1 = centerY + fromNode.y;
            const x2 = centerX + toNode.x;
            const y2 = centerY + toNode.y;
            
            if (connection.style === 'curved') {
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              const offset = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 0.2;
              
              return (
                <path
                  key={index}
                  d={`M ${x1} ${y1} Q ${midX} ${midY - offset} ${x2} ${y2}`}
                  stroke={connection.color || '#6b7280'}
                  strokeWidth={connection.width || 2}
                  fill="none"
                  opacity={0.7}
                />
              );
            }
            
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={connection.color || '#6b7280'}
                strokeWidth={connection.width || 2}
                opacity={0.7}
              />
            );
          })}
        </svg>

        {currentMindMap.nodes?.map(node => (
          <div
            key={node.id}
            style={getNodeStyle(node)}
          >
            <span className="relative z-10">
              {node.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Mind Maps
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              3D visual brainstorming and idea organization
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {currentMindMap && (
            <Button variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          )}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Plus className="w-4 h-4" />
                Create Mind Map
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Mind Map</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Mind Map Title</Label>
                  <Input
                    id="title"
                    value={newMapTitle}
                    onChange={(e) => setNewMapTitle(e.target.value)}
                    placeholder="Enter mind map title..."
                  />
                </div>
                
                <div>
                  <Label>Choose Template</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {Object.entries(MIND_MAP_TEMPLATES).map(([key, template]) => {
                      const Icon = template.icon;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedTemplate(key)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedTemplate === key 
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: template.color }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{template.name}</h3>
                              <p className="text-sm text-gray-500">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <Label>Visual Theme</Label>
                  <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(THEMES).map(([key, theme]) => (
                        <SelectItem key={key} value={key}>{theme.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={createFromTemplate}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!newMapTitle.trim()}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Mind Map
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {currentMindMap ? (
        <div className="flex-1 flex gap-6">
          <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
            {renderCanvas()}
          </div>
          
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={currentMindMap.theme} onValueChange={(theme) => 
                    setCurrentMindMap({...currentMindMap, theme})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(THEMES).map(([key, theme]) => (
                        <SelectItem key={key} value={key}>{theme.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Node
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Palette className="w-4 h-4 mr-2" />
                  Customize Colors
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">3D Visualization</h3>
                <p className="text-sm text-gray-600">Create stunning 3D mind maps with depth and perspective</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Animated Elements</h3>
                <p className="text-sm text-gray-600">Bring your ideas to life with smooth animations</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Smart Templates</h3>
                <p className="text-sm text-gray-600">Pre-built templates for different use cases</p>
              </CardContent>
            </Card>
          </div>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Your Mind Maps</CardTitle>
            </CardHeader>
            <CardContent>
              {mindMaps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mind maps yet</h3>
                  <p className="text-gray-500 mb-4">Create your first mind map to start organizing your ideas visually</p>
                  <Button onClick={() => setIsCreating(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Mind Map
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mindMaps.map(mindMap => (
                    <Card 
                      key={mindMap.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setCurrentMindMap(mindMap)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{mindMap.title}</h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{MIND_MAP_TEMPLATES[mindMap.template]?.name || mindMap.template}</Badge>
                          <Badge variant="secondary">{mindMap.nodes?.length || 0} nodes</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}