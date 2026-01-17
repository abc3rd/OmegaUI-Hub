import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import WelcomeModal from './WelcomeModal';
import OnboardingOverlay from './OnboardingOverlay';
import OnboardingTooltip from './OnboardingTooltip';

const OnboardingContext = createContext(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

const ONBOARDING_STEPS = [
  {
    id: 'navigation',
    target: '[data-onboarding="navigation"]',
    title: 'Navigation Menu',
    description: 'Access all main sections of Omega from here. Switch between the Dashboard and Analytics to track your productivity.',
    position: 'bottom',
  },
  {
    id: 'theme-toggle',
    target: '[data-onboarding="theme-toggle"]',
    title: 'Theme Settings',
    description: 'Toggle between light and dark mode. Your preference will be saved automatically.',
    position: 'bottom-left',
  },
  {
    id: 'user-menu',
    target: '[data-onboarding="user-menu"]',
    title: 'Your Profile',
    description: 'Access your profile settings, preferences, and sign out option from this menu.',
    position: 'bottom-left',
  },
  {
    id: 'app-carousel',
    target: '[data-onboarding="app-carousel"]',
    title: 'Application Hub',
    description: 'Browse all your SynCloud applications organized by category. Scroll horizontally or use the arrows to explore. Click any app to launch it.',
    position: 'top',
  },
  {
    id: 'help-desk',
    target: '[data-onboarding="help-desk"]',
    title: 'Help Center',
    description: 'Need assistance? Click here anytime to access FAQs, documentation, and contact support.',
    position: 'top-left',
  },
];

export default function OnboardingProvider({ children, user }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTouring, setIsTouring] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const observerRef = useRef(null);

  // Check if user needs onboarding
  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(`omega-onboarding-${user.email}`);
      if (!hasSeenOnboarding) {
        // Small delay to let the page render
        const timer = setTimeout(() => setShowWelcome(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Update target rect when step changes
  const updateTargetRect = useCallback(() => {
    if (!isTouring || currentStep >= ONBOARDING_STEPS.length) return;
    
    const step = ONBOARDING_STEPS[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [isTouring, currentStep]);

  useEffect(() => {
    // Small delay to let the DOM settle
    const timer = setTimeout(updateTargetRect, 100);
    
    // Update on resize/scroll
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect]);

  const startTour = () => {
    setShowWelcome(false);
    setCurrentStep(0);
    setIsTouring(true);
  };

  const skipOnboarding = () => {
    setShowWelcome(false);
    setIsTouring(false);
    setCurrentStep(0);
    setTargetRect(null);
    if (user) {
      localStorage.setItem(`omega-onboarding-${user.email}`, 'completed');
    }
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    setIsTouring(false);
    setTargetRect(null);
    if (user) {
      localStorage.setItem(`omega-onboarding-${user.email}`, 'completed');
    }
  };

  const restartTour = () => {
    if (user) {
      localStorage.removeItem(`omega-onboarding-${user.email}`);
    }
    setCurrentStep(0);
    setShowWelcome(true);
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <OnboardingContext.Provider value={{ restartTour, isTouring }}>
      {children}

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onStartTour={startTour}
        onSkip={skipOnboarding}
        userName={user?.full_name}
      />

      {/* Tour Overlay & Tooltip */}
      <AnimatePresence>
        {isTouring && targetRect && currentStepData && (
          <>
            <OnboardingOverlay targetRect={targetRect} />
            
            {/* Tooltip positioned relative to target */}
            <div 
              className="fixed z-[100]"
              style={{
                top: currentStepData.position.includes('top') 
                  ? targetRect.top - 8 
                  : currentStepData.position.includes('bottom')
                    ? targetRect.top + targetRect.height + 8
                    : targetRect.top,
                left: currentStepData.position.includes('left')
                  ? targetRect.left + targetRect.width - 320
                  : currentStepData.position.includes('right')
                    ? targetRect.left
                    : targetRect.left + (targetRect.width / 2) - 160,
              }}
            >
              <OnboardingTooltip
                step={currentStep + 1}
                totalSteps={ONBOARDING_STEPS.length}
                title={currentStepData.title}
                description={currentStepData.description}
                position={currentStepData.position}
                onNext={nextStep}
                onPrev={prevStep}
                onSkip={skipOnboarding}
                onComplete={completeTour}
                isFirst={currentStep === 0}
                isLast={currentStep === ONBOARDING_STEPS.length - 1}
              />
            </div>
          </>
        )}
      </AnimatePresence>
    </OnboardingContext.Provider>
  );
}