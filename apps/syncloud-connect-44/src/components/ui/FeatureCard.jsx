import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color = 'magenta',
  delay = 0,
  className 
}) {
  const colorStyles = {
    magenta: 'from-[#ea00ea] to-[#ea00ea]/70',
    blue: 'from-[#2699fe] to-[#2699fe]/70',
    green: 'from-[#4bce2a] to-[#4bce2a]/70',
    warm: 'from-[#c4653a] to-[#c4653a]/70'
  };

  return (
    <GlassCard delay={delay} className={cn("p-6 md:p-8", className)}>
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
        "bg-gradient-to-br shadow-lg",
        colorStyles[color]
      )}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[#3c3c3c] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </GlassCard>
  );
}