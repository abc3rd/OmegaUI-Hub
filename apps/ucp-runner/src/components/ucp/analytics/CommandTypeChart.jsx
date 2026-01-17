import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Languages, Code, HelpCircle, BarChart3, RefreshCw, ListOrdered, Zap 
} from 'lucide-react';

const COMMAND_COLORS = {
  SUMMARIZE: { bg: 'bg-cyan-500', text: 'text-cyan-400' },
  TRANSLATE: { bg: 'bg-violet-500', text: 'text-violet-400' },
  GENCODE: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
  EXPLAIN: { bg: 'bg-amber-500', text: 'text-amber-400' },
  ANALYZE: { bg: 'bg-blue-500', text: 'text-blue-400' },
  REWRITE: { bg: 'bg-rose-500', text: 'text-rose-400' },
  LIST: { bg: 'bg-teal-500', text: 'text-teal-400' },
  OTHER: { bg: 'bg-slate-500', text: 'text-slate-400' }
};

const COMMAND_ICONS = {
  SUMMARIZE: FileText,
  TRANSLATE: Languages,
  GENCODE: Code,
  EXPLAIN: HelpCircle,
  ANALYZE: BarChart3,
  REWRITE: RefreshCw,
  LIST: ListOrdered,
  OTHER: Zap
};

export default function CommandTypeChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Token Usage by Command Type</h3>
        <p className="text-slate-500 text-sm text-center py-8">No command data available</p>
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, d) => sum + d.tokens, 0);
  const sortedData = Object.entries(data)
    .map(([type, stats]) => ({ type, ...stats, percent: total > 0 ? (stats.tokens / total) * 100 : 0 }))
    .sort((a, b) => b.tokens - a.tokens);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        Token Usage by Command Type
      </h3>

      {/* Pie Chart Visual */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {(() => {
              let offset = 0;
              return sortedData.map((item, i) => {
                const circumference = 2 * Math.PI * 40;
                const strokeDash = (item.percent / 100) * circumference;
                const currentOffset = offset;
                offset += strokeDash;
                const colors = COMMAND_COLORS[item.type] || COMMAND_COLORS.OTHER;
                return (
                  <circle
                    key={item.type}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors.bg.replace('bg-', '')}
                    strokeWidth="20"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeDashoffset={-currentOffset}
                    className={colors.bg}
                    style={{ opacity: 0.8 }}
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{total.toLocaleString()}</p>
              <p className="text-xs text-slate-400">tokens</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {sortedData.slice(0, 6).map((item) => {
            const Icon = COMMAND_ICONS[item.type] || COMMAND_ICONS.OTHER;
            const colors = COMMAND_COLORS[item.type] || COMMAND_COLORS.OTHER;
            return (
              <div key={item.type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${colors.bg}`} />
                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                <span className="text-xs text-slate-300 truncate">{item.type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-2">
        {sortedData.map((item, i) => {
          const Icon = COMMAND_ICONS[item.type] || COMMAND_ICONS.OTHER;
          const colors = COMMAND_COLORS[item.type] || COMMAND_COLORS.OTHER;
          return (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <Icon className={`w-4 h-4 ${colors.text}`} />
              <span className="text-sm text-slate-300 w-24">{item.type}</span>
              <div className="flex-1 h-4 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={`h-full ${colors.bg} rounded-full`}
                  style={{ opacity: 0.8 }}
                />
              </div>
              <div className="text-right w-24">
                <span className="text-sm text-white font-medium">{item.tokens.toLocaleString()}</span>
                <span className="text-xs text-slate-500 ml-1">({item.percent.toFixed(1)}%)</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}