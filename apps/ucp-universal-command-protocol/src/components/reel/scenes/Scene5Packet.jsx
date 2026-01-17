import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import UCPPacket from '../UCPPacket';

export default function Scene5Packet() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Glowing background grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(234, 0, 234, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(234, 0, 234, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Packet with fields */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150 }}
      >
        <UCPPacket showFields={true} scale={1.2} />
      </motion.div>

      {/* Field highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-wrap justify-center gap-3 px-4"
      >
        {[
          { label: 'Intent', color: '#ea00ea', icon: '🎯' },
          { label: 'Params', color: '#2699fe', icon: '⚙️' },
          { label: 'Signature', color: '#4bce2a', icon: '🔐' },
          { label: 'Drivers', color: '#c4653a', icon: '🔌' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `${item.color}15`,
              border: `1px solid ${item.color}40`,
            }}
          >
            <span>{item.icon}</span>
            <span className="text-xs font-medium" style={{ color: item.color }}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <NeonText color="#2699fe" size="text-xl">
          Self-Contained • Secure • Portable
        </NeonText>
      </motion.div>

      {/* Floating security indicators */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 rounded-lg border border-[#4bce2a]/30 flex items-center justify-center"
          style={{
            top: `${20 + i * 25}%`,
            right: `${10 + i * 5}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
          }}
        >
          <span className="text-[#4bce2a] text-xs">✓</span>
        </motion.div>
      ))}
    </div>
  );
}