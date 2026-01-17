import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, ExternalLink, Copy, Check, Sparkles, 
  Filter, Grid3x3 
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import UsageStats from "../components/analytics/UsageStats";
import TopApps from "../components/analytics/TopApps";
import UsageTrends from "../components/analytics/UsageTrends";

export default function Hub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Get query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cat = params.get('cat');
    if (q) setSearchQuery(q);
    if (cat) setSelectedCategory(cat);
  }, []);

  // Update query params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== "All") params.set('cat', selectedCategory);
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedCategory]);

  const { data: apps, isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: () => base44.entities.apps.list('-created_date'),
    initialData: [],
  });

  const { data: usageData = [] } = useQuery({
    queryKey: ['appUsage'],
    queryFn: () => base44.entities.AppUsage.list('-created_date'),
    initialData: [],
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const categories = ["All", ...new Set(apps.map(app => app.category))];

  // Analytics calculations
  const totalUsers = new Set(usageData.map(u => u.user_email)).size || allUsers.length;
  const totalClicks = usageData.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayClicks = usageData.filter(u => u.created_date?.startsWith(today)).length;

  // Top apps
  const appClickCounts = usageData.reduce((acc, usage) => {
    acc[usage.app_name] = (acc[usage.app_name] || 0) + 1;
    return acc;
  }, {});
  const topApps = Object.entries(appClickCounts)
    .map(([app_name, count]) => ({ app_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Usage trends (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const trendData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: usageData.filter(u => u.created_date?.startsWith(date)).length
  }));

  const filteredApps = apps.filter(app => {
    const matchesSearch = !searchQuery || 
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopyUrl = (url, appName) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success(`Copied ${appName} URL`);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCardClick = async (app) => {
    if (app.status === "active" && app.url) {
      // Track usage
      if (user) {
        try {
          await base44.entities.AppUsage.create({
            app_id: app.id,
            app_name: app.name,
            user_email: user.email
          });
        } catch (error) {
          console.error("Failed to track usage:", error);
        }
      }
      window.open(app.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#EA00EA] via-[#9D00FF] to-[#2962FF] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Grid3x3 className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-bold">Unified App Hub</h1>
          </motion.div>
          <p className="text-xl text-white/90">
            Command Console for all your applications
          </p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <UsageStats 
          totalUsers={totalUsers}
          totalClicks={totalClicks}
          todayClicks={todayClicks}
        />
        
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <TopApps topApps={topApps} />
          <UsageTrends trendData={trendData} />
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid md:grid-cols-[1fr,300px] gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search apps by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus-visible:ring-2 focus-visible:ring-[#EA00EA]"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="pl-12 h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-[#EA00EA]">{filteredApps.length}</span> of {apps.length} apps
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </div>
        </div>

        {/* Apps Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-20 bg-gray-200 rounded mb-4" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCardClick(app)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-[#EA00EA] ${
                  app.status === "active" && app.url ? 'cursor-pointer' : ''
                }`}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-[#EA00EA] to-[#9D00FF] p-6 relative">
                  <div className="absolute top-4 right-4">
                    <Badge 
                      className={`${
                        app.status === "active" 
                          ? 'bg-[#4bce2a] hover:bg-[#3db522]' 
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      } text-white border-0`}
                    >
                      {app.status === "active" ? "Active" : "Coming Soon"}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 pr-24">
                    {app.name}
                  </h3>
                  <p className="text-sm text-white/80 font-medium">
                    {app.category}
                  </p>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <p className="text-gray-600 line-clamp-3 min-h-[4.5rem]">
                    {app.description}
                  </p>

                  {app.sourceRef && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 font-mono">
                      <span className="font-semibold text-gray-700">Source: </span>
                      {app.sourceRef}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {app.url ? (
                      <>
                        <Button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (user) {
                              try {
                                await base44.entities.AppUsage.create({
                                  app_id: app.id,
                                  app_name: app.name,
                                  user_email: user.email
                                });
                              } catch (error) {
                                console.error("Failed to track usage:", error);
                              }
                            }
                            window.open(app.url, '_blank');
                          }}
                          className="flex-1 bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] hover:from-[#9D00FF] hover:to-[#EA00EA] text-white font-bold"
                          disabled={app.status !== "active"}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open App
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(app.url, app.name);
                          }}
                          variant="outline"
                          size="icon"
                          className="border-2 border-[#EA00EA] text-[#EA00EA] hover:bg-[#EA00EA] hover:text-white"
                        >
                          {copiedUrl === app.url ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        URL Needed
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No apps found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}