import React from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const configs = {
    SUCCESS: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: CheckCircle,
      label: 'SUCCESS'
    },
    FAILED: {
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      icon: XCircle,
      label: 'FAILED'
    },
    OK: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: CheckCircle,
      label: 'OK'
    },
    ERROR: {
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      icon: XCircle,
      label: 'ERROR'
    },
    PENDING: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: Clock,
      label: 'PENDING'
    },
    RUNNING: {
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      icon: Loader2,
      label: 'RUNNING',
      animate: true
    }
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${config.bg} ${config.border} ${config.text}`}>
      <Icon className={`${iconSizes[size]} ${config.animate ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;