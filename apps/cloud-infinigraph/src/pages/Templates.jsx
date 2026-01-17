import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Clock,
  BarChart3,
  TrendingUp,
  FileText,
  List,
  Grid3X3,
  PieChart,
  ArrowLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  { value: 'timeline', label: 'Timeline', icon: Clock },
  { value: 'comparison', label: 'Comparison', icon: BarChart3 },
  { value: 'statistics', label: 'Statistics', icon: TrendingUp },
  { value: 'process', label: 'Process', icon: FileText },
  { value: 'list', label: 'List', icon: List },
  { value: 'chart', label: 'Chart', icon: PieChart },
  { value: 'infographic', label: 'Infographic', icon: LayoutTemplate },
];

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'infographic',
    is_premium: false,
    canvas_width: 800,
    canvas_height: 1200,
    background_color: '#ffffff',
    color_scheme: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created');
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Template.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template updated');
      setEditingTemplate(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'infographic',
      is_premium: false,
      canvas_width: 800,
      canvas_height: 1200,
      background_color: '#ffffff',
      color_scheme: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
    });
  };

  const handleEdit = (template) => {
    setFormData({
      name: template.name || '',
      description: template.description || '',
      category: template.category || 'infographic',
      is_premium: template.is_premium || false,
      canvas_width: template.canvas_width || 800,
      canvas_height: template.canvas_height || 1200,
      background_color: template.background_color || '#ffffff',
      color_scheme: template.color_scheme || ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
    });
    setEditingTemplate(template);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Please enter a template name');
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate({
        ...formData,
        canvas_data: { elements: [] },
      });
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || LayoutTemplate;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')} className="text-slate-500 hover:text-slate-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Template Manager</h1>
                <p className="text-sm text-slate-500">Manage and create templates</p>
              </div>
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="gap-1"
              >
                <cat.icon className="h-3 w-3" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-slate-200" />
                <CardContent className="p-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <LayoutTemplate className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No templates found</h3>
            <p className="text-slate-500 mb-6">Create your first template to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <Card key={template.id} className="group overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: template.background_color || '#f8fafc' }}
                    >
                      {template.thumbnail_url ? (
                        <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
                      ) : (
                        <CategoryIcon className="h-12 w-12 text-slate-300" />
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{template.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                      {template.is_premium && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingTemplate} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={formData.canvas_width}
                  onChange={(e) => setFormData({ ...formData, canvas_width: parseInt(e.target.value) || 800 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={formData.canvas_height}
                  onChange={(e) => setFormData({ ...formData, canvas_height: parseInt(e.target.value) || 1200 })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2 mt-1">
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: formData.background_color }}
                />
                <Input
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Premium Template</Label>
                <p className="text-xs text-slate-500">Mark as premium content</p>
              </div>
              <Switch
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setEditingTemplate(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}