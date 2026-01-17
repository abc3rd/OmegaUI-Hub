import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Coins, 
  DollarSign, 
  ChevronDown, 
  ChevronRight,
  Zap,
  Globe,
  Database,
  Bell,
  Shuffle,
  Timer,
  Brain
} from 'lucide-react';
import { SettingsRepo, initDB } from './UCPDatabase';

// Token cost estimates per operation type
const OP_TOKEN_ESTIMATES = {
  'http.get': { input: 20, output: 50, description: 'HTTP GET request' },
  'http.post': { input: 40, output: 60, description: 'HTTP POST request' },
  'http.put': { input: 40, output: 50, description: 'HTTP PUT request' },
  'http.delete': { input: 20, output: 30, description: 'HTTP DELETE request' },
  'local.put': { input: 15, output: 10, description: 'Store data locally' },
  'local.get': { input: 10, output: 20, description: 'Retrieve local data' },
  'local.delete': { input: 10, output: 5, description: 'Delete local data' },
  'local.increment': { input: 15, output: 10, description: 'Increment counter' },
  'notify.show': { input: 25, output: 5, description: 'Show notification' },
  'transform.map': { input: 30, output: 40, description: 'Map transformation' },
  'transform.filter': { input: 25, output: 35, description: 'Filter data' },
  'transform.reduce': { input: 30, output: 20, description: 'Reduce operation' },
  'transform.set': { input: 15, output: 10, description: 'Set value' },
  'transform.concat': { input: 20, output: 15, description: 'Concatenate' },
  'transform.split': { input: 15, output: 20, description: 'Split string' },
  'transform.json': { input: 20, output: 25, description: 'JSON transform' },
  'wait.delay': { input: 5, output: 5, description: 'Delay execution' },
  'wait.until': { input: 10, output: 10, description: 'Wait for condition' },
  'llm.invoke': { input: 500, output: 200, description: 'LLM call (varies)' },
  'llm.analyze': { input: 600, output: 300, description: 'LLM analysis' },
  'llm.generate': { input: 400, output: 500, description: 'LLM generation' },
  'llm.summarize': { input: 300, output: 100, description: 'LLM summarization' }
};

const OP_ICONS = {
  http: Globe,
  local: Database,
  notify: Bell,
  transform: Shuffle,
  wait: Timer,
  llm: Brain
};

// Recursively count operations and estimate tokens
const analyzeOps = (ops, depth = 0) => {
  const results = [];
  
  for (const op of ops) {
    if (op.type === 'conditional' || op.type === 'if') {
      // Count both branches (worst case)
      const thenOps = op.then ? analyzeOps(op.then, depth + 1) : [];
      const elseOps = op.else ? analyzeOps(op.else, depth + 1) : [];
      results.push({
        type: 'conditional',
        depth,
        branches: { then: thenOps, else: elseOps },
        worstCase: Math.max(
          thenOps.reduce((a, b) => a + (b.estimate?.input || 0) + (b.estimate?.output || 0), 0),
          elseOps.reduce((a, b) => a + (b.estimate?.input || 0) + (b.estimate?.output || 0), 0)
        )
      });
    } else if (op.type === 'loop' || op.type === 'foreach') {
      const loopOps = op.ops ? analyzeOps(op.ops, depth + 1) : [];
      const iterations = op.count || (op.items?.length || 3); // Estimate 3 if unknown
      const perIteration = loopOps.reduce((a, b) => a + (b.estimate?.input || 0) + (b.estimate?.output || 0), 0);
      results.push({
        type: 'loop',
        depth,
        iterations,
        ops: loopOps,
        estimate: { input: perIteration * iterations * 0.6, output: perIteration * iterations * 0.4 }
      });
    } else if (op.type === 'parallel') {
      const parallelOps = op.ops ? analyzeOps(op.ops, depth + 1) : [];
      results.push({
        type: 'parallel',
        depth,
        ops: parallelOps,
        estimate: parallelOps.reduce((a, b) => ({
          input: a.input + (b.estimate?.input || 0),
          output: a.output + (b.estimate?.output || 0)
        }), { input: 0, output: 0 })
      });
    } else if (op.type === 'try') {
      const tryOps = op.ops ? analyzeOps(op.ops, depth + 1) : [];
      const catchOps = op.catch ? analyzeOps(op.catch, depth + 1) : [];
      results.push({
        type: 'try',
        depth,
        tryOps,
        catchOps,
        estimate: tryOps.reduce((a, b) => ({
          input: a.input + (b.estimate?.input || 0),
          output: a.output + (b.estimate?.output || 0)
        }), { input: 0, output: 0 })
      });
    } else if (op.op) {
      const estimate = OP_TOKEN_ESTIMATES[op.op] || { input: 30, output: 30, description: 'Unknown operation' };
      results.push({
        type: 'standard',
        op: op.op,
        opId: op.id,
        depth,
        estimate
      });
    }
  }
  
  return results;
};

