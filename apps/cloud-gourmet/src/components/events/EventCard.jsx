import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ChefHat, Edit, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventCard({ event, onEdit, onDelete }) {
  const statusColors = {
    planning: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-stone-100 text-stone-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[event.status]}>
                  {event.status}
                </Badge>
              </div>
              <CardTitle className="text-xl mb-1">{event.name}</CardTitle>
              {event.theme && (
                <p className="text-sm text-stone-500 italic">{event.theme}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(event);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(event.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm line-clamp-1">{event.location}</span>
              </div>
            )}
            {event.guest_count > 0 && (
              <div className="flex items-center gap-2 text-stone-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">{event.guest_count} guests</span>
              </div>
            )}
            {event.menu?.length > 0 && (
              <div className="flex items-center gap-2 text-stone-600">
                <ChefHat className="w-4 h-4" />
                <span className="text-sm">{event.menu.length} course menu</span>
              </div>
            )}
          </div>
          <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
            <Button variant="outline" className="w-full">
              View Details
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}