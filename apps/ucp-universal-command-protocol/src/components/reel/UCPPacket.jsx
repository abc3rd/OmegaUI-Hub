import React from 'react';
import { motion } from 'framer-motion';

export default function UCPPacket({ scale = 1, rotating = false, showFields = false }) {
  const packetFields = [
    { key: 'intent', value: '"execute_task"', color: '#ea00ea' },
    { key: 'params', value: '{...}', color: '#2699fe' },
    { key: 'signature', value: '"0x..."', color: '#4bce2a' },
    { key: 'drivers', value: '["ai", "local"]', color: '#c4653a' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: scale,
        rotateY: rotating ? [0, 360] : 0,
      }}
      transition={{ 
        duration: rotating ? 4 : 0.5,
        repeat: rotating ? Infinity : 0,
        ease: rotating ? 'linear' : 'easeOut'
      }}
      className="relative"
      style={{ perspective: '1000px' }}
    >
      {/* Outer glow container */}
      <div 
        className="relative rounded-2xl p-1"
        style={{
          background: 'linear-gradient(135deg, #ea00ea, #2699fe, #4bce2a)',
          boxShadow: '0 0 30px rgba(234, 0, 234, 0.5), 0 0 60px rgba(38, 153, 254, 0.3)',
        }}
      >
        {/* Inner packet */}
        <div 
          className="rounded-xl p-4 min-w-[200px]"
          style={{
            background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.95), rgba(30, 30, 50, 0.95))',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="w-2 h-2 rounded-full bg-[#ea00ea] animate-pulse" />
            <span className="text-xs font-mono text-white/80">UCP.v1</span>
          </div>

          {/* Fields */}
          {showFields && (
            <div className="space-y-2 font-mono text-xs">
              {packetFields.map((field, i) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-2"
                >
                  <span style={{ color: field.color }}>{field.key}:</span>
                  <span className="text-white/60">{field.value}</span>
                </motion.div>
              ))}
            </div>
          )}

          {!showFields && (
            <div className="flex items-center justify-center py-2">
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 20px #ea00ea', '0 0 40px #2699fe', '0 0 20px #ea00ea']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">U</span>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Particle effects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ['#ea00ea', '#2699fe', '#4bce2a'][i % 3],
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: [0, Math.cos(i * 60 * Math.PI / 180) * 80],
            y: [0, Math.sin(i * 60 * Math.PI / 180) * 80],
            opacity: [0.8, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
}