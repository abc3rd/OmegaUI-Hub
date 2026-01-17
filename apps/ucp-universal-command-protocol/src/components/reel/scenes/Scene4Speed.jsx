import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import { Brain, Zap } from 'lucide-react';

export default function Scene4Speed() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Split screen container */}
      <div className="w-full max-w-sm">
        {/* Left side - Single interpretation */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative mb-4"
        >
          <div className="text-center mb-2">
            <span className="text-xs text-white/50 uppercase tracking-wider">Traditional</span>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-8 h-8 text-[#c4653a]" />
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-bold text-[#c4653a]"
              >
                1
              </motion.div>
            </div>
            <p className="text-center text-xs text-white/40 mt-2">interpretation</p>
          </div>
        </motion.div>

        {/* VS divider */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center my-2"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="px-3 text-white/30 text-sm">VS</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>

        {/* Right side - Instant executions */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="text-center mb-2">
            <span className="text-xs text-white/50 uppercase tracking-wider">UCP</span>
          </div>
          <div className="bg-gradient-to-br from-[#4bce2a]/10 to-[#2699fe]/10 rounded-xl p-4 border border-[#4bce2a]/30">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-8 h-8 text-[#4bce2a]" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-[#4bce2a]"
              >
                ∞
              </motion.div>
            </div>
            <p className="text-center text-xs text-white/40 mt-2">instant executions</p>

            {/* Execution particles */}
            <div className="flex justify-center gap-1 mt-3">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#4bce2a]"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex gap-6"
      >
        <div className="text-center">
          <NeonText color="#4bce2a" size="text-3xl">99%</NeonText>
          <p className="text-white/50 text-sm mt-1">Cheaper</p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="text-center">
          <NeonText color="#2699fe" size="text-3xl">600×</NeonText>
          <p className="text-white/50 text-sm mt-1">Faster</p>
        </div>
      </motion.div>
    </div>
  );
}