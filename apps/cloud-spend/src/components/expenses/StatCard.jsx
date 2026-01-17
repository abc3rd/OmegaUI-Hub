import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendLabel,
  className 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={cn(
                "text-sm font-medium",
                trend >= 0 ? "text-rose-500" : "text-emerald-500"
              )}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-xs text-slate-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-indigo-50 p-3">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
        )}
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-2xl" />
    </motion.div>
  );
}