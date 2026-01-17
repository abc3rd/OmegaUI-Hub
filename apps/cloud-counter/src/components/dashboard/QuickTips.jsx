import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingDown, Clock, Zap } from "lucide-react";

const tips = [
  {
    icon: Lightbulb,
    title: "LED Upgrade",
    description: "Switch to LED bulbs to save 75% on lighting costs",
    savings: "$45/year",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: TrendingDown,
    title: "AC Optimization",
    description: "Set thermostat 2°F higher to reduce HVAC usage",
    savings: "$180/year",
    color: "from-blue-400 to-cyan-500"
  },
  {
    icon: Clock,
    title: "Off-Peak Usage",
    description: "Run appliances during off-peak hours (9PM-6AM)",
    savings: "$90/year",
    color: "from-purple-400 to-pink-500"
  },
  {
    icon: Zap,
    title: "Unplug Devices",
    description: "Unplug electronics when not in use to eliminate phantom load",
    savings: "$65/year",
    color: "from-green-400 to-emerald-500"
  }
];

export default function QuickTips() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Smart Tips</h2>
      </motion.div>

      {/* Tips */}
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group cursor-pointer"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/15">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${tip.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <tip.icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-white text-sm">{tip.title}</h4>
                      <span className="text-green-300 text-xs font-medium">{tip.savings}</span>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              </div>

              {/* Light reflection */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        View All Recommendations
      </motion.button>
    </div>
  );
}