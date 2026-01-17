import React from 'react';
import { motion } from 'framer-motion';

export default function GlytchAvatar({ status = 'idle', size = 'md' }) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const statusColors = {
    idle: '#00d4ff',
    scanning: '#ea00ea',
    success: '#00ff88',
    error: '#ff0055',
    syncing: '#00d4ff'
  };

  return (
    <div className={`relative ${sizes[size]} flex items-center justify-center`}>
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-20"
        style={{ backgroundColor: statusColors[status] }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2"
        style={{ borderColor: statusColors[status] }}
        animate={{
          rotate: status === 'scanning' || status === 'syncing' ? 360 : 0
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Core */}
      <motion.div
        className="relative w-3/5 h-3/5 rounded-full flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${statusColors[status]}40, ${statusColors[status]}80)`,
          boxShadow: `0 0 30px ${statusColors[status]}50`
        }}
        animate={{
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Inner geometric pattern */}
        <svg viewBox="0 0 40 40" className="w-full h-full p-2">
          <motion.path
            d="M20 5 L35 15 L35 30 L20 35 L5 30 L5 15 Z"
            fill="none"
            stroke={statusColors[status]}
            strokeWidth="1.5"
            animate={{
              strokeDasharray: status === 'scanning' ? ['0 100', '100 0'] : '100 0'
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
          <circle cx="20" cy="20" r="4" fill={statusColors[status]} />
        </svg>
      </motion.div>

      {/* Status indicator dot */}
      <motion.div
        className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
        style={{ backgroundColor: statusColors[status] }}
        animate={{
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity
        }}
      />
    </div>
  );
}