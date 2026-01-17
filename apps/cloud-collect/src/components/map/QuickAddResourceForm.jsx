import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Droplet, Wifi, Plug, Home, ShowerHead, UtensilsCrossed, 
  Battery, Package, Heart, BookOpen, Building2, MapPin, Loader2, Camera, Trash2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const resourceTypes = [
  { value: 'water_spigot', label: 'Water', icon: Droplet },
  { value: 'wifi_hotspot', label: 'WiFi', icon: Wifi },
  { value: 'electrical_outlet', label: 'Power', icon: Plug },
  { value: 'tent_spot', label: 'Tent Spot', icon: Home },
  { value: 'shower', label: 'Shower', icon: ShowerHead },
  { value: 'restroom', label: 'Restroom', icon: Building2 },
  { value: 'food', label: 'Food', icon: UtensilsCrossed },
  { value: 'charging_station', label: 'Charging', icon: Battery },
  { value: 'laundry', label: 'Laundry', icon: Package },
  { value: 'storage', label: 'Storage', icon: Package },
  { value: 'medical', label: 'Medical', icon: Heart },
  { value: 'library', label: 'Library', icon: BookOpen },
  { value: 'shelter', label: 'Shelter', icon: Building2 },
  { value: 'other', label: 'Other', icon: MapPin },
];

export default function QuickAddResourceForm({ location, onCancel, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    description: '',
    hours: '',
    accessNotes: '',
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Get AI suggestions when description is entered
  useEffect(() => {
    const getSuggestions = async () => {
      if (formData.description.length > 20 && !aiSuggestions) {
        setAiSuggesting(true);
        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Based on this resource description and location (lat: ${location.lat}, lng: ${location.lng}), suggest:
1. A clear, concise name (max 5 words)
2. The most appropriate resource type from: water_spigot, wifi_hotspot, electrical_outlet, tent_spot, shower, restroom, food, charging_station, laundry, storage, medical, library, shelter, other

Description: "${formData.description}"

Respond only with JSON.`,
            response_json_schema: {
              type: "object",
              properties: {
                suggested_name: { type: "string" },
                suggested_type: { type: "string" },
                confidence: { type: "string" }
              }
            }
          });
          setAiSuggestions(result);
        } catch (error) {
          console.error('AI suggestion error:', error);
        } finally {
          setAiSuggesting(false);
        }
      }
    };
    
    const timer = setTimeout(getSuggestions, 1000);
    return () => clearTimeout(timer);
  }, [formData.description, location, aiSuggestions]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        setImageUrls(prev => [...prev, result.file_url]);
        toast.success(`Photo uploaded`);
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const applySuggestion = (field, value) => {
    setFormData({ ...formData, [field]: value });
    toast.success('Suggestion applied!');
  };

  const createMutation = useMutation({
    mutationFn: async (resourceData) => {
      if (user) {
        // Logged in user - create directly
        return await base44.entities.ResourceLocation.create(resourceData);
      } else {
        // Guest user - use function with rate limiting
        const { data } = await base44.functions.invoke('createGuestResource', resourceData);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resourceLocations'] });
      toast.success('Resource added successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add resource');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type) {
      toast.error('Please fill in the required fields');
      return;
    }

    const resourceData = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim(),
      latitude: location.lat,
      longitude: location.lng,
      hours: formData.hours.trim(),
      accessNotes: formData.accessNotes.trim(),
      photoUrls: imageUrls,
      status: user ? 'active' : 'pending',
      visibility: 'community',
      createdByUserId: user?.id || null,
      isVerified: false,
    };

    createMutation.mutate(resourceData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Add Resource at This Location</h3>
        <p className="text-sm text-slate-500">
          Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Resource Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Public Water Fountain"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description
          {aiSuggesting && (
            <Badge variant="outline" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
              AI analyzing...
            </Badge>
          )}
        </Label>
        <Textarea
          id="description"
          placeholder="Describe this resource... AI will suggest a name and type!"
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            setAiSuggestions(null);
          }}
          rows={3}
        />
        {aiSuggestions && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
              <Sparkles className="w-4 h-4" />
              AI Suggestions
            </div>
            {aiSuggestions.suggested_name && !formData.name && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applySuggestion('name', aiSuggestions.suggested_name)}
                className="w-full justify-start text-left"
              >
                Name: {aiSuggestions.suggested_name}
              </Button>
            )}
            {aiSuggestions.suggested_type && formData.type === 'other' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applySuggestion('type', aiSuggestions.suggested_type)}
                className="w-full justify-start text-left"
              >
                Type: {resourceTypes.find(t => t.value === aiSuggestions.suggested_type)?.label}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hours">Hours</Label>
        <Input
          id="hours"
          placeholder="e.g., 24/7 or 9am-5pm"
          value={formData.hours}
          onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessNotes">Access Notes</Label>
        <Input
          id="accessNotes"
          placeholder="How to access this resource"
          value={formData.accessNotes}
          onChange={(e) => setFormData({ ...formData, accessNotes: e.target.value })}
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Photos (Optional)</Label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <Camera className="mx-auto h-8 w-8 text-slate-400 mb-1" />
          <Label htmlFor="photos" className="cursor-pointer text-xs text-blue-600 font-medium">
            Add photos
          </Label>
          <Input
            id="photos"
            type="file"
            className="hidden"
            multiple
            onChange={handleImageChange}
            accept="image/*"
            disabled={uploading}
          />
          {uploading && <Loader2 className="animate-spin mx-auto mt-2 w-4 h-4" />}
        </div>
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img src={url} alt={`Preview ${index + 1}`} className="h-16 w-full object-cover rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!user && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          Guest submissions are pending approval by moderators
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Resource'
          )}
        </Button>
      </div>
    </form>
  );
}