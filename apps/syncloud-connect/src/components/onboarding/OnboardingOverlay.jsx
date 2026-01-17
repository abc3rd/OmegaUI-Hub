import React from 'react';
import { motion } from 'framer-motion';

export default function OnboardingOverlay({ targetRect, padding = 8 }) {
  if (!targetRect) return null;

  const { top, left, width, height } = targetRect;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] pointer-events-none"
    >
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={left - padding}
              y={top - padding}
              width={width + padding * 2}
              height={height + padding * 2}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Animated border around spotlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute rounded-xl border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        style={{
          top: top - padding,
          left: left - padding,
          width: width + padding * 2,
          height: height + padding * 2,
        }}
      >
        {/* Pulsing animation */}
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(59,130,246,0.3)',
              '0 0 40px rgba(59,130,246,0.6)',
              '0 0 20px rgba(59,130,246,0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-xl"
        />
      </motion.div>
    </motion.div>
  );
}