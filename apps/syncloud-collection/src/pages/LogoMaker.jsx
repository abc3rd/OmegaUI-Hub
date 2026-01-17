import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Square, Circle, Triangle, Type, Download, Undo, Redo, Trash2, Copy, Save, FolderOpen, Layers, Eye, EyeOff, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, PanelLeft, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { LogoDesign } from '@/entities/LogoDesign';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Sortable Layer Item Component
const SortableLayerItem = ({ id, element, index, isSelected, onSelect, onVisibilityToggle }) => {

  const icons = {
    rectangle: <Square className="w-4 h-4" />,
    circle: <Circle className="w-4 h-4" />,
    triangle: <Triangle className="w-4 h-4" />,
    text: <Type className="w-4 h-4" />,
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelect(element)}
          className={`flex items-center gap-2 p-2 rounded-md cursor-grab ${
            isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-accent'
          } ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
      {icons[element.type] || <Square className="w-4 h-4" />}
      <span className="flex-1 truncate">{element.text || element.type}</span>
      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onVisibilityToggle(element.id);
        }}
      >
        {element.visible === false ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4" />}
      </Button>
    </div>
      )}
    </Draggable>
  );
};

// Moved templates object outside the component to prevent re-renders
const templates = {
  barChart: [
    { id: '3', type: 'rectangle', x: 520, y: 200, width: 80, height: 450, color: '#fbbc04', cornerRadius: 20, rotation: 0, visible: true },
    { id: '2', type: 'rectangle', x: 360, y: 350, width: 80, height: 300, color: '#34a853', cornerRadius: 20, rotation: 0, visible: true },
    { id: '1', type: 'rectangle', x: 200, y: 450, width: 80, height: 200, color: '#4285f4', cornerRadius: 20, rotation: 0, visible: true },
  ]
};

export default function LogoMaker() {
  const canvasRef = useRef(null);
  const dragInfoRef = useRef({});

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [savedDesigns, setSavedDesigns] = useState([]);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [saveDesignName, setSaveDesignName] = useState('');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // --- Drawing Logic ---
  const drawRoundedRect = useCallback((ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    [...elements].reverse().forEach(element => {
      if (element.visible === false) return;

      ctx.save();
      ctx.globalAlpha = element.opacity ?? 1;
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate(element.rotation * Math.PI / 180);

      ctx.fillStyle = element.color || '#000000';
      ctx.strokeStyle = element.strokeColor || 'transparent';
      ctx.lineWidth = element.strokeWidth || 0;

      const x = -element.width / 2;
      const y = -element.height / 2;

      if (element.type === 'rectangle') {
        if ((element.cornerRadius || 0) > 0) {
          drawRoundedRect(ctx, x, y, element.width, element.height, element.cornerRadius);
        } else {
          ctx.fillRect(x, y, element.width, element.height);
          ctx.strokeRect(x, y, element.width, element.height);
        }
      } else if (element.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, element.width / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (element.type === 'text') {
        ctx.fillStyle = element.color;
        ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.text || 'Text', 0, 0);
      }
      
      ctx.restore();
    });

    if (selectedElement && selectedElement.visible !== false) {
      const el = selectedElement;
      ctx.save();
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate(el.rotation * Math.PI / 180);
      
      const x = -el.width / 2;
      const y = -el.height / 2;
      
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x - 2, y - 2, el.width + 4, el.height + 4);
      ctx.setLineDash([]);
      ctx.restore();
    }
  }, [elements, backgroundColor, canvasSize, selectedElement, drawRoundedRect]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);
  
  // --- History Management ---
  const commitChanges = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    if (JSON.stringify(newHistory[historyIndex]) !== JSON.stringify(newElements)) {
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);
  
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setElements(history[newIndex]);
      setHistoryIndex(newIndex);
      setSelectedElement(null);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setElements(history[newIndex]);
      setHistoryIndex(newIndex);
      setSelectedElement(null);
    }
  };

  // --- Element & Canvas Interaction ---
  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedElement = [...elements].find(el => 
      el.visible !== false &&
      x >= el.x && x <= el.x + el.width &&
      y >= el.y && y <= el.y + el.height
    );

    setSelectedElement(clickedElement || null);

    if (clickedElement) {
      dragInfoRef.current = {
        isDragging: true,
        startX: x,
        startY: y,
        elementStartX: clickedElement.x,
        elementStartY: clickedElement.y,
      };
    } else {
        dragInfoRef.current = { isDragging: false };
    }

    canvasRef.current.addEventListener('mousemove', handleCanvasMouseMove);
    canvasRef.current.addEventListener('mouseup', handleCanvasMouseUp);
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragInfoRef.current.isDragging || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragInfoRef.current.startX;
    const dy = y - dragInfoRef.current.startY;

    const newX = dragInfoRef.current.elementStartX + dx;
    const newY = dragInfoRef.current.elementStartY + dy;

    updateElement(selectedElement.id, { x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    if (dragInfoRef.current.isDragging) {
        commitChanges(elements);
    }
    dragInfoRef.current = { isDragging: false };
    canvasRef.current.removeEventListener('mousemove', handleCanvasMouseMove);
    canvasRef.current.removeEventListener('mouseup', handleCanvasMouseUp);
  };

  const updateElement = (id, updates) => {
    let newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(newElements);
    if(selectedElement?.id === id) {
        setSelectedElement(prev => ({...prev, ...updates}));
    }
  };
  
  // --- Element Management ---
  const addElement = (type) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      width: 100,
      height: 100,
      color: '#4285f4',
      rotation: 0,
      visible: true,
      ...(type === 'rectangle' && { cornerRadius: 10 }),
      ...(type === 'text' && { text: 'Text', fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold' })
    };
    const newElements = [newElement, ...elements];
    setElements(newElements);
    setSelectedElement(newElement);
    commitChanges(newElements);
  };

  const updateSelectedElement = (updates) => {
    if (!selectedElement) return;
    updateElement(selectedElement.id, updates);
  };
  
  const handlePropertyChangeComplete = () => {
    commitChanges(elements);
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    const newElements = elements.filter(el => el.id !== selectedElement.id);
    setElements(newElements);
    setSelectedElement(null);
    commitChanges(newElements);
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement) return;
    const duplicate = {
      ...selectedElement,
      id: Date.now().toString(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };
    const newElements = [duplicate, ...elements];
    setElements(newElements);
    setSelectedElement(duplicate);
    commitChanges(newElements);
  };
  
  const centerElement = (axis) => {
    if (!selectedElement) return;
    let updates = {};
    if (axis === 'horizontal') {
      updates.x = (canvasSize.width - selectedElement.width) / 2;
    }
    if (axis === 'vertical') {
      updates.y = (canvasSize.height - selectedElement.height) / 2;
    }
    updateSelectedElement(updates);
    handlePropertyChangeComplete();
  };
  
  const toggleVisibility = (id) => {
    const newElements = elements.map(el => {
      if (el.id === id) {
        return { ...el, visible: el.visible === false ? true : false };
      }
      return el;
    });
    setElements(newElements);
    commitChanges(newElements);
  }
  
  // --- Save/Load Logic ---
  const fetchSavedDesigns = async () => {
    try {
      const designs = await LogoDesign.list();
      setSavedDesigns(designs);
    } catch (e) {
      toast.error("Failed to fetch saved designs.");
    }
  };

  const handleSaveDesign = async () => {
    if (!saveDesignName) {
      toast.error("Please enter a name for your design.");
      return;
    }
    try {
      await LogoDesign.create({
        name: saveDesignName,
        design_data: {
          elements,
          canvasSize,
          backgroundColor
        }
      });
      toast.success(`Design "${saveDesignName}" saved successfully!`);
      setSaveDesignName('');
    } catch (e) {
      toast.error("Failed to save design.");
    }
  };

  const handleLoadDesign = (design) => {
    const { elements, canvasSize, backgroundColor } = design.design_data;
    setElements(elements);
    setCanvasSize(canvasSize);
    setBackgroundColor(backgroundColor);
    setSelectedElement(null);
    commitChanges(elements);
    setIsLoadDialogOpen(false);
    toast.success(`Design "${design.name}" loaded.`);
  };

  const loadTemplate = useCallback((templateName) => {
    const templateElements = templates[templateName];
    setElements(templateElements);
    setSelectedElement(null);
    commitChanges(templateElements);
    toast.success(`Template "${templateName}" loaded!`);
  }, [commitChanges]); // 'templates' is now a constant outside the component, no need for it in dependencies.

  // --- Drag and Drop for Layers ---
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setElements(items);
    commitChanges(items);
  };

  // --- Export ---
  const exportLogo = (format = 'png') => {
    setSelectedElement(null);
    setTimeout(() => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `logo-${canvasSize.width}x${canvasSize.height}.${format}`;
        if (format === 'png') {
            link.href = canvas.toDataURL('image/png');
        } else if (format === 'jpg') {
            link.href = canvas.toDataURL('image/jpeg', 0.95);
        }
        link.click();
        toast.success(`Logo exported as ${format.toUpperCase()}!`);
    }, 100);
  };
  
  useEffect(() => {
    // Initialize with a template if canvas is empty
    if (elements.length === 0) {
      loadTemplate('barChart');
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      } else {
        setIsLeftSidebarOpen(true);
        setIsRightSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [elements.length, loadTemplate]);

  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}>
            <PanelLeft />
          </Button>
          <h1 className="text-lg font-bold">Logo Maker Pro</h1>
        </div>
        <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Your Design</DialogTitle>
                  <DialogDescription>
                    Enter a name for your design to save it for later.
                  </DialogDescription>
                </DialogHeader>
                <Input 
                  placeholder="e.g. My Awesome Logo" 
                  value={saveDesignName}
                  onChange={(e) => setSaveDesignName(e.target.value)}
                />
                <DialogFooter>
                  <Button onClick={handleSaveDesign}>Save Design</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => {
                  fetchSavedDesigns();
                  setIsLoadDialogOpen(true);
                }}>
                  <FolderOpen className="w-4 h-4 mr-2" /> Load
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Load a Design</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto space-y-2 p-1">
                  {savedDesigns.length > 0 ? (
                    savedDesigns.map(design => (
                      <div key={design.id} onClick={() => handleLoadDesign(design)} className="p-3 rounded-lg hover:bg-accent cursor-pointer flex justify-between items-center">
                        <span>{design.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(design.created_date).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No saved designs found.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className={`w-72 bg-card border-r border-border p-4 overflow-y-auto space-y-4 transition-all absolute md:relative h-full z-10 ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Elements</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => addElement('rectangle')} className="flex-col h-16 gap-1"><Square className="w-5 h-5" />Rectangle</Button>
              <Button variant="outline" onClick={() => addElement('circle')} className="flex-col h-16 gap-1"><Circle className="w-5 h-5" />Circle</Button>
              <Button variant="outline" onClick={() => addElement('text')} className="flex-col h-16 gap-1"><Type className="w-5 h-5" />Text</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Templates</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={() => loadTemplate('barChart')} className="w-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 text-white">Bar Chart Logo</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Export</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => exportLogo('png')} className="w-full"><Download className="w-4 h-4 mr-2" />Export PNG</Button>
              <Button onClick={() => exportLogo('jpg')} variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" />Export JPG</Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col bg-muted/40">
          <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0}><Undo className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}><Redo className="w-4 h-4" /></Button>
            </div>
            <div className='flex items-center gap-2'>
                <Button variant="ghost" size="icon" onClick={() => centerElement('horizontal')} disabled={!selectedElement}><AlignHorizontalJustifyCenter className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => centerElement('vertical')} disabled={!selectedElement}><AlignVerticalJustifyCenter className="w-4 h-4" /></Button>
            </div>
            <span className="text-sm text-muted-foreground">{canvasSize.width}×{canvasSize.height}</span>
            <div className="flex items-center gap-1 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}>
                <Pencil />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleCanvasMouseDown}
              className="bg-white shadow-lg cursor-crosshair"
            />
          </div>
        </main>

        {/* Right Properties Panel */}
        <aside className={`w-80 bg-card border-l border-border p-4 overflow-y-auto space-y-4 transition-all absolute right-0 md:relative h-full z-10 ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers/> Layers</CardTitle></CardHeader>
            <CardContent className='space-y-1'>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="layers">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {elements.map((el, index) => (
                        <SortableLayerItem 
                          key={el.id} 
                          id={el.id} 
                          element={el} 
                          index={index}
                          isSelected={selectedElement?.id === el.id} 
                          onSelect={setSelectedElement} 
                          onVisibilityToggle={toggleVisibility}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
          {selectedElement ? (
            <Card>
              <CardHeader className='flex-row items-center justify-between'>
                <CardTitle className="text-sm">Properties</CardTitle>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={duplicateSelectedElement} className="w-6 h-6"><Copy className="w-3 h-3"/></Button>
                    <Button variant="ghost" size="icon" onClick={deleteSelectedElement} className="w-6 h-6"><Trash2 className="w-3 h-3 text-destructive"/></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>X</Label><Input type="number" value={Math.round(selectedElement.x)} onChange={e => updateSelectedElement({ x: parseInt(e.target.value) || 0 })} onBlur={handlePropertyChangeComplete}/></div>
                  <div><Label>Y</Label><Input type="number" value={Math.round(selectedElement.y)} onChange={e => updateSelectedElement({ y: parseInt(e.target.value) || 0 })} onBlur={handlePropertyChangeComplete}/></div>
                  <div><Label>Width</Label><Input type="number" value={Math.round(selectedElement.width)} onChange={e => updateSelectedElement({ width: parseInt(e.target.value) || 0 })} onBlur={handlePropertyChangeComplete}/></div>
                  <div><Label>Height</Label><Input type="number" value={Math.round(selectedElement.height)} onChange={e => updateSelectedElement({ height: parseInt(e.target.value) || 0 })} onBlur={handlePropertyChangeComplete}/></div>
                </div>
                 <div>
                  <Label>Rotation: {selectedElement.rotation || 0}°</Label>
                  <Slider value={[selectedElement.rotation || 0]} onValueChange={([value]) => updateSelectedElement({ rotation: value })} onValueChangeEnd={handlePropertyChangeComplete} max={360} min={0} step={1} />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={selectedElement.color} onChange={e => updateSelectedElement({ color: e.target.value })} onBlur={handlePropertyChangeComplete} className="w-8 h-8"/>
                    <Input value={selectedElement.color} onChange={e => updateSelectedElement({ color: e.target.value })} onBlur={handlePropertyChangeComplete}/>
                  </div>
                </div>
                {selectedElement.type === 'rectangle' && (
                  <div>
                    <Label>Corner Radius: {selectedElement.cornerRadius || 0}</Label>
                    <Slider value={[selectedElement.cornerRadius || 0]} onValueChange={([value]) => updateSelectedElement({ cornerRadius: value })} onValueChangeEnd={handlePropertyChangeComplete} max={100} min={0} step={1} />
                  </div>
                )}
                {selectedElement.type === 'text' && (
                  <>
                    <div><Label>Text</Label><Input value={selectedElement.text || ''} onChange={e => updateSelectedElement({ text: e.target.value })} onBlur={handlePropertyChangeComplete}/></div>
                    <div className='grid grid-cols-2 gap-2'>
                        <div><Label>Font Size</Label><Input type="number" value={selectedElement.fontSize || 24} onChange={e => updateSelectedElement({ fontSize: parseInt(e.target.value) || 24 })} onBlur={handlePropertyChangeComplete}/></div>
                        <div>
                            <Label>Font Weight</Label>
                            <Select value={selectedElement.fontWeight || 'normal'} onValueChange={value => { updateSelectedElement({ fontWeight: value }); handlePropertyChangeComplete(); }}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                                <SelectItem value="lighter">Lighter</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm">Canvas Properties</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-2">
                    <div><Label>Width</Label><Input type="number" value={canvasSize.width} onChange={e => setCanvasSize(cs => ({...cs, width: parseInt(e.target.value) || 1}))}/></div>
                    <div><Label>Height</Label><Input type="number" value={canvasSize.height} onChange={e => setCanvasSize(cs => ({...cs, height: parseInt(e.target.value) || 1}))}/></div>
                </div>
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-8 h-8"/>
                    <Input value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}