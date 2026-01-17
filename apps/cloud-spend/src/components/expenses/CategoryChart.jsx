import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { categoryConfig } from './CategoryBadge';
import { motion } from 'framer-motion';

const COLORS = {
  food: '#f97316',
  transport: '#3b82f6',
  shopping: '#ec4899',
  bills: '#64748b',
  entertainment: '#a855f7',
  health: '#10b981',
  travel: '#06b6d4',
  other: '#6b7280'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100">
        <p className="text-sm font-medium text-slate-900">{data.label}</p>
        <p className="text-lg font-semibold">${data.value.toFixed(2)}</p>
        <p className="text-xs text-slate-500">{data.percentage}%</p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ expenses }) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const chartData = Object.entries(categoryTotals)
    .map(([category, value]) => ({
      name: category,
      label: categoryConfig[category]?.label || category,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-slate-400">
        No expenses to display
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-[180px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name] || COLORS.other}
                  className="transition-all duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex-1 space-y-2">
        {chartData.slice(0, 5).map((item, index) => {
          const Icon = categoryConfig[item.name]?.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[item.name] }}
                />
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                ${item.value.toFixed(2)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}