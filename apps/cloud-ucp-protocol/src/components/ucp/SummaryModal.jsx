import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, TrendingDown, Cpu, Zap, Copy, CheckCircle2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

export default function SummaryModal({ isOpen, onClose, summary }) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-purple-400" />
            {summary.file_name}
          </DialogTitle>
        </DialogHeader>

        {/* Token Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">Original Tokens</span>
            </div>
            <div className="text-xl font-bold text-red-400">{summary.original_tokens?.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">UCP Tokens</span>
            </div>
            <div className="text-xl font-bold text-green-400">{summary.ucp_tokens?.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Savings</span>
            </div>
            <div className="text-xl font-bold text-cyan-400">{summary.savings_percentage}%</div>
          </div>
        </div>

        {/* Model & Chunks Info */}
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {summary.model_used}
          </Badge>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            {summary.chunks_processed} chunk{summary.chunks_processed !== 1 ? 's' : ''} processed
          </Badge>
        </div>

        <Tabs defaultValue="summary" className="flex-1">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="summary">Final Summary</TabsTrigger>
            {summary.chunk_summaries?.length > 1 && (
              <TabsTrigger value="chunks">Chunk Summaries ({summary.chunk_summaries.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <div className="flex justify-end mb-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="text-slate-400 hover:text-white h-8"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{summary.summary}</ReactMarkdown>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {summary.chunk_summaries?.length > 1 && (
            <TabsContent value="chunks" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {summary.chunk_summaries.map((chunk, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-slate-700 text-slate-300">Chunk {idx + 1}</Badge>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none text-sm">
                        <ReactMarkdown>{chunk}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}