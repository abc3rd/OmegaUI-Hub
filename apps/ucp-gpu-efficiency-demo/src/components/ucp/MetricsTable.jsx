import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricsTable({ baselineMetrics, ucpMetrics, delay = 0 }) {
  const rows = [
    { 
      label: 'Avg GPU Watts', 
      baseline: `${baselineMetrics.avgWatts}W`,
      ucp: `${ucpMetrics.avgWatts}W`,
      change: calculateChange(baselineMetrics.avgWatts, ucpMetrics.avgWatts),
      goodIfLower: true
    },
    { 
      label: 'Tasks/min', 
      baseline: baselineMetrics.tasksPerMin,
      ucp: ucpMetrics.tasksPerMin,
      change: calculateChange(baselineMetrics.tasksPerMin, ucpMetrics.tasksPerMin),
      goodIfLower: false
    },
    { 
      label: 'Joules/Task', 
      baseline: baselineMetrics.joulesPerTask.toFixed(1),
      ucp: ucpMetrics.joulesPerTask.toFixed(1),
      change: calculateChange(baselineMetrics.joulesPerTask, ucpMetrics.joulesPerTask),
      goodIfLower: true
    },
    { 
      label: 'Cache Hit %', 
      baseline: `${baselineMetrics.cacheHitRate}%`,
      ucp: `${ucpMetrics.cacheHitRate}%`,
      change: null,
      goodIfLower: false
    },
    { 
      label: 'Tokens/sec/Watt', 
      baseline: baselineMetrics.tokensPerSecWatt.toFixed(2),
      ucp: ucpMetrics.tokensPerSecWatt.toFixed(2),
      change: calculateChange(baselineMetrics.tokensPerSecWatt, ucpMetrics.tokensPerSecWatt),
      goodIfLower: false
    },
  ];

  const efficiencyGain = Math.round(
    ((baselineMetrics.joulesPerTask - ucpMetrics.joulesPerTask) / baselineMetrics.joulesPerTask) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border border-[#3c3c3c] overflow-hidden"
    >
      <div className="p-6 border-b border-[#3c3c3c]">
        <h3 className="text-lg font-semibold text-white">Proof Metrics</h3>
        <p className="text-sm text-gray-400 mt-1">
          Quantified efficiency improvements with UCP deterministic caching
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#3c3c3c]">
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500 font-medium">
                Metric
              </th>
              <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-500 font-medium">
                Baseline
              </th>
              <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-500 font-medium">
                UCP Mode
              </th>
              <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-500 font-medium">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr 
                key={row.label}
                className="border-b border-[#3c3c3c]/50 hover:bg-[#3c3c3c]/20 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-300">{row.label}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-400">{row.baseline}</td>
                <td className="px-6 py-4 text-sm text-right font-medium text-white">{row.ucp}</td>
                <td className="px-6 py-4 text-right">
                  {row.change !== null ? (
                    <ChangeIndicator 
                      value={row.change} 
                      goodIfLower={row.goodIfLower}
                    />
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Efficiency Gain Footer */}
      <div className="p-6 bg-gradient-to-r from-[#4bce2a]/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#4bce2a] mb-1">
              Overall Efficiency Gain
            </div>
            <p className="text-sm text-gray-400">
              Useful work per joule improvement
            </p>
          </div>
          <div className="text-4xl font-bold text-white">
            {efficiencyGain}%
            <TrendingUp className="inline-block ml-2 w-6 h-6 text-[#4bce2a]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function calculateChange(baseline, ucp) {
  return Math.round(((ucp - baseline) / baseline) * 100);
}

function ChangeIndicator({ value, goodIfLower }) {
  const isGood = goodIfLower ? value < 0 : value > 0;
  const color = isGood ? 'text-[#4bce2a]' : value === 0 ? 'text-gray-500' : 'text-[#c4653a]';
  
  return (
    <div className={`flex items-center justify-end gap-1 ${color}`}>
      {value > 0 ? (
        <TrendingUp className="w-4 h-4" />
      ) : value < 0 ? (
        <TrendingDown className="w-4 h-4" />
      ) : (
        <Minus className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {value > 0 ? '+' : ''}{value}%
      </span>
    </div>
  );
}