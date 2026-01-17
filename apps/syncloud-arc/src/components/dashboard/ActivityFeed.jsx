import React from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, FileText, Shield, AlertTriangle, 
  CheckCircle, XCircle, Plus, Trash2, Key
} from 'lucide-react';
import { format } from 'date-fns';

const eventConfig = {
  sync_start: { icon: RefreshCw, color: '#00d4ff' },
  sync_complete: { icon: CheckCircle, color: '#00ff88' },
  sync_error: { icon: AlertTriangle, color: '#ff0055' },
  file_added: { icon: Plus, color: '#00ff88' },
  file_modified: { icon: FileText, color: '#00d4ff' },
  file_deleted: { icon: Trash2, color: '#ff0055' },
  snapshot_created: { icon: Shield, color: '#00ff88' },
  biometric_success: { icon: CheckCircle, color: '#00ff88' },
  biometric_failed: { icon: XCircle, color: '#ff0055' },
  connection_added: { icon: Plus, color: '#00ff88' },
  connection_removed: { icon: Trash2, color: '#ff0055' },
  recovery_initiated: { icon: Key, color: '#ffdd00' },
  recovery_complete: { icon: CheckCircle, color: '#00ff88' },
  access_granted: { icon: CheckCircle, color: '#00ff88' },
  access_denied: { icon: XCircle, color: '#ff0055' }
};

const severityColors = {
  info: 'bg-slate-800',
  warning: 'bg-amber-900/30',
  error: 'bg-red-900/30',
  critical: 'bg-red-900/50'
};

export default function ActivityFeed({ logs = [] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => {
        const config = eventConfig[log.event_type] || { icon: FileText, color: '#6b7280' };
        const EventIcon = config.icon;

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-start gap-3 p-3 rounded-lg ${severityColors[log.severity] || 'bg-slate-800/50'}`}
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <EventIcon className="w-4 h-4" style={{ color: config.color }} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 leading-relaxed">{log.message}</p>
              {log.details && (
                <p className="text-xs text-slate-500 mt-1 font-mono">{log.details}</p>
              )}
            </div>

            <span className="text-xs text-slate-600 flex-shrink-0">
              {format(new Date(log.created_date), 'HH:mm')}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}