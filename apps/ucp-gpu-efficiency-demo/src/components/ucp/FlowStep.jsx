import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function FlowStep({ step, title, description, icon: Icon, isLast, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center"
    >
      <div className="relative">
        {/* Step card */}
        <div className="relative bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-[#3c3c3c] min-w-[280px] group hover:border-[#ea00ea]/30 transition-all duration-300">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ea00ea]/20 to-[#2699fe]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Step number */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#ea00ea]/60 flex items-center justify-center text-white font-bold text-sm">
                {step}
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#ea00ea]/30 to-transparent" />
            </div>
            
            {/* Icon */}
            {Icon && (
              <div className="w-12 h-12 rounded-xl bg-[#ea00ea]/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[#ea00ea]" />
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
      
      {/* Arrow connector */}
      {!isLast && (
        <div className="hidden md:flex items-center px-4">
          <div className="w-12 h-px bg-gradient-to-r from-[#ea00ea]/50 to-[#2699fe]/50" />
          <ChevronRight className="w-5 h-5 text-[#ea00ea]/60 -ml-1" />
        </div>
      )}
    </motion.div>
  );
}