import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'blue', delay = 0 }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-500/10 dark:bg-blue-500/20',
    purple: 'bg-purple-500/10 dark:bg-purple-500/20',
    green: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    orange: 'bg-orange-500/10 dark:bg-orange-500/20',
    pink: 'bg-pink-500/10 dark:bg-pink-500/20',
    cyan: 'bg-cyan-500/10 dark:bg-cyan-500/20',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-emerald-500',
    orange: 'text-orange-500',
    pink: 'text-pink-500',
    cyan: 'text-cyan-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"
    >
      {/* Background gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${bgColorClasses[color]}`}>
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}