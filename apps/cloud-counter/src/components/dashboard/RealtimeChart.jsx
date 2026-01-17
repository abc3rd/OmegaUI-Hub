import React from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg border border-white/20 shadow-lg">
        <p className="text-gray-600 text-sm">{`Time: ${label}`}</p>
        <p className="text-blue-600 font-medium">{`Usage: ${payload[0].value} kWh`}</p>
      </div>
    );
  }
  return null;
};

export default function RealtimeChart({ readings, isLoading }) {
  const chartData = readings
    .slice(0, 24)
    .reverse()
    .map((reading, index) => ({
      time: format(new Date(reading.timestamp), 'HH:mm'),
      usage: reading.consumption_kwh,
      cost: reading.cost
    }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative"
    >
      {/* Glass container */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Real-time Usage</h3>
                <p className="text-white/60 text-sm">Last 24 hours</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-white/60 text-sm">Live</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-xs font-medium">Active</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full bg-white/20" />
                <Skeleton className="h-8 w-full bg-white/20" />
                <Skeleton className="h-8 w-full bg-white/20" />
                <Skeleton className="h-8 w-full bg-white/20" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="url(#gradient1)" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#EF4444' }}
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Light reflection */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </motion.div>
  );
}