import React, { useState, useEffect } from "react";
import { Recipe } from "@/entities/Recipe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat, 
  Plus, 
  Search,
  Clock,
  Users,
  Heart,
  Star,
  Filter,
  BookOpen,
  Utensils
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const GLYTCH_ICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/42f53f232_splash_with_glytch.png";

export default function GlytchsKitchen() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    cuisine_type: "american",
    meal_type: "dinner",
    difficulty_level: "medium",
    prep_time_minutes: 30,
    cook_time_minutes: 60,
    servings: 4,
    ingredients: [{ name: "", amount: "", unit: "" }],
    instructions: [{ step: 1, instruction: "" }],
    tags: [],
    family_tradition: false,
    story: "",
    shared_publicly: true
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await Recipe.list("-created_date");
      setRecipes(data);
    } catch (error) {
      console.error("Error loading recipes:", error);
      toast.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async () => {
    try {
      await Recipe.create(newRecipe);
      setNewRecipe({
        title: "",
        description: "",
        cuisine_type: "american",
        meal_type: "dinner",
        difficulty_level: "medium",
        prep_time_minutes: 30,
        cook_time_minutes: 60,
        servings: 4,
        ingredients: [{ name: "", amount: "", unit: "" }],
        instructions: [{ step: 1, instruction: "" }],
        tags: [],
        family_tradition: false,
        story: "",
        shared_publicly: true
      });
      setShowAddDialog(false);
      loadRecipes();
      toast.success("Recipe added to Glytch's Kitchen!");
    } catch (error) {
      console.error("Error adding recipe:", error);
      toast.error("Failed to add recipe");
    }
  };

  const addIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { name: "", amount: "", unit: "" }]
    });
  };

  const addInstruction = () => {
    setNewRecipe({
      ...newRecipe,
      instructions: [...newRecipe.instructions, { step: newRecipe.instructions.length + 1, instruction: "" }]
    });
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
                         selectedFilter === recipe.meal_type ||
                         (selectedFilter === "family" && recipe.family_tradition) ||
                         selectedFilter === recipe.cuisine_type;

    return matchesSearch && matchesFilter;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Glytch's Kitchen
              </h1>
              <img src={GLYTCH_ICON_URL} alt="GLYTCH" className="w-6 h-6" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Share recipes, preserve family traditions, and discover culinary adventures
            </p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
              <Plus className="w-4 h-4" />
              Share Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share Your Recipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Recipe Title *</Label>
                  <Input
                    id="title"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
                    placeholder="Grandma's Famous Apple Pie"
                  />
                </div>
                <div>
                  <Label htmlFor="meal_type">Meal Type</Label>
                  <Select value={newRecipe.meal_type} onValueChange={(value) => setNewRecipe({...newRecipe, meal_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="appetizer">Appetizer</SelectItem>
                      <SelectItem value="drink">Drink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                  placeholder="A heartwarming family recipe passed down through generations..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prep_time">Prep Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={newRecipe.prep_time_minutes}
                    onChange={(e) => setNewRecipe({...newRecipe, prep_time_minutes: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="cook_time">Cook Time (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    value={newRecipe.cook_time_minutes}
                    onChange={(e) => setNewRecipe({...newRecipe, cook_time_minutes: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={newRecipe.servings}
                    onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div>
                <Label>Ingredients</Label>
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => {
                        const updated = [...newRecipe.ingredients];
                        updated[index].name = e.target.value;
                        setNewRecipe({...newRecipe, ingredients: updated});
                      }}
                    />
                    <Input
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) => {
                        const updated = [...newRecipe.ingredients];
                        updated[index].amount = e.target.value;
                        setNewRecipe({...newRecipe, ingredients: updated});
                      }}
                    />
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) => {
                        const updated = [...newRecipe.ingredients];
                        updated[index].unit = e.target.value;
                        setNewRecipe({...newRecipe, ingredients: updated});
                      }}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="mt-2">
                  Add Ingredient
                </Button>
              </div>

              <div>
                <Label>Instructions</Label>
                {newRecipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-800">
                      {instruction.step}
                    </div>
                    <Textarea
                      placeholder={`Step ${instruction.step} instructions...`}
                      value={instruction.instruction}
                      onChange={(e) => {
                        const updated = [...newRecipe.instructions];
                        updated[index].instruction = e.target.value;
                        setNewRecipe({...newRecipe, instructions: updated});
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addInstruction} className="mt-2">
                  Add Step
                </Button>
              </div>

              <div>
                <Label htmlFor="story">Recipe Story (Optional)</Label>
                <Textarea
                  id="story"
                  value={newRecipe.story}
                  onChange={(e) => setNewRecipe({...newRecipe, story: e.target.value})}
                  placeholder="Share the story behind this recipe - family traditions, memories, origins..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddRecipe}
                  disabled={!newRecipe.title}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Share Recipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-300">Total Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{recipes.length}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">In the kitchen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-700 dark:text-red-300">Family Traditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {recipes.filter(r => r.family_tradition).length}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">Passed down</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-yellow-700 dark:text-yellow-300">Shared Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {recipes.filter(r => r.shared_publicly).length}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Community recipes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-700 dark:text-green-300">Average Cook Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {recipes.length > 0 ? Math.round(recipes.reduce((acc, r) => acc + (r.cook_time_minutes || 0), 0) / recipes.length) : 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search recipes, ingredients, or stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipes</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
                <SelectItem value="family">Family Traditions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                      {recipe.title}
                      {recipe.family_tradition && (
                        <Heart className="w-4 h-4 text-red-500 inline ml-2" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {recipe.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getDifficultyColor(recipe.difficulty_level)}>
                    {recipe.difficulty_level}
                  </Badge>
                  <Badge variant="outline">{recipe.meal_type}</Badge>
                  <Badge variant="outline">{recipe.cuisine_type}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="w-4 h-4" />
                      {recipe.servings} servings
                    </div>
                  </div>
                  {recipe.likes_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {recipe.likes_count}
                    </div>
                  )}
                </div>

                {recipe.story && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded italic">
                    "{recipe.story.slice(0, 100)}{recipe.story.length > 100 ? '...' : ''}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {recipes.length === 0 ? "No recipes yet" : "No recipes match your search"}
            </h3>
            <p className="text-gray-500 mb-4">
              {recipes.length === 0 
                ? "Start building your recipe collection by sharing your first dish"
                : "Try adjusting your search terms or filters"
              }
            </p>
            {recipes.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Share Your First Recipe
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}