import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ChefHat,
  Users,
  Calendar,
  Heart,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { Recipe } from '@/entities/Recipe';
import { MealPlan } from '@/entities/MealPlan';

export default function HomeIntegrationsOverview() {
  const [homeStats, setHomeStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeStats();
  }, []);

  const loadHomeStats = async () => {
    try {
      const [recipes, mealPlans] = await Promise.all([
        Recipe.list(),
        MealPlan.list()
      ]);

      const familyRecipes = recipes.filter(r => r.family_tradition === true);
      const publicRecipes = recipes.filter(r => r.shared_publicly === true);
      const activeMealPlans = mealPlans.filter(mp => new Date(mp.end_date) >= new Date());

      setHomeStats({
        totalRecipes: recipes.length,
        familyRecipes: familyRecipes.length,
        publicRecipes: publicRecipes.length,
        totalMealPlans: mealPlans.length,
        activeMealPlans: activeMealPlans.length
      });
    } catch (error) {
      console.error('Failed to load home stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Home Integrations</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your home life with intelligent kitchen management, recipe sharing, meal planning, 
            and family tradition preservation. Create a connected home experience that brings families together.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-orange-100 text-orange-800">Kitchen Management</Badge>
          <Badge className="bg-red-100 text-red-800">Recipe Sharing</Badge>
          <Badge className="bg-green-100 text-green-800">Family Traditions</Badge>
        </div>
      </div>

      {/* Home Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-orange-500" />
              <div className="text-2xl font-bold">{loading ? '...' : homeStats.totalRecipes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Family Traditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <div className="text-2xl font-bold">{loading ? '...' : homeStats.familyRecipes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Shared Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <div className="text-2xl font-bold">{loading ? '...' : homeStats.publicRecipes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Meal Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : homeStats.activeMealPlans}</div>
                <div className="text-xs text-muted-foreground">of {homeStats.totalMealPlans} total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            What are Home Integrations?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Home Integrations bring technology into the heart of your home - the kitchen and family spaces. 
            From GLYTCH's intelligent kitchen assistant to community recipe sharing and meal planning, 
            these tools help families organize their culinary life and preserve precious traditions.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Features:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• AI-powered recipe suggestions</li>
                <li>• Intelligent meal planning</li>
                <li>• Family tradition preservation</li>
                <li>• Community recipe sharing</li>
                <li>• Smart shopping list generation</li>
                <li>• Nutritional tracking and analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Busy families and parents</li>
                <li>• Home cooking enthusiasts</li>
                <li>• Health-conscious individuals</li>
                <li>• Community recipe sharing</li>
                <li>• Tradition-minded families</li>
                <li>• Meal planning organizers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Home Applications</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to={createPageUrl('GlytchsKitchen')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-500" />
                    GLYTCH's Kitchen
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Your AI-powered kitchen assistant that suggests recipes, helps with meal planning, 
                  and provides intelligent cooking guidance based on your preferences and dietary needs.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">AI Assistant</Badge>
                  <Badge variant="outline">Recipe Suggestions</Badge>
                  <Badge variant="outline">Smart Planning</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('RecipeSharing')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Recipe Sharing
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Share your favorite recipes with the community, discover new dishes from other home cooks, 
                  and build a collaborative cookbook that everyone can enjoy.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Community Sharing</Badge>
                  <Badge variant="outline">Recipe Discovery</Badge>
                  <Badge variant="outline">Social Cooking</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('MealPlanner')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Meal Planner
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Plan your weekly meals, generate automatic shopping lists, and stay organized 
                  with your family's dining schedule. Never wonder "what's for dinner?" again.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Weekly Planning</Badge>
                  <Badge variant="outline">Shopping Lists</Badge>
                  <Badge variant="outline">Family Organization</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('FamilyTraditions')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Family Traditions
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Preserve and share your family's special recipes and cooking traditions. 
                  Capture the stories behind the dishes that bring your family together.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Family Heritage</Badge>
                  <Badge variant="outline">Story Preservation</Badge>
                  <Badge variant="outline">Tradition Sharing</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Home Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Home Integration Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Discover</h4>
              <p className="text-sm text-muted-foreground">Find new recipes through AI suggestions or community sharing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Plan</h4>
              <p className="text-sm text-muted-foreground">Organize your weekly meals and generate shopping lists</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Cook</h4>
              <p className="text-sm text-muted-foreground">Prepare meals with AI guidance and family recipes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Share</h4>
              <p className="text-sm text-muted-foreground">Share your creations and preserve family traditions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-green-500" />
              Time Saving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reduce meal planning stress with AI-powered suggestions and automated shopping lists. 
              Spend less time deciding what to cook and more time enjoying family meals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-500" />
              Family Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Preserve precious family recipes and traditions while creating new memories. 
              Share the stories behind your favorite dishes with future generations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-500" />
              Community Building
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect with other home cooks, share your creations, and discover new favorites 
              from a community of food enthusiasts who share your passion for cooking.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Home Integrations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Set Up GLYTCH's Kitchen</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Let our AI assistant learn your preferences and dietary needs. 
                Start getting personalized recipe suggestions immediately.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Create Your First Meal Plan</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Plan a week's worth of meals and generate a shopping list. 
                See how much easier meal organization becomes.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('GlytchsKitchen')}>Start with GLYTCH</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('MealPlanner')}>Create Meal Plan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}