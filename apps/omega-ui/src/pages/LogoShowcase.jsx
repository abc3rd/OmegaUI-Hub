import React from 'react';
import { motion } from 'framer-motion';
import OmegaLogo from '@/components/OmegaLogo';

export default function LogoShowcase() {
  return (
    <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: '#13151A' }}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(52, 136, 169, 0.15) 0%, #13151A 50%, rgba(83, 177, 184, 0.1) 100%)' }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(52, 136, 169, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(52, 136, 169, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(52, 136, 169, 0.1)', top: '10%', left: '10%' }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(244, 186, 31, 0.08)', bottom: '20%', right: '15%' }}
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <OmegaLogo size="hero" animated={true} />
          </motion.div>
          
          <motion.p
            className="mt-8 text-xl text-slate-400 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            The ultimate design system for building beautiful, 
            accessible, and performant user interfaces.
          </motion.p>
          
          <motion.div
            className="mt-10 flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <button 
              className="px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #F17C38 0%, #F4BA1F 100%)',
                boxShadow: '0 4px 20px rgba(241, 124, 56, 0.3)'
              }}
            >
              Get Started
            </button>
            <button 
              className="px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:text-white"
              style={{ 
                border: '1px solid #3488A9',
                color: '#53B1B8'
              }}
            >
              Documentation
            </button>
          </motion.div>
        </div>

        {/* Logo Variations */}
        <motion.div
          className="mt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white text-center mb-12">Logo Variations</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Size variations */}
            <div className="p-8 rounded-2xl flex flex-col items-center gap-4" style={{ backgroundColor: 'rgba(19, 21, 26, 0.8)', border: '1px solid rgba(52, 136, 169, 0.2)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: '#53B1B8' }}>Extra Large</span>
              <OmegaLogo size="xl" />
            </div>
            
            <div className="p-8 rounded-2xl flex flex-col items-center gap-4" style={{ backgroundColor: 'rgba(19, 21, 26, 0.8)', border: '1px solid rgba(52, 136, 169, 0.2)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: '#53B1B8' }}>Large</span>
              <OmegaLogo size="lg" />
            </div>
            
            <div className="p-8 rounded-2xl flex flex-col items-center gap-4" style={{ backgroundColor: 'rgba(19, 21, 26, 0.8)', border: '1px solid rgba(52, 136, 169, 0.2)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: '#53B1B8' }}>Medium</span>
              <OmegaLogo size="md" />
            </div>
            
            <div className="p-8 rounded-2xl flex flex-col items-center gap-4" style={{ backgroundColor: 'rgba(19, 21, 26, 0.8)', border: '1px solid rgba(52, 136, 169, 0.2)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: '#53B1B8' }}>Small</span>
              <OmegaLogo size="sm" />
            </div>
          </div>
          
          {/* Icon only */}
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl flex flex-col items-center gap-4" style={{ backgroundColor: 'rgba(19, 21, 26, 0.8)', border: '1px solid rgba(52, 136, 169, 0.2)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: '#53B1B8' }}>Icon Only</span>
              <div className="flex gap-6 items-center">
                <OmegaLogo size="lg" showText={false} />
                <OmegaLogo size="md" showText={false} />
                <OmegaLogo size="sm" showText={false} />
              </div>
            </div>
            
            <div className="p-8 rounded-2xl flex flex-col items-center gap-4" style={{ backgroundColor: '#FAFBFA' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: '#3488A9' }}>Light Background</span>
              <div className="flex gap-6 items-center">
                <OmegaLogo size="lg" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-32 text-center text-sm"
          style={{ color: '#C9CAC9' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <p>© 2024 Omega UI. Crafted with precision.</p>
          <p className="mt-2" style={{ color: '#53B1B8' }}>www.omegaui.com</p>
        </motion.footer>
      </div>
    </div>
  );
}