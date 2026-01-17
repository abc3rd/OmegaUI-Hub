import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, TrendingUp, Database } from 'lucide-react';
import { format } from 'date-fns';

export default function PromptHistory({ prompts, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border border-[#3c3c3c] p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-gray-500">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border border-[#3c3c3c] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Your GLYTCH Dictionary</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Database className="w-4 h-4" />
          {prompts.length} entries
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No prompts yet. Start building your dictionary!</p>
            </div>
          ) : (
            prompts.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1f1f1f] rounded-xl border border-[#3c3c3c] p-4 hover:border-[#ea00ea]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-white flex-1 mr-3">{item.prompt}</p>
                  <div className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {format(new Date(item.created_date), 'MMM d, HH:mm')}
                  </div>
                </div>

                {item.metrics && (
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#3c3c3c]">
                    <MetricBadge
                      icon={Zap}
                      label="Power"
                      value={`${item.metrics.avgWatts}W`}
                      color="text-[#2699fe]"
                    />
                    <MetricBadge
                      icon={TrendingUp}
                      label="Cache"
                      value={`${item.metrics.cacheHitRate}%`}
                      color="text-[#4bce2a]"
                    />
                    <MetricBadge
                      icon={Database}
                      label="Dict"
                      value={item.dictionary_size || 0}
                      color="text-[#ea00ea]"
                    />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MetricBadge({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3 h-3 ${color}`} />
      <div className="text-xs">
        <div className="text-gray-500">{label}</div>
        <div className={`font-medium ${color}`}>{value}</div>
      </div>
    </div>
  );
}