import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText,
  Share2,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Repeat,
  Layers,
  Shield,
  SkipForward,
  Coins,
  TrendingDown,
  TrendingUp,
  Zap,
  DollarSign,
  RefreshCw,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReceiptRepo, initDB } from '@/components/ucp/UCPDatabase';
import StatusBadge from '@/components/ucp/StatusBadge';

// Token cost per op type estimates
const OP_TOKEN_ESTIMATES = {
  'http.get': { input: 20, output: 50 },
  'http.post': { input: 40, output: 60 },
  'http.put': { input: 40, output: 50 },
  'http.delete': { input: 20, output: 30 },
  'local.put': { input: 15, output: 10 },
  'local.get': { input: 10, output: 20 },
  'local.delete': { input: 10, output: 5 },
  'notify.show': { input: 25, output: 5 },
  'transform.map': { input: 30, output: 40 },
  'transform.filter': { input: 25, output: 35 },
  'transform.reduce': { input: 30, output: 20 },
  'llm.invoke': { input: 500, output: 200 },
  'llm.analyze': { input: 600, output: 300 }
};

// Component to render operation result with support for nested control flow
const OpResultItem = ({ result, index, depth = 0, tokenPricing }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const opDuration = result.finishedAtEpochMs - result.startedAtEpochMs;
  
  // Calculate op cost
  const opEstimate = result.op ? OP_TOKEN_ESTIMATES[result.op] || { input: 25, output: 25 } : null;
  const inputPrice = tokenPricing?.inputPrice || 0.00015;
  const outputPrice = tokenPricing?.outputPrice || 0.0006;
  const opCost = opEstimate ? 
    ((opEstimate.input / 1000) * inputPrice) + ((opEstimate.output / 1000) * outputPrice) : 0;
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'conditional': return GitBranch;
      case 'loop': return Repeat;
      case 'parallel': return Layers;
      case 'try': return Shield;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ERROR': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'SKIPPED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const TypeIcon = getTypeIcon(result.type);
  const hasNestedResults = result.branchResults || result.iterationResults || 
                           result.parallelResults || result.tryResults || result.catchResults;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-lg border ${getStatusColor(result.status)}`}
      style={{ marginLeft: depth * 16 }}
    >
      <div 
        className={`p-3 ${hasNestedResults ? 'cursor-pointer hover:bg-white/5' : ''}`}
        onClick={() => hasNestedResults && setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {hasNestedResults && (
              <button className="mt-0.5 text-slate-400">
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 ${
              result.status === 'OK' 
                ? 'bg-emerald-500/30 text-emerald-400' 
                : result.status === 'SKIPPED'
                ? 'bg-amber-500/30 text-amber-400'
                : 'bg-rose-500/30 text-rose-400'
            }`}>
              {result.status === 'SKIPPED' ? (
                <SkipForward className="w-3 h-3" />
              ) : (
                result.index !== undefined ? result.index : index
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                {TypeIcon && <TypeIcon className="w-4 h-4 text-violet-400" />}
                <p className="font-mono text-cyan-400 text-sm">
                  {result.op || result.type}
                </p>
                {result.type && (
                  <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded">
                    {result.type}
                  </span>
                )}
              </div>
              {result.opId && (
                <p className="text-xs text-slate-500 mt-0.5">ID: {result.opId}</p>
              )}
              
              {/* Type-specific info */}
              {result.type === 'conditional' && (
                <p className="text-xs text-slate-400 mt-1">
                  Condition: <span className={result.conditionResult ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.conditionResult ? 'true' : 'false'}
                  </span> → executed <span className="text-cyan-400">{result.branch}</span> branch
                </p>
              )}
              
              {result.type === 'loop' && (
                <p className="text-xs text-slate-400 mt-1">
                  Iterations: <span className="text-cyan-400">{result.iterations}</span>/{result.totalItems}
                </p>
              )}
              
              {result.type === 'parallel' && result.parallelResults && (
                <p className="text-xs text-slate-400 mt-1">
                  Parallel ops: <span className="text-cyan-400">{result.parallelResults.length}</span>
                </p>
              )}

              {result.type === 'try' && (
                <p className="text-xs text-slate-400 mt-1">
                  {result.caught ? (
                    <span className="text-amber-400">Error caught and handled</span>
                  ) : (
                    <span className="text-emerald-400">No errors</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {opCost > 0 && result.status === 'OK' && (
              <span className="text-xs text-amber-400 font-medium">${opCost.toFixed(5)}</span>
            )}
            <span className="text-xs text-slate-500">{opDuration}ms</span>
            {result.status === 'OK' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : result.status === 'SKIPPED' ? (
              <SkipForward className="w-4 h-4 text-amber-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
        </div>

        {/* Output for standard ops */}
        {result.output && !hasNestedResults && (
          <div className="mt-3">
            <p className="text-xs text-slate-400 mb-1">Output:</p>
            <pre className="text-xs text-slate-300 bg-slate-900/50 rounded p-2 overflow-x-auto max-h-32">
              {JSON.stringify(result.output, null, 2)}
            </pre>
          </div>
        )}

        {result.error && (
          <div className="mt-3">
            <div className="flex items-center gap-1 text-rose-400 text-xs mb-1">
              <AlertCircle className="w-3 h-3" />
              <span>Error:</span>
            </div>
            <p className="text-sm text-rose-300 bg-rose-500/10 rounded p-2">
              {result.error}
            </p>
          </div>
        )}
      </div>

      {/* Nested Results */}
      <AnimatePresence>
        {expanded && hasNestedResults && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {/* Conditional branch results */}
              {result.branchResults && (
                <div className="pl-4 border-l-2 border-violet-500/30 space-y-2">
                  <p className="text-xs text-violet-400 font-medium">
                    {result.branch} branch ({result.branchResults.length} ops)
                  </p>
                  {result.branchResults.map((r, i) => (
                    <OpResultItem key={i} result={r} index={i} depth={depth + 1} tokenPricing={tokenPricing} />
                  ))}
                </div>
              )}

              {/* Loop iteration results */}
              {result.iterationResults && (
                <div className="pl-4 border-l-2 border-cyan-500/30 space-y-2">
                  {result.iterationResults.map((iteration, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-xs text-cyan-400 font-medium">
                        Iteration {iteration.iteration + 1}
                      </p>
                      {iteration.results.map((r, j) => (
                        <OpResultItem key={j} result={r} index={j} depth={depth + 1} tokenPricing={tokenPricing} />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Parallel results */}
              {result.parallelResults && (
                <div className="pl-4 border-l-2 border-amber-500/30 space-y-2">
                  <p className="text-xs text-amber-400 font-medium">
                    Parallel execution ({result.parallelResults.length} ops)
                  </p>
                  {result.parallelResults.map((r, i) => (
                    <OpResultItem key={i} result={r} index={i} depth={depth + 1} tokenPricing={tokenPricing} />
                  ))}
                </div>
              )}

              {/* Try block results */}
              {result.tryResults && (
                <div className="pl-4 border-l-2 border-blue-500/30 space-y-2">
                  <p className="text-xs text-blue-400 font-medium">try block</p>
                  {result.tryResults.map((r, i) => (
                    <OpResultItem key={i} result={r} index={i} depth={depth + 1} tokenPricing={tokenPricing} />
                  ))}
                </div>
              )}

              {/* Catch block results */}
              {result.catchResults && result.catchResults.length > 0 && (
                <div className="pl-4 border-l-2 border-rose-500/30 space-y-2">
                  <p className="text-xs text-rose-400 font-medium">catch block</p>
                  {result.catchResults.map((r, i) => (
                    <OpResultItem key={i} result={r} index={i} depth={depth + 1} tokenPricing={tokenPricing} />
                  ))}
                </div>
              )}

              {/* Finally block results */}
              {result.finallyResults && result.finallyResults.length > 0 && (
                <div className="pl-4 border-l-2 border-slate-500/30 space-y-2">
                  <p className="text-xs text-slate-400 font-medium">finally block</p>
                  {result.finallyResults.map((r, i) => (
                    <OpResultItem key={i} result={r} index={i} depth={depth + 1} tokenPricing={tokenPricing} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function ReceiptDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const receiptId = urlParams.get('receiptId');

  const [receipt, setReceipt] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadReceipt = async () => {
      await initDB();
      const receiptRecord = await ReceiptRepo.get(receiptId);
      if (receiptRecord) {
        setReceipt(receiptRecord);
        setReceiptData(JSON.parse(receiptRecord.json));
      }
      setLoading(false);
    };
    loadReceipt();
  }, [receiptId]);

  const handleShare = async () => {
    const shareData = {
      title: 'UCP Execution Receipt',
      text: `UCP Receipt: ${receiptId}\nStatus: ${receiptData.status}\nPacket: ${receiptData.packetId}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const text = JSON.stringify(receiptData, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${receiptId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <FileText className="w-8 h-8 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  if (!receipt || !receiptData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
        <FileText className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Receipt Not Found</h2>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-cyan-500 hover:bg-cyan-600">Go Home</Button>
        </Link>
      </div>
    );
  }

  const duration = receiptData.finishedAtEpochMs - receiptData.startedAtEpochMs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Execution Receipt</h1>
                <p className="text-sm text-slate-400 font-mono">{receiptId.substring(0, 8)}...</p>
              </div>
            </div>
            <StatusBadge status={receiptData.status} size="md" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className={`rounded-xl p-5 ${
          receiptData.status === 'SUCCESS' 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-rose-500/10 border border-rose-500/30'
        }`}>
          <div className="flex items-center gap-4">
            {receiptData.status === 'SUCCESS' ? (
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-400" />
            )}
            <div>
              <h2 className={`text-2xl font-bold ${
                receiptData.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {receiptData.status}
              </h2>
              <p className="text-slate-400">
                Completed in {duration}ms • {receiptData.opResults?.length || 0} operations
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Info */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Hash className="w-4 h-4" />
                <span>Receipt ID</span>
              </div>
              <p className="font-mono text-white text-sm break-all">{receiptData.receiptId}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Package className="w-4 h-4" />
                <span>Packet ID</span>
              </div>
              <Link 
                to={createPageUrl(`PacketDetail?packetId=${receiptData.packetId}`)}
                className="font-mono text-cyan-400 hover:text-cyan-300 text-sm"
              >
                {receiptData.packetId}
              </Link>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Started At</span>
              </div>
              <p className="text-white text-sm">
                {new Date(receiptData.startedAtEpochMs).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Finished At</span>
              </div>
              <p className="text-white text-sm">
                {new Date(receiptData.finishedAtEpochMs).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Token Savings Card */}
        {(receiptData.avoidedTotalTokens > 0 || receiptData.cacheStatus) && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                Token Savings (Template Cache)
              </h3>
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                receiptData.cacheStatus === 'HIT' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {receiptData.cacheStatus}
              </span>
            </div>
            
            {receiptData.cacheStatus === 'HIT' ? (
              <>
                <div className="bg-emerald-500/10 rounded-xl p-4 mb-4 text-center">
                  <p className="text-sm text-emerald-300/70 mb-1">This run avoided</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {receiptData.avoidedTotalTokens?.toLocaleString() || 0} tokens
                  </p>
                  {receiptData.avoidedCostUsd > 0 && (
                    <p className="text-lg font-semibold text-emerald-300 mt-1">
                      ${receiptData.avoidedCostUsd?.toFixed(4)} saved
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Prompt Avoided</p>
                    <p className="text-lg font-bold text-white">{receiptData.avoidedPromptTokens?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Completion Avoided</p>
                    <p className="text-lg font-bold text-white">{receiptData.avoidedCompletionTokens?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Reuse Count
                    </p>
                    <p className="text-lg font-bold text-violet-400">{receiptData.reuseCountAfterRun || 0}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-amber-500/10 rounded-xl p-4 text-center">
                <p className="text-amber-300/70 text-sm">
                  First run (cache miss) - no tokens avoided this time.
                </p>
                <p className="text-amber-200/50 text-xs mt-1">
                  Subsequent runs will use this template and save ~{receiptData.baselineTotalTokens || 0} tokens.
                </p>
              </div>
            )}
            
            {receiptData.templateId && (
              <Link 
                to={createPageUrl(`TemplateDetail?templateId=${receiptData.templateId}`)}
                className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <Database className="w-4 h-4" />
                View Template
              </Link>
            )}
          </div>
        )}

        {/* Token Stats */}
        {receiptData.tokenStats && receiptData.tokenStats.totalTokens > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-violet-400" />
              Token Usage (This Run)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Input Tokens</p>
                <p className="text-xl font-bold text-white">{receiptData.tokenStats.inputTokens.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Output Tokens</p>
                <p className="text-xl font-bold text-white">{receiptData.tokenStats.outputTokens.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Total Used</p>
                <p className="text-xl font-bold text-cyan-400">{receiptData.tokenStats.totalTokens.toLocaleString()}</p>
              </div>
              <div className={`rounded-lg p-3 ${receiptData.tokenStats.savedTokens > 0 ? 'bg-emerald-500/20' : 'bg-slate-900/50'}`}>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  {receiptData.tokenStats.savedTokens > 0 && <TrendingDown className="w-3 h-3 text-emerald-400" />}
                  LLM Saved
                </p>
                <p className={`text-xl font-bold ${receiptData.tokenStats.savedTokens > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {receiptData.tokenStats.savedTokens > 0 ? `+${receiptData.tokenStats.savedTokens.toLocaleString()}` : '0'}
                </p>
              </div>
            </div>
            
            {receiptData.tokenStats.calls > 0 && (
              <div className="mt-4 pt-4 border-t border-violet-500/20 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">LLM Calls</p>
                  <p className="text-lg font-semibold text-white">{receiptData.tokenStats.calls}</p>
                </div>
                {receiptData.tokenStats.efficiency !== 0 && (
                  <div>
                    <p className="text-xs text-slate-400">UCP Efficiency</p>
                    <p className={`text-lg font-semibold flex items-center gap-1 ${
                      receiptData.tokenStats.efficiency > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {receiptData.tokenStats.efficiency > 0 ? (
                        <><TrendingDown className="w-4 h-4" /> {receiptData.tokenStats.efficiency}% saved</>
                      ) : (
                        <><TrendingUp className="w-4 h-4" /> {Math.abs(receiptData.tokenStats.efficiency)}% increase</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hashes */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-cyan-400" />
            Cryptographic Verification
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Packet Hash (SHA-256)</p>
              <p className="font-mono text-xs text-slate-300 bg-slate-900 rounded-lg p-3 break-all">
                {receiptData.packetHash}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Receipt Hash (SHA-256)</p>
              <p className="font-mono text-xs text-slate-300 bg-slate-900 rounded-lg p-3 break-all">
                {receiptData.receiptHash}
              </p>
            </div>
          </div>
        </div>

        {/* Operation Results with Cost Breakdown */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Operation Results</h3>
          <div className="space-y-3">
            {receiptData.opResults?.map((result, index) => (
              <OpResultItem key={index} result={result} index={index} depth={0} tokenPricing={receiptData.tokenPricing} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleShare}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-6"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 mr-2" />
                Share Receipt
              </>
            )}
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 py-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Export JSON
          </Button>
        </div>

        {/* Raw JSON Toggle */}
        <details className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <summary className="px-4 py-3 cursor-pointer text-slate-400 hover:text-white transition-colors">
            View Raw Receipt JSON
          </summary>
          <div className="px-4 pb-4">
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="absolute top-2 right-2 text-slate-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96">
                {JSON.stringify(receiptData, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-slate-800 mt-8">
        <p className="text-slate-500 text-sm">
          Powered by UCP – Patent Pending
        </p>
      </footer>
    </div>
  );
}