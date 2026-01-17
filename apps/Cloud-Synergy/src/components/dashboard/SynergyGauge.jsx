import React from 'react';
import { motion } from 'framer-motion';

export default function SynergyGauge({ 
  score, 
  title = "Synergy Score", 
  size = 120, 
  strokeWidth = 8,
  showDetails = false 
}) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  // Color based on score
  const getColor = (score) => {
    if (score >= 80) return { primary: '#10b981', secondary: '#6ee7b7', bg: '#d1fae5' };
    if (score >= 60) return { primary: '#f59e0b', secondary: '#fcd34d', bg: '#fef3c7' };
    return { primary: '#ef4444', secondary: '#f87171', bg: '#fee2e2' };
  };
  
  const colors = getColor(normalizedScore);
  
  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${colors.primary}40)`,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-slate-800">
              {Math.round(normalizedScore)}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {getScoreLabel(normalizedScore)}
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {showDetails && (
          <div className="text-xs text-slate-500 mt-1">
            Updated today
          </div>
        )}
      </div>
    </div>
  );
}