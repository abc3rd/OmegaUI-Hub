import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContextWindowMeter({ used = 0, contextWindow = 4096, className }) {
  const percentage = Math.min(100, Math.max(0, used));
  
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };
  
  const getTextColor = () => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 font-medium">Context Window</span>
        <span className={cn("font-mono font-semibold", getTextColor())}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out rounded-full", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>0</span>
        <span>{contextWindow.toLocaleString()} tokens</span>
      </div>
      
      {percentage >= 75 && (
        <div className={cn(
          "flex items-center gap-2 text-xs p-2 rounded-lg",
          percentage >= 90 ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
        )}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {percentage >= 90 
              ? "Critical: Context window nearly full. Truncation imminent."
              : "Warning: High context usage. Consider shorter prompts."}
          </span>
        </div>
      )}
    </div>
  );
}