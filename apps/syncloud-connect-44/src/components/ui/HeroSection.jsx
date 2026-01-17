import React from 'react';
import { motion } from 'framer-motion';
import GradientButton from './GradientButton';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ 
  title, 
  subtitle, 
  description, 
  primaryCta,
  secondaryCta,
  backgroundVariant = 'default'
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
        
        {/* Animated gradient orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-r from-[#ea00ea]/20 to-[#2699fe]/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-[#2699fe]/20 to-[#4bce2a]/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            y: [0, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-[#ea00ea]/10 to-[#c4653a]/10 blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {subtitle && (
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-5 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 text-[#ea00ea] border border-[#ea00ea]/20"
            >
              {subtitle}
            </motion.span>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight"
          >
            <span className="bg-gradient-to-r from-[#ea00ea] via-[#2699fe] to-[#ea00ea] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {title}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
          >
            {description}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {primaryCta && (
              <GradientButton 
                href={primaryCta.href} 
                variant="primary"
                size="lg"
                icon={ArrowRight}
              >
                {primaryCta.label}
              </GradientButton>
            )}
            {secondaryCta && (
              <GradientButton 
                href={secondaryCta.href} 
                variant="outline"
                size="lg"
              >
                {secondaryCta.label}
              </GradientButton>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}