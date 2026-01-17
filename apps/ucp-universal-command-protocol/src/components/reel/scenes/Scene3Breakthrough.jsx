import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import UCPPacket from '../UCPPacket';
import { Brain } from 'lucide-react';

export default function Scene3Breakthrough() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Brain collapsing */}
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2699fe] to-[#ea00ea] flex items-center justify-center">
          <Brain className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Collapse particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#ea00ea', '#2699fe', '#4bce2a'][i % 3],
          }}
          initial={{
            x: Math.cos(i * 18 * Math.PI / 180) * 100,
            y: Math.sin(i * 18 * Math.PI / 180) * 100,
            opacity: 1,
          }}
          animate={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.6, delay: i * 0.02 }}
        />
      ))}

      {/* UCP packet emerges */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
      >
        <UCPPacket />
      </motion.div>

      {/* Flash effect */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />

      {/* Text */}
      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <NeonText color="#4bce2a" size="text-3xl">
          UCP CHANGES
        </NeonText>
        <NeonText color="#ea00ea" size="text-4xl" delay={0.2} className="mt-2">
          EVERYTHING
        </NeonText>
      </motion.div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-4 text-white/70 text-center text-sm px-4"
      >
        Interpret once. Execute infinitely.
      </motion.p>
    </div>
  );
}