import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Download, CheckCircle2, XCircle, TrendingDown, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function RequestHistory() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: requests, isLoading } = useQuery({
    queryKey: ['ucpRequests'],
    queryFn: () => base44.entities.UcpRequest.list('-created_date', 20),
    initialData: []
  });

  const exportHistory = () => {
    const dataStr = JSON.stringify(requests, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ucp_history_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const successCount = requests.filter(r => r.success).length;
  const totalSavings = requests.reduce((acc, r) => acc + (r.savings_percentage || 0), 0);
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <History className="w-5 h-5 text-slate-400" />
            History
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={exportHistory}
              className="text-slate-400 hover:text-white h-8 px-2"
              disabled={requests.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 text-slate-400"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Compact summary when collapsed */}
        {!isExpanded && (
          <div className="mt-2 flex items-center gap-3 text-xs">
            <Badge className="bg-slate-700 text-slate-300 border-slate-600">
              {requests.length} requests
            </Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {successCount} success
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
      <CardContent className="pt-2">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 bg-slate-700/50" />
            ))
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No requests yet</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant={request.success ? 'default' : 'destructive'}
                    className={request.success ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}
                  >
                    {request.success ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {request.api_endpoint}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {request.response_time_ms}ms
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Tokens:</span>
                    <span className="font-medium text-slate-300">
                      {request.original_tokens} → {request.ucp_tokens}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-green-400" />
                      <span>Savings:</span>
                    </div>
                    <span className="font-bold text-green-400">
                      {request.savings_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))
            )}
            </div>
            </CardContent>
            </motion.div>
            )}
            </AnimatePresence>
            </Card>
            );
            }