import React from 'react';
import { motion } from 'framer-motion';
import AppCard from './AppCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppGrid({ apps, isLoading, onFavoriteToggle, onLaunch }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Add your Base44 applications to get started with your enterprise dashboard.
        </p>
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {apps.map((app) => (
        <AppCard 
          key={app.id} 
          app={app} 
          onFavoriteToggle={onFavoriteToggle}
          onLaunch={onLaunch}
        />
      ))}
    </motion.div>
  );
}