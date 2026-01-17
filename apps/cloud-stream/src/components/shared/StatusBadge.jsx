import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

const STATUS_CONFIG = {
  ONLINE: { icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Online' },
  OFFLINE: { icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Offline' },
  DEGRADED: { icon: AlertCircle, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Degraded' },
  UNKNOWN: { icon: HelpCircle, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Unknown' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border flex items-center gap-1.5 w-fit`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}