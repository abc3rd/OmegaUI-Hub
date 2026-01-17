import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import AppGrid from '@/components/dashboard/AppGrid';
import AppListView from '@/components/dashboard/AppListView';
import AppFooter from '@/components/dashboard/AppFooter';
import AddAppModal from '@/components/dashboard/AddAppModal';
import SearchFilter from '@/components/dashboard/SearchFilter';
import StatsBar from '@/components/dashboard/StatsBar';

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const queryClient = useQueryClient();

  // Fetch applications
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => base44.entities.Application.list('-sort_order'),
  });

  // Create application
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Application.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowAddModal(false);
      toast.success('Application added successfully');
    },
  });

  // Update application (for favorites)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Application.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  // Handle favorite toggle
  const handleFavoriteToggle = (app) => {
    updateMutation.mutate({
      id: app.id,
      data: { is_favorite: !app.is_favorite }
    });
  };

  // Handle app launch (update last_accessed)
  const handleLaunch = (app) => {
    updateMutation.mutate({
      id: app.id,
      data: { last_accessed: new Date().toISOString() }
    });
  };

  // Filter apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch = !searchQuery || 
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      const matchesFavorites = !showFavorites || app.is_favorite;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [apps, searchQuery, selectedCategory, showFavorites]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg"
              >
                <Layers className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">App Suite</h1>
                <p className="text-xs text-slate-500">Enterprise Dashboard</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-slate-500">Your Workspace</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            All Your Applications,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              One Click Away
            </span>
          </h2>
          <p className="text-slate-500 max-w-2xl">
            Access your entire Base44 application suite instantly. All apps under your subscription 
            are authorized and ready to launch.
          </p>
        </motion.div>

        {/* Stats */}
        <StatsBar apps={apps} />

        {/* Search & Filters */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showFavorites={showFavorites}
          onShowFavoritesChange={setShowFavorites}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Apps Grid/List */}
        {viewMode === 'grid' ? (
          <AppGrid
            apps={filteredApps}
            isLoading={isLoading}
            onFavoriteToggle={handleFavoriteToggle}
            onLaunch={handleLaunch}
          />
        ) : (
          <AppListView
            apps={filteredApps}
            isLoading={isLoading}
            onFavoriteToggle={handleFavoriteToggle}
            onLaunch={handleLaunch}
          />
        )}

        {/* Results count */}
        {!isLoading && filteredApps.length > 0 && (
          <p className="text-center text-sm text-slate-400 mt-8">
            Showing {filteredApps.length} of {apps.length} applications
          </p>
        )}
      </main>

      {/* Footer with app links */}
      <AppFooter apps={apps} />

      {/* Add App Modal */}
      <AddAppModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={(data) => createMutation.mutateAsync(data)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}