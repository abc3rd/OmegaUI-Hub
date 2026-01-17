import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Clock, TrendingUp, Activity, Zap } from 'lucide-react';

const METRIC_OPTIONS = [
  { id: 'avgDuration', label: 'Avg Duration', color: '#f59e0b', unit: 'ms' },
  { id: 'successRate', label: 'Success Rate', color: '#10b981', unit: '%' },
  { id: 'cacheHitRate', label: 'Cache Hit Rate', color: '#8b5cf6', unit: '%' },
  { id: 'tokensPerRun', label: 'Tokens/Run', color: '#06b6d4', unit: '' }
];

export default function PerformanceChart({ data }) {
  const [selectedMetric, setSelectedMetric] = useState('avgDuration');

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Performance Over Time</h3>
        <p className="text-slate-500 text-sm text-center py-8">No performance data available</p>
      </div>
    );
  }

  const metric = METRIC_OPTIONS.find(m => m.id === selectedMetric);
  const chartData = data.map(d => ({
    date: d.date,
    displayDate: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: d[selectedMetric] || 0
  }));

  const avgValue = chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length;
  const minValue = Math.min(...chartData.map(d => d.value));
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Performance Over Time
        </h3>
        
        {/* Metric Selector */}
        <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
          {METRIC_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedMetric(opt.id)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedMetric === opt.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">Avg</p>
          <p className="text-lg font-bold" style={{ color: metric.color }}>
            {avgValue.toFixed(1)}{metric.unit}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">Min</p>
          <p className="text-lg font-bold text-slate-300">
            {minValue.toFixed(1)}{metric.unit}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">Max</p>
          <p className="text-lg font-bold text-slate-300">
            {maxValue.toFixed(1)}{metric.unit}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="displayDate" 
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
              formatter={(value) => [`${value.toFixed(1)}${metric.unit}`, metric.label]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2}
              fill={`url(#gradient-${selectedMetric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}