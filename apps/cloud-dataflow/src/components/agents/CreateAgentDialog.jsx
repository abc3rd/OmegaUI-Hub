import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Bot, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Available entities that agents can access
const AVAILABLE_ENTITIES = [
  "Database",
  "Table",
  "Query",
  "Dashboard",
  "DataRecord",
  "ActivityLog"
];

const OPERATIONS = [
  { value: "create", label: "Create" },
  { value: "read", label: "Read" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" }
];

export default function CreateAgentDialog({ open, onOpenChange, onSave, editingAgent }) {
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    description: "",
    instructions: "",
    tool_configs: [],
    whatsapp_greeting: ""
  });

  useEffect(() => {
    if (editingAgent) {
      setForm({
        name: editingAgent.name || "",
        displayName: editingAgent.displayName || "",
        description: editingAgent.description || "",
        instructions: editingAgent.instructions || "",
        tool_configs: editingAgent.tool_configs || [],
        whatsapp_greeting: editingAgent.whatsapp_greeting || ""
      });
    } else {
      setForm({
        name: "",
        displayName: "",
        description: "",
        instructions: "",
        tool_configs: [],
        whatsapp_greeting: ""
      });
    }
  }, [editingAgent, open]);

  const handleEntityToggle = (entityName) => {
    const existing = form.tool_configs.find(t => t.entity_name === entityName);
    if (existing) {
      setForm({
        ...form,
        tool_configs: form.tool_configs.filter(t => t.entity_name !== entityName)
      });
    } else {
      setForm({
        ...form,
        tool_configs: [
          ...form.tool_configs,
          { entity_name: entityName, allowed_operations: ["read"] }
        ]
      });
    }
  };

  const handleOperationToggle = (entityName, operation) => {
    setForm({
      ...form,
      tool_configs: form.tool_configs.map(t => {
        if (t.entity_name === entityName) {
          const ops = t.allowed_operations.includes(operation)
            ? t.allowed_operations.filter(op => op !== operation)
            : [...t.allowed_operations, operation];
          return { ...t, allowed_operations: ops };
        }
        return t;
      })
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate agent name if not provided
    const agentName = form.name || 
      form.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    onSave({
      ...form,
      name: agentName
    });
  };

  const isEntitySelected = (entityName) => {
    return form.tool_configs.some(t => t.entity_name === entityName);
  };

  const isOperationSelected = (entityName, operation) => {
    const tool = form.tool_configs.find(t => t.entity_name === entityName);
    return tool?.allowed_operations.includes(operation) || false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{editingAgent ? "Edit Custom Agent" : "Create Custom Agent"}</DialogTitle>
              <DialogDescription>
                Configure an AI agent with custom instructions and tool access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Custom agents will have access to web search by default. Configure entity access below to give them additional capabilities.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="e.g., Data Analyst"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">
                  Agent ID
                  <span className="text-xs text-slate-500 ml-2">(auto-generated if empty)</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., data_analyst"
                  pattern="[a-z0-9_]+"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of what this agent does..."
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions *</Label>
              <Textarea
                id="instructions"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Detailed instructions for the agent's behavior, tone, and capabilities..."
                rows={6}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Be specific about the agent's role, expertise, and how it should respond to users.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Tool Access</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select which entities this agent can access and what operations it can perform
              </p>
            </div>

            <div className="space-y-4">
              {AVAILABLE_ENTITIES.map((entity) => {
                const isSelected = isEntitySelected(entity);
                return (
                  <div key={entity} className="border rounded-lg p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`entity-${entity}`}
                          checked={isSelected}
                          onCheckedChange={() => handleEntityToggle(entity)}
                        />
                        <Label htmlFor={`entity-${entity}`} className="font-semibold cursor-pointer">
                          {entity}
                        </Label>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          {form.tool_configs.find(t => t.entity_name === entity)?.allowed_operations.length || 0} operations
                        </Badge>
                      )}
                    </div>
                    
                    {isSelected && (
                      <div className="flex flex-wrap gap-2 ml-6">
                        {OPERATIONS.map((op) => (
                          <div key={op.value} className="flex items-center gap-2">
                            <Checkbox
                              id={`${entity}-${op.value}`}
                              checked={isOperationSelected(entity, op.value)}
                              onCheckedChange={() => handleOperationToggle(entity, op.value)}
                            />
                            <Label htmlFor={`${entity}-${op.value}`} className="text-sm cursor-pointer">
                              {op.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">WhatsApp Integration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Optional greeting message when users connect via WhatsApp
              </p>
            </div>
            
            <div>
              <Label htmlFor="whatsapp_greeting">WhatsApp Greeting</Label>
              <Textarea
                id="whatsapp_greeting"
                value={form.whatsapp_greeting}
                onChange={(e) => setForm({ ...form, whatsapp_greeting: e.target.value })}
                placeholder="e.g., 👋 Hello! I'm your Data Analyst assistant..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900"
            >
              {editingAgent ? "Update Agent" : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}