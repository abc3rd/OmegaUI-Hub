import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Share2, Link2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import Canvas from '../components/editor/Canvas';
import Toolbar from '../components/editor/Toolbar';
import LeftPanel from '../components/editor/LeftPanel';
import RightPanel from '../components/editor/RightPanel';
import LayersPanel from '../components/editor/LayersPanel';
import AIAssistant from '../components/editor/AIAssistant';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function EditorPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const templateId = urlParams.get('template');
  
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(1200);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [zoom, setZoom] = useState(0.75);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Load project if editing existing
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    enabled: !!projectId,
  });

  // Load templates
  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list(),
  });

  // Load template if starting from template
  const { data: templateData } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => base44.entities.Template.filter({ id: templateId }),
    enabled: !!templateId && !projectId,
  });

  useEffect(() => {
    if (project?.[0]) {
      const p = project[0];
      setProjectName(p.name);
      setCanvasWidth(p.canvas_width || 800);
      setCanvasHeight(p.canvas_height || 1200);
      setBackgroundColor(p.background_color || '#ffffff');
      if (p.canvas_data?.elements) {
        setElements(p.canvas_data.elements);
      }
    }
  }, [project]);

  useEffect(() => {
    if (templateData?.[0] && !projectId) {
      const t = templateData[0];
      setProjectName(`${t.name} - Copy`);
      setCanvasWidth(t.canvas_width || 800);
      setCanvasHeight(t.canvas_height || 1200);
      setBackgroundColor(t.background_color || '#ffffff');
      if (t.canvas_data?.elements) {
        setElements(t.canvas_data.elements);
      }
    }
  }, [templateData, projectId]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (projectId) {
        return base44.entities.Project.update(projectId, data);
      } else {
        return base44.entities.Project.create(data);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (!projectId && result?.id) {
        window.history.replaceState({}, '', `${window.location.pathname}?id=${result.id}`);
      }
      toast.success('Project saved!');
    },
    onError: () => {
      toast.error('Failed to save project');
    },
  });

  const pushHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: generateId(),
      zIndex: elements.length + 1,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedId(newElement.id);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const updateElement = useCallback((id, updates) => {
    setElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  }, []);

  const deleteElement = useCallback((id) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedId(null);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  const duplicateElement = useCallback(() => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (element) {
      addElement({
        ...element,
        x: element.x + 20,
        y: element.y + 20,
      });
    }
  }, [selectedId, elements, addElement]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveMutation.mutateAsync({
      name: projectName,
      canvas_width: canvasWidth,
      canvas_height: canvasHeight,
      background_color: backgroundColor,
      canvas_data: { elements },
      status: 'draft',
    });
    setIsSaving(false);
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    toast.info(`Preparing ${format.toUpperCase()} export...`);
    
    try {
      if (format === 'svg') {
        // Generate SVG locally for faster export
        const svgContent = generateLocalSVG();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName || 'infographic'}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('SVG exported successfully!');
      } else if (format === 'png' || format === 'jpg') {
        // Use canvas for PNG/JPG export
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Convert to data URL and download
        const dataUrl = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${projectName || 'infographic'}.${format}`;
        a.click();
        toast.success(`${format.toUpperCase()} exported successfully!`);
      } else if (format === 'pdf') {
        toast.info('PDF export coming soon!');
      }
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generateLocalSVG = () => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">`;
    svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
    
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    for (const element of sortedElements) {
      if (element.hidden) continue;
      
      switch (element.type) {
        case 'text':
          svgContent += `<text x="${element.x}" y="${element.y + (element.fontSize || 16)}" font-family="${element.fontFamily || 'Inter'}" font-size="${element.fontSize || 16}" font-weight="${element.fontWeight || 400}" fill="${element.color || '#000000'}">${element.content || ''}</text>`;
          break;
        case 'shape':
          if (element.shape === 'rectangle') {
            svgContent += `<rect x="${element.x}" y="${element.y}" width="${element.width || 100}" height="${element.height || 100}" fill="${element.fill || '#3b82f6'}" rx="${element.borderRadius || 0}" opacity="${element.opacity || 1}"/>`;
          } else if (element.shape === 'circle') {
            const cx = element.x + (element.width || 100) / 2;
            const cy = element.y + (element.height || 100) / 2;
            const r = Math.min(element.width || 100, element.height || 100) / 2;
            svgContent += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${element.fill || '#3b82f6'}" opacity="${element.opacity || 1}"/>`;
          } else if (element.shape === 'line') {
            svgContent += `<line x1="${element.x}" y1="${element.y}" x2="${element.x + (element.width || 200)}" y2="${element.y}" stroke="${element.stroke || '#000000'}" stroke-width="${element.strokeWidth || 2}"/>`;
          }
          break;
        case 'image':
          svgContent += `<image href="${element.src}" x="${element.x}" y="${element.y}" width="${element.width || 200}" height="${element.height || 200}" preserveAspectRatio="xMidYMid slice"/>`;
          break;
      }
    }
    
    svgContent += '</svg>';
    return svgContent;
  };

  const handleAlignH = (alignment) => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    let newX = element.x;
    switch (alignment) {
      case 'left':
        newX = 0;
        break;
      case 'center':
        newX = (canvasWidth - (element.width || 100)) / 2;
        break;
      case 'right':
        newX = canvasWidth - (element.width || 100);
        break;
    }
    updateElement(selectedId, { x: newX });
  };

  const handleAlignV = (alignment) => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    let newY = element.y;
    switch (alignment) {
      case 'top':
        newY = 0;
        break;
      case 'middle':
        newY = (canvasHeight - (element.height || 100)) / 2;
        break;
      case 'bottom':
        newY = canvasHeight - (element.height || 100);
        break;
    }
    updateElement(selectedId, { y: newY });
  };

  const bringForward = () => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;
    const maxZ = Math.max(...elements.map(el => el.zIndex || 0));
    updateElement(selectedId, { zIndex: maxZ + 1 });
  };

  const sendBackward = () => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;
    const minZ = Math.min(...elements.map(el => el.zIndex || 0));
    updateElement(selectedId, { zIndex: minZ - 1 });
  };

  const applyTemplate = (template) => {
    if (template.canvas_data?.elements) {
      setElements(template.canvas_data.elements);
      setCanvasWidth(template.canvas_width || 800);
      setCanvasHeight(template.canvas_height || 1200);
      setBackgroundColor(template.background_color || '#ffffff');
      pushHistory(template.canvas_data.elements);
      toast.success('Template applied!');
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedId) {
        deleteElement(selectedId);
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        }
        if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
        if (e.key === 'd' && selectedId) {
          e.preventDefault();
          duplicateElement();
        }
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteElement, handleUndo, handleRedo, duplicateElement]);

  if (projectLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4">
        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-64 h-9 font-medium border-transparent hover:border-slate-200 focus:border-slate-300"
        />
      </div>

      {/* Toolbar */}
      <Toolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onExport={handleExport}
        onShare={() => setShowShareDialog(true)}
        selectedElement={selectedElement}
        onDelete={() => selectedId && deleteElement(selectedId)}
        onDuplicate={duplicateElement}
        onAlignH={handleAlignH}
        onAlignV={handleAlignV}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSaving={isSaving}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel
          onAddElement={addElement}
          templates={templates}
          onApplyTemplate={applyTemplate}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas
            elements={elements.filter(el => !el.hidden)}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={updateElement}
            width={canvasWidth}
            height={canvasHeight}
            backgroundColor={backgroundColor}
            zoom={zoom}
            canvasRef={canvasRef}
          />
          
          <LayersPanel
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={deleteElement}
            onReorder={() => {}}
            onToggleVisibility={(id) => {
              const el = elements.find(e => e.id === id);
              if (el) updateElement(id, { hidden: !el.hidden });
            }}
            onToggleLock={(id) => {
              const el = elements.find(e => e.id === id);
              if (el) updateElement(id, { locked: !el.locked });
            }}
          />
        </div>

        <RightPanel
          selectedElement={selectedElement}
          onUpdateElement={updateElement}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          backgroundColor={backgroundColor}
          onUpdateCanvas={({ width, height, backgroundColor: bg }) => {
            if (width) setCanvasWidth(width);
            if (height) setCanvasHeight(height);
            if (bg) setBackgroundColor(bg);
          }}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
        />
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={window.location.href}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowShareDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}