import React from 'react';
import { 
  Utensils, Car, ShoppingBag, Receipt, Film, 
  Heart, Plane, MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryConfig = {
  food: { 
    icon: Utensils, 
    label: 'Food & Dining',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200'
  },
  transport: { 
    icon: Car, 
    label: 'Transport',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  shopping: { 
    icon: ShoppingBag, 
    label: 'Shopping',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200'
  },
  bills: { 
    icon: Receipt, 
    label: 'Bills & Utilities',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200'
  },
  entertainment: { 
    icon: Film, 
    label: 'Entertainment',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  health: { 
    icon: Heart, 
    label: 'Health',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200'
  },
  travel: { 
    icon: Plane, 
    label: 'Travel',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200'
  },
  other: { 
    icon: MoreHorizontal, 
    label: 'Other',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200'
  }
};

export default function CategoryBadge({ category, size = 'sm', showLabel = true }) {
  const config = categoryConfig[category] || categoryConfig.other;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium border',
      config.bg, config.text, config.border,
      sizeClasses[size]
    )}>
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export { categoryConfig };