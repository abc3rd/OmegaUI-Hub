import React, { useState, useEffect } from "react";
import { Preset, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play,
  BookOpen,
  Code,
  Briefcase,
  PenTool,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const categoryIcons = {
  writing: PenTool,
  coding: Code,
  analysis: BookOpen,
  creative: Sparkles,
  business: Briefcase,
  education: GraduationCap,
  other: BookOpen
};

const categoryColors = {
  writing: "bg-blue-100 text-blue-800 border-blue-200",
  coding: "bg-green-100 text-green-800 border-green-200",
  analysis: "bg-purple-100 text-purple-800 border-purple-200",
  creative: "bg-pink-100 text-pink-800 border-pink-200",
  business: "bg-orange-100 text-orange-800 border-orange-200",
  education: "bg-indigo-100 text-indigo-800 border-indigo-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function PresetsPage() {
  const [presets, setPresets] = useState([]);
  const [filteredPresets, setFilteredPresets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    filterPresets();
  }, [presets, searchQuery, selectedCategory]);

  const loadPresets = async () => {
    try {
      const user = await User.me();
      const data = await Preset.filter(
        { $or: [{ created_by: user.email }, { is_public: true }] },
        "-created_date"
      );
      setPresets(data);
    } catch (error) {
      console.error("Error loading presets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPresets = () => {
    let filtered = presets;
    
    if (searchQuery) {
      filtered = filtered.filter(preset =>
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(preset => preset.category === selectedCategory);
    }
    
    setFilteredPresets(filtered);
  };

  const handleCreatePreset = async (presetData) => {
    try {
      await Preset.create(presetData);
      await loadPresets();
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating preset:", error);
    }
  };

  const handleUpdatePreset = async (presetData) => {
    try {
      await Preset.update(editingPreset.id, presetData);
      await loadPresets();
      setEditingPreset(null);
    } catch (error) {
      console.error("Error updating preset:", error);
    }
  };

  const handleDeletePreset = async (preset) => {
    try {
      await Preset.delete(preset.id);
      await loadPresets();
    } catch (error) {
      console.error("Error deleting preset:", error);
    }
  };

  const handleUsePreset = (preset) => {
    // Increment usage count
    Preset.update(preset.id, { usage_count: (preset.usage_count || 0) + 1 });
    
    // Navigate to chat with preset
    window.location.href = `/chat?preset=${preset.id}`;
  };

  const categoryTabs = [
    { value: "all", label: "All Presets" },
    { value: "writing", label: "Writing" },
    { value: "coding", label: "Coding" },
    { value: "analysis", label: "Analysis" },
    { value: "creative", label: "Creative" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Presets</h1>
          <p className="text-gray-500 mt-2">Pre-configured prompts for various tasks and workflows</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Preset</DialogTitle>
            </DialogHeader>
            <PresetForm onSubmit={handleCreatePreset} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {categoryTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onUse={handleUsePreset}
            onEdit={setEditingPreset}
            onDelete={handleDeletePreset}
          />
        ))}
      </div>

      {filteredPresets.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No presets found</h3>
          <p className="text-gray-500">Try adjusting your search or create a new preset</p>
        </div>
      )}

      {/* Edit Dialog */}
      {editingPreset && (
        <Dialog open={!!editingPreset} onOpenChange={() => setEditingPreset(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Preset</DialogTitle>
            </DialogHeader>
            <PresetForm 
              preset={editingPreset} 
              onSubmit={handleUpdatePreset}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function PresetCard({ preset, onUse, onEdit, onDelete }) {
  const CategoryIcon = categoryIcons[preset.category] || BookOpen;
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${categoryColors[preset.category]} border`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg">{preset.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {preset.category}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => onEdit(preset)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(preset)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {preset.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Used {preset.usage_count || 0} times
          </div>
          <Button 
            size="sm" 
            onClick={() => onUse(preset)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Use Preset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PresetForm({ preset, onSubmit }) {
  const [formData, setFormData] = useState({
    name: preset?.name || "",
    description: preset?.description || "",
    system_prompt: preset?.system_prompt || "",
    category: preset?.category || "other",
    model: preset?.model || "gpt-4",
    temperature: preset?.temperature || 0.7,
    is_public: preset?.is_public || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Preset name"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="What does this preset do?"
          className="h-20"
        />
      </div>
      
      <div>
        <Label htmlFor="system_prompt">System Prompt</Label>
        <Textarea
          id="system_prompt"
          value={formData.system_prompt}
          onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
          placeholder="Enter the system prompt..."
          className="h-32"
          required
        />
      </div>
      
      <div className="flex justify-end gap-3">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {preset ? 'Update Preset' : 'Create Preset'}
        </Button>
      </div>
    </form>
  );
}