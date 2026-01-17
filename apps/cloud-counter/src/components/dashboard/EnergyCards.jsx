import React from "react";
import { motion } from "framer-motion";
import { Zap, DollarSign, TrendingUp, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ icon: Icon, title, value, subtitle, color, isLoading, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="group relative overflow-hidden"
    >
      {/* Glass card */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        
        {/* Floating icon */}
        <div className={`absolute -top-2 -right-2 w-16 h-16 ${color} rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-xl`}></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              {isLoading ? (
                <Skeleton className="h-8 w-20 bg-white/20" />
              ) : (
                <p className="text-2xl font-bold text-white">{value}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-white/90 font-medium text-sm">{title}</h3>
            {subtitle && (
              <p className="text-white/60 text-xs">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Light reflection */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </motion.div>
  );
};

export default function EnergyCards({ currentUsage, totalCost, avgEfficiency, isLoading }) {
  const cards = [
    {
      icon: Zap,
      title: "Current Usage",
      value: isLoading ? "..." : `${currentUsage.toFixed(2)} kWh`,
      subtitle: "Real-time consumption",
      color: "bg-gradient-to-r from-yellow-400 to-orange-500",
      delay: 0
    },
    {
      icon: DollarSign,
      title: "Total Cost",
      value: isLoading ? "..." : `$${totalCost.toFixed(2)}`,
      subtitle: "This billing period",
      color: "bg-gradient-to-r from-green-400 to-emerald-500",
      delay: 0.1
    },
    {
      icon: TrendingUp,
      title: "Efficiency Score",
      value: isLoading ? "..." : `${avgEfficiency.toFixed(0)}%`,
      subtitle: "Above average",
      color: "bg-gradient-to-r from-blue-400 to-purple-500",
      delay: 0.2
    },
    {
      icon: Award,
      title: "Savings Goal",
      value: isLoading ? "..." : "85%",
      subtitle: "Target: 15% reduction",
      color: "bg-gradient-to-r from-purple-400 to-pink-500",
      delay: 0.3
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}