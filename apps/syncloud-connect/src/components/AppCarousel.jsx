import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppCard from './AppCard';

const categoryLabels = {
  productivity: 'Productivity Suite',
  analytics: 'Analytics & Insights',
  communication: 'Communication Tools',
  finance: 'Finance & Accounting',
  automation: 'Automation Hub',
  security: 'Security & Compliance',
  creative: 'Creative Studio',
  data: 'Data Management'
};

const categoryDescriptions = {
  productivity: 'Streamline your workflow with powerful tools',
  analytics: 'Transform data into actionable insights',
  communication: 'Stay connected with your team',
  finance: 'Manage your financial operations',
  automation: 'Automate repetitive tasks effortlessly',
  security: 'Protect your assets and data',
  creative: 'Bring your ideas to life',
  data: 'Organize and manage your data'
};

export default function AppCarousel({ category, apps, isAuthenticated, onAppClick }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!apps || apps.length === 0) return null;

  return (
    <div className="relative group py-4">
      {/* Header */}
      <div className="px-8 md:px-16 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          {categoryLabels[category] || category}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {categoryDescriptions[category]}
        </p>
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Left arrow */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: showLeftArrow ? 1 : 0 }}
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          style={{ pointerEvents: showLeftArrow ? 'auto' : 'none' }}
        >
          <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-white" />
        </motion.button>

        {/* Right arrow */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: showRightArrow ? 1 : 0 }}
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          style={{ pointerEvents: showRightArrow ? 'auto' : 'none' }}
        >
          <ChevronRight className="w-6 h-6 text-slate-700 dark:text-white" />
        </motion.button>

        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

        {/* Scrollable area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-8 md:px-16 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {apps.map((app, index) => (
            <AppCard
              key={app.id}
              app={app}
              index={index}
              isAuthenticated={isAuthenticated}
              onAppClick={onAppClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}