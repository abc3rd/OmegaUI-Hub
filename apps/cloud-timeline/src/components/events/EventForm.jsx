
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, MapPin, Upload, X } from "lucide-react";
import { UploadFile } from "@/integrations/Core";

export default function EventForm({ 
  event, 
  timeline, 
  initialLocation, 
  onSave, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    exact_date: "",
    location: "",
    importance: "medium",
    event_types: [],
    sentiment: "neutral",
    image_url: "",
    document_url: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date || "",
        exact_date: event.exact_date || "",
        location: event.location || "",
        importance: event.importance || "medium",
        event_types: event.event_types || [],
        sentiment: event.sentiment || "neutral",
        image_url: event.image_url || "",
        document_url: event.document_url || ""
      });
    } else if (initialLocation) {
      setFormData(prev => ({
        ...prev,
        location: `${initialLocation.lat.toFixed(6)}, ${initialLocation.lng.toFixed(6)}`
      }));
    }
  }, [event, initialLocation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update exact_date when date changes (if it's a valid date format)
    if (field === "date") {
      const dateMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        setFormData(prev => ({ ...prev, exact_date: value }));
      } else if (value.match(/(\d{4})/)) {
        // If just a year, set January 1st of that year for sorting
        const year = value.match(/(\d{4})/)[1];
        setFormData(prev => ({ ...prev, exact_date: `${year}-01-01` }));
      }
    }
  };

  const handleFileUpload = async (file, type) => {
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange(type === 'image' ? 'image_url' : 'document_url', file_url);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsUploading(false);
  };

  const handleEventTypeToggle = (type) => {
    setFormData(prev => {
      const types = prev.event_types || [];
      if (types.includes(type)) {
        return { ...prev, event_types: types.filter(t => t !== type) };
      } else {
        return { ...prev, event_types: [...types, type] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving event:", error);
    }

    setIsSubmitting(false);
  };

  const eventTypeOptions = [
    { value: "family", label: "Family", color: "#ec4899" },
    { value: "political", label: "Political", color: "#3b82f6" },
    { value: "educational", label: "Educational", color: "#10b981" },
    { value: "war_start", label: "War Start", color: "#8b5cf6" },
    { value: "war_end", label: "War End", color: "#eab308" },
    { value: "cultural", label: "Cultural", color: "#f97316" },
    { value: "economic", label: "Economic", color: "#06b6d4" },
    { value: "scientific", label: "Scientific", color: "#14b8a6" },
    { value: "religious", label: "Religious", color: "#a855f7" },
    { value: "natural_disaster", label: "Natural Disaster", color: "#78716c" },
    { value: "celebration", label: "Celebration", color: "#fbbf24" },
    { value: "tragedy", label: "Tragedy", color: "#dc2626" },
    { value: "achievement", label: "Achievement", color: "#22c55e" },
    { value: "other", label: "Other", color: "#64748b" }
  ];

  const sentimentOptions = [
    { value: "positive", label: "Positive", color: "#eab308", icon: "😊" },
    { value: "negative", label: "Negative", color: "#ef4444", icon: "😔" },
    { value: "neutral", label: "Neutral", color: "#94a3b8", icon: "😐" },
    { value: "progress", label: "Progress", color: "#22c55e", icon: "📈" },
    { value: "regress", label: "Regress", color: "#1e293b", icon: "📉" }
  ];

  const colorThemes = {
    navy: 'from-slate-800 to-slate-900',
    emerald: 'from-emerald-600 to-emerald-800',
    purple: 'from-purple-600 to-purple-800',
    amber: 'from-amber-600 to-amber-800'
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-slate-200/60">
        <DialogHeader className="pb-6">
          <div className={`h-1 bg-gradient-to-r ${colorThemes[timeline.color_theme] || colorThemes.navy} rounded-full mb-4`}></div>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {event ? "Edit Event" : "Add New Event"}
          </DialogTitle>
          {initialLocation && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Location: {initialLocation.lat.toFixed(4)}, {initialLocation.lng.toFixed(4)}</span>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-900">
              Event Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter event title..."
              className="bg-white/70 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-900">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the event in detail..."
              className="bg-white/70 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl h-24 resize-none"
            />
          </div>

          {/* Event Types (Multi-select) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">
              Event Types (select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50/30 rounded-xl border border-slate-200/40">
              {eventTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleEventTypeToggle(option.value)}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left ${
                    formData.event_types?.includes(option.value)
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  ></div>
                  <span className="text-sm font-medium text-slate-900">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sentiment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-900">Event Sentiment</Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {sentimentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange("sentiment", option.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.sentiment === option.value
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    ></div>
                    <span className="text-xs font-medium text-slate-900">
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-slate-900">
                Date *
              </Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                placeholder="e.g. June 6, 1944 or 1944"
                className="bg-white/70 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-slate-900">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country or coordinates"
                className="bg-white/70 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
              />
              <p className="text-xs text-slate-500">
                Use coordinates (lat, lng) for map placement
              </p>
            </div>
          </div>

          {/* Importance and Exact Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Importance</Label>
              <Select
                value={formData.importance}
                onValueChange={(value) => handleInputChange("importance", value)}
              >
                <SelectTrigger className="bg-white/70 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exact_date" className="text-sm font-medium text-slate-900">
                Exact Date (for sorting)
              </Label>
              <Input
                id="exact_date"
                type="date"
                value={formData.exact_date}
                onChange={(e) => handleInputChange("exact_date", e.target.value)}
                className="bg-white/70 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Image</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'image')}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload').click()}
                  className="w-full border-slate-200/60 hover:bg-slate-50 rounded-xl"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                {formData.image_url && (
                  <p className="text-xs text-slate-600 truncate">
                    ✓ Image uploaded
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Document</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'document')}
                  className="hidden"
                  id="document-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('document-upload').click()}
                  className="w-full border-slate-200/60 hover:bg-slate-50 rounded-xl"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Document"}
                </Button>
                {formData.document_url && (
                  <p className="text-xs text-slate-600 truncate">
                    ✓ Document uploaded
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-200/60 hover:bg-slate-50 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title || !formData.date || isSubmitting}
              className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  {event ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
