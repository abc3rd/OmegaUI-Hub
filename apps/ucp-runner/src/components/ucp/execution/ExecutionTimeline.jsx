import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Database, Bell, Shuffle, Timer, Brain, GitBranch, 
  Repeat, Layers, Shield, CheckCircle, XCircle, Loader2, 
  Clock, SkipForward
} from 'lucide-react';

const OP_ICONS = {
  http: Globe,
  local: Database,
  notify: Bell,
  transform: Shuffle,
  wait: Timer,
  llm: Brain,
  conditional: GitBranch,
  loop: Repeat,
  parallel: Layers,
  try: Shield
};

const STATUS_STYLES = {
  pending: { dot: 'bg-slate-500', line: 'bg-slate-700' },
  running: { dot: 'bg-cyan-500 animate-pulse', line: 'bg-cyan-500/50' },
  success: { dot: 'bg-emerald-500', line: 'bg-emerald-500/50' },
  error: { dot: 'bg-rose-500', line: 'bg-rose-500/50' },
  skipped: { dot: 'bg-amber-500', line: 'bg-amber-500/50' }
};

export default function ExecutionTimeline({ operations, currentIndex, results }) {
  if (!operations || operations.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
        <p className="text-slate-500 text-sm">No operations to display</p>
      </div>
    );
  }

  const getOpStatus = (index) => {
    if (results[index]) {
      if (results[index].status === 'OK' || results[index].status === 'SUCCESS') return 'success';
      if (results[index].status === 'SKIPPED') return 'skipped';
      return 'error';
    }
    if (index === currentIndex) return 'running';
    return 'pending';
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-400" />
        Operation Timeline
      </h3>

      <div className="space-y-1">
        {operations.map((op, index) => {
          const status = getOpStatus(index);
          const styles = STATUS_STYLES[status];
          const isControlFlow = ['conditional', 'if', 'loop', 'foreach', 'parallel', 'try'].includes(op.type);
          const namespace = isControlFlow ? op.type : (op.op?.split('.')[0] || 'unknown');
          const method = isControlFlow ? '' : (op.op?.split('.').slice(1).join('.') || '');
          const Icon = OP_ICONS[namespace] || Globe;
          const result = results[index];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-stretch gap-3"
            >
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${styles.dot} flex-shrink-0`} />
                {index < operations.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[20px] ${styles.line}`} />
                )}
              </div>

              {/* Operation content */}
              <div className={`flex-1 pb-3 ${index < operations.length - 1 ? '' : ''}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${
                    status === 'running' ? 'text-cyan-400' :
                    status === 'success' ? 'text-emerald-400' :
                    status === 'error' ? 'text-rose-400' :
                    status === 'skipped' ? 'text-amber-400' :
                    'text-slate-500'
                  }`} />
                  <span className={`font-mono text-xs ${
                    status === 'pending' ? 'text-slate-500' : 'text-white'
                  }`}>
                    {isControlFlow ? op.type.toUpperCase() : `${namespace}.${method}`}
                  </span>
                  {op.id && (
                    <span className="text-xs text-slate-600">#{op.id}</span>
                  )}
                  {status === 'running' && (
                    <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  )}
                  {result?.finishedAtEpochMs && result?.startedAtEpochMs && (
                    <span className="text-xs text-slate-500">
                      {result.finishedAtEpochMs - result.startedAtEpochMs}ms
                    </span>
                  )}
                </div>
                
                {/* Show error message if failed */}
                {result?.error && (
                  <p className="text-xs text-rose-400 mt-1 pl-6">{result.error}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}