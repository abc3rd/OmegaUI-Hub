import React from "react";
import { Users, MousePointer, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function UsageStats({ totalUsers, totalClicks, todayClicks }) {
  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Total App Opens", value: totalClicks, icon: MousePointer, color: "from-purple-500 to-pink-500" },
    { label: "Today's Activity", value: todayClicks, icon: TrendingUp, color: "from-green-500 to-emerald-500" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}