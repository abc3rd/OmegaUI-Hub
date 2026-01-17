import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, Zap, Mail, CheckSquare, Users, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeIcons = {
  trigger: Play,
  send_email: Mail,
  create_task: CheckSquare,
  create_lead: Users,
  default: Zap
};

const WorkflowNode = ({ node, isSelected, onSelect, onMove, onAddNode, onDelete, canDelete = true }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
    onSelect(node);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    onMove(node.id, newPosition);
  }, [isDragging, dragStart, node.id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const IconComponent = nodeIcons[node.data?.type] || nodeIcons.default;
  const nodeTitle = node.type === 'trigger' ? 
    (node.data?.type === 'manual' ? 'Manual Trigger' : `${node.data?.type?.replace('_', ' ') || 'Trigger'}`) :
    (node.data?.type?.replace('_', ' ') || 'Action');

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute group cursor-move",
        isDragging && "z-50"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={cn(
        "bg-white dark:bg-slate-800 border-2 rounded-lg p-4 shadow-lg min-w-[200px]",
        isSelected ? "border-blue-500 shadow-blue-200" : "border-slate-200 dark:border-slate-700",
        "hover:shadow-xl transition-all duration-200"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            node.type === 'trigger' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
          )}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm capitalize">{nodeTitle}</h3>
            <p className="text-xs text-muted-foreground">
              {node.type === 'trigger' ? 'Starts the workflow' : 'Performs an action'}
            </p>
          </div>
          {canDelete && node.id !== 'trigger' && (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </Button>
          )}
        </div>
        
        {node.data?.config && Object.keys(node.data.config).length > 0 && (
          <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 p-2 rounded">
            {Object.entries(node.data.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="font-medium">{key}:</span> {String(value).substring(0, 20)}
                {String(value).length > 20 && '...'}
              </div>
            ))}
            {Object.keys(node.data.config).length > 2 && (
              <div className="text-slate-400">+{Object.keys(node.data.config).length - 2} more...</div>
            )}
          </div>
        )}
      </div>

      {/* Add Node Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onAddNode(node.id);
        }}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

const ConnectionLine = ({ from, to, nodes }) => {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);
  
  if (!fromNode || !toNode) return null;

  const fromX = fromNode.position.x + 200; // Node width
  const fromY = fromNode.position.y + 50; // Half node height
  const toX = toNode.position.x;
  const toY = toNode.position.y + 50;

  const midX = (fromX + toX) / 2;

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#3b82f6"
          />
        </marker>
      </defs>
      <path
        d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="drop-shadow-sm"
      />
    </svg>
  );
};

export default function WorkflowCanvas({ 
  nodes, 
  connections, 
  selectedNode, 
  onSelectNode, 
  onMoveNode, 
  onAddNode, 
  onDeleteNode, 
  transform, 
  onTransformChange 
}) {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y
      });
      onSelectNode(null); // Deselect nodes when clicking canvas
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isPanning) return;
    onTransformChange(prev => ({
      ...prev,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    }));
  }, [isPanning, panStart, onTransformChange]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      onTransformChange(prev => ({
        ...prev,
        scale: Math.max(0.3, Math.min(3, prev.scale * scaleFactor))
      }));
    }
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden cursor-move select-none relative"
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      style={{
        backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: `${transform.x % 20}px ${transform.y % 20}px`
      }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Render connections first (behind nodes) */}
        {connections.map((connection, index) => (
          <ConnectionLine
            key={`${connection.from}-${connection.to}-${index}`}
            from={connection.from}
            to={connection.to}
            nodes={nodes}
          />
        ))}

        {/* Render nodes */}
        {nodes.map(node => (
          <WorkflowNode
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={onSelectNode}
            onMove={onMoveNode}
            onAddNode={onAddNode}
            onDelete={onDeleteNode}
            canDelete={node.id !== 'trigger'}
          />
        ))}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Start Building</h3>
              <p className="text-muted-foreground mb-4">Click the trigger to begin your automation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}