import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Basic Info", fields: ["name", "url"] },
  { id: 2, title: "Details", fields: ["description", "category"] },
  { id: 3, title: "Enhancement", fields: ["tags", "featured"] },
  { id: 4, title: "Review" }
];

export default function AppOnboardingWizard({ open, onOpenChange, existingApp = null }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(existingApp || {
    name: "",
    url: "",
    description: "",
    category: "",
    tags: [],
    featured: false,
    status: "active"
  });
  const [tagInput, setTagInput] = useState("");

  const isStepValid = (step) => {
    const fields = STEPS[step - 1].fields;
    if (!fields) return true;
    return fields.every(field => {
      if (field === "tags") return true; // Optional
      if (field === "featured") return true; // Optional
      return formData[field] && formData[field].length > 0;
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async () => {
    try {
      if (existingApp) {
        await base44.entities.apps.update(existingApp.id, formData);
        toast.success("App updated successfully!");
      } else {
        await base44.entities.apps.create(formData);
        toast.success("App created successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      onOpenChange(false);
      setCurrentStep(1);
    } catch (error) {
      toast.error("Failed to save app");
    }
  };

  const completionPercentage = () => {
    const requiredFields = ["name", "url", "description", "category"];
    const completed = requiredFields.filter(f => formData[f]).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {existingApp ? "Complete App Setup" : "Add New Application"}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.id
                      ? "bg-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-[#EA00EA] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <p className={`text-xs mt-1 ${currentStep === step.id ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Application Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome App"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="url">Application URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://myapp.com"
                  className="mt-1"
                />
              </div>
              <p className="text-sm text-gray-500">* Required fields</p>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your application..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead Gen">Lead Gen</SelectItem>
                    <SelectItem value="Data">Data</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="Connectivity">Connectivity</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Enhancement */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Tags (Optional)</Label>
                <p className="text-sm text-gray-500 mb-2">Add tags to help users discover your app</p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Enter a tag"
                  />
                  <Button type="button" onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} className="px-3 py-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Mark as Featured App
                </Label>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] rounded-lg p-6 text-white mb-4">
                <h3 className="text-lg font-bold mb-2">Setup Complete!</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/30 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${completionPercentage()}%` }}
                    />
                  </div>
                  <span className="font-semibold">{completionPercentage()}%</span>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">URL</p>
                  <p className="text-sm font-medium break-all">{formData.url}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{formData.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">{formData.description}</p>
                </div>
                {formData.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {formData.featured && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <span>⭐</span>
                    <p className="font-medium">Featured App</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Check className="w-4 h-4 mr-2" />
              {existingApp ? "Update App" : "Create App"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}