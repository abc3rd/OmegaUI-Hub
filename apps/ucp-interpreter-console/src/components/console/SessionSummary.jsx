import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Coins, TrendingUp, Hash, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScoreDisplay from './ScoreDisplay';
import TokenDisplay from './TokenDisplay';

export default function SessionSummary({
  session,
  onExport,
  onReplay,
  isRecording = false,
  className
}) {
  if (!session) return null;

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider",
            session.status === 'success' && "bg-emerald-100 text-emerald-700",
            session.status === 'error' && "bg-red-100 text-red-700",
            session.status === 'compiling' && "bg-blue-100 text-blue-700",
            session.status === 'running' && "bg-amber-100 text-amber-700",
            session.status === 'pending' && "bg-slate-100 text-slate-700"
          )}>
            {session.status}
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-red-700">REC</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReplay} className="h-8">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Replay
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="h-8">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Evidence
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {/* Session Score */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Session Score
          </div>
          <ScoreDisplay 
            score={session.session_score || 0} 
            size="md"
            showBreakdown={false}
          />
        </div>

        {/* Total Latency */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Clock className="w-3.5 h-3.5" />
            Total Latency
          </div>
          <div className="text-2xl font-mono font-bold text-slate-800">
            {((session.total_latency_ms || 0) / 1000).toFixed(2)}
            <span className="text-sm font-normal text-slate-500 ml-1">sec</span>
          </div>
        </div>

        {/* Total Tokens */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Coins className="w-3.5 h-3.5" />
            Total Tokens
          </div>
          <div className="text-2xl font-mono font-bold text-slate-800">
            {(session.total_tokens || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {(session.prompt_tokens || 0).toLocaleString()} in / {(session.completion_tokens || 0).toLocaleString()} out
          </div>
        </div>

        {/* Cost */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="text-base">$</span>
            Estimated Cost
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-600">
            ${(session.total_cost_estimate || 0).toFixed(6)}
          </div>
        </div>
      </div>

      {/* Chain Hash */}
      {session.chain_hash && (
        <div className="px-4 pb-4">
          <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Chain Hash:</span>
              <code className="text-xs font-mono text-slate-300">
                {session.chain_hash.substring(0, 32)}...
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-slate-400 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(session.chain_hash);
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      {/* Recording Timestamp */}
      {isRecording && (
        <div className="px-4 pb-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
            <div className="text-3xl font-mono font-bold text-red-600">
              {new Date().toISOString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}