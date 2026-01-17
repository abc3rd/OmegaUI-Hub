import React from 'react';
import { motion } from 'framer-motion';

export default function GlytchMessage({ message, type = 'info' }) {
  const typeStyles = {
    info: 'border-[#00d4ff] bg-[#00d4ff]/5',
    alert: 'border-[#ea00ea] bg-[#ea00ea]/5',
    success: 'border-[#00ff88] bg-[#00ff88]/5'
  };

  const typeColors = {
    info: '#00d4ff',
    alert: '#ea00ea',
    success: '#00ff88'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border ${typeStyles[type]} p-4 overflow-hidden`}
    >
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 h-1 opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${typeColors[type]}, transparent)` }}
        animate={{
          top: ['0%', '100%', '0%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <div className="flex items-start gap-3">
        <div 
          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
          style={{ backgroundColor: typeColors[type], boxShadow: `0 0 10px ${typeColors[type]}` }}
        />
        <p className="text-sm text-slate-300 font-mono leading-relaxed">
          {message}
        </p>
      </div>
    </motion.div>
  );
}