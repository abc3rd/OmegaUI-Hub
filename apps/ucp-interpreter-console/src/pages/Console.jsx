import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { 
  Terminal, 
  Video, 
  VideoOff, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

import PromptInput from '@/components/console/PromptInput';
import OutputPanel from '@/components/console/OutputPanel';
import HopLedger from '@/components/console/HopLedger';
import SessionSummary from '@/components/console/SessionSummary';
import ContextWindowMeter from '@/components/console/ContextWindowMeter';
import TokenDisplay from '@/components/console/TokenDisplay';

export default function Console() {
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [maxTokens, setMaxTokens] = useState(1024);
  
  const [currentSession, setCurrentSession] = useState(null);
  const [hops, setHops] = useState([]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [showLedger, setShowLedger] = useState(true);

  // Load providers
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const result = await base44.functions.invoke('providerConfig', { action: 'list' });
      if (result.data.success) {
        setProviders(result.data.configs);
        // Set default provider
        const defaultProvider = result.data.configs.find(p => p.is_default) || result.data.configs[0];
        if (defaultProvider) {
          setSelectedProviderId(defaultProvider.id);
        }
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const handleCompile = async (prompt) => {
    setIsCompiling(true);
    setError(null);
    setOutput('');
    setHops([]);
    setCurrentSession(null);

    try {
      const result = await base44.functions.invoke('ucpCompiler', {
        rawPrompt: prompt,
        providerConfigId: selectedProviderId,
        maxTokens
      });

      if (result.data.success) {
        setCurrentSession({
          id: result.data.session_id,
          status: 'compiling',
          prompt_tokens: result.data.totals.prompt_tokens,
          completion_tokens: 0,
          total_tokens: result.data.totals.prompt_tokens,
          total_latency_ms: result.data.totals.compilation_latency_ms,
          context_window_used: result.data.totals.context_window_used,
          chain_hash: result.data.chain_hash
        });
        setHops(result.data.hops);
        toast.success('UCP compilation complete');
      } else {
        setError(result.data.error || 'Compilation failed');
        toast.error('Compilation failed');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Compilation error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCompileAndRun = async (prompt) => {
    // First compile
    await handleCompile(prompt);
    
    // Wait for compilation to complete and get session ID
    // This is a simplified flow - in production you might use refs or callbacks
  };

  // Effect to auto-run after compilation
  useEffect(() => {
    if (currentSession?.status === 'compiling' && currentSession.id && !isRunning) {
      handleRun();
    }
  }, [currentSession?.status, currentSession?.id]);

  const handleRun = async () => {
    if (!currentSession?.id) {
      toast.error('No compiled session to run');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const result = await base44.functions.invoke('ucpExecutor', {
        sessionId: currentSession.id
      });

      if (result.data.success) {
        setOutput(result.data.final_output);
        setHops(prev => [...prev, ...result.data.new_hops]);
        setCurrentSession(prev => ({
          ...prev,
          status: 'success',
          prompt_tokens: result.data.totals.prompt_tokens,
          completion_tokens: result.data.totals.completion_tokens,
          total_tokens: result.data.totals.total_tokens,
          total_cost_estimate: result.data.totals.total_cost_estimate,
          total_latency_ms: result.data.totals.total_latency_ms,
          context_window_used: result.data.totals.context_window_used,
          session_score: result.data.totals.session_score,
          chain_hash: result.data.chain_hash
        }));
        toast.success('Execution complete');
      } else {
        setError(result.data.error || result.data.details || 'Execution failed');
        setCurrentSession(prev => ({ ...prev, status: 'error' }));
        toast.error('Execution failed');
      }
    } catch (err) {
      setError(err.message);
      setCurrentSession(prev => ({ ...prev, status: 'error' }));
      toast.error('Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async () => {
    if (!currentSession?.id) {
      toast.error('No session to export');
      return;
    }

    try {
      const result = await base44.functions.invoke('exportSession', {
        sessionId: currentSession.id
      });

      if (result.data.success) {
        const blob = new Blob([JSON.stringify(result.data.export, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ucp-session-${currentSession.id}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Session exported');
      }
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleReplay = async () => {
    if (!currentSession?.id) {
      toast.error('No session to replay');
      return;
    }

    try {
      const result = await base44.functions.invoke('sessionManager', {
        action: 'replay',
        sessionId: currentSession.id
      });

      if (result.data.success) {
        // Reset state and re-run with original prompt
        setCurrentSession(null);
        setHops([]);
        setOutput('');
        setError(null);
        
        // Re-compile and run with replay data
        const replayData = result.data.replay_data;
        if (replayData.provider_config_id) {
          setSelectedProviderId(replayData.provider_config_id);
        }
        if (replayData.max_tokens) {
          setMaxTokens(replayData.max_tokens);
        }
        
        toast.info('Replaying session...');
        await handleCompileAndRun(replayData.raw_prompt);
      }
    } catch (err) {
      toast.error('Replay failed');
    }
  };

  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  const contextWindow = selectedProvider?.context_window || 4096;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <div className="w-5 h-5 bg-white/90" style={{ clipPath: 'polygon(50% 20%, 90% 80%, 50% 95%, 10% 80%)' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">UCP Interpreter Console</h1>
                <p className="text-xs text-slate-500">Universal Command Protocol</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
                className="gap-1.5"
              >
                {isRecording ? (
                  <>
                    <VideoOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Record
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm" onClick={loadProviders}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Prompt & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <PromptInput
                providers={providers}
                selectedProvider={selectedProviderId}
                onProviderChange={setSelectedProviderId}
                maxTokens={maxTokens}
                onMaxTokensChange={setMaxTokens}
                onCompile={handleCompile}
                onRun={handleCompileAndRun}
                isCompiling={isCompiling}
                isRunning={isRunning}
                disabled={providers.length === 0}
              />
            </div>

            {/* Output Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[300px]">
              <OutputPanel
                output={output}
                status={currentSession?.status}
                error={error}
                isLoading={isCompiling || isRunning}
              />
            </div>
          </div>

          {/* Right Column: Telemetry */}
          <div className="space-y-6">
            {/* Context Window Meter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <ContextWindowMeter
                used={currentSession?.context_window_used || 0}
                contextWindow={contextWindow}
              />
            </div>

            {/* Token Display */}
            {currentSession && (
              <TokenDisplay
                promptTokens={currentSession.prompt_tokens || 0}
                completionTokens={currentSession.completion_tokens || 0}
                method={hops.find(h => h.hop_type === 'PROVIDER_RESPONSE')?.token_method || 'local-estimated'}
                costEstimate={currentSession.total_cost_estimate || 0}
              />
            )}

            {/* Session Summary */}
            {currentSession && (
              <SessionSummary
                session={currentSession}
                onExport={handleExport}
                onReplay={handleReplay}
                isRecording={isRecording}
              />
            )}
          </div>
        </div>

        {/* Hop Ledger */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            onClick={() => setShowLedger(!showLedger)}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800">Hop-by-Hop Ledger</h3>
              {hops.length > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {hops.length} hops
                </span>
              )}
            </div>
            {showLedger ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showLedger && (
            <div className="border-t border-slate-200">
              <HopLedger hops={hops} isRecording={isRecording} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              Universal Command Protocol (UCP) — Confidential. © Omega UI, LLC
            </p>
            <p className="text-xs">
              Contact: omegaui@syncloudconnect.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}