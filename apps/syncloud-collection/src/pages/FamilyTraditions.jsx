import React, { useState, useEffect } from 'react';
import { Recipe } from '@/entities/Recipe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cake, BookHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FamilyTraditions() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraditions = async () => {
      setLoading(true);
      try {
        const traditionRecipes = await Recipe.filter({ family_tradition: true }, '-created_date');
        setRecipes(traditionRecipes);
      } catch (error) {
        console.error("Failed to load family traditions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTraditions();
  }, []);

  return (
    <div className="p-4 md:p-6 w-full bg-amber-50/30 dark:bg-amber-900/10 min-h-full">
      <header className="mb-8 text-center space-y-3">
        <BookHeart className="w-14 h-14 text-amber-600 mx-auto" />
        <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200" style={{ fontFamily: "'Dancing Script', cursive" }}>Our Family Traditions</h1>
        <p className="text-lg text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">A collection of cherished recipes and the stories behind them, passed down through generations.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3).fill(0).map((_, i) => <Card key={i} className="h-80 animate-pulse bg-muted"></Card>)}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map(recipe => (
            <Link key={recipe.id} to={createPageUrl(`GlytchsKitchen?recipeId=${recipe.id}`)}>
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <img src={recipe.image_url || `https://source.unsplash.com/random/400x300/?${recipe.meal_type}`} alt={recipe.title} className="w-full h-full object-cover"/>
                  </div>
                  <CardTitle className="text-2xl text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Dancing Script', cursive" }}>{recipe.title}</CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">A beloved recipe from the {recipe.created_by.split('@')[0]} family</CardDescription>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-4 border-amber-400 pl-4 italic text-amber-800 dark:text-amber-200">
                    {recipe.story ? `"${recipe.story.substring(0, 150)}${recipe.story.length > 150 ? '...' : ''}"` : "A cherished family favorite."}
                  </blockquote>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-amber-700 dark:text-amber-300">
          <Cake className="w-20 h-20 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold mb-2">No Traditions Shared Yet</h3>
          <p>Mark a recipe as a 'Family Tradition' in Glytch's Kitchen to see it here.</p>
        </div>
      )}
    </div>
  );
}