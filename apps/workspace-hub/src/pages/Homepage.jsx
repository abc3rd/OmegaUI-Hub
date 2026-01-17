import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Plus, User, Grid3x3, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AppCard from "../components/homepage/AppCard";
import CategorySection from "../components/homepage/CategorySection";
import ProfileCard from "../components/homepage/ProfileCard";
import AddAppDialog from "../components/homepage/AddAppDialog";

export default function Homepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set(["productivity", "business"]));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("category"); // "category", "grid", "list"

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: apps, isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: () => base44.entities.apps.list('-updated_date'),
    initialData: [],
  });

  const categories = {
    productivity: { name: "Productivity", color: "from-blue-500 to-cyan-500" },
    business: { name: "Business", color: "from-purple-500 to-pink-500" },
    creative: { name: "Creative", color: "from-orange-500 to-red-500" },
    data: { name: "Data & Analytics", color: "from-green-500 to-emerald-500" },
    tools: { name: "Tools", color: "from-indigo-500 to-blue-500" },
    other: { name: "Other", color: "from-gray-500 to-slate-500" }
  };

  const filteredApps = apps.filter(app => 
    app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const appsByCategory = Object.keys(categories).reduce((acc, category) => {
    acc[category] = filteredApps.filter(app => app.category === category);
    return acc;
  }, {});

  const favoriteApps = filteredApps.filter(app => app.favorite);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (viewMode === "category") {
      setExpandedCategories(new Set(Object.keys(categories)));
    } else {
      setViewMode("category");
      setExpandedCategories(new Set(Object.keys(categories)));
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    setViewMode("category");
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#EA00EA] via-[#9D00FF] to-[#2962FF]">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto px-6 py-16 md:py-24"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Omega UI Dashboard
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl">
            Your unified command center for all applications and tools
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search your applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl focus-visible:ring-2 focus-visible:ring-white/50"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-white text-[#EA00EA] hover:bg-white/90 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              variant="outline"
              className={`border-white/30 text-white hover:bg-white/30 backdrop-blur-sm ${viewMode === "grid" ? "bg-white/30" : "bg-white/20"}`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Grid View
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant="outline"
              className={`border-white/30 text-white hover:bg-white/30 backdrop-blur-sm ${viewMode === "list" ? "bg-white/30" : "bg-white/20"}`}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
            <Button
              onClick={expandAll}
              variant="outline"
              className={`border-white/30 text-white hover:bg-white/30 backdrop-blur-sm ${viewMode === "category" && expandedCategories.size === Object.keys(categories).length ? "bg-white/30" : "bg-white/20"}`}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Expand All
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard user={user} />
            
            {favoriteApps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-200"
              >
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Favorites
                </h3>
                <div className="space-y-2">
                  {favoriteApps.map(app => (
                    <a
                      key={app.id}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl hover:bg-yellow-50 transition-colors"
                    >
                      <p className="font-medium text-sm text-gray-900">{app.name}</p>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#EA00EA] to-[#FF00FF] rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="font-semibold mb-2">Total Applications</h3>
              <p className="text-4xl font-bold">{apps.length}</p>
            </motion.div>
          </div>

          {/* Categories Grid */}
          <div className="lg:col-span-3 space-y-8">
            {viewMode === "category" && Object.entries(categories).map(([key, category], index) => (
              <CategorySection
                key={key}
                categoryKey={key}
                category={category}
                apps={appsByCategory[key]}
                isExpanded={expandedCategories.has(key)}
                onToggle={() => toggleCategory(key)}
                index={index}
              />
            ))}

            {viewMode === "grid" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredApps.map((app, idx) => (
                  <AppCard key={app.id} app={app} index={idx} />
                ))}
              </motion.div>
            )}

            {viewMode === "list" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {filteredApps.map((app, idx) => (
                  <motion.a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 group"
                  >
                    <div className="flex items-center gap-6">
                      {app.screenshot_url ? (
                        <img 
                          src={app.screenshot_url} 
                          alt={app.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${categories[app.category]?.color || "from-gray-500 to-slate-500"} flex items-center justify-center`}>
                          <Sparkles className="w-10 h-10 text-white/60" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#EA00EA] transition-colors mb-2">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {app.description || "No description provided"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${categories[app.category]?.color || "from-gray-500 to-slate-500"} text-white`}>
                            {categories[app.category]?.name || "Other"}
                          </span>
                          {app.favorite && (
                            <span className="text-yellow-500">⭐</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            )}

            {filteredApps.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or add a new application</p>
                <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First App
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AddAppDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}