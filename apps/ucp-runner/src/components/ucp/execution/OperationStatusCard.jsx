import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Database, Bell, Shuffle, Timer, Brain, 
  CheckCircle, XCircle, Loader2, Clock, SkipForward
} from 'lucide-react';

const OP_ICONS = {
  http: Globe,
  local: Database,
  notify: Bell,
  transform: Shuffle,
  wait: Timer,
  llm: Brain
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  running: { icon: Loader2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', animate: true },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  error: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  skipped: { icon: SkipForward, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
};

export default function OperationStatusCard({ op, status = 'pending', duration = null, index }) {
  const opParts = op?.op?.split('.') || ['unknown', 'unknown'];
  const namespace = opParts[0];
  const method = opParts.slice(1).join('.');
  
  const OpIcon = OP_ICONS[namespace] || Globe;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`${statusConfig.bg} border ${statusConfig.border} rounded-lg p-3 flex items-center gap-3`}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-lg">
        <OpIcon className={`w-4 h-4 ${statusConfig.color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-white">{namespace}.{method}</span>
          {op?.id && <span className="text-xs text-slate-500">({op.id})</span>}
        </div>
        {duration !== null && (
          <span className="text-xs text-slate-400">{duration}ms</span>
        )}
      </div>

      <StatusIcon className={`w-5 h-5 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} />
    </motion.div>
  );
}