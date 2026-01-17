import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function TopApps({ topApps }) {
  const maxCount = Math.max(...topApps.map(app => app.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Most Accessed Apps</h3>
      </div>

      <div className="space-y-4">
        {topApps.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No usage data yet</p>
        ) : (
          topApps.map((app, index) => (
            <div key={app.app_name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {index + 1}. {app.app_name}
                </span>
                <span className="text-sm font-semibold text-gray-900">{app.count} opens</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(app.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}