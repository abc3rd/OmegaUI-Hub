import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WizardProgress({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber < currentStep && onStepClick;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isCompleted && "bg-emerald-500 text-white",
                    isCurrent && "bg-slate-900 text-white ring-4 ring-slate-900/20",
                    !isCompleted && !isCurrent && "bg-slate-100 text-slate-400",
                    isClickable && "cursor-pointer hover:scale-105"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </button>
                <span className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  isCurrent ? "text-slate-900" : "text-slate-500"
                )}>
                  {step.title}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 bg-slate-200 relative">
                  <div 
                    className={cn(
                      "absolute inset-0 bg-emerald-500 transition-all duration-500",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}