import React, { useState, useEffect } from 'react';
import { Plus, Minus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DictionaryEntryForm({
  open,
  onOpenChange,
  entry = null,
  onSave,
  isSaving = false
}) {
  const [formData, setFormData] = useState({
    command_name: '',
    category: 'intent',
    description: '',
    schema: '{}',
    validation_rules: '[]',
    examples: [''],
    is_active: true
  });
  const [schemaError, setSchemaError] = useState(null);

  useEffect(() => {
    if (entry) {
      setFormData({
        command_name: entry.command_name || '',
        category: entry.category || 'intent',
        description: entry.description || '',
        schema: JSON.stringify(entry.schema || {}, null, 2),
        validation_rules: JSON.stringify(entry.validation_rules || [], null, 2),
        examples: entry.examples?.length > 0 ? entry.examples : [''],
        is_active: entry.is_active !== false
      });
    } else {
      setFormData({
        command_name: '',
        category: 'intent',
        description: '',
        schema: '{}',
        validation_rules: '[]',
        examples: [''],
        is_active: true
      });
    }
    setSchemaError(null);
  }, [entry, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate JSON fields
    try {
      const schema = JSON.parse(formData.schema);
      const validation_rules = JSON.parse(formData.validation_rules);
      
      onSave({
        command_name: formData.command_name,
        category: formData.category,
        description: formData.description,
        schema,
        validation_rules,
        examples: formData.examples.filter(ex => ex.trim()),
        is_active: formData.is_active
      });
    } catch (error) {
      setSchemaError('Invalid JSON in schema or validation rules');
    }
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, '']
    }));
  };

  const removeExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index, value) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Dictionary Entry' : 'Add Dictionary Entry'}</DialogTitle>
          <DialogDescription>
            Define a UCP command for the interpreter
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="command_name">Command Name</Label>
              <Input
                id="command_name"
                value={formData.command_name}
                onChange={(e) => setFormData(prev => ({ ...prev, command_name: e.target.value }))}
                placeholder="intent.code_generation"
                required
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intent">Intent</SelectItem>
                  <SelectItem value="constraint">Constraint</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="execution">Execution</SelectItem>
                  <SelectItem value="fallback">Fallback</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this command does..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schema">JSON Schema</Label>
            <Textarea
              id="schema"
              value={formData.schema}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, schema: e.target.value }));
                setSchemaError(null);
              }}
              placeholder="{}"
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validation_rules">Validation Rules (JSON Array)</Label>
            <Textarea
              id="validation_rules"
              value={formData.validation_rules}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, validation_rules: e.target.value }));
                setSchemaError(null);
              }}
              placeholder="[]"
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          {schemaError && (
            <p className="text-sm text-red-500">{schemaError}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Examples</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExample}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.examples.map((ex, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={ex}
                    onChange={(e) => updateExample(i, e.target.value)}
                    placeholder="Example prompt or usage..."
                    className="flex-1"
                  />
                  {formData.examples.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeExample(i)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-xs text-slate-500">Enable this dictionary entry</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (entry ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}