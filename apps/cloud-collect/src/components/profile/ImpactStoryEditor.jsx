import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Trash2, Loader2, Save, Image, Award, Heart, Star, CheckCircle2, Pin, PinOff } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const typeOptions = [
  { value: "general", label: "General Update", icon: Megaphone },
  { value: "milestone", label: "Milestone", icon: Award },
  { value: "thank_you", label: "Thank You", icon: Heart },
  { value: "progress", label: "Progress Update", icon: CheckCircle2 },
  { value: "goal_reached", label: "Goal Reached!", icon: Star }
];

function StoryForm({ story, profileId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: story?.title || "",
    content: story?.content || "",
    type: story?.type || "general",
    isPinned: story?.isPinned || false
  });
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState(story?.imageUrls || []);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (story?.id) {
        return base44.entities.ImpactStory.update(story.id, data);
      }
      return base44.entities.ImpactStory.create({ ...data, profileId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['impactStories']);
      toast.success(story?.id ? "Update edited!" : "Update posted!");
      onSave?.();
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrls(prev => [...prev, file_url]);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    saveMutation.mutate({
      title: formData.title || null,
      content: formData.content,
      type: formData.type,
      isPinned: formData.isPinned,
      imageUrls: imageUrls.length > 0 ? imageUrls : null,
      likes: story?.likes || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Update Type</Label>
        <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          placeholder="Give your update a title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Your Update *</Label>
        <Textarea
          id="content"
          placeholder="Share your progress, thank donors, or celebrate a milestone..."
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="min-h-[120px]"
          maxLength={2000}
        />
        <p className="text-xs text-slate-500">{formData.content.length}/2000</p>
      </div>

      {/* Image uploads */}
      <div className="space-y-2">
        <Label>Images (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative w-20 h-20">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
              >
                ×
              </button>
            </div>
          ))}
          {imageUrls.length < 4 && (
            <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                <Image className="w-5 h-5 text-slate-400" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Pin option */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-amber-600" />
          <Label htmlFor="pinned" className="cursor-pointer">Pin to top of profile</Label>
        </div>
        <Button
          type="button"
          variant={formData.isPinned ? "default" : "outline"}
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }))}
        >
          {formData.isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {story?.id ? "Update" : "Post Update"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function StoryListItem({ story, onEdit, onDelete }) {
  const typeConfig = typeOptions.find(t => t.value === story.type) || typeOptions[0];
  const Icon = typeConfig.icon;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {story.title && <h4 className="font-semibold text-slate-800">{story.title}</h4>}
              {story.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
              <Badge variant="outline" className="text-xs">{typeConfig.label}</Badge>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">{story.content}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>{format(new Date(story.created_date), 'MMM d, yyyy')}</span>
              <span>❤️ {story.likes || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(story)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(story)} className="text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ImpactStoryEditor({ profileId }) {
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['impactStories', profileId],
    queryFn: () => base44.entities.ImpactStory.filter({ profileId }, '-created_date'),
    enabled: !!profileId
  });

  const deleteMutation = useMutation({
    mutationFn: (storyId) => base44.entities.ImpactStory.delete(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['impactStories']);
      toast.success("Update deleted");
    }
  });

  const handleEdit = (story) => {
    setEditingStory(story);
    setShowForm(true);
  };

  const handleDelete = (story) => {
    if (confirm("Delete this update?")) {
      deleteMutation.mutate(story.id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStory(null);
  };

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Impact Stories</CardTitle>
              <CardDescription>Share updates and thank your supporters</CardDescription>
            </div>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingStory(null)}>
                <Plus className="w-4 h-4 mr-1" />
                Post Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingStory ? "Edit Update" : "Post New Update"}</DialogTitle>
              </DialogHeader>
              <StoryForm 
                story={editingStory} 
                profileId={profileId}
                onSave={handleFormClose}
                onCancel={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : stories.length === 0 ? (
          <p className="text-center text-slate-500 py-4">
            No updates yet. Share your journey with your supporters!
          </p>
        ) : (
          <div className="space-y-3">
            {stories.map(story => (
              <StoryListItem 
                key={story.id} 
                story={story} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}