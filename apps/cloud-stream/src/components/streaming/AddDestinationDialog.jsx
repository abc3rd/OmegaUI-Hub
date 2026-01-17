import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLATFORM_PRESETS = {
  youtube: {
    name: "YouTube Live",
    url: "rtmp://a.rtmp.youtube.com/live2",
    type: "youtube"
  },
  twitch: {
    name: "Twitch",
    url: "rtmp://live.twitch.tv/app",
    type: "twitch"
  },
  facebook: {
    name: "Facebook Live",
    url: "rtmps://live-api-s.facebook.com:443/rtmp/",
    type: "facebook"
  },
  custom: {
    name: "Custom RTMP Server",
    url: "",
    type: "custom"
  }
};

export default function AddDestinationDialog({ open, onClose, onSave, editingDestination }) {
  const [formData, setFormData] = useState({
    platform_name: "",
    stream_url: "",
    stream_key: "",
    platform_type: "custom",
    notes: "",
    is_active: true
  });

  useEffect(() => {
    if (editingDestination) {
      setFormData(editingDestination);
    } else {
      setFormData({
        platform_name: "",
        stream_url: "",
        stream_key: "",
        platform_type: "custom",
        notes: "",
        is_active: true
      });
    }
  }, [editingDestination, open]);

  const handlePresetChange = (preset) => {
    const presetData = PLATFORM_PRESETS[preset];
    setFormData(prev => ({
      ...prev,
      platform_name: presetData.name,
      stream_url: presetData.url,
      platform_type: presetData.type
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingDestination ? "Edit Stream Destination" : "Add Stream Destination"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingDestination && (
            <div>
              <Label htmlFor="preset">Platform Preset</Label>
              <Select onValueChange={handlePresetChange}>
                <SelectTrigger className="bg-slate-900 border-slate-700">
                  <SelectValue placeholder="Choose a preset or enter custom" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="youtube">YouTube Live</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="facebook">Facebook Live</SelectItem>
                  <SelectItem value="custom">Custom RTMP Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="platform_name">Platform Name *</Label>
            <Input
              id="platform_name"
              value={formData.platform_name}
              onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
              placeholder="e.g., YouTube Main Channel"
              required
              className="bg-slate-900 border-slate-700"
            />
          </div>

          <div>
            <Label htmlFor="stream_url">Server URL (RTMP) *</Label>
            <Input
              id="stream_url"
              value={formData.stream_url}
              onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
              placeholder="rtmp://live.example.com/app"
              required
              className="bg-slate-900 border-slate-700"
            />
          </div>

          <div>
            <Label htmlFor="stream_key">Stream Key *</Label>
            <Input
              id="stream_key"
              type="password"
              value={formData.stream_key}
              onChange={(e) => setFormData({ ...formData, stream_key: e.target.value })}
              placeholder="Your stream key from the platform"
              required
              className="bg-slate-900 border-slate-700"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes or details"
              className="bg-slate-900 border-slate-700"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {editingDestination ? "Update" : "Add"} Destination
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}