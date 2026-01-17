import React from 'react';
import { motion } from 'framer-motion';
import ReelPlayer from '@/components/reel/ReelPlayer';

export default function Home() {
  return (
    <div 
      className="min-h-screen w-full py-8 px-4"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ea00ea, #2699fe)',
              boxShadow: '0 0 20px rgba(234, 0, 234, 0.4)',
            }}
          >
            <span className="text-white font-bold text-lg">Ω</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">
            UCP Reel Builder
          </h1>
        </div>
        <p className="text-white/40 text-sm">
          Social Media Reel Preview • Professional Video Builder
        </p>
      </motion.div>

      {/* Reel Player */}
      <ReelPlayer />

      {/* Footer info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center space-y-2"
      >
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <span className="text-white/30">9:16 Vertical</span>
          <span className="text-[#ea00ea]/50">•</span>
          <span className="text-white/30">25-35 seconds</span>
          <span className="text-[#ea00ea]/50">•</span>
          <span className="text-white/30">TikTok/Instagram Ready</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 pt-4">
          {['#ea00ea', '#2699fe', '#4bce2a', '#3c3c3c', '#c4653a'].map((color) => (
            <div
              key={color}
              className="w-6 h-6 rounded-full"
              style={{
                background: color,
                boxShadow: `0 0 10px ${color}40`,
              }}
            />
          ))}
        </div>
        <p className="text-white/20 text-xs mt-2">Brand Colors</p>
      </motion.div>
    </div>
  );
}