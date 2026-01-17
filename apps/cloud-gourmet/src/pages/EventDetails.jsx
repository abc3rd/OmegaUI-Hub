import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Calendar, MapPin, Users, ChefHat, ShoppingCart, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import ShoppingListDialog from "../components/events/ShoppingListDialog";

export default function EventDetailsPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [showShoppingList, setShowShoppingList] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.Event.list();
      return events.find(e => e.id === eventId);
    },
    enabled: !!eventId,
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 p-6 flex items-center justify-center">
        <div className="animate-pulse text-stone-500">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-stone-500 mb-4">Event not found</p>
          <Button onClick={() => navigate(createPageUrl("Events"))}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const menuRecipes = event.menu?.map(menuItem => {
    const recipe = recipes.find(r => r.id === menuItem.recipe_id);
    return { ...menuItem, recipeDetails: recipe };
  }) || [];

  const statusColors = {
    planning: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-stone-100 text-stone-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({
      id: event.id,
      data: { ...event, status: newStatus }
    });
  };

  const handleGuestRSVP = (guestIndex, newStatus) => {
    const updatedGuests = [...(event.guests || [])];
    updatedGuests[guestIndex] = { ...updatedGuests[guestIndex], rsvp_status: newStatus };
    updateMutation.mutate({
      id: event.id,
      data: { ...event, guests: updatedGuests }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50">
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(createPageUrl("Events"))}
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">{event.name}</h1>
              {event.theme && (
                <p className="text-xl text-orange-100 italic mb-4">{event.theme}</p>
              )}
              <Badge className={`${statusColors[event.status]} text-sm px-3 py-1`}>
                {event.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowShoppingList(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shopping List
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-stone-500 mb-1">Date & Time</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                {event.location && (
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Location</p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      {event.location}
                    </p>
                  </div>
                )}
                {event.guest_count > 0 && (
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Expected Guests</p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-stone-400" />
                      {event.guest_count} guests
                    </p>
                  </div>
                )}
                {event.notes && (
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Notes</p>
                    <p className="text-stone-700">{event.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-orange-600" />
                  Menu ({menuRecipes.length} courses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {menuRecipes.length > 0 ? (
                  <div className="space-y-4">
                    {menuRecipes.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="capitalize">
                                {item.course}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-lg">{item.recipe_name}</h3>
                            {item.recipeDetails && (
                              <div className="mt-2 space-y-1">
                                {item.recipeDetails.description && (
                                  <p className="text-sm text-stone-600">{item.recipeDetails.description}</p>
                                )}
                                {item.recipeDetails.wine_pairing && (
                                  <p className="text-sm text-stone-500 italic">
                                    🍷 Pairs with: {item.recipeDetails.wine_pairing}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-stone-500 mt-2">
                                  {item.recipeDetails.prep_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {item.recipeDetails.prep_time + (item.recipeDetails.cook_time || 0)} min
                                    </span>
                                  )}
                                  {item.recipeDetails.servings && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {item.recipeDetails.servings} servings
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {item.recipeDetails?.image_url && (
                            <img 
                              src={item.recipeDetails.image_url} 
                              alt={item.recipe_name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-500">
                    No menu items added yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Event Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['planning', 'confirmed', 'completed'].map(status => (
                  <Button
                    key={status}
                    variant={event.status === status ? "default" : "outline"}
                    className="w-full justify-start capitalize"
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Guest List */}
            {event.guests?.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Guest List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.guests.map((guest, idx) => (
                      <div key={idx} className="pb-3 border-b border-stone-200 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            {guest.email && (
                              <p className="text-sm text-stone-500">{guest.email}</p>
                            )}
                          </div>
                          <Badge 
                            className={
                              guest.rsvp_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-800' :
                              'bg-stone-100 text-stone-800'
                            }
                          >
                            {guest.rsvp_status}
                          </Badge>
                        </div>
                        {guest.dietary_restrictions && (
                          <p className="text-xs text-stone-600">
                            🥗 {guest.dietary_restrictions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ShoppingListDialog
        open={showShoppingList}
        onOpenChange={setShowShoppingList}
        menuRecipes={menuRecipes}
        guestCount={event.guest_count || 1}
      />
    </div>
  );
}