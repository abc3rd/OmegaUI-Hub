import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SectionTitle({ 
  title, 
  subtitle, 
  description,
  align = 'center',
  className 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        "max-w-3xl",
        align === 'center' && "mx-auto text-center",
        align === 'left' && "text-left",
        className
      )}
    >
      {subtitle && (
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider uppercase rounded-full bg-gradient-to-r from-[#ea00ea]/10 to-[#2699fe]/10 text-[#ea00ea]">
          {subtitle}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3c3c3c] leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg md:text-xl text-gray-600 leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}