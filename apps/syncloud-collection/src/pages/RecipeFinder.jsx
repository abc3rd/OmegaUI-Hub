
import React, { useState, useEffect, useMemo } from 'react';
import { Recipe } from '@/entities/Recipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Soup, ChefHat, Clock, BarChart, X, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const dietaryOptions = ["vegetarian", "vegan", "gluten_free", "dairy_free", "nut_free", "keto"];
const proteinSources = ["all", "chicken", "beef", "pork", "fish", "seafood", "tofu", "beans"];

const initialFilters = {
  meal_type: 'all',
  cuisine_type: 'all',
  difficulty_level: 'all',
  dietary_restrictions: [],
  max_prep_time: 240,
  max_calories: 2000,
  protein_source: 'all',
};

export default function RecipeFinder() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]); // This state will hold recipes after filtering but before sorting
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortOption, setSortOption] = useState('health_score_desc');

  const mealTypes = useMemo(() => ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'], []);
  const cuisineTypes = useMemo(() => ['all', 'american', 'italian', 'mexican', 'chinese', 'indian', 'mediterranean'], []);
  const difficultyLevels = useMemo(() => ['all', 'easy', 'medium', 'hard'], []);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const data = await Recipe.list();
      setRecipes(data);
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDietaryChange = (restriction) => {
    setFilters(prev => {
      const newRestrictions = prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction];
      return { ...prev, dietary_restrictions: newRestrictions };
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
  };

  // EFFECT 1: Applies filtering based on recipes, search term, and filter options
  useEffect(() => {
    let filtered = recipes.filter(recipe => {
      // Text search
      if (searchTerm && !recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

      // Meal type filter
      if (filters.meal_type !== 'all' && recipe.meal_type !== filters.meal_type) {
        return false;
      }

      // Cuisine type filter
      if (filters.cuisine_type !== 'all' && recipe.cuisine_type !== filters.cuisine_type) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty_level !== 'all' && recipe.difficulty_level !== filters.difficulty_level) {
        return false;
      }

      // Dietary restrictions filter
      if (filters.dietary_restrictions.length > 0) {
        const recipeDietary = recipe.dietary_restrictions || [];
        const hasAllRequired = filters.dietary_restrictions.every(restriction => 
          recipeDietary.includes(restriction)
        );
        if (!hasAllRequired) return false;
      }

      // Prep time filter
      const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
      if (totalTime > filters.max_prep_time) {
        return false;
      }

      // Calorie filter
      if (recipe.nutrition_info?.calories && recipe.nutrition_info.calories > filters.max_calories) {
        return false;
      }

      // Protein source filter
      if (filters.protein_source !== 'all' && recipe.protein_source !== filters.protein_source) {
        return false;
      }

      return true;
    });

    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, filters]); // Dependency array updated as per outline

  // MEMOIZED value: Applies sorting to the filtered recipes
  const sortedAndFilteredRecipes = useMemo(() => {
    // Create a shallow copy to sort without mutating the original filteredRecipes state
    const sortableRecipes = [...filteredRecipes]; 

    const [key, order] = sortOption.split('_');

    sortableRecipes.sort((a, b) => {
      let valA, valB;
      if (key === 'total_time') {
        valA = (a.prep_time_minutes || 0) + (a.cook_time_minutes || 0);
        valB = (b.prep_time_minutes || 0) + (b.cook_time_minutes || 0);
      } else { // Default to health_score if key is not 'total_time'
        valA = a.health_score || 0;
        valB = b.health_score || 0;
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });

    return sortableRecipes;
  }, [filteredRecipes, sortOption]); // Recalculate when filteredRecipes or sortOption changes


  return (
    <div className="p-6 w-full flex gap-6">
      {/* Filters Sidebar */}
      <aside className="w-1/4 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Filter className="w-5 h-5"/>Filters</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="meal_type">Meal Type</Label>
            <Select value={filters.meal_type} onValueChange={(v) => handleFilterChange('meal_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {mealTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cuisine_type">Cuisine</Label>
            <Select value={filters.cuisine_type} onValueChange={(v) => handleFilterChange('cuisine_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {cuisineTypes.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="difficulty_level">Difficulty</Label>
            <Select value={filters.difficulty_level} onValueChange={(v) => handleFilterChange('difficulty_level', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {difficultyLevels.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dietary</Label>
            <div className="space-y-2 mt-2">
              {dietaryOptions.map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <Checkbox id={opt} checked={filters.dietary_restrictions.includes(opt)} onCheckedChange={() => handleDietaryChange(opt)} />
                  <Label htmlFor={opt} className="capitalize font-normal">{opt.replace('_', ' ')}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Max Total Time: {filters.max_prep_time} mins</Label>
            <Slider value={[filters.max_prep_time]} onValueChange={([v]) => handleFilterChange('max_prep_time', v)} max={300} step={15} />
          </div>
          <div>
            <Label>Max Calories: {filters.max_calories}</Label>
            <Slider value={[filters.max_calories]} onValueChange={([v]) => handleFilterChange('max_calories', v)} max={2500} step={100} />
          </div>
          <div>
            <Label htmlFor="protein_source">Protein Source</Label>
            <Select value={filters.protein_source} onValueChange={(v) => handleFilterChange('protein_source', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {proteinSources.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="w-4 h-4 mr-2" /> Clear All Filters
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-3/4">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>Sort by:</Label>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="health_score_desc">Health Score (High-Low)</SelectItem>
                <SelectItem value="health_score_asc">Health Score (Low-High)</SelectItem>
                <SelectItem value="total_time_asc">Total Time (Shortest)</SelectItem>
                <SelectItem value="total_time_desc">Total Time (Longest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p>Loading recipes...</p>
        ) : sortedAndFilteredRecipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredRecipes.map(recipe => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img src={recipe.image_url || 'https://placehold.co/400x250'} alt={recipe.title} className="w-full h-40 object-cover" />
                <CardHeader>
                  <CardTitle className="truncate">{recipe.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{recipe.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min</div>
                    <div className="flex items-center gap-1 capitalize"><ChefHat className="w-4 h-4" /> {recipe.difficulty_level}</div>
                    <div className="flex items-center gap-1"><BarChart className="w-4 h-4" /> {recipe.health_score || 'N/A'}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags?.slice(0, 3).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Soup className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Recipes Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            <Button variant="ghost" onClick={clearFilters} className="mt-4">Clear Filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
