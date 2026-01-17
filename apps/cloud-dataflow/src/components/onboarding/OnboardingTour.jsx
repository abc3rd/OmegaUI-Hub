import React, { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingTour({ steps, isOpen, onTourClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        setTargetElement(element);
        
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        // If target not found, skip to next step or end tour
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          onTourClose();
        }
      }
    }
  }, [currentStep, isOpen, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onTourClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = useMemo(() => steps[currentStep], [currentStep, steps]);

  if (!isOpen || !step || !targetElement) {
    return null;
  }

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div 
        className="fixed z-[100] transition-all duration-300 pointer-events-none rounded-lg"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
        }}
      />
      
      {/* Popover content */}
      <Popover open={true}>
        <PopoverTrigger asChild>
          <div 
            className="fixed z-[100] pointer-events-none"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              height: position.height,
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          side={step.side || 'bottom'}
          align={step.align || 'center'}
          sideOffset={15}
          className="z-[101] w-80 shadow-2xl pointer-events-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{step.content}</p>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button variant="ghost" size="sm" onClick={handlePrev}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Prev
                      </Button>
                    )}
                    <Button size="sm" onClick={handleNext}>
                      {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={onTourClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </>
  );
}