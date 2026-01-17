import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Coins } from 'lucide-react';

export default function TokenDisplay({ 
  promptTokens = 0, 
  completionTokens = 0, 
  method = 'local-estimated',
  costEstimate = 0,
  compact = false,
  className 
}) {
  const totalTokens = promptTokens + completionTokens;
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <Coins className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono text-slate-600">{totalTokens.toLocaleString()}</span>
        {costEstimate > 0 && (
          <span className="text-emerald-600 font-medium">
            ${costEstimate.toFixed(4)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-slate-50 rounded-xl p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Token Usage</h4>
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          method === 'provider-reported' 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-slate-200 text-slate-600"
        )}>
          {method === 'provider-reported' ? 'Provider Reported' : 'Estimated'}
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-3">
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-blue-600">
            {promptTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Input</div>
        </div>
        
        <ArrowRight className="w-4 h-4 text-slate-300" />
        
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-purple-600">
            {completionTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Output</div>
        </div>
        
        <div className="w-px h-10 bg-slate-200" />
        
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-slate-800">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total</div>
        </div>
      </div>
      
      {costEstimate > 0 && (
        <div className="pt-2 border-t border-slate-200 text-center">
          <span className="text-xs text-slate-500">Estimated Cost: </span>
          <span className="text-sm font-semibold text-emerald-600">
            ${costEstimate.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}