import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function SchemaEditor({ schema, onChange }) {
  const properties = schema?.properties || {};
  const required = schema?.required || [];

  // Helper to safely get type as string
  const getTypeString = (prop) => {
    if (!prop) return "string";
    if (typeof prop.type === "string") return prop.type;
    if (typeof prop.type === "object") return "object";
    return "string";
  };

  const addParameter = () => {
    const newKey = `param_${Object.keys(properties).length + 1}`;
    onChange({
      ...schema,
      properties: {
        ...properties,
        [newKey]: { type: "string", description: "" }
      }
    });
  };

  const updateParameter = (oldKey, newKey, value) => {
    const newProperties = { ...properties };
    if (oldKey !== newKey) {
      delete newProperties[oldKey];
    }
    newProperties[newKey] = value;
    onChange({ ...schema, properties: newProperties });
  };

  const removeParameter = (key) => {
    const newProperties = { ...properties };
    delete newProperties[key];
    onChange({
      ...schema,
      properties: newProperties,
      required: required.filter(r => r !== key)
    });
  };

  const toggleRequired = (key, isRequired) => {
    const newRequired = isRequired 
      ? [...required, key]
      : required.filter(r => r !== key);
    onChange({ ...schema, required: newRequired });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Parameter Schema</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addParameter}
          className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Parameter
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(properties).map(([key, prop]) => (
          <div key={key} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <GripVertical className="h-5 w-5 text-slate-600 mt-2 cursor-move" />
            
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate-400">Name</Label>
                <Input
                  value={key}
                  onChange={(e) => updateParameter(key, e.target.value, prop)}
                  className="mt-1 bg-white/5 border-white/10 text-white text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs text-slate-400">Type</Label>
                <Select
                  value={getTypeString(prop)}
                  onValueChange={(type) => updateParameter(key, key, { ...prop, type })}
                >
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161c] border-white/10">
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-slate-400">Description</Label>
                <Input
                  value={prop.description || ""}
                  onChange={(e) => updateParameter(key, key, { ...prop, description: e.target.value })}
                  placeholder="Describe this parameter"
                  className="mt-1 bg-white/5 border-white/10 text-white text-sm placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={required.includes(key)}
                  onCheckedChange={(checked) => toggleRequired(key, checked)}
                  className="data-[state=checked]:bg-[#4bce2a]"
                />
                <span className="text-xs text-slate-400">Required</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeParameter(key)}
                className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {Object.keys(properties).length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No parameters defined yet.</p>
            <p className="text-sm mt-1">Add parameters to define the input schema.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}