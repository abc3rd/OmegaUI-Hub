import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function OnboardingTooltip({ 
  step, 
  totalSteps, 
  title, 
  description, 
  position = 'bottom',
  onNext, 
  onPrev, 
  onSkip, 
  onComplete,
  isLast = false,
  isFirst = true 
}) {
  const positionClasses = {
    top: 'bottom-full mb-3',
    bottom: 'top-full mt-3',
    left: 'right-full mr-3',
    right: 'left-full ml-3',
    'bottom-left': 'top-full mt-3 right-0',
    'bottom-right': 'top-full mt-3 left-0',
    'top-left': 'bottom-full mb-3 right-0',
    'top-right': 'bottom-full mb-3 left-0',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800',
    'bottom-left': 'bottom-full right-6 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    'bottom-right': 'bottom-full left-6 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    'top-left': 'top-full right-6 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
    'top-right': 'top-full left-6 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: position.includes('top') ? 10 : -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute z-[100] w-80 ${positionClasses[position]}`}
    >
      {/* Arrow */}
      <div className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`} />
      
      {/* Content */}
      <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-400">
              Step {step} of {totalSteps}
            </span>
          </div>
          <button 
            onClick={onSkip}
            className="p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
        
        {/* Progress bar */}
        <div className="px-4 pb-2">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-slate-400 hover:text-white"
          >
            Skip tour
          </Button>
          
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={isLast ? onComplete : onNext}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}