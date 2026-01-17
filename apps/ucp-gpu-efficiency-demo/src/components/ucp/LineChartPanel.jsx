import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f1f1f] border border-[#3c3c3c] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="font-medium text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function LineChartPanel({ title, data, dataKeys, yAxisLabel, unit, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border border-[#3c3c3c] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {unit && (
          <span className="text-xs text-gray-500 uppercase tracking-wider">{unit}</span>
        )}
      </div>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
            <XAxis 
              dataKey="time" 
              stroke="#666"
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: '#3c3c3c' }}
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: '#3c3c3c' }}
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                fill: '#666',
                fontSize: 11
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key.name}
                type="monotone"
                dataKey={key.name}
                name={key.label}
                stroke={key.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: key.color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}