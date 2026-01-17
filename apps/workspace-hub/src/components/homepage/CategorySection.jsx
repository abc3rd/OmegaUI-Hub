import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AppCard from "./AppCard";

export default function CategorySection({ 
  categoryKey, 
  category, 
  apps, 
  isExpanded, 
  onToggle,
  index 
}) {
  if (apps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-lg">{apps.length}</span>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#EA00EA] transition-colors">
              {category.name}
            </h2>
            <p className="text-sm text-gray-500">
              {apps.length} {apps.length === 1 ? 'application' : 'applications'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </button>

      {/* Apps Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
              {apps.map((app, idx) => (
                <AppCard key={app.id} app={app} index={idx} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}