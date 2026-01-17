import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Scale, 
  RefreshCw, 
  Download, 
  GripVertical,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const RULE_TYPE_COLORS = {
  normalization: 'bg-blue-100 text-blue-700',
  routing: 'bg-purple-100 text-purple-700',
  transformation: 'bg-amber-100 text-amber-700',
  validation: 'bg-emerald-100 text-emerald-700',
  safety: 'bg-red-100 text-red-700'
};

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_type: 'normalization',
    priority: 100,
    description: '',
    condition: '{}',
    action: '{}',
    is_active: true
  });
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('ucpRules', { action: 'list' });
      if (result.data.success) {
        setRules(result.data.rules);
      }
    } catch (err) {
      toast.error('Failed to load rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const result = await base44.functions.invoke('ucpRules', { action: 'seed' });
      if (result.data.success) {
        toast.success(`Seeded ${result.data.created_count} default rules`);
        loadRules();
      }
    } catch (err) {
      toast.error('Failed to seed rules');
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_type: 'normalization',
      priority: 100,
      description: '',
      condition: '{}',
      action: '{}',
      is_active: true
    });
    setJsonError(null);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name || '',
      rule_type: rule.rule_type || 'normalization',
      priority: rule.priority || 100,
      description: rule.description || '',
      condition: JSON.stringify(rule.condition || {}, null, 2),
      action: JSON.stringify(rule.action || {}, null, 2),
      is_active: rule.is_active !== false
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setJsonError(null);
    
    try {
      const condition = JSON.parse(formData.condition);
      const action = JSON.parse(formData.action);
      
      setIsSaving(true);
      
      const apiAction = editingRule ? 'update' : 'create';
      const result = await base44.functions.invoke('ucpRules', {
        action: apiAction,
        ruleId: editingRule?.id,
        rule_name: formData.rule_name,
        rule_type: formData.rule_type,
        priority: formData.priority,
        description: formData.description,
        condition,
        action,
        is_active: formData.is_active
      });

      if (result.data.success) {
        toast.success(editingRule ? 'Rule updated' : 'Rule created');
        setFormOpen(false);
        setEditingRule(null);
        resetForm();
        loadRules();
      } else {
        toast.error(result.data.error || 'Failed to save rule');
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setJsonError('Invalid JSON in condition or action');
      } else {
        toast.error('Failed to save rule');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rule) => {
    try {
      const result = await base44.functions.invoke('ucpRules', {
        action: 'delete',
        ruleId: rule.id
      });

      if (result.data.success) {
        toast.success('Rule deleted');
        loadRules();
      } else {
        toast.error(result.data.error || 'Failed to delete rule');
      }
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <div className="w-5 h-5 bg-white/90" style={{ clipPath: 'polygon(50% 20%, 90% 80%, 50% 95%, 10% 80%)' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">UCP Rules</h1>
                <p className="text-xs text-slate-500">Normalization, routing, and validation rules</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadRules}>
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSeed}>
                <Download className="w-4 h-4 mr-2" />
                Seed Defaults
              </Button>
              <Button onClick={() => { setEditingRule(null); resetForm(); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Rules Configured</h3>
            <p className="text-slate-500 mb-6">Seed the default rules or create your own</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleSeed}>
                <Download className="w-4 h-4 mr-2" />
                Seed Defaults
              </Button>
              <Button onClick={() => { setEditingRule(null); resetForm(); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <Card key={rule.id} className={cn(!rule.is_active && "opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-mono">#{rule.priority}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium font-mono text-slate-800">{rule.rule_name}</h3>
                        <Badge className={cn("text-xs", RULE_TYPE_COLORS[rule.rule_type])}>
                          {rule.rule_type}
                        </Badge>
                        {rule.is_active ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-slate-400">v{rule.version || 1}</span>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-slate-500 mt-1">{rule.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                        <Settings className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{rule.rule_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(rule)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Rule Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => {
        setFormOpen(open);
        if (!open) {
          setEditingRule(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
            <DialogDescription>
              Define a UCP processing rule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Rule Name</Label>
                <Input
                  id="rule_name"
                  value={formData.rule_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                  placeholder="normalize_whitespace"
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rule_type">Rule Type</Label>
                <Select 
                  value={formData.rule_type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, rule_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normalization">Normalization</SelectItem>
                    <SelectItem value="routing">Routing</SelectItem>
                    <SelectItem value="transformation">Transformation</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (lower = higher priority)</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 100 }))}
                min={1}
                max={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this rule does..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition (JSON)</Label>
              <Textarea
                id="condition"
                value={formData.condition}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, condition: e.target.value }));
                  setJsonError(null);
                }}
                placeholder="{}"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action (JSON)</Label>
              <Textarea
                id="action"
                value={formData.action}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, action: e.target.value }));
                  setJsonError(null);
                }}
                placeholder="{}"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            {jsonError && (
              <p className="text-sm text-red-500">{jsonError}</p>
            )}

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-slate-500">Enable this rule</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : (editingRule ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-center">
            Universal Command Protocol (UCP) — Confidential. © Omega UI, LLC
          </p>
        </div>
      </footer>
    </div>
  );
}