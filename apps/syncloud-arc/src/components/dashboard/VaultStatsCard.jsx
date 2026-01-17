import React from 'react';
import { motion } from 'framer-motion';

export default function VaultStatsCard({ title, value, subtitle, icon: Icon, color = '#2699fe' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 overflow-hidden"
    >
      {/* Background glow */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>

        <div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}