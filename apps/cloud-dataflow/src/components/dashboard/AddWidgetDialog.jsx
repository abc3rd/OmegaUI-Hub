
import React, { useState, useEffect } from "react";
import { Query } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

const WIDGET_TYPES = [
  { value: "table", label: "Table", description: "Display query results in a table" },
  { value: "metric", label: "Metric Card", description: "Display a single number" },
  { value: "bar_chart", label: "Bar Chart", description: "Visualize data with bars" },
  { value: "line_chart", label: "Line Chart", description: "Show trends over time" },
  { value: "area_chart", label: "Area Chart", description: "Show trends with a filled area" },
  { value: "pie_chart", label: "Pie Chart", description: "Show proportions" },
  { value: "scatter_plot", label: "Scatter Plot", description: "Show relationships between variables" },
  { value: "text", label: "Text Block", description: "Add custom text or markdown" }
];

export default function AddWidgetDialog({ open, onOpenChange, onAdd, databaseId, editingWidget }) {
  const [queries, setQueries] = useState([]);
  const [form, setForm] = useState({
    title: "",
    type: "table",
    query_id: "",
    text_content: "",
    config: {
      color: "#4f46e5",
      showLegend: true,
      showLabels: false,
      clickBehavior: "none", // Default for new widgets
    }
  });

  useEffect(() => {
    if (databaseId) {
      Query.filter({ database_id: databaseId }, "-created_date", 100).then(setQueries);
    }
  }, [databaseId]);

  useEffect(() => {
    if (editingWidget) {
      setForm({
        title: editingWidget.title || "",
        type: editingWidget.type || "table",
        query_id: editingWidget.query_id || "",
        text_content: editingWidget.text_content || "",
        config: {
          color: "#4f46e5",
          showLegend: true,
          showLabels: false,
          clickBehavior: "none", // Default for existing widgets if not present
          ...editingWidget.config
        }
      });
    } else {
      setForm({
        title: "",
        type: "table",
        query_id: "",
        text_content: "",
        config: {
          color: "#4f46e5",
          showLegend: true,
          showLabels: false,
          clickBehavior: "none"
        }
      });
    }
  }, [editingWidget, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    onOpenChange(false);
  };
  
  const handleConfigChange = (field, value) => {
    setForm(prev => ({ ...prev, config: { ...prev.config, [field]: value } }));
  };

  const needsQuery = form.type !== "text";
  const isChart = ["bar_chart", "line_chart", "pie_chart", "area_chart", "scatter_plot"].includes(form.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingWidget ? "Edit Widget" : "Add Widget"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div>
            <Label>Widget Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Monthly Sales"
              required
            />
          </div>

          <div>
            <Label>Widget Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIDGET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsQuery ? (
            <div>
              <Label>Data Source (Query)</Label>
              <Select 
                value={form.query_id} 
                onValueChange={(v) => setForm({ ...form, query_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved query" />
                </SelectTrigger>
                <SelectContent>
                  {queries.filter(q => q.is_saved).map((query) => (
                    <SelectItem key={query.id} value={query.id}>
                      {query.name}
                    </SelectItem>
                  ))}
                  {queries.filter(q => q.is_saved).length === 0 && (
                    <div className="p-2 text-sm text-slate-500">
                      No saved queries. Create and save a query first.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Create queries in the Query Editor and save them to use here
              </p>
            </div>
          ) : (
            <div>
              <Label>Text Content</Label>
              <Textarea
                value={form.text_content}
                onChange={(e) => setForm({ ...form, text_content: e.target.value })}
                placeholder="Enter text or markdown..."
                rows={6}
              />
            </div>
          )}

          {(form.type === "metric") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Value Column Name</Label>
                <Input
                  value={form.config.value_column || ""}
                  onChange={(e) => setForm({ 
                    ...form, 
                    config: { ...form.config, value_column: e.target.value }
                  })}
                  placeholder="e.g., total"
                />
              </div>
              <div>
                <Label>Format</Label>
                <Select 
                  value={form.config.format || "number"}
                  onValueChange={(v) => setForm({ 
                    ...form, 
                    config: { ...form.config, format: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency ($)</SelectItem>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {(isChart) && (
            <div className="space-y-4 p-4 border rounded-lg dark:border-slate-700">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Chart Configuration</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>X-Axis Column</Label>
                  <Input
                    value={form.config.x_column || ""}
                    onChange={(e) => handleConfigChange("x_column", e.target.value)}
                    placeholder="e.g., month"
                  />
                </div>
                <div>
                  <Label>Y-Axis Column</Label>
                  <Input
                    value={form.config.y_column || ""}
                    onChange={(e) => handleConfigChange("y_column", e.target.value)}
                    placeholder="e.g., sales"
                  />
                </div>
                {form.type === "scatter_plot" && (
                  <div>
                    <Label>Z-Axis (Size) Column</Label>
                    <Input
                      value={form.config.z_column || ""}
                      onChange={(e) => handleConfigChange("z_column", e.target.value)}
                      placeholder="e.g., quantity"
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Customization</h4>
              <div className="grid grid-cols-2 gap-4 items-center">
                 <div>
                    <Label>Chart Color</Label>
                    <Input
                      type="color"
                      value={form.config.color || "#4f46e5"}
                      onChange={(e) => handleConfigChange("color", e.target.value)}
                      className="p-1 h-10"
                    />
                  </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    id="show-legend"
                    checked={form.config.showLegend}
                    onCheckedChange={(v) => handleConfigChange("showLegend", v)}
                  />
                  <Label htmlFor="show-legend">Show Legend</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-labels"
                    checked={form.config.showLabels}
                    onCheckedChange={(v) => handleConfigChange("showLabels", v)}
                  />
                  <Label htmlFor="show-labels">Show Data Labels</Label>
                </div>
              </div>
              
              <Separator />
              
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Interactivity</h4>
               <div>
                  <Label>Click Behavior</Label>
                  <Select
                    value={form.config.clickBehavior || "none"}
                    onValueChange={(v) => handleConfigChange("clickBehavior", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="drilldown">Drill-down to Query Editor</SelectItem>
                      <SelectItem value="filter">Filter the dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    What happens when a user clicks on a chart data point.
                  </p>
                </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={needsQuery && !form.query_id}
            >
              {editingWidget ? "Update Widget" : "Add Widget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
