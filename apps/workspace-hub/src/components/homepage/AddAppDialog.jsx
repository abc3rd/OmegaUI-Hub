import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Box, Briefcase, Calendar, Database, FileText, Folder,
  Globe, Layout, Mail, Package, PieChart, Settings,
  ShoppingCart, Users, Zap, BarChart3, Code, Image
} from "lucide-react";

const iconMap = {
  Box, Briefcase, Calendar, Database, FileText, Folder,
  Globe, Layout, Mail, Package, PieChart, Settings,
  ShoppingCart, Users, Zap, BarChart3, Code, Image
};

const iconOptions = [
  "Box", "Briefcase", "Calendar", "Database", "FileText", "Folder",
  "Globe", "Layout", "Mail", "Package", "PieChart", "Settings",
  "ShoppingCart", "Users", "Zap", "BarChart3", "Code", "Image"
];

const colorOptions = [
  { value: "magenta", label: "Magenta", class: "bg-[#EA00EA]" },
  { value: "purple", label: "Purple", class: "bg-[#9D00FF]" },
  { value: "cyan", label: "Cyan", class: "bg-[#00E5FF]" },
  { value: "blue", label: "Blue", class: "bg-[#2962FF]" },
  { value: "pink", label: "Pink", class: "bg-[#FF1744]" },
  { value: "teal", label: "Teal", class: "bg-[#00BFA5]" }
];

export default function AddAppDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    screenshot_url: "",
    category: "productivity",
    icon: "Box",
    color: "magenta",
    favorite: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.App.create(formData);
    queryClient.invalidateQueries({ queryKey: ['apps'] });
    onOpenChange(false);
    setFormData({
      name: "",
      description: "",
      url: "",
      screenshot_url: "",
      category: "productivity",
      icon: "Box",
      color: "magenta",
      favorite: false
    });
  };

  const IconPreview = iconMap[formData.icon] || Box;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Application Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Awesome App"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://myapp.base44.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot_url">Screenshot URL</Label>
              <Input
                id="screenshot_url"
                type="url"
                value={formData.screenshot_url}
                onChange={(e) => setFormData({ ...formData, screenshot_url: e.target.value })}
                placeholder="https://example.com/screenshot.png"
              />
              <p className="text-xs text-gray-500">Optional: Add a preview image of your app</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your application..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="data">Data & Analytics</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <IconPreview className="w-4 h-4" />
                        {formData.icon}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(iconName => {
                      const Icon = iconMap[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {iconName}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-10 h-10 rounded-lg ${color.class} ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]">
              Add Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}