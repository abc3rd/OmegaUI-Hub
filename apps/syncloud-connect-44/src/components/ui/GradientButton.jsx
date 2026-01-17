import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GradientButton({ 
  children, 
  href, 
  variant = 'primary', 
  size = 'default',
  className,
  icon: Icon,
  ...props 
}) {
  const baseStyles = cn(
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full",
    "transition-all duration-300 transform",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea00ea]/50",
    size === 'default' && "px-8 py-4 text-base",
    size === 'sm' && "px-6 py-3 text-sm",
    size === 'lg' && "px-10 py-5 text-lg"
  );

  const variants = {
    primary: cn(
      baseStyles,
      "bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white",
      "hover:shadow-lg hover:shadow-[#ea00ea]/30 hover:scale-105",
      "active:scale-95"
    ),
    outline: cn(
      baseStyles,
      "border-2 border-[#ea00ea] text-[#ea00ea] bg-transparent",
      "hover:bg-[#ea00ea]/10 hover:scale-105",
      "active:scale-95"
    ),
    ghost: cn(
      baseStyles,
      "text-[#3c3c3c] hover:bg-gray-100",
      "hover:scale-105 active:scale-95"
    )
  };

  const content = (
    <>
      {children}
      {Icon && <Icon className="w-5 h-5" />}
    </>
  );

  const Component = motion.div;

  if (href) {
    return (
      <Component whileTap={{ scale: 0.95 }}>
        <Link to={href} className={cn(variants[variant], className)} {...props}>
          {content}
        </Link>
      </Component>
    );
  }

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className={cn(variants[variant], className)} 
      {...props}
    >
      {content}
    </motion.button>
  );
}