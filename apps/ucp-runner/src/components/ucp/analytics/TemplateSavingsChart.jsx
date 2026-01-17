import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, TrendingDown, Coins, Award } from 'lucide-react';

export default function TemplateSavingsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Cost Savings by Template</h3>
        <p className="text-slate-500 text-sm text-center py-8">No template savings data available</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.savedTokens - a.savedTokens);
  const maxSaved = Math.max(...sortedData.map(d => d.savedTokens), 1);
  const totalSaved = sortedData.reduce((sum, d) => sum + d.savedTokens, 0);
  const totalCostSaved = sortedData.reduce((sum, d) => sum + d.savedCost, 0);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          Cost Savings by Template
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Tokens Saved</p>
            <p className="text-lg font-bold text-emerald-400">{totalSaved.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Est. Cost Saved</p>
            <p className="text-lg font-bold text-emerald-400">${totalCostSaved.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Top Performer Badge */}
      {sortedData.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4 flex items-center gap-3">
          <Award className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-sm text-emerald-400 font-medium">Top Saver: {sortedData[0].name}</p>
            <p className="text-xs text-slate-400">
              {sortedData[0].savedTokens.toLocaleString()} tokens saved ({sortedData[0].usageCount} uses)
            </p>
          </div>
        </div>
      )}

      {/* Template Bars */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {sortedData.map((item, i) => {
          const percent = (item.savedTokens / maxSaved) * 100;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-white font-medium truncate max-w-48">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">{item.usageCount}x used</span>
                  <span className="text-emerald-400 font-medium">${item.savedCost.toFixed(4)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-emerald-400 font-medium w-20 text-right">
                  {item.savedTokens.toLocaleString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}