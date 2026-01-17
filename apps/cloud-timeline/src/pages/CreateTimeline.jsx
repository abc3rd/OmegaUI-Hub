import React, { useState } from "react";
import { Timeline } from "@/entities/all";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const colorThemes = {
  navy: { name: "Navy Blue", bg: "from-slate-800 to-slate-900", preview: "bg-slate-800" },
  emerald: { name: "Emerald Green", bg: "from-emerald-600 to-emerald-800", preview: "bg-emerald-600" },
  purple: { name: "Royal Purple", bg: "from-purple-600 to-purple-800", preview: "bg-purple-600" },
  amber: { name: "Golden Amber", bg: "from-amber-600 to-amber-800", preview: "bg-amber-600" }
};

const layouts = {
  alternating: { name: "Alternating", description: "Events alternate left and right" },
  horizontal: { name: "Horizontal", description: "Linear horizontal layout" },
  vertical: { name: "Vertical", description: "Vertical stack layout" }
};

export default function CreateTimeline() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    period: "",
    layout: "alternating",
    color_theme: "navy",
    is_public: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const timeline = await Timeline.create(formData);
      navigate(createPageUrl(`EditTimeline?id=${timeline.id}`));
    } catch (error) {
      console.error("Error creating timeline:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="rounded-xl border-slate-200/60 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Timeline</h1>
            <p className="text-slate-600 mt-1">Start building your historical narrative</p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-900">
                  Timeline Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., World War II Timeline, Ancient Greek Civilization"
                  className="bg-white/50 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
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
                  placeholder="Brief description of what this timeline covers..."
                  className="bg-white/50 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl h-24 resize-none"
                />
              </div>

              {/* Period */}
              <div className="space-y-2">
                <Label htmlFor="period" className="text-sm font-medium text-slate-900">
                  Time Period
                </Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => handleInputChange("period", e.target.value)}
                  placeholder="e.g., 1939-1945, Ancient Rome, 15th Century"
                  className="bg-white/50 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
                />
              </div>

              {/* Layout */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Layout Style</Label>
                <Select
                  value={formData.layout}
                  onValueChange={(value) => handleInputChange("layout", value)}
                >
                  <SelectTrigger className="bg-white/50 border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(layouts).map(([key, layout]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{layout.name}</div>
                          <div className="text-xs text-slate-500">{layout.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Theme */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-900">Color Theme</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(colorThemes).map(([key, theme]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleInputChange("color_theme", key)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.color_theme === key
                          ? "border-amber-400 bg-amber-50"
                          : "border-slate-200/60 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${theme.preview}`}></div>
                        <span className="text-sm font-medium text-slate-900">{theme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Public Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-200/60">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Make Public</Label>
                  <p className="text-xs text-slate-500 mt-1">Allow others to view this timeline</p>
                </div>
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange("is_public", checked)}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!formData.title || isSubmitting}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Timeline...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Timeline & Add Events
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}