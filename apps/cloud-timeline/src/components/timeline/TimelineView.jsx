import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Image, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const colorThemes = {
  navy: 'from-slate-800 to-slate-900',
  emerald: 'from-emerald-600 to-emerald-800',
  purple: 'from-purple-600 to-purple-800',
  amber: 'from-amber-600 to-amber-800'
};

export default function TimelineView({ timeline, events }) {
  const sortedEvents = [...events].sort((a, b) => {
    if (a.exact_date && b.exact_date) {
      return new Date(a.exact_date) - new Date(b.exact_date);
    }
    return (a.order_index || 0) - (b.order_index || 0);
  });

  return (
    <div className="relative">
      {timeline.layout === 'alternating' ? (
        <div className="relative">
          {/* Center line */}
          <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b ${colorThemes[timeline.color_theme] || colorThemes.navy} rounded-full`}></div>
          
          <div className="space-y-8 py-8">
            {sortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <EventCard event={event} timeline={timeline} side={index % 2 === 0 ? 'left' : 'right'} />
                </div>
                
                {/* Timeline dot */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br ${colorThemes[timeline.color_theme] || colorThemes.navy} rounded-full border-4 border-white shadow-lg`}
                     style={{ top: `${index * 8 + 2}rem` }}></div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EventCard event={event} timeline={timeline} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, timeline, side }) {
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
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
          
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
        </div>
        
        {/* Description */}
        {event.description && (
          <p className="text-slate-700 leading-relaxed mb-4">
            {event.description}
          </p>
        )}
        
        {/* Media attachments */}
        {(event.image_url || event.document_url) && (
          <div className="flex gap-3 pt-4 border-t border-slate-200/60">
            {event.image_url && (
              <a 
                href={event.image_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Image className="w-4 h-4" />
                <span>View Image</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {event.document_url && (
              <a 
                href={event.document_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Document</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}