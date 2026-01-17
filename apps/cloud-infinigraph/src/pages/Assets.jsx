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
  Image,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Upload,
  ArrowLeft,
  Shapes,
  FileImage,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const assetTypes = [
  { value: 'icon', label: 'Icon', icon: Shapes },
  { value: 'shape', label: 'Shape', icon: Shapes },
  { value: 'image', label: 'Image', icon: FileImage },
  { value: 'illustration', label: 'Illustration', icon: Sparkles },
];

const assetCategories = [
  'business', 'social', 'arrows', 'charts', 'technology', 'nature', 'people', 'abstract', 'other'
];

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'icon',
    category: 'business',
    svg_content: '',
    image_url: '',
    tags: [],
    is_premium: false,
  });
  const [tagsInput, setTagsInput] = useState('');

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Asset.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset created');
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Asset.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset updated');
      setEditingAsset(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'icon',
      category: 'business',
      svg_content: '',
      image_url: '',
      tags: [],
      is_premium: false,
    });
    setTagsInput('');
  };

  const handleEdit = (asset) => {
    setFormData({
      name: asset.name || '',
      type: asset.type || 'icon',
      category: asset.category || 'business',
      svg_content: asset.svg_content || '',
      image_url: asset.image_url || '',
      tags: asset.tags || [],
      is_premium: asset.is_premium || false,
    });
    setTagsInput((asset.tags || []).join(', '));
    setEditingAsset(asset);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Please enter an asset name');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const data = { ...formData, tags };

    if (editingAsset) {
      updateMutation.mutate({ id: editingAsset.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData({ ...formData, svg_content: event.target.result });
        };
        reader.readAsText(file);
      } else {
        const result = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, image_url: result.file_url });
      }
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || a.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type) => {
    const t = assetTypes.find(at => at.value === type);
    return t?.icon || Image;
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
                <h1 className="text-xl font-bold text-slate-900">Asset Library</h1>
                <p className="text-sm text-slate-500">Manage icons, shapes, and images</p>
              </div>
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All Types
            </Button>
            {assetTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className="gap-1"
              >
                <type.icon className="h-3 w-3" />
                {type.label}
              </Button>
            ))}
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {assetCategories.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-slate-200" />
                <CardContent className="p-3">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-16">
            <Image className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No assets found</h3>
            <p className="text-slate-500 mb-6">Add your first asset to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAssets.map((asset) => {
              const TypeIcon = getTypeIcon(asset.type);
              return (
                <Card key={asset.id} className="group overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-slate-100 relative flex items-center justify-center p-4">
                    {asset.svg_content ? (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: asset.svg_content }}
                      />
                    ) : asset.image_url ? (
                      <img src={asset.image_url} alt={asset.name} className="w-full h-full object-contain" />
                    ) : (
                      <TypeIcon className="h-10 w-10 text-slate-300" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(asset)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteMutation.mutate(asset.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 truncate">{asset.name}</span>
                      {asset.is_premium && (
                        <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {asset.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingAsset} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingAsset(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Asset Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter asset name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {assetCategories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Upload File</Label>
              <label className="cursor-pointer mt-1 block">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Click to upload</p>
                  <p className="text-xs text-slate-400">SVG, PNG, JPG</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {(formData.type === 'icon' || formData.type === 'shape') && (
              <div>
                <Label>SVG Content</Label>
                <Textarea
                  value={formData.svg_content}
                  onChange={(e) => setFormData({ ...formData, svg_content: e.target.value })}
                  placeholder="Paste SVG code here"
                  className="mt-1 font-mono text-xs"
                  rows={4}
                />
              </div>
            )}

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="icon, business, chart"
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Premium Asset</Label>
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
              setEditingAsset(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingAsset ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}