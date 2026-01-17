import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function OmegaLogo({ size = 'lg', animated = true, showText = true }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizes = {
    sm: { logo: 48, text: 'text-xl', gap: 'gap-2' },
    md: { logo: 64, text: 'text-2xl', gap: 'gap-3' },
    lg: { logo: 80, text: 'text-3xl', gap: 'gap-4' },
    xl: { logo: 120, text: 'text-5xl', gap: 'gap-5' },
    hero: { logo: 160, text: 'text-6xl', gap: 'gap-6' }
  };
  
  const s = sizes[size] || sizes.lg;

  return (
    <motion.div 
      className={`flex items-center ${s.gap} cursor-pointer select-none`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo Mark */}
      <div className="relative" style={{ width: s.logo, height: s.logo }}>
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #3488A9 0%, #53B1B8 30%, #F4BA1F 70%, #F17C38 100%)',
            backgroundSize: '200% 200%',
          }}
          animate={animated ? {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            scale: isHovered ? 1.1 : 1,
          } : {}}
          transition={{
            backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.3 }
          }}
        />
        
        {/* Inner dark circle */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: s.logo * 0.06,
            backgroundColor: '#13151A',
          }}
          animate={animated ? {
            scale: isHovered ? 0.95 : 1,
          } : {}}
          transition={{ duration: 0.3 }}
        />
        
        {/* Omega Symbol Container */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={animated ? {
            rotateY: isHovered ? 360 : 0,
          } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Omega Symbol SVG */}
          <motion.svg
            viewBox="0 0 100 100"
            style={{ width: s.logo * 0.55, height: s.logo * 0.55 }}
            animate={animated ? {
              filter: isHovered 
                ? 'drop-shadow(0 0 20px rgba(244, 186, 31, 0.8))' 
                : 'drop-shadow(0 0 10px rgba(52, 136, 169, 0.5))',
            } : {}}
          >
            <defs>
              <linearGradient id="omegaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <motion.stop
                  offset="0%"
                  animate={animated ? {
                    stopColor: ['#3488A9', '#53B1B8', '#3488A9'],
                  } : { stopColor: '#3488A9' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.stop
                  offset="50%"
                  animate={animated ? {
                    stopColor: ['#53B1B8', '#F4BA1F', '#53B1B8'],
                  } : { stopColor: '#53B1B8' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.stop
                  offset="100%"
                  animate={animated ? {
                    stopColor: ['#F4BA1F', '#F17C38', '#F4BA1F'],
                  } : { stopColor: '#F4BA1F' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </linearGradient>
            </defs>
            
            {/* Omega path */}
            <motion.path
              d="M20 75 L20 65 C20 65 25 70 35 70 C45 70 50 60 50 45 C50 30 40 20 50 20 C60 20 50 30 50 45 C50 60 55 70 65 70 C75 70 80 65 80 65 L80 75 L65 75 L65 70 C65 70 60 75 50 75 C40 75 35 70 35 70 L35 75 Z"
              fill="url(#omegaGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.div>
        
        {/* Orbiting particle */}
        {animated && (
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: '#F4BA1F',
              boxShadow: '0 0 10px 2px rgba(244, 186, 31, 0.6)',
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            initial={{ x: s.logo / 2 - 4, y: -4 }}
          />
        )}
        
        {/* Pulse rings */}
        {animated && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(52, 136, 169, 0.3)' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(244, 186, 31, 0.2)' }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
          </>
        )}
      </div>
      
      {/* Text */}
      {showText && (
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.span 
            className={`${s.text} font-bold tracking-tight`}
            style={{
              background: 'linear-gradient(135deg, #3488A9 0%, #53B1B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={animated ? {
              backgroundPosition: isHovered ? ['0% 50%', '100% 50%'] : '0% 50%',
            } : {}}
            transition={{ duration: 0.5 }}
          >
            Omega<span style={{ color: '#F4BA1F' }}>UI</span>
          </motion.span>
          {size === 'hero' && (
            <motion.span 
              className="text-sm text-slate-400 tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Design System
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}