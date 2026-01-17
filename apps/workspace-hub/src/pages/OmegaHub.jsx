import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Sparkles, ExternalLink, Grid3x3, 
  List, Upload, X, RefreshCw
} from "lucide-react";
import CsvSyncButton from "../components/omega/CsvSyncButton";
import RefreshDataButton from "../components/omega/RefreshDataButton";
import AppRating from "../components/feedback/AppRating";
import AppAdminControls from "../components/omega/AppAdminControls";
import AddAppForm from "../components/omega/AddAppForm";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export default function OmegaHub() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("all"); // all, featured, trending, recent
  const [useGoogleSheets, setUseGoogleSheets] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch from Google Sheets
  const { data: sheetsData, isLoading: sheetsLoading, refetch: refetchSheets } = useQuery({
    queryKey: ['googleSheets'],
    queryFn: async () => {
      const response = await base44.functions.invoke('syncGoogleSheets', {});
      return response.data;
    },
    enabled: useGoogleSheets,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // Fetch from database
  const { data: dbApps = [], isLoading: dbLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: () => base44.entities.apps.list('-updated_date'),
    initialData: [],
    enabled: !useGoogleSheets,
  });

  const assets = useGoogleSheets && sheetsData?.apps ? sheetsData.apps : dbApps;
  const isLoading = useGoogleSheets ? sheetsLoading : dbLoading;

  const categories = ["All", ...new Set(assets.map(a => a.category).filter(Boolean))];
  
  // Get all unique tags
  const allTags = [...new Set(assets.flatMap(a => a.tags || []))].sort();

  // Filter by section
  const isAdmin = user?.role === "admin";
  const activeAssets = assets.filter(a => a.status === "active" && (isAdmin || !a.hidden));
  const featuredApps = activeAssets.filter(a => a.featured);
  const trendingApps = [...activeAssets].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
  const recentApps = [...activeAssets].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  ).slice(0, 6);

  const filteredAssets = activeAssets.filter(asset => {
    const matchesSearch = !searchQuery || 
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || asset.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => (asset.tags || []).includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAppClick = (asset) => {
    navigate(`/app/${asset.id}`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data = [];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            return headers.reduce((obj, header, i) => {
              obj[header] = values[i];
              return obj;
            }, {});
          });
      }

      // Bulk create apps
      for (const item of data) {
        await base44.entities.apps.create({
          name: item.name || item.title,
          description: item.description,
          category: item.category,
          url: item.url || item.link_url,
          status: item.status || "active",
          tags: item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : []
        });
      }

      toast.success(`Imported ${data.length} apps successfully`);
      setUploadDialogOpen(false);
    } catch (error) {
      toast.error("Failed to import data: " + error.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-4">
            {/* Sections */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EA00EA]" />
                Discover
              </h3>
              <div className="space-y-1">
                {[
                  { id: "all", label: "All Apps", count: activeAssets.length },
                  { id: "featured", label: "Featured", count: featuredApps.length },
                  { id: "trending", label: "Trending", count: trendingApps.length },
                  { id: "recent", label: "Recently Added", count: recentApps.length }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] text-white font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span>{section.label}</span>
                    <span className="text-xs opacity-75">{section.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            {activeSection === "all" && (
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedCategory === category
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {activeSection === "all" && allTags.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-2 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Data Source */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Data Source</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    id="sheets"
                    checked={useGoogleSheets}
                    onChange={() => setUseGoogleSheets(true)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="sheets" className="flex-1 cursor-pointer text-sm">
                    <div className="font-medium">Google Sheets</div>
                    <div className="text-xs text-gray-500">Live sync enabled</div>
                  </label>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    id="database"
                    checked={!useGoogleSheets}
                    onChange={() => setUseGoogleSheets(false)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="database" className="flex-1 cursor-pointer text-sm">
                    <div className="font-medium">Database</div>
                    <div className="text-xs text-gray-500">Local storage</div>
                  </label>
                </div>
                {useGoogleSheets && (
                  <div className="space-y-2 mt-3">
                    <Button
                      onClick={() => refetchSheets()}
                      className="w-full bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] hover:from-[#9D00FF] hover:to-[#EA00EA] text-white font-semibold"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Google Sheets
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Last synced: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                )}
                </div>
                </div>

            {/* Admin Tools */}
            {isAdmin && !useGoogleSheets && (
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Admin Tools</h3>
                <div className="space-y-2">
                  <RefreshDataButton />
                  <CsvSyncButton />
                  <Sheet open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Import File
                      </Button>
                    </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Import Apps from File</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <p className="text-sm text-gray-600">
                        Upload a CSV or JSON file with app data. Required fields: name, description, url
                      </p>
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#EA00EA] file:text-white hover:file:bg-[#9D00FF] cursor-pointer"
                      />
                    </div>
                  </SheetContent>
                  </Sheet>
                  <AddAppForm />
                  </div>
                  </div>
                  )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#EA00EA] via-[#9D00FF] to-[#2962FF] rounded-xl shadow-lg p-6 sm:p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-3xl sm:text-4xl font-bold">Omega Hub</h1>
              </div>
              <p className="text-base sm:text-lg text-white/90 mb-6">
                Discover and launch your applications
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/50"
                />
              </div>
            </div>

            {/* Section Title & View Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeSection === "all" && "All Apps"}
                  {activeSection === "featured" && "⭐ Featured Apps"}
                  {activeSection === "trending" && "🔥 Trending Now"}
                  {activeSection === "recent" && "🆕 Recently Added"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeSection === "all" && `${filteredAssets.length} apps available`}
                  {activeSection === "featured" && `${featuredApps.length} hand-picked apps`}
                  {activeSection === "trending" && "Most popular apps right now"}
                  {activeSection === "recent" && "Latest additions to the hub"}
                </p>
              </div>
              {activeSection === "all" && (
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-[#EA00EA]" : ""}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-[#EA00EA]" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Apps Grid/List */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA00EA] mx-auto"></div>
                </div>
              ) : (() => {
                const displayAssets = activeSection === "all" ? filteredAssets :
                                     activeSection === "featured" ? featuredApps :
                                     activeSection === "trending" ? trendingApps : recentApps;
                
                if (displayAssets.length === 0) {
                  return (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No apps found</h3>
                      <p className="text-gray-500">Try adjusting your filters</p>
                    </div>
                  );
                }

                return (activeSection === "all" && viewMode === "list") ? (
                  <div className="space-y-4">
                    {displayAssets.map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-[#EA00EA] group cursor-pointer"
                        onClick={() => handleAppClick(asset)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {isAdmin && <AppAdminControls app={asset} isHidden={asset.hidden} />}
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#EA00EA] transition-colors">
                                {asset.name}
                              </h3>
                              <Badge variant="outline">{asset.category}</Badge>
                              {asset.featured && <span className="text-yellow-500">⭐</span>}
                              {asset.hidden && isAdmin && (
                                <Badge className="bg-gray-500 text-white text-xs">Hidden</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {asset.description}
                            </p>
                            <div className="mb-2">
                              <AppRating appId={asset.id} />
                            </div>
                            {asset.tags && asset.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {asset.tags.map((tag, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button 
                            className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/${asset.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayAssets.map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-100 hover:border-[#EA00EA] group cursor-pointer"
                        onClick={() => handleAppClick(asset)}
                      >
                        <div className="bg-gradient-to-br from-[#EA00EA] to-[#9D00FF] p-6 relative">
                          {isAdmin && <AppAdminControls app={asset} isHidden={asset.hidden} />}
                          <div className={`absolute top-4 ${isAdmin ? 'right-14' : 'right-4'} flex gap-2`}>
                            <Badge className="bg-[#4bce2a] text-white">
                              {asset.category}
                            </Badge>
                            {asset.featured && (
                              <Badge className="bg-yellow-500 text-white">⭐ Featured</Badge>
                            )}
                            {asset.hidden && isAdmin && (
                              <Badge className="bg-gray-500 text-white">Hidden</Badge>
                            )}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 pr-20">
                            {asset.name}
                          </h3>
                          {asset.views > 0 && (
                            <div className="text-xs text-white/70 space-y-0.5">
                              <p>{asset.views} {asset.views === 1 ? 'view' : 'views'}</p>
                              {asset.last_accessed && (
                                <p>Last: {new Date(asset.last_accessed).toLocaleDateString()}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {asset.description || "No description available"}
                          </p>
                          <div className="mb-4">
                            <AppRating appId={asset.id} />
                          </div>
                          {asset.tags && asset.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {asset.tags.map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <Button 
                            className="w-full bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] hover:from-[#9D00FF] hover:to-[#EA00EA] group-hover:scale-105 transition-transform"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Launch App
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}