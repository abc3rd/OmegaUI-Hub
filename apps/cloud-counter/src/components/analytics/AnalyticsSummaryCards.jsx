import React from "react";
import { motion } from "framer-motion";
import { Zap, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ icon: Icon, title, value, color, isLoading, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white/70 text-sm">{title}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-24 bg-white/20 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-white">{value}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function AnalyticsSummaryCards({ readings, isLoading }) {
  const totalConsumption = readings.reduce((sum, r) => sum + r.consumption_kwh, 0);
  const totalCost = readings.reduce((sum, r) => sum + r.cost, 0);
  const peakConsumption = Math.max(0, ...readings.map(r => r.consumption_kwh));

  const stats = [
    { icon: Zap, title: "Total Consumption", value: `${totalConsumption.toFixed(1)} kWh`, color: "bg-blue-500", delay: 0 },
    { icon: DollarSign, title: "Total Cost", value: `$${totalCost.toFixed(2)}`, color: "bg-green-500", delay: 0.1 },
    { icon: TrendingUp, title: "Avg. Daily Cost", value: `$${(totalCost / 30).toFixed(2)}`, color: "bg-purple-500", delay: 0.2 },
    { icon: AlertCircle, title: "Peak Consumption", value: `${peakConsumption.toFixed(1)} kWh`, color: "bg-red-500", delay: 0.3 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map(stat => <StatCard key={stat.title} {...stat} isLoading={isLoading} />)}
    </div>
  );
}