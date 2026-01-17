import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, BookOpen, Users, Plus, ChefHat, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-date'),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date'),
  });

  const upcomingEvents = events.filter(e => 
    e.status !== 'completed' && e.status !== 'cancelled' && new Date(e.date) >= new Date()
  ).slice(0, 3);

  const recentRecipes = recipes.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Savory
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-2xl">
              Create unforgettable culinary experiences with multi-course tasting menus and themed dinner parties
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl("Events")}>
                <Button size="lg" className="bg-white text-orange-700 hover:bg-orange-50">
                  <Calendar className="w-5 h-5 mr-2" />
                  Plan an Event
                </Button>
              </Link>
              <Link to={createPageUrl("Recipes")}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Recipes
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-stone-500 font-medium mb-1">Total Events</p>
                  <p className="text-4xl font-bold text-stone-800">{events.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-stone-500 font-medium mb-1">Recipe Collection</p>
                  <p className="text-4xl font-bold text-stone-800">{recipes.length}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <ChefHat className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-stone-500 font-medium mb-1">Upcoming Events</p>
                  <p className="text-4xl font-bold text-stone-800">{upcomingEvents.length}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-stone-800">Upcoming Events</h2>
            <Link to={createPageUrl("Events")}>
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Link key={event.id} to={createPageUrl(`EventDetails?id=${event.id}`)}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{event.name}</CardTitle>
                            {event.theme && (
                              <p className="text-sm text-stone-500 italic">{event.theme}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-stone-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{format(new Date(event.date), "MMMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          {event.guest_count > 0 && (
                            <div className="flex items-center gap-2 text-stone-600">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{event.guest_count} guests expected</span>
                            </div>
                          )}
                          {event.menu?.length > 0 && (
                            <div className="flex items-center gap-2 text-stone-600">
                              <ChefHat className="w-4 h-4" />
                              <span className="text-sm">{event.menu.length} course menu</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                <p className="text-stone-500 mb-4">No upcoming events planned yet</p>
                <Link to={createPageUrl("Events")}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Recipes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-stone-800">Recipe Collection</h2>
            <Link to={createPageUrl("Recipes")}>
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {recentRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentRecipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full overflow-hidden">
                    {recipe.image_url && (
                      <div className="h-48 overflow-hidden bg-stone-200">
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{recipe.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                          {recipe.course_type}
                        </span>
                        {recipe.cuisine && (
                          <span className="text-xs px-2 py-1 bg-stone-100 text-stone-700 rounded-full">
                            {recipe.cuisine}
                          </span>
                        )}
                      </div>
                      {(recipe.prep_time || recipe.cook_time) && (
                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <ChefHat className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                <p className="text-stone-500 mb-4">No recipes in your collection yet</p>
                <Link to={createPageUrl("Recipes")}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Recipe
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}