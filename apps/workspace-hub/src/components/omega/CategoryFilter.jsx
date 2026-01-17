import React from "react";
import { motion } from "framer-motion";

const categories = [
  { value: "All", emoji: "🌟" },
  { value: "Lead Gen", emoji: "🎯" },
  { value: "Data", emoji: "📊" },
  { value: "CRM", emoji: "👥" },
  { value: "Connectivity", emoji: "🔗" }
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="flex justify-center gap-3 mb-12">
      {categories.map((category, index) => (
        <motion.button
          key={category.value}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelectCategory(category.value)}
          className={`
            px-6 py-3 rounded-full font-bold text-lg transition-all duration-300
            ${selectedCategory === category.value
              ? 'bg-[#ea00ea] text-white shadow-lg shadow-[#ea00ea]/50 scale-110'
              : 'bg-[#2a2a2a] text-gray-300 border-2 border-[#2699fe] hover:border-[#ea00ea] hover:scale-105'
            }
          `}
        >
          <span className="mr-2">{category.emoji}</span>
          {category.value}
        </motion.button>
      ))}
    </div>
  );
}