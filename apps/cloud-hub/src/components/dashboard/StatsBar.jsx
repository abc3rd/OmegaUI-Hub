import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Star, Activity, Clock } from 'lucide-react';

export default function StatsBar({ apps }) {
  const totalApps = apps?.length || 0;
  const favorites = apps?.filter(a => a.is_favorite)?.length || 0;
  
  const categoryCounts = apps?.reduce((acc, app) => {
    acc[app.category] = (acc[app.category] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      icon: Layers,
      label: 'Total Apps',
      value: totalApps,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Star,
      label: 'Favorites',
      value: favorites,
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: Activity,
      label: 'Categories',
      value: Object.keys(categoryCounts).length,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Clock,
      label: 'Top Category',
      value: topCategory ? topCategory[0]?.replace(/_/g, ' ') : '-',
      isText: true,
      color: 'from-violet-500 to-violet-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className={`font-semibold text-slate-900 ${stat.isText ? 'text-sm capitalize' : 'text-2xl'}`}>
                {stat.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}