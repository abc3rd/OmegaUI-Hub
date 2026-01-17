import React from "react";
import { motion } from "framer-motion";

const statusColors = {
  todo: { bg: "bg-slate-200", fill: "bg-slate-400", text: "text-slate-600" },
  in_progress: { bg: "bg-blue-100", fill: "bg-gradient-to-r from-blue-400 to-blue-600", text: "text-blue-600" },
  blocked: { bg: "bg-red-100", fill: "bg-gradient-to-r from-red-400 to-red-600", text: "text-red-600" },
  review: { bg: "bg-amber-100", fill: "bg-gradient-to-r from-amber-400 to-amber-500", text: "text-amber-600" },
  done: { bg: "bg-emerald-100", fill: "bg-gradient-to-r from-emerald-400 to-emerald-600", text: "text-emerald-600" },
  default: { bg: "bg-gray-200", fill: "bg-gradient-to-r from-gray-400 to-gray-500", text: "text-gray-600" }
};

export default function ProgressBar({ 
  progress = 0, 
  status = "default",
  size = "md", 
  showLabel = true,
  showPercentage = true,
  label = "",
  animated = true,
  className = ""
}) {
  const colors = statusColors[status] || statusColors.default;
  
  const heights = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
    xl: "h-4"
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {showLabel && label && (
            <span className="text-xs font-medium text-gray-600">{label}</span>
          )}
          {showPercentage && (
            <span className={`text-xs font-semibold ${colors.text}`}>
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${colors.bg} rounded-full overflow-hidden ${heights[size]}`}>
        <motion.div
          className={`h-full rounded-full ${colors.fill}`}
          initial={animated ? { width: 0 } : { width: `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function CircularProgress({ 
  progress = 0, 
  size = 60, 
  strokeWidth = 6,
  status = "default",
  showPercentage = true,
  className = ""
}) {
  const colors = statusColors[status] || statusColors.default;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clampedProgress / 100) * circumference;

  const strokeColor = {
    todo: "#94a3b8",
    in_progress: "#3b82f6",
    blocked: "#ef4444",
    review: "#f59e0b",
    done: "#10b981",
    default: "#6b7280"
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor[status] || strokeColor.default}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${colors.text}`}>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}