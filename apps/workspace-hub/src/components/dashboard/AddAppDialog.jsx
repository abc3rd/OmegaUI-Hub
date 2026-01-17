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
import { toast } from "sonner";

export default function AddAppDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    category: "Core Apps",
    description: "",
    url: "",
    sourceRef: "",
    status: "active"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.apps.create(formData);
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      toast.success(`${formData.name} added successfully!`);
      onOpenChange(false);
      setFormData({
        name: "",
        category: "Core Apps",
        description: "",
        url: "",
        sourceRef: "",
        status: "active"
      });
    } catch (error) {
      toast.error("Failed to add app");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">App Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My App"
                  required
                />
              </div>

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
                    <SelectItem value="Core Apps">Core Apps</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Dev Tools">Dev Tools</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Legal Tech">Legal Tech</SelectItem>
                    <SelectItem value="Messaging">Messaging</SelectItem>
                    <SelectItem value="Games">Games</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your application..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://myapp.com"
              />
              <p className="text-xs text-gray-500">Leave empty if not yet deployed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceRef">Source Reference</Label>
              <Input
                id="sourceRef"
                value={formData.sourceRef}
                onChange={(e) => setFormData({ ...formData, sourceRef: e.target.value })}
                placeholder="CNAME myapp → target.com or A myapp → 1.2.3.4"
              />
              <p className="text-xs text-gray-500">DNS record or deployment reference</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
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