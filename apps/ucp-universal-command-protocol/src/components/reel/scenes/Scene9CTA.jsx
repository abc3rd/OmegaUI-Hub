import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import UCPPacket from '../UCPPacket';
import { Globe, Shield, Sparkles } from 'lucide-react';

export default function Scene9CTA() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 50% 30%, rgba(234, 0, 234, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 30%, rgba(38, 153, 254, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 30%, rgba(75, 206, 42, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 30%, rgba(234, 0, 234, 0.15) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Rotating packet */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UCPPacket rotating={true} scale={1.1} />
      </motion.div>

      {/* Logo/Brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-2"
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #ea00ea, #2699fe)',
            boxShadow: '0 0 20px rgba(234, 0, 234, 0.5)',
          }}
        >
          <span className="text-white font-bold text-lg">Ω</span>
        </div>
        <span className="text-white font-bold text-xl tracking-wider">OMEGA UI</span>
      </motion.div>

      {/* Main title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-center"
      >
        <NeonText color="#ea00ea" size="text-2xl" className="tracking-widest">
          Universal Command Protocol
        </NeonText>
      </motion.div>

      {/* Patent badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(75, 206, 42, 0.1)',
          border: '1px solid rgba(75, 206, 42, 0.3)',
        }}
      >
        <Shield className="w-4 h-4 text-[#4bce2a]" />
        <span className="text-[#4bce2a] text-sm font-medium">
          Patent Pending – 63/928,882
        </span>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 text-white/60 text-center"
      >
        The Future of Efficient AI
      </motion.p>

      {/* Website */}
      <motion.a
        href="https://www.omegaui.com"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full cursor-pointer hover:scale-105 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #ea00ea, #2699fe)',
          boxShadow: '0 0 30px rgba(234, 0, 234, 0.4)',
        }}
      >
        <Globe className="w-4 h-4 text-white" />
        <span className="text-white font-medium">www.omegaui.com</span>
      </motion.a>

      {/* Sparkle effects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 2,
            delay: i * 0.5,
            repeat: Infinity,
          }}
        >
          <Sparkles className="w-4 h-4 text-[#ea00ea]" />
        </motion.div>
      ))}
    </div>
  );
}