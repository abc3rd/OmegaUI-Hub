import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FeaturedHero({ featuredApp, isAuthenticated, onAppClick }) {
  const handleClick = () => {
    if (!isAuthenticated) {
      onAppClick(featuredApp);
    } else if (featuredApp?.url) {
      window.open(featuredApp.url, '_blank');
    }
  };

  return (
    <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0], 
            y: [0, 50, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]"
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">
              Welcome to Omega Command Center
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SynCloud
            </span>
            <br />
            Applications Hub
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-xl">
            Access all your business applications from one unified dashboard. 
            Seamlessly integrated, secure, and always connected.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleClick}
              className="px-8 py-6 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-lg transition-all duration-300 group"
            >
              {isAuthenticated ? 'Explore Apps' : 'Get Started'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg font-semibold border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
    </div>
  );
}