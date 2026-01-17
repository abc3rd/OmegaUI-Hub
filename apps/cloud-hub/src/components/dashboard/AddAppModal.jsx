import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, MessageSquare, DollarSign, Megaphone, 
  Settings, Users, Code, Briefcase, Layers, Zap,
  FileText, Calendar, Mail, ShoppingCart, Database,
  PieChart, TrendingUp, Target, Workflow, Globe, Loader2
} from 'lucide-react';

const icons = [
  { value: 'bar-chart', label: 'Chart', Icon: BarChart3 },
  { value: 'message-square', label: 'Messages', Icon: MessageSquare },
  { value: 'dollar-sign', label: 'Finance', Icon: DollarSign },
  { value: 'megaphone', label: 'Marketing', Icon: Megaphone },
  { value: 'settings', label: 'Settings', Icon: Settings },
  { value: 'users', label: 'Users', Icon: Users },
  { value: 'code', label: 'Code', Icon: Code },
  { value: 'briefcase', label: 'Business', Icon: Briefcase },
  { value: 'layers', label: 'Layers', Icon: Layers },
  { value: 'zap', label: 'Power', Icon: Zap },
  { value: 'file-text', label: 'Documents', Icon: FileText },
  { value: 'calendar', label: 'Calendar', Icon: Calendar },
  { value: 'mail', label: 'Email', Icon: Mail },
  { value: 'shopping-cart', label: 'Commerce', Icon: ShoppingCart },
  { value: 'database', label: 'Database', Icon: Database },
  { value: 'pie-chart', label: 'Analytics', Icon: PieChart },
  { value: 'trending-up', label: 'Growth', Icon: TrendingUp },
  { value: 'target', label: 'Goals', Icon: Target },
  { value: 'workflow', label: 'Workflow', Icon: Workflow },
  { value: 'globe', label: 'Web', Icon: Globe },
];

const categories = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communication', label: 'Communication' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'development', label: 'Development' },
  { value: 'other', label: 'Other' },
];

export default function AddAppModal({ open, onOpenChange, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    icon: 'layers',
    category: 'productivity',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      url: '',
      icon: 'layers',
      category: 'productivity',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Application</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Application Name</Label>
            <Input
              id="name"
              placeholder="e.g., Sales Dashboard"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Application URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-app.base44.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this app does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {icons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <icon.Icon className="w-4 h-4" />
                        <span>{icon.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Icon Preview */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              {(() => {
                const IconItem = icons.find(i => i.value === formData.icon);
                const IconComponent = IconItem?.Icon || Layers;
                return <IconComponent className="w-6 h-6 text-white" />;
              })()}
            </div>
            <div>
              <p className="font-medium text-slate-900">{formData.name || 'App Name'}</p>
              <p className="text-xs text-slate-500">{formData.category}</p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}