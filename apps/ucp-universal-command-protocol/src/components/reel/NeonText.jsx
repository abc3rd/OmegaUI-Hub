import React from 'react';
import { motion } from 'framer-motion';

export default function NeonText({ 
  children, 
  color = '#ea00ea', 
  size = 'text-2xl',
  className = '',
  delay = 0,
  glow = true 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay }}
      className={`font-bold ${size} ${className}`}
      style={{
        color: color,
        textShadow: glow ? `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}` : 'none',
      }}
    >
      {children}
    </motion.div>
  );
}