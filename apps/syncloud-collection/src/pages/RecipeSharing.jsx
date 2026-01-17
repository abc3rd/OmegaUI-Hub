import React, { useState, useEffect, useMemo } from 'react';
import { Recipe } from '@/entities/Recipe';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtensilsCrossed, Clock, Search, Heart, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const RecipeCard = ({ recipe }) => (
  <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <CardHeader className="p-0 relative">
      <img src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={recipe.title} className="w-full h-48 object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <CardTitle className="text-lg font-bold text-white">{recipe.title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex-1 p-4 space-y-2">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
        <span className="flex items-center gap-1"><UtensilsCrossed className="w-4 h-4" /> {recipe.difficulty_level}</span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{recipe.description}</p>
      <div className="flex flex-wrap gap-2 pt-2">
        {recipe.tags?.slice(0, 3).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
      </div>
    </CardContent>
    <CardFooter className="p-4 flex justify-between items-center">
        <span className="text-sm text-muted-foreground flex items-center gap-1"><Heart className="w-4 h-4 text-red-500" /> {recipe.likes_count || 0}</span>
        <span className="text-xs text-muted-foreground">By {recipe.created_by.split('@')[0]}</span>
    </CardFooter>
  </Card>
);

export default function RecipeSharing() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ meal_type: 'all', difficulty_level: 'all' });
  const [sortBy, setSortBy] = useState('-likes_count');

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const publicRecipes = await Recipe.filter({ shared_publicly: true }, sortBy);
        setRecipes(publicRecipes);
      } catch (error) {
        console.error("Failed to load recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [sortBy]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const searchMatch = !searchTerm || recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const mealMatch = filter.meal_type === 'all' || recipe.meal_type === filter.meal_type;
      const difficultyMatch = filter.difficulty_level === 'all' || recipe.difficulty_level === filter.difficulty_level;
      return searchMatch && mealMatch && difficultyMatch;
    });
  }, [recipes, searchTerm, filter]);

  return (
    <div className="p-4 md:p-6 w-full">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2"><ChefHat className="w-8 h-8 text-primary" /> Community Recipes</h1>
        <p className="text-lg text-muted-foreground">Discover and share delicious recipes from the community.</p>
      </header>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search for a recipe..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={filter.meal_type} onValueChange={value => setFilter(prev => ({ ...prev, meal_type: value }))}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Meal Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meal Types</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter.difficulty_level} onValueChange={value => setFilter(prev => ({ ...prev, difficulty_level: value }))}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="-likes_count">Most Popular</SelectItem>
                <SelectItem value="-created_date">Newest</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => <Card key={i} className="h-96 animate-pulse bg-muted"></Card>)}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <Link key={recipe.id} to={createPageUrl(`GlytchsKitchen?recipeId=${recipe.id}`)}>
                <RecipeCard recipe={recipe} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <ChefHat className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No Recipes Found</h3>
          <p>Try adjusting your filters or be the first to share a recipe!</p>
        </div>
      )}
    </div>
  );
}