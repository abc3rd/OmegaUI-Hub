import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ScoreDisplay({ 
  score = 0, 
  breakdown = {},
  label = "Score",
  size = "md",
  showBreakdown = true,
  className 
}) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getScoreBg = () => {
    if (score >= 80) return 'bg-emerald-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };
  
  const getScoreIcon = () => {
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    if (score >= 40) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const breakdownItems = Object.entries(breakdown).map(([key, value]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: typeof value === 'number' ? value : 0
  }));

  return (
    <TooltipProvider>
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl",
          getScoreBg()
        )}>
          <span className={cn(getScoreColor())}>{getScoreIcon()}</span>
          <span className={cn("font-mono font-bold", sizeClasses[size], getScoreColor())}>
            {Math.round(score)}
          </span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
        
        {showBreakdown && breakdownItems.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                <Info className="w-4 h-4 text-slate-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="w-64 p-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 mb-2">Score Breakdown</p>
                {breakdownItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-slate-500">{item.label}</span>
                    <span className={cn(
                      "font-mono font-medium",
                      item.value > 20 ? "text-emerald-600" : 
                      item.value > 10 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {item.value > 0 ? '+' : ''}{item.value}
                    </span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}