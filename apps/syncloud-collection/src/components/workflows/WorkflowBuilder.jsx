import React, { useState, useCallback } from 'react';
import { Workflow } from '@/entities/Workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import NodeEditor from './NodeEditor';
import WorkflowCanvas from './WorkflowCanvas';

const generateUniqueId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function WorkflowBuilder({ workflow, onClose, onSave }) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [nodes, setNodes] = useState(() => {
    if (workflow?.trigger && workflow?.actions) {
      const triggerNode = {
        id: 'trigger',
        type: 'trigger',
        data: workflow.trigger,
        position: { x: 100, y: 100 }
      };
      
      const actionNodes = workflow.actions.map((action, index) => ({
        id: action.id || generateUniqueId(),
        type: 'action',
        data: action,
        position: { x: 100 + (index + 1) * 300, y: 100 }
      }));
      
      return [triggerNode, ...actionNodes];
    }
    
    return [{
      id: 'trigger',
      type: 'trigger', 
      data: { type: 'manual', config: {} },
      position: { x: 100, y: 100 }
    }];
  });
  
  const [connections, setConnections] = useState(() => {
    if (workflow?.actions?.length) {
      const conns = [{ from: 'trigger', to: workflow.actions[0].id || generateUniqueId() }];
      for (let i = 0; i < workflow.actions.length - 1; i++) {
        conns.push({
          from: workflow.actions[i].id || generateUniqueId(),
          to: workflow.actions[i + 1].id || generateUniqueId()
        });
      }
      return conns;
    }
    return [];
  });
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isSaving, setIsSaving] = useState(false);

  const updateNode = useCallback((nodeId, newData) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, data: newData } : node
    ));
  }, []);

  const addNode = useCallback((afterNodeId, nodeType = 'action') => {
    const afterNode = nodes.find(n => n.id === afterNodeId);
    if (!afterNode) return;

    const newNode = {
      id: generateUniqueId(),
      type: nodeType,
      data: nodeType === 'action' ? { type: 'send_email', config: {} } : { type: 'manual', config: {} },
      position: { 
        x: afterNode.position.x + 300, 
        y: afterNode.position.y 
      }
    };

    setNodes(prev => [...prev, newNode]);
    
    // Update connections
    const existingConnection = connections.find(c => c.from === afterNodeId);
    if (existingConnection) {
      setConnections(prev => prev.map(conn => 
        conn.from === afterNodeId 
          ? { ...conn, to: newNode.id }
          : conn
      ).concat({ from: newNode.id, to: existingConnection.to }));
    } else {
      setConnections(prev => [...prev, { from: afterNodeId, to: newNode.id }]);
    }
  }, [nodes, connections]);

  const deleteNode = useCallback((nodeId) => {
    if (nodeId === 'trigger') return; // Can't delete trigger
    
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  }, []);

  const moveNode = useCallback((nodeId, newPosition) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  }, []);

  const resetCanvas = () => {
    setCanvasTransform({ x: 0, y: 0, scale: 1 });
  };

  const zoomIn = () => {
    setCanvasTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  };

  const zoomOut = () => {
    setCanvasTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.3) }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Workflow name is required.');
      return;
    }

    const triggerNode = nodes.find(n => n.type === 'trigger');
    const actionNodes = nodes.filter(n => n.type === 'action')
      .sort((a, b) => a.position.x - b.position.x);

    if (!triggerNode) {
      toast.error('A trigger is required.');
      return;
    }

    setIsSaving(true);
    const workflowData = {
      name,
      description,
      trigger: triggerNode.data,
      actions: actionNodes.map(n => n.data),
      is_active: workflow?.is_active || false,
    };

    try {
      if (workflow?.id) {
        await Workflow.update(workflow.id, workflowData);
        toast.success('Workflow updated successfully!');
      } else {
        await Workflow.create(workflowData);
        toast.success('Workflow created successfully!');
      }
      onSave();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{workflow ? 'Edit Workflow' : 'Create Workflow'}</h1>
            <p className="text-sm text-muted-foreground">Visual workflow builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetCanvas}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset View
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card p-4 overflow-y-auto">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Workflow Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="workflow-name" className="text-sm">Name</Label>
                  <Input 
                    id="workflow-name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Automation"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-description" className="text-sm">Description</Label>
                  <Textarea 
                    id="workflow-description"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this workflow do?"
                    className="mt-1 h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {selectedNode && (
              <NodeEditor 
                node={selectedNode}
                onUpdate={(data) => updateNode(selectedNode.id, data)}
                onDelete={() => deleteNode(selectedNode.id)}
              />
            )}

            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Canvas Tips:</p>
                  <ul className="space-y-1">
                    <li>• Click nodes to select and edit</li>
                    <li>• Drag nodes to reposition</li>
                    <li>• Use + buttons to add next steps</li>
                    <li>• Use placeholders like {'{{trigger.data.email}}'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
          <WorkflowCanvas
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onMoveNode={moveNode}
            onAddNode={addNode}
            onDeleteNode={deleteNode}
            transform={canvasTransform}
            onTransformChange={setCanvasTransform}
          />
        </div>
      </div>
    </div>
  );
}