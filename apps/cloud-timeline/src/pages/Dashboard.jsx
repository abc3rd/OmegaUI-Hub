
import React, { useState, useEffect } from "react";
import { Timeline, Event } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, Clock, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";

import TimelineCard from "../components/dashboard/TimelineCard";
import EmptyState from "../components/dashboard/EmptyState";

export default function Dashboard() {
  const [timelines, setTimelines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimelines();
  }, []);

  const loadTimelines = async () => {
    setIsLoading(true);
    try {
      const data = await Timeline.list("-updated_date");
      // Get event counts for each timeline
      const timelinesWithCounts = await Promise.all(
        data.map(async (timeline) => {
          const events = await Event.filter({ timeline_id: timeline.id });
          return { ...timeline, eventCount: events.length };
        })
      );
      setTimelines(timelinesWithCounts);
    } catch (error) {
      console.error("Error loading timelines:", error);
    }
    setIsLoading(false);
  };

  const filteredTimelines = timelines.filter(timeline =>
    timeline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timeline.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Mapline
            </h1>
            <p className="text-slate-600 text-lg">
              Visualize history through maps and timelines
            </p>
          </div>
          <Link to={createPageUrl("CreateTimeline")}>
            <Button className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Create Timeline
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <Clock className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{timelines.length}</p>
                <p className="text-sm text-slate-600">Total Timelines</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {timelines.reduce((sum, t) => sum + t.eventCount, 0)}
                </p>
                <p className="text-sm text-slate-600">Historical Events</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {timelines.filter(t => t.is_public).length}
                </p>
                <p className="text-sm text-slate-600">Public Timelines</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search timelines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/60 focus:border-amber-300 focus:ring-amber-200 rounded-xl"
            />
          </div>
        </div>

        {/* Timeline Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/80 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-3 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredTimelines.length === 0 ? (
          searchTerm ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No timelines found</h3>
              <p className="text-slate-600">Try adjusting your search terms</p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTimelines.map((timeline, index) => (
              <motion.div
                key={timeline.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TimelineCard timeline={timeline} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
