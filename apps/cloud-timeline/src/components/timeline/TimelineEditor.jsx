import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Image, FileText, Edit3, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Event } from "@/entities/all";

const colorThemes = {
  navy: 'from-slate-800 to-slate-900',
  emerald: 'from-emerald-600 to-emerald-800',
  purple: 'from-purple-600 to-purple-800',
  amber: 'from-amber-600 to-amber-800'
};

export default function TimelineEditor({ timeline, events, onEventEdit, onDataChange }) {
  const sortedEvents = [...events].sort((a, b) => {
    if (a.exact_date && b.exact_date) {
      return new Date(a.exact_date) - new Date(b.exact_date);
    }
    return (a.order_index || 0) - (b.order_index || 0);
  });

  const handleDeleteEvent = async (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await Event.delete(eventId);
        onDataChange();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {sortedEvents.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Events Yet</h3>
          <p className="text-slate-600">
            Add events to your timeline to start building your historical narrative.
          </p>
        </div>
      ) : (
        sortedEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <EditableEventCard 
              event={event} 
              timeline={timeline} 
              onEdit={onEventEdit}
              onDelete={handleDeleteEvent}
            />
          </motion.div>
        ))
      )}
    </div>
  );
}

function EditableEventCard({ event, timeline, onEdit, onDelete }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
      {/* Header with importance indicator */}
      <div className={`h-1 bg-gradient-to-r ${colorThemes[timeline.color_theme] || colorThemes.navy}`}></div>
      
      <CardContent className="p-6">
        {/* Event header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight">
              {event.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {event.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-48">{event.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {event.importance && (
              <Badge 
                className={`${
                  event.importance === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                  event.importance === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  event.importance === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {event.importance}
              </Badge>
            )}
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(event)}
                className="h-8 w-8 p-0 hover:bg-slate-100"
              >
                <Edit3 className="w-4 h-4 text-slate-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(event.id)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {event.description && (
          <p className="text-slate-700 leading-relaxed mb-4 line-clamp-3">
            {event.description}
          </p>
        )}
        
        {/* Media attachments */}
        {(event.image_url || event.document_url) && (
          <div className="flex gap-4 pt-4 border-t border-slate-200/60">
            {event.image_url && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Image className="w-4 h-4" />
                <span>Image attached</span>
              </div>
            )}
            {event.document_url && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>Document attached</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}