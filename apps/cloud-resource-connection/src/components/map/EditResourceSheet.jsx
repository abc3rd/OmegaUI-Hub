import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function EditResourceSheet({ resource, isOpen, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(resource || {});
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ResourceLocation.update(resource.id, data);
      
      // Log the change
      await base44.entities.ResourceHistory.create({
        resourceId: resource.id,
        userId: currentUser.id,
        userName: currentUser.full_name,
        changeType: 'updated',
        changes: data,
        notes: 'Resource updated by community member'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resourceLocations']);
      toast.success('Resource updated successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update resource');
      console.error(error);
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ResourceLocation.update(resource.id, {
        lastVerifiedDate: new Date().toISOString(),
        lastVerifiedBy: currentUser.full_name,
        upvotes: (resource.upvotes || 0) + 1
      });

      await base44.entities.ResourceHistory.create({
        resourceId: resource.id,
        userId: currentUser.id,
        userName: currentUser.full_name,
        changeType: 'verified',
        notes: 'Resource verified as accurate'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resourceLocations']);
      toast.success('Resource verified! Thank you.');
      onClose();
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
          .then(res => res.file_url)
      );
      
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        photoUrls: [...(prev.photoUrls || []), ...urls]
      }));
      toast.success('Photos uploaded!');
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleQuickUpdate = (field, value) => {
    const updates = { [field]: value };
    if (field === 'currentStatus') {
      updates.statusUpdatedDate = new Date().toISOString();
    }
    updateMutation.mutate(updates);
  };

  if (!resource) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Update Resource</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending}
                className="text-xs"
              >
                ✓ Verify Accurate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickUpdate('currentStatus', 'unavailable')}
                className="text-xs"
              >
                Mark Unavailable
              </Button>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Current Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {['available', 'unavailable', 'limited', 'unknown'].map(status => (
                <Button
                  key={status}
                  size="sm"
                  variant={formData.currentStatus === status ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, currentStatus: status }))}
                  className="text-xs capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <Label htmlFor="name">Resource Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                placeholder="e.g., Mon-Fri 9am-5pm"
                value={formData.hours || ''}
                onChange={e => setFormData(prev => ({ ...prev, hours: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="accessNotes">Access Notes</Label>
              <Textarea
                id="accessNotes"
                placeholder="How to access this resource..."
                value={formData.accessNotes || ''}
                onChange={e => setFormData(prev => ({ ...prev, accessNotes: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="communityNotes">Community Notes (What's changed?)</Label>
              <Textarea
                id="communityNotes"
                placeholder="Share any updates or changes..."
                value={formData.communityNotes || ''}
                onChange={e => setFormData(prev => ({ ...prev, communityNotes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Photos */}
            <div>
              <Label>Photos</Label>
              <div className="mt-2 space-y-2">
                {formData.photoUrls && formData.photoUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.photoUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img src={url} alt={`Photo ${index + 1}`} className="h-20 w-full object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Camera className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <Label htmlFor="photos-input" className="cursor-pointer text-sm text-blue-600 font-medium">
                    Add Photos
                  </Label>
                  <Input
                    id="photos-input"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={uploading}
                  />
                  {uploading && <Loader2 className="animate-spin mx-auto mt-2" />}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>

          {/* Last Updated Info */}
          {resource.lastVerifiedDate && (
            <div className="text-xs text-slate-500 text-center pt-2 border-t">
              Last verified {new Date(resource.lastVerifiedDate).toLocaleDateString()} 
              {resource.lastVerifiedBy && ` by ${resource.lastVerifiedBy}`}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}