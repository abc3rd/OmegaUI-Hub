import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';

export default function Scene8ROI() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Chart container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xs"
      >
        <div className="text-center mb-6">
          <span className="text-white/50 text-sm uppercase tracking-wider">Cost Comparison</span>
        </div>

        {/* Bar chart */}
        <div className="space-y-6">
          {/* Traditional AI bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-sm">Traditional AI</span>
              <span className="text-[#c4653a] text-sm font-medium">$100,000</span>
            </div>
            <div className="h-10 bg-white/5 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-lg flex items-center justify-end pr-3"
                style={{
                  background: 'linear-gradient(90deg, #c4653a40, #c4653a)',
                  boxShadow: '0 0 20px rgba(196, 101, 58, 0.3)',
                }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-white font-bold text-xs"
                >
                  HIGH COST
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* UCP bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-sm">UCP</span>
              <span className="text-[#4bce2a] text-sm font-medium">$1,000</span>
            </div>
            <div className="h-10 bg-white/5 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '1%' }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="h-full rounded-lg min-w-[40px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(90deg, #4bce2a40, #4bce2a)',
                  boxShadow: '0 0 30px rgba(75, 206, 42, 0.5)',
                }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="text-white font-bold text-[10px]"
                >
                  1%
                </motion.span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Savings indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center"
        >
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(75, 206, 42, 0.1), rgba(38, 153, 254, 0.1))',
              border: '1px solid rgba(75, 206, 42, 0.3)',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-3xl font-bold text-[#4bce2a]"
            >
              99%
            </motion.span>
            <span className="text-white/70">Savings</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="mt-8"
      >
        <NeonText color="#2699fe" size="text-lg">
          Enterprise Ready
        </NeonText>
      </motion.div>

      {/* Floating dollar signs */}
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${15 + i * 18}%`,
            color: '#4bce2a',
            opacity: 0.2,
          }}
          animate={{
            y: [100, -100],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 0.4,
            repeat: Infinity,
          }}
        >
          $
        </motion.span>
      ))}
    </div>
  );
}