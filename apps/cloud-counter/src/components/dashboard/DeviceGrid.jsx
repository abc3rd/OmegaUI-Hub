import React from "react";
import { motion } from "framer-motion";
import { Monitor, Lightbulb, Thermometer, Tv, WashingMachine, Droplets, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const deviceIcons = {
  lighting: Lightbulb,
  hvac: Thermometer,
  kitchen: Monitor,
  entertainment: Tv,
  laundry: WashingMachine,
  water_heating: Droplets,
  other: MoreHorizontal
};

const DeviceCard = ({ device, usage, cost, delay }) => {
  const Icon = deviceIcons[device.type] || MoreHorizontal;
  const efficiency = usage < 2 ? 'excellent' : usage < 5 ? 'good' : usage < 8 ? 'average' : 'poor';
  
  const efficiencyColors = {
    excellent: 'bg-green-500/20 text-green-300 border-green-500/30',
    good: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    average: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    poor: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group relative overflow-hidden cursor-pointer"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <Badge className={`${efficiencyColors[efficiency]} text-xs`}>
              {efficiency}
            </Badge>
          </div>

          {/* Device Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">{device.name}</h4>
            <p className="text-white/60 text-xs capitalize">{device.location}</p>
            
            {/* Usage Stats */}
            <div className="flex justify-between items-end pt-2">
              <div>
                <p className="text-white font-bold text-lg">{usage.toFixed(1)}</p>
                <p className="text-white/60 text-xs">kWh</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">${cost.toFixed(2)}</p>
                <p className="text-white/60 text-xs">cost</p>
              </div>
            </div>
          </div>
        </div>

        {/* Light reflection */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </motion.div>
  );
};

export default function DeviceGrid({ devices, readings, isLoading }) {
  // Calculate usage per device
  const deviceUsage = devices.map(device => {
    const deviceReadings = readings.filter(r => r.device_name === device.name);
    const usage = deviceReadings.reduce((sum, r) => sum + (r.consumption_kwh || 0), 0);
    const cost = deviceReadings.reduce((sum, r) => sum + (r.cost || 0), 0);
    return { ...device, usage, cost };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Monitor className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Connected Devices</h2>
        <Badge className="bg-white/10 text-white/80 border-white/20">
          {devices.length} active
        </Badge>
      </motion.div>

      {/* Device Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Skeleton className="h-10 w-10 rounded-lg bg-white/20 mb-3" />
              <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
              <Skeleton className="h-3 w-16 bg-white/20 mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-12 bg-white/20" />
                <Skeleton className="h-4 w-16 bg-white/20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {deviceUsage.map((device, index) => (
            <DeviceCard
              key={device.id}
              device={device}
              usage={device.usage}
              cost={device.cost}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}
    </div>
  );
}