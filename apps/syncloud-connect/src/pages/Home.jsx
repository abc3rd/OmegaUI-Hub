import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import FeaturedHero from '@/components/FeaturedHero';
import AppCarousel from '@/components/AppCarousel';
import PaywallModal from '@/components/PaywallModal';
import { Skeleton } from "@/components/ui/skeleton";

const categories = ['productivity', 'analytics', 'communication', 'finance', 'automation', 'security', 'creative', 'data'];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const { data: apps, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => base44.entities.Application.list(),
    initialData: [],
  });

  const handleAppClick = (app) => {
    if (!isAuthenticated) {
      setSelectedApp(app);
      setShowPaywall(true);
    }
  };

  const groupedApps = categories.reduce((acc, category) => {
    acc[category] = apps.filter(app => app.category === category && app.is_active !== false);
    return acc;
  }, {});

  const featuredApp = apps.find(app => app.is_featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
        <div className="h-[60vh] bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="px-8 md:px-16 py-8 space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(j => (
                  <Skeleton key={j} className="w-[240px] h-[320px] rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <FeaturedHero 
        featuredApp={featuredApp}
        isAuthenticated={isAuthenticated}
        onAppClick={handleAppClick}
      />

      {/* App Carousels */}
      <div className="py-8 space-y-2">
        {categories.map((category, idx) => (
                      groupedApps[category]?.length > 0 && (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.5 }}
                          data-onboarding={idx === 0 ? "app-carousel" : undefined}
                        >
                          <AppCarousel
                            category={category}
                            apps={groupedApps[category]}
                            isAuthenticated={isAuthenticated}
                            onAppClick={handleAppClick}
                          />
                        </motion.div>
                      )
                    ))}

        {/* Empty state */}
        {apps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                🚀
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No Applications Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              Your application dashboard is ready. Add your first SynCloud application to get started.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-12 px-8 md:px-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ω</span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              © 2024 Omega SynCloud. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        appName={selectedApp?.name}
      />
    </div>
  );
}