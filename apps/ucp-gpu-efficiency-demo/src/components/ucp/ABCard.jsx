import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, Server } from 'lucide-react';

export default function ABCard({ title, type, metrics, isRunning, delay = 0 }) {
  const isUcp = type === 'ucp';
  const accentColor = isUcp ? '#4bce2a' : '#c4653a';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative flex-1"
    >
      <div 
        className={`relative bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border overflow-hidden transition-all duration-300 ${
          isRunning ? 'border-[#ea00ea]/50' : 'border-[#3c3c3c]'
        }`}
      >
        {/* Running indicator */}
        {isRunning && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ea00ea] via-[#2699fe] to-[#ea00ea] animate-pulse" />
        )}
        
        {/* Header */}
        <div className="p-6 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {isUcp 
              ? 'GPU inference on cache miss only' 
              : 'GPU runs every request'
            }
          </p>
        </div>
        
        {/* Metrics grid */}
        <div className="p-6 space-y-4">
          <MetricRow 
            icon={Zap} 
            label="GPU Power" 
            value={`${metrics.avgWatts}W`}
            highlight={isUcp}
          />
          <MetricRow 
            icon={Activity} 
            label="Utilization" 
            value={`${metrics.utilization}%`}
            highlight={isUcp}
          />
          <MetricRow 
            icon={Cpu} 
            label="Tasks/min" 
            value={metrics.tasksPerMin}
            highlight={isUcp}
          />
          <MetricRow 
            icon={Server} 
            label="Cache Hits" 
            value={`${metrics.cacheHitRate}%`}
            highlight={isUcp}
          />
        </div>
        
        {/* Efficiency badge */}
        {isUcp && (
          <div className="px-6 pb-6">
            <div className="rounded-xl bg-[#4bce2a]/10 border border-[#4bce2a]/20 p-4">
              <div className="text-xs uppercase tracking-wider text-[#4bce2a] mb-1">
                Efficiency Gain
              </div>
              <div className="text-2xl font-bold text-white">
                {metrics.efficiencyGain}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                More useful work per joule
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MetricRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          highlight ? 'bg-[#4bce2a]/10' : 'bg-[#3c3c3c]'
        }`}>
          <Icon className={`w-4 h-4 ${highlight ? 'text-[#4bce2a]' : 'text-gray-400'}`} />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}