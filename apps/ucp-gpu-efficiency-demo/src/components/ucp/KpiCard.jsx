import React from 'react';
import { motion } from 'framer-motion';

export default function KpiCard({ label, value, unit, trend, icon: Icon }) {
  const isPositive = trend && trend > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-xl p-4 border border-[#3c3c3c] overflow-hidden group"
    >
      {/* Magenta glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ea00ea]/0 to-[#ea00ea]/0 group-hover:from-[#ea00ea]/5 group-hover:to-transparent transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            {label}
          </span>
          {Icon && (
            <Icon className="w-4 h-4 text-[#ea00ea]/60" />
          )}
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-500">{unit}</span>
          )}
        </div>
        
        {trend !== undefined && (
          <div className={`mt-2 text-xs font-medium ${isPositive ? 'text-[#4bce2a]' : 'text-[#c4653a]'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}% vs baseline
          </div>
        )}
      </div>
    </motion.div>
  );
}