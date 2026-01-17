import React from "react";
import { motion } from "framer-motion";
import { 
  ExternalLink, Star, MoreVertical, Box, Briefcase, Calendar, 
  Database, FileText, Folder, Globe, Layout, Mail, Package, 
  PieChart, Settings, ShoppingCart, Users, Zap, BarChart3, 
  Code, Image, CheckSquare, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const iconMap = {
  Box, Briefcase, Calendar, Database, FileText, Folder,
  Globe, Layout, Mail, Package, PieChart, Settings,
  ShoppingCart, Users, Zap, BarChart3, Code, Image,
  CheckSquare, Palette
};

export default function AppCard({ app, index }) {
  const queryClient = useQueryClient();
  const IconComponent = iconMap[app.icon] || Box;

  const toggleFavorite = async (e) => {
    e.preventDefault();
    await base44.entities.App.update(app.id, { favorite: !app.favorite });
    queryClient.invalidateQueries({ queryKey: ['apps'] });
  };

  const deleteApp = async () => {
    await base44.entities.App.delete(app.id);
    queryClient.invalidateQueries({ queryKey: ['apps'] });
  };

  const colors = {
    magenta: "from-[#EA00EA] to-[#FF00FF]",
    purple: "from-[#9D00FF] to-[#EA00EA]",
    cyan: "from-[#00E5FF] to-[#00B8D4]",
    blue: "from-[#2962FF] to-[#448AFF]",
    pink: "from-[#FF1744] to-[#EA00EA]",
    teal: "from-[#00BFA5] to-[#1DE9B6]"
  };

  const gradient = colors[app.color] || "from-[#EA00EA] to-[#FF00FF]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
          {/* Screenshot/Preview Section */}
          <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            
            {app.screenshot_url ? (
              <img 
                src={app.screenshot_url} 
                alt={app.name}
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconComponent className="w-20 h-20 text-white/40" />
              </div>
            )}
            
            {/* Overlay Icon */}
            <div className="absolute bottom-4 left-4 p-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/20">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-lg hover:bg-black/40 transition-colors border border-white/20"
            >
              <Star 
                className={`w-5 h-5 ${app.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`}
              />
            </button>
          </div>

          {/* Content with Gradient Background */}
          <div className={`p-6 bg-gradient-to-br ${gradient} relative`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-white group-hover:text-yellow-300 transition-colors">
                  {app.name}
                </h3>
                <ExternalLink className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <p className="text-sm text-white/90 line-clamp-2">
                {app.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </a>

      {/* More Options */}
      <div className="absolute bottom-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md hover:bg-gray-50"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleFavorite}>
              {app.favorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteApp} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}