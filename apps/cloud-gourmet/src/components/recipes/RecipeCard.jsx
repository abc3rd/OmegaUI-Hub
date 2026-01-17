import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RecipeCard({ recipe, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow h-full overflow-hidden group">
        {recipe.image_url ? (
          <div className="h-56 overflow-hidden bg-stone-200 relative">
            <img 
              src={recipe.image_url} 
              alt={recipe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-56 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative">
            <div className="text-6xl">🍽️</div>
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => onEdit(recipe)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDelete(recipe.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        <CardContent className="p-5">
          <h3 className="font-bold text-xl mb-2 line-clamp-1">{recipe.name}</h3>
          
          {recipe.description && (
            <p className="text-sm text-stone-600 mb-3 line-clamp-2">{recipe.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-orange-100 text-orange-700 capitalize">
              {recipe.course_type}
            </Badge>
            {recipe.cuisine && (
              <Badge variant="outline" className="capitalize">
                {recipe.cuisine}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-stone-500">
            {(recipe.prep_time || recipe.cook_time) && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}