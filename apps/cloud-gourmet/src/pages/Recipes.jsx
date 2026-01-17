import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

import RecipeCard from "../components/recipes/RecipeCard";
import RecipeDialog from "../components/recipes/RecipeDialog";

export default function RecipesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowDialog(false);
      setEditingRecipe(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Recipe.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowDialog(false);
      setEditingRecipe(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const handleSave = (data) => {
    if (editingRecipe) {
      updateMutation.mutate({ id: editingRecipe.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || recipe.course_type === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const courses = ["all", "appetizer", "soup", "salad", "main", "side", "dessert", "beverage"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Recipe Collection</h1>
            <p className="text-stone-600">Build your culinary repertoire</p>
          </div>
          <Button 
            onClick={() => {
              setEditingRecipe(null);
              setShowDialog(true);
            }}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Recipe
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white shadow-sm"
            />
          </div>

          <Tabs value={selectedCourse} onValueChange={setSelectedCourse}>
            <TabsList className="bg-white shadow-sm h-12 flex-wrap">
              {courses.map(course => (
                <TabsTrigger key={course} value={course} className="capitalize">
                  {course === "all" ? "All Courses" : course}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-stone-400" />
            </div>
            <p className="text-xl text-stone-500">No recipes found</p>
            <p className="text-stone-400 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <RecipeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        recipe={editingRecipe}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}