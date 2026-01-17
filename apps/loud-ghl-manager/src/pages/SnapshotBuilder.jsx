import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Plus, Play, Archive, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RecipeForm from "../components/snapshot/RecipeForm";
import BuildRecipeDialog from "../components/snapshot/BuildRecipeDialog";

export default function SnapshotBuilder() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [buildingRecipe, setBuildingRecipe] = useState(null);
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.SnapshotRecipe.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SnapshotRecipe.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowForm(false);
      setEditingRecipe(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SnapshotRecipe.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowForm(false);
      setEditingRecipe(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SnapshotRecipe.delete(id),
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const countAssets = (recipe) => {
    const data = recipe.recipe_data || {};
    return {
      pipelines: data.pipelines?.length || 0,
      customFields: data.custom_fields?.length || 0,
      workflows: data.workflows?.length || 0,
      funnels: data.funnels?.length || 0,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#fce7fc]/20 to-[#ea00ea]/10 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Snapshot Builder</h1>
            <p className="text-gray-600">
              Create and manage snapshot recipes to build GHL sub-accounts
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingRecipe(null);
              setShowForm(true);
            }}
            className="bg-[#ea00ea] hover:bg-[#c900c9] gap-2"
          >
            <Plus className="w-5 h-5" />
            New Recipe
          </Button>
        </div>

        {showForm && (
          <RecipeForm
            recipe={editingRecipe}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingRecipe(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {recipes.length === 0 && !showForm ? (
          <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-[#fce7fc] rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-[#ea00ea]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Snapshot Recipes Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first snapshot recipe to start building GHL sub-accounts programmatically
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-[#ea00ea] hover:bg-[#c900c9]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Recipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => {
              const assets = countAssets(recipe);
              const totalAssets = assets.pipelines + assets.customFields + assets.workflows + assets.funnels;
              
              return (
                <Card key={recipe.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{recipe.name}</CardTitle>
                        <Badge className={getStatusColor(recipe.status)}>
                          {recipe.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRecipe(recipe);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(recipe.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {recipe.description || 'No description'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-2xl font-bold text-blue-700">{assets.pipelines}</p>
                        <p className="text-xs text-blue-600">Pipelines</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-2xl font-bold text-green-700">{assets.customFields}</p>
                        <p className="text-xs text-green-600">Custom Fields</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <p className="text-2xl font-bold text-purple-700">{assets.workflows}</p>
                        <p className="text-xs text-purple-600">Workflows</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <p className="text-2xl font-bold text-orange-700">{assets.funnels}</p>
                        <p className="text-xs text-orange-600">Funnels</p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#ea00ea] hover:bg-[#c900c9]"
                      onClick={() => setBuildingRecipe(recipe)}
                      disabled={recipe.status !== 'active'}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Build Recipe
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {buildingRecipe && (
          <BuildRecipeDialog
            recipe={buildingRecipe}
            onClose={() => setBuildingRecipe(null)}
          />
        )}
      </div>
    </div>
  );
}