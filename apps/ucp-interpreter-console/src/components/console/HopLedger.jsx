import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Zap, 
  Send, 
  MessageSquare, 
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ScoreDisplay from './ScoreDisplay';
import { toast } from 'sonner';

const HOP_TYPE_CONFIG = {
  RAW_PROMPT: { 
    icon: FileText, 
    label: 'Raw Prompt', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  NORMALIZED_PROMPT: { 
    icon: Zap, 
    label: 'Normalized', 
    color: 'text-violet-600',
    bgColor: 'bg-violet-50'
  },
  UCP_PACKET: { 
    icon: Send, 
    label: 'UCP Packet', 
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  PROVIDER_REQUEST: { 
    icon: Send, 
    label: 'Provider Request', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  PROVIDER_RESPONSE: { 
    icon: MessageSquare, 
    label: 'Provider Response', 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  FINAL_OUTPUT: { 
    icon: CheckCircle2, 
    label: 'Final Output', 
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
};

function HopRow({ hop, onViewContent, isRecording }) {
  const config = HOP_TYPE_CONFIG[hop.hop_type] || HOP_TYPE_CONFIG.RAW_PROMPT;
  const Icon = config.icon;
  
  return (
    <tr 
      className="group hover:bg-slate-50 cursor-pointer transition-colors"
      onClick={() => onViewContent(hop)}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
            <Icon className={cn("w-4 h-4", config.color)} />
          </div>
          <div>
            <div className="font-medium text-sm text-slate-800">
              Hop {String.fromCharCode(65 + hop.hop_index)}
            </div>
            <div className="text-xs text-slate-500">{config.label}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="font-mono text-sm text-slate-600">
          {(hop.tokens_in || 0).toLocaleString()}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="font-mono text-sm text-slate-600">
          {(hop.tokens_out || 0).toLocaleString()}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="font-mono text-sm text-slate-600">
          {(hop.latency_ms || 0).toLocaleString()}ms
        </div>
      </td>
      <td className="py-3 px-4">
        <ScoreDisplay 
          score={hop.score || 0} 
          breakdown={hop.score_breakdown}
          size="sm"
          showBreakdown={false}
        />
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          hop.token_method === 'provider-reported'
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-600"
        )}>
          {hop.token_method === 'provider-reported' ? 'Provider' : 'Estimated'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onViewContent(hop);
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
      {isRecording && (
        <td className="py-3 px-4">
          <span className="text-xs font-mono text-slate-400">
            {hop.timestamp ? new Date(hop.timestamp).toISOString() : '-'}
          </span>
        </td>
      )}
    </tr>
  );
}

export default function HopLedger({ hops = [], isRecording = false, className }) {
  const [selectedHop, setSelectedHop] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewContent = (hop) => {
    setSelectedHop(hop);
    setDialogOpen(true);
  };

  const copyContent = () => {
    if (selectedHop?.content) {
      navigator.clipboard.writeText(selectedHop.content);
      toast.success('Content copied to clipboard');
    }
  };

  const copyHash = () => {
    if (selectedHop?.sha256_hash) {
      navigator.clipboard.writeText(selectedHop.sha256_hash);
      toast.success('Hash copied to clipboard');
    }
  };

  const formatContent = (content) => {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  };

  if (hops.length === 0) {
    return (
      <div className={cn("text-center py-12 text-slate-400", className)}>
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hops recorded yet</p>
        <p className="text-sm mt-1">Run a compilation to see the hop-by-hop ledger</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("overflow-x-auto", className)}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hop</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tokens In</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tokens Out</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Latency</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              {isRecording && (
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hops.map((hop, i) => (
              <HopRow 
                key={hop.id || i} 
                hop={hop} 
                onViewContent={handleViewContent}
                isRecording={isRecording}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedHop && (
                <>
                  {React.createElement(
                    HOP_TYPE_CONFIG[selectedHop.hop_type]?.icon || FileText,
                    { className: cn("w-5 h-5", HOP_TYPE_CONFIG[selectedHop.hop_type]?.color) }
                  )}
                  <span>Hop {String.fromCharCode(65 + (selectedHop.hop_index || 0))}: {HOP_TYPE_CONFIG[selectedHop.hop_type]?.label}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedHop && (
            <div className="flex-1 overflow-auto space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Tokens In</div>
                  <div className="font-mono font-semibold">{(selectedHop.tokens_in || 0).toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Tokens Out</div>
                  <div className="font-mono font-semibold">{(selectedHop.tokens_out || 0).toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Latency</div>
                  <div className="font-mono font-semibold">{(selectedHop.latency_ms || 0).toLocaleString()}ms</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Score</div>
                  <ScoreDisplay score={selectedHop.score || 0} breakdown={selectedHop.score_breakdown} size="sm" />
                </div>
              </div>

              {/* Hashes */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">SHA-256 Hash</span>
                  <Button variant="ghost" size="sm" onClick={copyHash} className="h-6 text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <code className="text-xs font-mono text-slate-600 break-all block">
                  {selectedHop.sha256_hash || 'N/A'}
                </code>
                <div className="text-xs text-slate-400">
                  Previous Hash: <code className="font-mono">{selectedHop.prev_hash?.substring(0, 16)}...</code>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Content</span>
                  <Button variant="outline" size="sm" onClick={copyContent} className="h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy Content
                  </Button>
                </div>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-auto max-h-[300px]">
                  {formatContent(selectedHop.content || '')}
                </pre>
              </div>

              {/* Score Breakdown */}
              {selectedHop.score_breakdown && Object.keys(selectedHop.score_breakdown).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 mb-2">Score Breakdown</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedHop.score_breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-600">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="font-mono font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}