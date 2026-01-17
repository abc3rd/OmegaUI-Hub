import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import UCPPacket from '../UCPPacket';

export default function Scene1Hook() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Background pulse */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(234, 0, 234, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(234, 0, 234, 0.4) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 50%, rgba(234, 0, 234, 0.2) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* Distortion lines */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #ea00ea, transparent)',
            top: `${20 + i * 15}%`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        />
      ))}

      {/* Packet slam */}
      <motion.div
        initial={{ scale: 3, opacity: 0, y: -200 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 15,
          duration: 0.4 
        }}
      >
        <UCPPacket />
      </motion.div>

      {/* Main text */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <NeonText color="#ea00ea" size="text-3xl" className="tracking-wider">
          AI IS WASTING
        </NeonText>
        <NeonText color="#c4653a" size="text-4xl" delay={0.2} className="mt-2">
          BILLIONS
        </NeonText>
      </motion.div>

      {/* Impact ripple */}
      <motion.div
        className="absolute rounded-full border-2 border-[#ea00ea]"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: 400, height: 400, opacity: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
}