export const estimatePacketCost = async (packetData) => {
  await initDB();
  
  const inputPrice = await SettingsRepo.get('inputPrice', 0.00015);
  const outputPrice = await SettingsRepo.get('outputPrice', 0.0006);
  const modelName = await SettingsRepo.get('modelName', 'gpt-4o-mini');
  
  const analysis = analyzeOps(packetData.ops || []);
  
  let totalInput = 0;
  let totalOutput = 0;
  
  const calculateTotals = (items) => {
    for (const item of items) {
      if (item.estimate) {
        totalInput += item.estimate.input || 0;
        totalOutput += item.estimate.output || 0;
      }
      if (item.branches) {
        calculateTotals(item.branches.then || []);
        // Don't count else branch as it's alternative path
      }
      if (item.ops) {
        calculateTotals(item.ops);
      }
      if (item.tryOps) {
        calculateTotals(item.tryOps);
      }
    }
  };
  
  calculateTotals(analysis);
  
  const inputCost = (totalInput / 1000) * inputPrice;
  const outputCost = (totalOutput / 1000) * outputPrice;
  const totalCost = inputCost + outputCost;
  
  return {
    analysis,
    totalInput,
    totalOutput,
    totalTokens: totalInput + totalOutput,
    inputCost,
    outputCost,
    totalCost,
    modelName,
    inputPrice,
    outputPrice
  };
};

export default function TokenCostEstimator({ packetData, compact = false }) {
  const [estimate, setEstimate] = useState(null);
  const [expanded, setExpanded] = useState(!compact);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (packetData) {
      estimatePacketCost(packetData).then(result => {
        setEstimate(result);
        setLoading(false);
      });
    }
  }, [packetData]);

  if (loading || !estimate) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
            <div className="h-3 bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">Est. Cost</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{estimate.totalTokens.toLocaleString()} tokens</span>
            <span className="font-bold text-amber-400">${estimate.totalCost.toFixed(4)}</span>
          </div>
        </div>
      </div>
    );
  }

  const renderOpBreakdown = (items, depth = 0) => {
    return items.map((item, index) => {
      const namespace = item.op?.split('.')[0];
      const Icon = OP_ICONS[namespace] || Zap;
      
      if (item.type === 'standard') {
        return (
          <div 
            key={index} 
            className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
            style={{ paddingLeft: depth * 16 }}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-sm text-cyan-400">{item.op}</span>
              {item.opId && <span className="text-xs text-slate-500">({item.opId})</span>}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">{item.estimate.input} in / {item.estimate.output} out</span>
              <span className="text-amber-400 font-medium">
                ${(((item.estimate.input / 1000) * estimate.inputPrice) + ((item.estimate.output / 1000) * estimate.outputPrice)).toFixed(5)}
              </span>
            </div>
          </div>
        );
      }
      
      if (item.type === 'loop') {
        return (
          <div key={index} className="py-2 border-b border-slate-700/50 last:border-0" style={{ paddingLeft: depth * 16 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-violet-400 text-sm font-medium">Loop ({item.iterations}x)</span>
              </div>
              <span className="text-xs text-amber-400">
                ~{(item.estimate.input + item.estimate.output).toLocaleString()} tokens
              </span>
            </div>
            {item.ops && renderOpBreakdown(item.ops, depth + 1)}
          </div>
        );
      }
      
      if (item.type === 'parallel') {
        return (
          <div key={index} className="py-2 border-b border-slate-700/50 last:border-0" style={{ paddingLeft: depth * 16 }}>
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 text-sm font-medium">Parallel ({item.ops?.length || 0} ops)</span>
              <span className="text-xs text-amber-400">
                ~{(item.estimate.input + item.estimate.output).toLocaleString()} tokens
              </span>
            </div>
            {item.ops && renderOpBreakdown(item.ops, depth + 1)}
          </div>
        );
      }
      
      if (item.type === 'conditional') {
        return (
          <div key={index} className="py-2 border-b border-slate-700/50 last:border-0" style={{ paddingLeft: depth * 16 }}>
            <div className="text-violet-400 text-sm font-medium mb-1">Conditional (worst case: {item.worstCase} tokens)</div>
            {item.branches.then?.length > 0 && (
              <div className="ml-4">
                <span className="text-xs text-slate-500">then:</span>
                {renderOpBreakdown(item.branches.then, depth + 1)}
              </div>
            )}
            {item.branches.else?.length > 0 && (
              <div className="ml-4">
                <span className="text-xs text-slate-500">else:</span>
                {renderOpBreakdown(item.branches.else, depth + 1)}
              </div>
            )}
          </div>
        );
      }
      
      return null;
    });
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Calculator className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">Pre-Run Cost Estimate</h3>
            <p className="text-sm text-slate-400">{estimate.modelName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-amber-400">${estimate.totalCost.toFixed(4)}</p>
            <p className="text-xs text-slate-400">{estimate.totalTokens.toLocaleString()} tokens</p>
          </div>
          {expanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-5 pb-5"
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Input Tokens</p>
              <p className="text-lg font-bold text-white">{estimate.totalInput.toLocaleString()}</p>
              <p className="text-xs text-slate-500">${estimate.inputCost.toFixed(5)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Output Tokens</p>
              <p className="text-lg font-bold text-white">{estimate.totalOutput.toLocaleString()}</p>
              <p className="text-xs text-slate-500">${estimate.outputCost.toFixed(5)}</p>
            </div>
            <div className="bg-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-300">Total Cost</p>
              <p className="text-lg font-bold text-amber-400">${estimate.totalCost.toFixed(4)}</p>
              <p className="text-xs text-slate-500">{estimate.totalTokens.toLocaleString()} tokens</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 mb-3">
            Pricing: ${estimate.inputPrice}/1K input • ${estimate.outputPrice}/1K output
          </div>

          {/* Per-operation breakdown toggle */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            {showBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Per-Operation Breakdown
          </button>

          {showBreakdown && (
            <div className="mt-3 bg-slate-900/50 rounded-lg p-3 max-h-64 overflow-y-auto">
              {renderOpBreakdown(estimate.analysis)}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}