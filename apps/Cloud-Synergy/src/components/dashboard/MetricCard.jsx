import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = "blue",
  index = 0 
}) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-100',
      icon: 'text-blue-600',
      accent: 'bg-blue-600'
    },
    green: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      icon: 'text-green-600',
      accent: 'bg-green-600'
    },
    purple: {
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-100',
      icon: 'text-purple-600',
      accent: 'bg-purple-600'
    },
    orange: {
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-100',
      icon: 'text-orange-600',
      accent: 'bg-orange-600'
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-500';
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} overflow-hidden group hover:shadow-lg transition-all duration-300`}
    >
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 opacity-10">
        <div className={`w-full h-full rounded-full ${colors.accent}`} />
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          {change && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}