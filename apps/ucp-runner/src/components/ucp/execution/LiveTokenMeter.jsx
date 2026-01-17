import React from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingDown, TrendingUp, Zap } from 'lucide-react';

export default function LiveTokenMeter({ stats, pricing, cacheStatus }) {
  if (!stats) return null;

  const inputCost = (stats.inputTokens / 1000) * (pricing?.inputPrice || 0.00015);
  const outputCost = (stats.outputTokens / 1000) * (pricing?.outputPrice || 0.0006);
  const totalCost = inputCost + outputCost;
  const savedCost = stats.avoidedCostUsd || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-violet-400" />
          <span className="font-medium text-violet-400">Live Token Usage</span>
        </div>
        {cacheStatus && (
          <span className={`px-2 py-1 text-xs font-bold rounded ${
            cacheStatus === 'HIT' 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            Cache {cacheStatus}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <p className="text-xs text-slate-400">Input</p>
          </div>
          <p className="text-lg font-bold text-white">{stats.inputTokens?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500">${inputCost.toFixed(5)}</p>
        </div>
        
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3 text-purple-400" />
            <p className="text-xs text-slate-400">Output</p>
          </div>
          <p className="text-lg font-bold text-white">{stats.outputTokens?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500">${outputCost.toFixed(5)}</p>
        </div>
        
        <div className="bg-cyan-500/10 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <p className="text-lg font-bold text-cyan-400">{stats.totalTokens?.toLocaleString() || 0}</p>
          <p className="text-xs text-cyan-400/70">${totalCost.toFixed(5)}</p>
        </div>
        
        <div className={`rounded-lg p-3 ${stats.savedTokens > 0 ? 'bg-emerald-500/20' : 'bg-slate-900/50'}`}>
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <p className="text-xs text-slate-400">Saved</p>
          </div>
          <p className={`text-lg font-bold ${stats.savedTokens > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
            {stats.savedTokens > 0 ? `+${stats.savedTokens.toLocaleString()}` : '0'}
          </p>
          {savedCost > 0 && <p className="text-xs text-emerald-400/70">+${savedCost.toFixed(5)}</p>}
        </div>
      </div>

      {/* Efficiency bar */}
      {stats.baselineTokens > 0 && (
        <div className="mt-3 pt-3 border-t border-violet-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Efficiency vs Baseline</span>
            <span className="text-sm font-medium text-emerald-400">{stats.efficiency || 0}%</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.efficiency || 0, 100)}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}