import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Tag, TrendingUp } from "lucide-react";

const eventTypeConfig = {
  family: { 
    name: "Family", 
    color: "#ec4899", 
    description: "Family events, weddings, births"
  },
  political: { 
    name: "Political", 
    color: "#3b82f6", 
    description: "Political events, elections, policies"
  },
  educational: { 
    name: "Educational", 
    color: "#10b981", 
    description: "Graduations, school events"
  },
  war_start: { 
    name: "War Start", 
    color: "#8b5cf6", 
    description: "Beginning of conflicts"
  },
  war_end: { 
    name: "War End", 
    color: "#eab308", 
    description: "End of conflicts, peace treaties"
  },
  cultural: { 
    name: "Cultural", 
    color: "#f97316", 
    description: "Cultural milestones, arts"
  },
  economic: { 
    name: "Economic", 
    color: "#06b6d4", 
    description: "Economic events, trade"
  },
  scientific: { 
    name: "Scientific", 
    color: "#14b8a6", 
    description: "Discoveries, inventions"
  },
  religious: { 
    name: "Religious", 
    color: "#a855f7", 
    description: "Religious events, ceremonies"
  },
  natural_disaster: { 
    name: "Natural Disaster", 
    color: "#78716c", 
    description: "Earthquakes, floods, storms"
  },
  celebration: { 
    name: "Celebration", 
    color: "#fbbf24", 
    description: "Festivals, commemorations"
  },
  tragedy: { 
    name: "Tragedy", 
    color: "#dc2626", 
    description: "Tragedies, accidents"
  },
  achievement: { 
    name: "Achievement", 
    color: "#22c55e", 
    description: "Accomplishments, records"
  },
  other: { 
    name: "Other", 
    color: "#64748b", 
    description: "Miscellaneous events"
  }
};

const sentimentConfig = {
  positive: { name: "Positive", color: "#eab308", icon: "😊" },
  negative: { name: "Negative", color: "#ef4444", icon: "😔" },
  neutral: { name: "Neutral", color: "#94a3b8", icon: "😐" },
  progress: { name: "Progress", color: "#22c55e", icon: "📈" },
  regress: { name: "Regress", color: "#1e293b", icon: "📉" }
};

export default function MapLegend({ events, timeline }) {
  const eventsWithLocation = events.filter(event => 
    event.location && event.location.includes(',')
  );

  // Count events by type
  const typeStats = {};
  const sentimentStats = {};
  
  eventsWithLocation.forEach(event => {
    if (event.event_types && Array.isArray(event.event_types)) {
      event.event_types.forEach(type => {
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
    }
    if (event.sentiment) {
      sentimentStats[event.sentiment] = (sentimentStats[event.sentiment] || 0) + 1;
    }
  });

  const colorThemes = {
    navy: { bg: 'from-slate-800 to-slate-900', text: 'Deep Navy' },
    emerald: { bg: 'from-emerald-600 to-emerald-800', text: 'Forest Emerald' },
    purple: { bg: 'from-purple-600 to-purple-800', text: 'Royal Purple' },
    amber: { bg: 'from-amber-600 to-amber-800', text: 'Golden Amber' }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Theme */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-600" />
            Timeline Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
            <div className={`w-6 h-6 bg-gradient-to-br ${colorThemes[timeline.color_theme]?.bg || colorThemes.navy.bg} rounded-lg shadow-sm`}></div>
            <div>
              <p className="font-medium text-slate-900 text-sm">
                {colorThemes[timeline.color_theme]?.text || 'Deep Navy'}
              </p>
              <p className="text-xs text-slate-500">Primary timeline color</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Types Legend */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-600" />
            Event Types
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Events categorized by type
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(eventTypeConfig)
              .sort((a, b) => (typeStats[b[0]] || 0) - (typeStats[a[0]] || 0))
              .map(([key, config]) => {
                const count = typeStats[key] || 0;
                if (count === 0) return null;
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-50/30 rounded-xl border border-slate-200/30 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {config.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-white/60 text-slate-700 text-xs"
                    >
                      {count}
                    </Badge>
                  </div>
                );
              })}
            
            {Object.keys(typeStats).length === 0 && (
              <div className="text-center py-6">
                <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No event types assigned yet
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Legend */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Event Sentiment
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Impact and outcomes
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Object.entries(sentimentConfig).map(([key, config]) => {
              const count = sentimentStats[key] || 0;
              if (count === 0) return null;
              
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50/30 rounded-xl border border-slate-200/30">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <span className="text-lg">{config.icon}</span>
                    </div>
                    <p className="font-medium text-slate-900 text-sm">
                      {config.name}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-white/60 text-slate-700 text-xs"
                  >
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Multi-Type Events Note */}
      <Card className="bg-amber-50/50 border-amber-200/60 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                Multi-Type Events
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Events with multiple types show split-colored markers on the map
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Events</span>
              <span className="font-bold text-slate-900">{events.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">With Locations</span>
              <span className="font-bold text-slate-900">{eventsWithLocation.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Event Types</span>
              <span className="font-bold text-slate-900">{Object.keys(typeStats).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}