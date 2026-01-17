import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  Terminal,
  Zap,
  TrendingDown,
  TrendingUp,
  Coins,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PacketRepo, ReceiptRepo, TemplateRepo, SettingsRepo, initDB } from '@/components/ucp/UCPDatabase';
import { ExecutionEngine, notifyDriver } from '@/components/ucp/UCPEngine';
import LiveTokenMeter from '@/components/ucp/execution/LiveTokenMeter';
import ExecutionTimeline from '@/components/ucp/execution/ExecutionTimeline';

const LOG_ICONS = {
  info: Info,
  success: CheckCircle,
  error: XCircle,
  debug: Terminal,
  warning: AlertCircle
};

const LOG_COLORS = {
  info: 'text-blue-400',
  success: 'text-emerald-400',
  error: 'text-rose-400',
  debug: 'text-slate-500',
  warning: 'text-amber-400'
};

export default function Run() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const packetId = urlParams.get('packetId');

  const [packet, setPacket] = useState(null);
  const [packetData, setPacketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState('idle');
  const [tokenStats, setTokenStats] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [tokenSettings, setTokenSettings] = useState({ inputPrice: 0.00015, outputPrice: 0.0006 });
  const [opResults, setOpResults] = useState({});
  const [currentOpIndex, setCurrentOpIndex] = useState(-1);
  const [showLogs, setShowLogs] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const engineRef = useRef(null);
  const logsEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadPacket = async () => {
      await initDB();
      const packetRecord = await PacketRepo.get(packetId);
      if (packetRecord) {
        setPacket(packetRecord);
        setPacketData(JSON.parse(packetRecord.json));
        
        if (packetRecord.templateId) {
          const tpl = await TemplateRepo.get(packetRecord.templateId);
          setTemplateData(tpl);
        }
      }
      
      const inputPrice = await SettingsRepo.get('inputPrice', 0.00015);
      const outputPrice = await SettingsRepo.get('outputPrice', 0.0006);
      setTokenSettings({ inputPrice, outputPrice });
      
      setLoading(false);
    };
    loadPacket();
  }, [packetId]);

  useEffect(() => {
    notifyDriver.setToastCallback((title, body) => {
      if (window.__ucpShowToast) {
        window.__ucpShowToast(title, body);
      }
    });
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (running && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, startTime]);

  const handleStart = async () => {
    if (!packetData) return;

    setRunning(true);
    setStatus('running');
    setLogs([]);
    setOpResults({});
    setCurrentOpIndex(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setProgress({ current: 0, total: packetData.ops.length });

    const engine = new ExecutionEngine(
      packetData,
      (logEntry) => {
        setLogs(prev => [...prev, logEntry]);
        
        // Track operation progress from logs
        const match = logEntry.message.match(/^\[(\d+)\]/);
        if (match) {
          setCurrentOpIndex(parseInt(match[1]));
        }
        
        // Track completion
        if (logEntry.message.includes('Completed:') || logEntry.message.includes('Failed:') || logEntry.message.includes('Skipped:')) {
          const opIndex = match ? parseInt(match[1]) : null;
          if (opIndex !== null) {
            setOpResults(prev => ({
              ...prev,
              [opIndex]: {
                status: logEntry.level === 'success' ? 'OK' : 
                        logEntry.message.includes('Skipped') ? 'SKIPPED' : 'ERROR',
                message: logEntry.message,
                timestamp: logEntry.timestamp
              }
            }));
          }
        }
      },
      (current, total) => {
        setProgress({ current, total });
      },
      (stats) => {
        setTokenStats(stats);
      }
    );
    engineRef.current = engine;

    try {
      const receipt = await engine.execute();
      
      // Process receipt results into opResults
      if (receipt.opResults) {
        const results = {};
        receipt.opResults.forEach((r, i) => {
          results[r.index !== undefined ? r.index : i] = r;
        });
        setOpResults(results);
      }
      
      const isTemplateRun = !!packet.templateId && !!templateData;
      const cacheStatus = isTemplateRun && templateData.reuseCount > 0 ? 'HIT' : 'MISS';
      
      const baselinePromptTokens = templateData?.baselinePromptTokens || 0;
      const baselineCompletionTokens = templateData?.baselineCompletionTokens || 0;
      const baselineTotalTokens = baselinePromptTokens + baselineCompletionTokens;
      
      const avoidedPromptTokens = cacheStatus === 'HIT' ? baselinePromptTokens : 0;
      const avoidedCompletionTokens = cacheStatus === 'HIT' ? baselineCompletionTokens : 0;
      const avoidedTotalTokens = avoidedPromptTokens + avoidedCompletionTokens;
      
      const avoidedCostUsd = (avoidedPromptTokens / 1000 * tokenSettings.inputPrice) + 
                            (avoidedCompletionTokens / 1000 * tokenSettings.outputPrice);
      
      let reuseCountAfterRun = 0;
      if (packet.templateId) {
        const updatedTpl = await TemplateRepo.incrementReuseCount(packet.templateId);
        reuseCountAfterRun = updatedTpl.reuseCount;
      }
      
      receipt.templateId = packet.templateId || null;
      receipt.cacheStatus = cacheStatus;
      receipt.tokenPricing = { inputPrice: tokenSettings.inputPrice, outputPrice: tokenSettings.outputPrice };
      receipt.baselinePromptTokens = baselinePromptTokens;
      receipt.baselineCompletionTokens = baselineCompletionTokens;
      receipt.baselineTotalTokens = baselineTotalTokens;
      receipt.avoidedPromptTokens = avoidedPromptTokens;
      receipt.avoidedCompletionTokens = avoidedCompletionTokens;
      receipt.avoidedTotalTokens = avoidedTotalTokens;
      receipt.avoidedCostUsd = avoidedCostUsd;
      receipt.reuseCountAfterRun = reuseCountAfterRun;
      
      await ReceiptRepo.insert(receipt);
      await PacketRepo.updateLastRun(packetId, receipt.status);
      
      if (receipt.tokenStats) {
        setTokenStats({
          ...receipt.tokenStats,
          avoidedTotalTokens,
          avoidedCostUsd,
          cacheStatus
        });
      }
      
      setStatus(receipt.status === 'SUCCESS' ? 'success' : 'failed');
      setCurrentOpIndex(-1);
      
      setTimeout(() => {
        navigate(createPageUrl(`ReceiptDetail?receiptId=${receipt.receiptId}`));
      }, 2000);

    } catch (error) {
      setLogs(prev => [...prev, {
        timestamp: Date.now(),
        level: 'error',
        message: `Execution failed: ${error.message}`
      }]);
      setStatus('failed');
      setCurrentOpIndex(-1);
    }

    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAbort = () => {
    if (engineRef.current) {
      engineRef.current.abort();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!packet || !packetData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Packet Not Found</h2>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-cyan-500 hover:bg-cyan-600">Go Home</Button>
        </Link>
      </div>
    );
  }

  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl(`PacketDetail?packetId=${packetId}`)}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {packetData.meta?.name || packetData.id}
                </h1>
                <p className="text-sm text-slate-400">Execution Monitor</p>
              </div>
            </div>
            {running && (
              <div className="flex items-center gap-2 text-cyan-400">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full space-y-4">
        {/* Status Banner */}
        <AnimatePresence mode="wait">
          {status === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <div className="flex-1">
                  <p className="font-medium text-cyan-400">Executing Packet...</p>
                  <p className="text-sm text-cyan-300/70">
                    Operation {progress.current} of {progress.total}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-cyan-400">{progressPercent}%</span>
                  <p className="text-xs text-cyan-300/50">{formatTime(elapsedTime)}</p>
                </div>
              </div>
              <Progress value={progressPercent} className="mt-3 h-2 bg-cyan-900/50" />
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-400">Execution Complete!</p>
                  <p className="text-sm text-emerald-300/70">Completed in {formatTime(elapsedTime)}</p>
                </div>
                <p className="text-sm text-emerald-300/70">Redirecting to receipt...</p>
              </div>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-500/20 border border-rose-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-rose-400" />
                <div>
                  <p className="font-medium text-rose-400">Execution Failed</p>
                  <p className="text-sm text-rose-300/70">Check logs for details</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Token Meter */}
        {(status === 'running' || tokenStats) && (
          <LiveTokenMeter 
            stats={tokenStats} 
            pricing={tokenSettings}
            cacheStatus={tokenStats?.cacheStatus}
          />
        )}

        {/* Operation Timeline */}
        {packetData.ops && (
          <div>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-t-xl hover:bg-slate-800/70 transition-colors"
            >
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Operations ({packetData.ops.length})
              </span>
              {showTimeline ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {showTimeline && (
              <div className="border border-t-0 border-slate-700/50 rounded-b-xl">
                <ExecutionTimeline 
                  operations={packetData.ops}
                  currentIndex={currentOpIndex}
                  results={opResults}
                />
              </div>
            )}
          </div>
        )}

        {/* Log Output */}
        <div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-t-xl hover:bg-slate-800/70 transition-colors"
          >
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              Execution Log
              {logs.length > 0 && <span className="text-xs text-slate-500">({logs.length})</span>}
            </span>
            {showLogs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          
          {showLogs && (
            <div className="bg-slate-950 border border-t-0 border-slate-700/50 rounded-b-xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto p-4 font-mono text-sm space-y-1">
                {logs.length === 0 ? (
                  <div className="text-slate-600 text-center py-8">
                    {status === 'idle' ? 'Press Start to begin execution' : 'Waiting for logs...'}
                  </div>
                ) : (
                  logs.map((log, index) => {
                    const Icon = LOG_ICONS[log.level] || Info;
                    const colorClass = LOG_COLORS[log.level] || 'text-slate-400';
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2"
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
                        <span className="text-slate-500 text-xs whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`${colorClass} break-all`}>{log.message}</span>
                      </motion.div>
                    );
                  })
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {status === 'idle' && (
            <Button
              onClick={handleStart}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Execution
            </Button>
          )}

          {status === 'running' && (
            <Button
              onClick={handleAbort}
              variant="destructive"
              className="flex-1 py-6"
            >
              <Square className="w-5 h-5 mr-2" />
              Abort
            </Button>
          )}

          {(status === 'success' || status === 'failed') && (
            <>
              <Button
                onClick={() => {
                  setStatus('idle');
                  setLogs([]);
                  setOpResults({});
                  setCurrentOpIndex(-1);
                  setProgress({ current: 0, total: 0 });
                  setTokenStats(null);
                  setElapsedTime(0);
                }}
                variant="outline"
                className="flex-1 py-6 border-slate-600 text-slate-300"
              >
                Run Again
              </Button>
              <Link to={createPageUrl('Home')} className="flex-1">
                <Button variant="ghost" className="w-full py-6 text-slate-400">
                  Go Home
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}