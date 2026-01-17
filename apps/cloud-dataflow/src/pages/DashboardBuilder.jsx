
import React, { useState, useEffect, useCallback } from "react";
import { Dashboard as DashboardEntity } from "@/entities/all";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Save,
  Eye,
  Edit3,
  Trash2,
  Expand,
  Shrink,
  GripVertical,
  X, 
  Filter as FilterIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AddWidgetDialog from "@/components/dashboard/AddWidgetDialog";
import DashboardWidget from "@/components/dashboard/DashboardWidget";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export default function DashboardBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const dashboardId = urlParams.get("id");
  const viewMode = urlParams.get("view") === "true";

  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [role, setRole] = useState("viewer");
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingWidget, setDeletingWidget] = useState(null);
  const [filters, setFilters] = useState([]);

  const loadDashboard = useCallback(async () => {
    if (!dashboardId) return;
    const db = await DashboardEntity.get(dashboardId);
    setDashboard(db);
    // Ensure all widgets have a position object with width
    setWidgets(db?.widgets?.map(w => ({
      ...w,
      position: { w: 6, h: 4, ...w.position } // Default to half-width (6/12 columns)
    })) || []);
  }, [dashboardId]);

  useEffect(() => {
    User.me().then(me => setRole(me.role || "viewer")).catch(() => setRole("viewer"));
    loadDashboard();
  }, [loadDashboard]);

  const canEdit = !viewMode && (role === "admin" || role === "editor");

  const saveDashboard = async () => {
    if (!dashboard) return;
    setSaving(true);
    await DashboardEntity.update(dashboard.id, { widgets });
    setSaving(false);
    // You could add a success toast here
  };

  const addWidget = (widget) => {
    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      position: { w: 6, h: 4 } // Default to half-width
    };
    setWidgets([...widgets, newWidget]);
  };

  const updateWidget = (widgetId, updates) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };
  
  const handleWidgetResize = (widgetId, newWidth) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId 
        ? { ...w, position: { ...w.position, w: newWidth } }
        : w
    ));
  };

  const deleteWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleDeleteWidget = () => {
    if (!deletingWidget) return;
    deleteWidget(deletingWidget.id);
    setDeletingWidget(null);
  };
  
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const handleAddFilter = useCallback((newFilter) => {
    setFilters(prev => {
      // Avoid adding duplicate filters (same column and value)
      if (prev.some(f => f.column === newFilter.column && f.value === newFilter.value)) {
        return prev;
      }
      return [...prev, newFilter];
    });
  }, []);

  const handleRemoveFilter = useCallback((filterToRemove) => {
    setFilters(prev => prev.filter(f => f.column !== filterToRemove.column || f.value !== filterToRemove.value));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Visualizations")}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {dashboard?.name || "Dashboard"}
              <Badge variant="secondary" className={viewMode ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"}>
                {viewMode ? <><Eye className="w-3 h-3 mr-1" /> View Mode</> : <><Edit3 className="w-3 h-3 mr-1" /> Edit Mode</>}
              </Badge>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{dashboard?.description || "No description"}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => setShowAddWidget(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={saveDashboard}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Layout"}
              </Button>
            </>
          )}
          {dashboardId && (
            <Link to={createPageUrl(`DashboardBuilder?id=${dashboardId}${viewMode ? '' : '&view=true'}`)}>
              <Button variant="outline">
                {viewMode ? <Edit3 className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {viewMode ? 'Edit' : 'Preview'}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {filters.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <FilterIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active Filters:</span>
              {filters.map((filter, index) => (
                <Badge key={`${filter.column}-${filter.value}-${index}`} variant="secondary" className="pl-2 pr-1 py-1 text-sm bg-white dark:bg-slate-700">
                  {filter.column}: <span className="font-semibold ml-1">{filter.value}</span>
                  <button onClick={() => handleRemoveFilter(filter)} className="ml-2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-500 text-xs" onClick={() => setFilters([])}>
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {widgets.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-12 gap-6"
              >
                {widgets.map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!canEdit}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "col-span-12",
                          widget.position.w === 6 && "md:col-span-6",
                          snapshot.isDragging && "shadow-2xl"
                        )}
                      >
                        <Card className="border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
                           <CardContent className="p-4 flex-grow flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                {canEdit && (
                                  <div {...provided.dragHandleProps} className="cursor-grab text-slate-400 hover:text-slate-600">
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                )}
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{widget.title}</h3>
                              </div>
                              {canEdit && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleWidgetResize(widget.id, 12)}
                                    disabled={widget.position.w === 12}
                                    title="Expand"
                                  >
                                    <Expand className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleWidgetResize(widget.id, 6)}
                                    disabled={widget.position.w === 6}
                                    title="Shrink"
                                  >
                                    <Shrink className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => { setEditingWidget(widget); setShowAddWidget(true); }}
                                    title="Edit"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setDeletingWidget(widget)}
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-grow">
                              <DashboardWidget 
                                widget={widget} 
                                databaseId={dashboard?.database_id}
                                filters={filters}
                                onAddFilter={handleAddFilter}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Card className="border-slate-200 border-dashed dark:border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Empty Dashboard</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Start building your dashboard by adding widgets.</p>
              {canEdit && (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddWidget(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Widget
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {canEdit && (
        <AddWidgetDialog
          open={showAddWidget}
          onOpenChange={(open) => {
            setShowAddWidget(open);
            if (!open) setEditingWidget(null);
          }}
          onAdd={editingWidget ? 
            (widget) => updateWidget(editingWidget.id, widget) : 
            addWidget
          }
          databaseId={dashboard?.database_id}
          editingWidget={editingWidget}
        />
      )}

      <ConfirmDialog
        open={!!deletingWidget}
        onOpenChange={(open) => !open && setDeletingWidget(null)}
        onConfirm={handleDeleteWidget}
        title="Delete Widget"
        description="Are you sure you want to remove this widget from the dashboard?"
        itemName={deletingWidget?.title}
        itemType="Widget"
        isDeleting={true}
      />
    </div>
  );
}
