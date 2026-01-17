import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mx-auto flex items-center justify-center">
          <Clock className="w-12 h-12 text-slate-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        Start Your Historical Journey
      </h3>
      
      <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
        Create your first timeline to organize and visualize historical events in an elegant, interactive format.
      </p>
      
      <div className="space-y-4">
        <Link to={createPageUrl("CreateTimeline")}>
          <Button className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-6 rounded-xl">
            <Plus className="w-6 h-6 mr-3" />
            Create Your First Timeline
          </Button>
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
          <div className="p-4 bg-white/60 rounded-xl border border-slate-200/60">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <Plus className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Add Events</h4>
            <p className="text-sm text-slate-600">Upload images and documents</p>
          </div>
          
          <div className="p-4 bg-white/60 rounded-xl border border-slate-200/60">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Customize</h4>
            <p className="text-sm text-slate-600">Choose layouts and themes</p>
          </div>
          
          <div className="p-4 bg-white/60 rounded-xl border border-slate-200/60">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">Share</h4>
            <p className="text-sm text-slate-600">Make timelines public</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}