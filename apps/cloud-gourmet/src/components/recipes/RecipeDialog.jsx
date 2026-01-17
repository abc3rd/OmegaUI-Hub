import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RecipeDialog({ open, onOpenChange, recipe, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    course_type: "main",
    cuisine: "",
    ingredients: [],
    instructions: [],
    prep_time: 0,
    cook_time: 0,
    servings: 4,
    image_url: "",
    plating_notes: "",
    wine_pairing: ""
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || "",
        description: recipe.description || "",
        course_type: recipe.course_type || "main",
        cuisine: recipe.cuisine || "",
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0,
        servings: recipe.servings || 4,
        image_url: recipe.image_url || "",
        plating_notes: recipe.plating_notes || "",
        wine_pairing: recipe.wine_pairing || ""
      });
    } else {
      setFormData({
        name: "",
        description: "",
        course_type: "main",
        cuisine: "",
        ingredients: [],
        instructions: [],
        prep_time: 0,
        cook_time: 0,
        servings: 4,
        image_url: "",
        plating_notes: "",
        wine_pairing: ""
      });
    }
  }, [recipe, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: "", amount: "", notes: "" }]
    }));
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? "Edit Recipe" : "Add New Recipe"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recipe Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Course Type *</Label>
              <Select value={formData.course_type} onValueChange={(value) => setFormData(prev => ({ ...prev, course_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appetizer">Appetizer</SelectItem>
                  <SelectItem value="soup">Soup</SelectItem>
                  <SelectItem value="salad">Salad</SelectItem>
                  <SelectItem value="main">Main Course</SelectItem>
                  <SelectItem value="side">Side Dish</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cuisine</Label>
              <Input
                value={formData.cuisine}
                onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                placeholder="Italian, French, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Prep Time (min)</Label>
              <Input
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData(prev => ({ ...prev, prep_time: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Cook Time (min)</Label>
              <Input
                type="number"
                value={formData.cook_time}
                onChange={(e) => setFormData(prev => ({ ...prev, cook_time: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Servings</Label>
            <Input
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="flex-1"
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-16 h-16 object-cover rounded" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
              <Button type="button" size="sm" onClick={addIngredient}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {formData.ingredients.map((ingredient, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  placeholder="Item"
                  value={ingredient.item}
                  onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                  className="w-32"
                />
                <Button type="button" size="icon" variant="ghost" onClick={() => removeIngredient(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Instructions</Label>
              <Button type="button" size="sm" onClick={addInstruction}>
                <Plus className="w-4 h-4 mr-1" /> Add Step
              </Button>
            </div>
            {formData.instructions.map((instruction, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-sm font-medium text-stone-500 pt-2">{idx + 1}.</span>
                <Textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(idx, e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button type="button" size="icon" variant="ghost" onClick={() => removeInstruction(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Plating & Presentation Notes</Label>
            <Textarea
              value={formData.plating_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, plating_notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Wine Pairing</Label>
            <Input
              value={formData.wine_pairing}
              onChange={(e) => setFormData(prev => ({ ...prev, wine_pairing: e.target.value }))}
              placeholder="Recommended wine or beverage"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : recipe ? "Update Recipe" : "Add Recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}