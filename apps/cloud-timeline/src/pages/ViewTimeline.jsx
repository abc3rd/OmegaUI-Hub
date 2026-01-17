
import React, { useState, useEffect, useCallback } from "react";
import { Timeline, Event } from "@/entities/all";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Map, Clock, Edit3, Share2 } from "lucide-react";

import TimelineView from "../components/timeline/TimelineView";
import InteractiveMap from "../components/map/InteractiveMap";
import MapLegend from "../components/map/MapLegend";

export default function ViewTimeline() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const timelineId = urlParams.get("id");

  const [timeline, setTimeline] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  const loadTimelineData = useCallback(async () => {
    if (!timelineId) {
      setIsLoading(false); // Ensure loading state is reset if no timelineId
      return;
    }
    
    setIsLoading(true);
    try {
      const [timelineData, eventsData] = await Promise.all([
        Timeline.get(timelineId),
        Event.filter({ timeline_id: timelineId }, "exact_date")
      ]);
      setTimeline(timelineData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading timeline:", error);
      // Optionally handle error state more gracefully, e.g., set an error message
    }
    setIsLoading(false);
  }, [timelineId]); // `timelineId` is a dependency here

  useEffect(() => {
    loadTimelineData();
  }, [loadTimelineData]); // `loadTimelineData` is now stable due to useCallback

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!timeline) {
    // This case will be hit if timelineId is null/undefined or if fetching fails and timeline is still null
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Timeline Not Found</h1>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const colorThemes = {
    navy: "from-slate-800 to-slate-900",
    emerald: "from-emerald-600 to-emerald-800", 
    purple: "from-purple-600 to-purple-800",
    amber: "from-amber-600 to-amber-800"
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="rounded-xl border-slate-200/60 hover:bg-slate-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{timeline.title}</h1>
              {timeline.description && (
                <p className="text-slate-600 mt-1">{timeline.description}</p>
              )}
              {timeline.period && (
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">{timeline.period}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-slate-200/60 hover:bg-slate-50 rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => navigate(createPageUrl(`EditTimeline?id=${timeline.id}`))}
              className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Timeline Header with gradient */}
        <div className={`h-1 bg-gradient-to-r ${colorThemes[timeline.color_theme] || colorThemes.navy} rounded-full mb-8`}></div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-1">
            <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="w-4 h-4 mr-2" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Map className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <TimelineView timeline={timeline} events={events} />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <InteractiveMap 
                  events={events} 
                  timeline={timeline}
                  readOnly={true}
                />
              </div>
              <div className="lg:col-span-1">
                <MapLegend events={events} timeline={timeline} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
