import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Edit3, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const colorThemes = {
  navy: "from-slate-800 to-slate-900",
  emerald: "from-emerald-600 to-emerald-800",
  purple: "from-purple-600 to-purple-800",
  amber: "from-amber-600 to-amber-800"
};

export default function TimelineCard({ timeline }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group">
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${colorThemes[timeline.color_theme] || colorThemes.navy}`}></div>
      
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
              {timeline.title}
            </h3>
            {timeline.period && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                <Clock className="w-4 h-4" />
                <span>{timeline.period}</span>
              </div>
            )}
          </div>
          {timeline.is_public && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <Users className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
        </div>
        
        {timeline.description && (
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {timeline.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{timeline.eventCount || 0} events</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="capitalize">{timeline.layout} layout</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={createPageUrl(`ViewTimeline?id=${timeline.id}`)} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-slate-200/60 hover:bg-slate-50 rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </Link>
          <Link to={createPageUrl(`EditTimeline?id=${timeline.id}`)} className="flex-1">
            <Button 
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}