
import React, { useState, useEffect, useCallback } from "react";
import { Timeline, Event } from "@/entities/all";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Clock, Map, Save } from "lucide-react";

import TimelineEditor from "../components/timeline/TimelineEditor";
import InteractiveMap from "../components/map/InteractiveMap";
import MapLegend from "../components/map/MapLegend";
import EventForm from "../components/events/EventForm";

export default function EditTimeline() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const timelineId = urlParams.get("id");

  const [timeline, setTimeline] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [mapClickLocation, setMapClickLocation] = useState(null);

  const loadTimelineData = useCallback(async () => {
    if (!timelineId) return; // Prevent fetching if timelineId is not available

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
    }
    setIsLoading(false);
  }, [timelineId]); // Dependency array includes timelineId

  useEffect(() => {
    // This effect now depends on the memoized loadTimelineData function
    loadTimelineData();
  }, [loadTimelineData]); // React Hook useEffect has a missing dependency: 'loadTimelineData'

  const handleMapClick = (location) => {
    setMapClickLocation(location);
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEventSave = async (eventData) => {
    try {
      if (editingEvent) {
        await Event.update(editingEvent.id, eventData);
      } else {
        await Event.create({ ...eventData, timeline_id: timelineId });
      }
      await loadTimelineData(); // Reload data after save
      setShowEventForm(false);
      setEditingEvent(null);
      setMapClickLocation(null);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEventEdit = (event) => {
    setEditingEvent(event);
    setMapClickLocation(null);
    setShowEventForm(true);
  };

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
              <h1 className="text-3xl font-bold text-slate-900">Edit: {timeline.title}</h1>
              {timeline.description && (
                <p className="text-slate-600 mt-1">{timeline.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowEventForm(true)}
              variant="outline"
              className="border-slate-200/60 hover:bg-slate-50 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
            <Button
              onClick={() => navigate(createPageUrl(`ViewTimeline?id=${timeline.id}`))}
              className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & View
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
              Timeline Editor
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Map className="w-4 h-4 mr-2" />
              Map Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <TimelineEditor 
              timeline={timeline} 
              events={events} 
              onEventEdit={handleEventEdit}
              onDataChange={loadTimelineData}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Click on the map</strong> to add events at specific locations. 
                Click existing pins to edit events.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <InteractiveMap 
                  events={events} 
                  timeline={timeline}
                  onMapClick={handleMapClick}
                  onEventEdit={handleEventEdit}
                  readOnly={false}
                />
              </div>
              <div className="lg:col-span-1">
                <MapLegend events={events} timeline={timeline} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Event Form Dialog */}
        {showEventForm && (
          <EventForm
            event={editingEvent}
            timeline={timeline}
            initialLocation={mapClickLocation}
            onSave={handleEventSave}
            onCancel={() => {
              setShowEventForm(false);
              setEditingEvent(null);
              setMapClickLocation(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
