import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Activity, Gauge, BatteryCharging, 
  Cpu, Server, Package, Play, 
  ToggleLeft, ToggleRight, RefreshCw,
  ChevronRight, Radio
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import KpiCard from "@/components/ucp/KpiCard";
import FlowStep from "@/components/ucp/FlowStep";
import ABCard from "@/components/ucp/ABCard";
import LineChartPanel from "@/components/ucp/LineChartPanel";
import MetricsTable from "@/components/ucp/MetricsTable";
import PromptInput from "@/components/ucp/PromptInput";
import PromptHistory from "@/components/ucp/PromptHistory";
import APIHealthMonitor from "@/components/ucp/APIHealthMonitor";

// Mock data generators - using accurate UCP performance metrics
const generateMockTimeSeries = () => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const time = `${i}s`;
    // Baseline: consistently high power/utilization (every request hits GPU)
    const baselinePower = 270 + Math.random() * 30; // 270-300W typical GPU inference load
    const baselineUtil = 78 + Math.random() * 8; // 78-86% utilization
    
    // UCP: 90% cache hit rate means only 10% of requests hit GPU
    const cacheHit = Math.random() > 0.10; // 90% cache hit rate
    const ucpPower = cacheHit 
      ? 45 + Math.random() * 25  // 45-70W idle/CPU execution
      : 250 + Math.random() * 40; // 250-290W on cache miss (GPU inference)
    const ucpUtil = cacheHit 
      ? 8 + Math.random() * 10   // 8-18% on cache hit (mostly idle)
      : 72 + Math.random() * 15; // 72-87% on cache miss (inference)
    
    data.push({
      time,
      baselinePower: Math.round(baselinePower),
      ucpPower: Math.round(ucpPower),
      baselineUtil: Math.round(baselineUtil),
      ucpUtil: Math.round(ucpUtil),
      baselineJoules: Math.round(baselinePower * 0.1), // Energy = Power × Time
      ucpJoules: Math.round(ucpPower * 0.1),
    });
  }
  return data;
};

const initialMockKpis = {
  cacheHitRate: 90,
  joulesPerTask: 13.7,
  tokensPerSecWatt: 3.42,
  gpuIdleReduction: 68,
};

const initialBaselineMetrics = {
  avgWatts: 285,
  utilization: 82,
  tasksPerMin: 45,
  cacheHitRate: 0,
  joulesPerTask: 38.0,
  tokensPerSecWatt: 1.16,
  efficiencyGain: 0,
};

const initialUcpMetrics = {
  avgWatts: 103,
  utilization: 26,
  tasksPerMin: 48,
  cacheHitRate: 90,
  joulesPerTask: 13.7,
  tokensPerSecWatt: 3.42,
  efficiencyGain: 64,
};

export default function UCPDemo() {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [metricsSource, setMetricsSource] = useState('Mock');
  
  const [kpis, setKpis] = useState(initialMockKpis);
  const [baselineMetrics, setBaselineMetrics] = useState(initialBaselineMetrics);
  const [ucpMetrics, setUcpMetrics] = useState(initialUcpMetrics);
  const [timeSeriesData, setTimeSeriesData] = useState(generateMockTimeSeries());

  // Fetch user's prompt history
  const { data: prompts = [], isLoading: promptsLoading, refetch: refetchPrompts } = useQuery({
    queryKey: ['ucpPrompts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return await base44.entities.UCPPrompt.filter({ created_by: user.email }, '-created_date');
    },
  });

  const fetchLiveMetrics = useCallback(async () => {
    try {
      const [summaryRes, timeseriesRes] = await Promise.all([
        fetch('/api/metrics/summary'),
        fetch('/api/metrics/timeseries')
      ]);
      
      if (summaryRes.ok && timeseriesRes.ok) {
        const summary = await summaryRes.json();
        const timeseries = await timeseriesRes.json();
        
        setKpis(summary.kpis);
        setBaselineMetrics(summary.baseline);
        setUcpMetrics(summary.ucp);
        setTimeSeriesData(timeseries);
        setMetricsSource('Live');
      } else {
        throw new Error('API unavailable');
      }
    } catch (error) {
      // Graceful fallback to mock data
      console.log('Falling back to mock data:', error.message);
      setMetricsSource('Mock (API unavailable)');
    }
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (isLiveMode) {
      fetchLiveMetrics();
      const interval = setInterval(fetchLiveMetrics, 5000);
      return () => clearInterval(interval);
    } else {
      setMetricsSource('Mock');
      setKpis(initialMockKpis);
      setBaselineMetrics(initialBaselineMetrics);
      setUcpMetrics(initialUcpMetrics);
      setTimeSeriesData(generateMockTimeSeries());
      setLastUpdated(new Date());
    }
  }, [isLiveMode, fetchLiveMetrics]);

  const handleRunBenchmark = () => {
    window.open('https://ucp.omegaui.com', '_blank');
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    
    // Simulate benchmark run with accurate UCP metrics
    let iteration = 0;
    const interval = setInterval(() => {
      setTimeSeriesData(generateMockTimeSeries());
      
      // Realistic variance in UCP metrics (±3-5% from baseline)
      const cacheHitRate = 88 + Math.round(Math.random() * 4); // 88-92%
      const avgWatts = 100 + Math.round(Math.random() * 8); // 100-108W
      const utilization = 24 + Math.round(Math.random() * 5); // 24-29%
      const tasksPerMin = 47 + Math.round(Math.random() * 3); // 47-50 tasks/min
      
      // Recalculate derived metrics
      const joulesPerTask = Number((avgWatts * 60 / tasksPerMin / 10).toFixed(1));
      const tokensPerSecWatt = Number((tasksPerMin / 60 * 150 / avgWatts).toFixed(2)); // ~150 tokens/task
      
      setUcpMetrics(prev => ({
        ...prev,
        avgWatts,
        utilization,
        tasksPerMin,
        cacheHitRate,
        joulesPerTask,
        tokensPerSecWatt,
      }));
      
      // Update KPIs
      setKpis(prev => ({
        ...prev,
        cacheHitRate,
        joulesPerTask,
        tokensPerSecWatt,
      }));
      
      iteration++;
      if (iteration >= 5) {
        clearInterval(interval);
        setIsRunning(false);
        setLastUpdated(new Date());
      }
    }, 800);
  };

  const scrollToMetrics = () => {
    document.getElementById('metrics-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePromptSubmit = async (prompt) => {
    setIsProcessingPrompt(true);
    try {
      const { data } = await base44.functions.invoke('processPrompt', { prompt });
      
      // Update metrics with the new data
      if (data.metrics) {
        setUcpMetrics(prev => ({
          ...prev,
          ...data.metrics,
        }));
        
        setKpis(prev => ({
          ...prev,
          cacheHitRate: data.metrics.cacheHitRate,
          joulesPerTask: data.metrics.joulesPerTask,
        }));
        
        setTimeSeriesData(generateMockTimeSeries());
        setLastUpdated(new Date());
        setMetricsSource(`GLYTCH AI - Dictionary: ${data.dictionarySize} entries`);
      }
      
      // Refresh prompt history
      refetchPrompts();
    } catch (error) {
      console.error('Error processing prompt:', error);
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ea00ea]/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ea00ea]/20 rounded-full blur-[120px] -translate-y-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ea00ea]/10 border border-[#ea00ea]/20">
              <Radio className="w-4 h-4 text-[#ea00ea] animate-pulse" />
              <span className="text-sm text-[#ea00ea]">Omega UI • Universal Command Protocol</span>
            </div>
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-center mb-6"
          >
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              UCP: More Inference Value
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] bg-clip-text text-transparent">
              Per Watt
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 text-center max-w-3xl mx-auto mb-10"
          >
            Deterministic caching + execution offloading for sustainable agentic AI on NVIDIA GPUs
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Button 
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="bg-gradient-to-r from-[#ea00ea] to-[#ea00ea]/80 hover:from-[#ea00ea]/90 hover:to-[#ea00ea]/70 text-white px-6 py-6 text-lg rounded-xl shadow-lg shadow-[#ea00ea]/25 transition-all duration-300"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Running Benchmark...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run A/B Benchmark
                </>
              )}
            </Button>
            <Button 
              onClick={scrollToMetrics}
              variant="outline"
              className="border-[#3c3c3c] bg-[#2a2a2a] hover:bg-[#3c3c3c] text-white px-6 py-6 text-lg rounded-xl"
            >
              <Activity className="w-5 h-5 mr-2" />
              View Live Metrics
            </Button>
          </motion.div>
          
          {/* KPI Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <KpiCard 
              label="Cache Hit Rate" 
              value={kpis.cacheHitRate}
              unit="%"
              trend={12}
              icon={Server}
            />
            <KpiCard 
              label="Joules/Task" 
              value={kpis.joulesPerTask}
              unit="J"
              trend={-64}
              icon={Zap}
            />
            <KpiCard 
              label="Tokens/sec/Watt" 
              value={kpis.tokensPerSecWatt}
              unit=""
              trend={191}
              icon={Gauge}
            />
            <KpiCard 
              label="GPU Idle Increase" 
              value={kpis.gpuIdleReduction}
              unit="%"
              trend={62}
              icon={BatteryCharging}
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Interpret once on GPU, execute many on CPU—maximizing useful work per joule through deterministic execution reuse
            </p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-6 md:gap-0">
            <FlowStep
              step={1}
              title="Interpret Once"
              description="GPU inference generates intent understanding and plans execution strategy"
              icon={Cpu}
              delay={0.1}
            />
            <FlowStep
              step={2}
              title="Compile UCP Packet"
              description="Deterministic, cryptographically signed command packet for verified replay"
              icon={Package}
              delay={0.2}
            />
            <FlowStep
              step={3}
              title="Execute Many"
              description="CPU executes cached commands, GPU only invoked on cache miss"
              icon={Server}
              delay={0.3}
              isLast
            />
          </div>
        </div>
      </section>

      {/* A/B Benchmark Section */}
      <section id="metrics-section" className="py-20 border-t border-[#2a2a2a] bg-gradient-to-b from-transparent to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">A/B Benchmark</h2>
              <p className="text-gray-400">
                Compare GPU duty cycle optimization between baseline and UCP modes
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-4 bg-[#2a2a2a] rounded-xl p-4 border border-[#3c3c3c]">
              <span className={`text-sm ${!isLiveMode ? 'text-white' : 'text-gray-500'}`}>
                Demo Mode
              </span>
              <Switch
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
                className="data-[state=checked]:bg-[#ea00ea]"
              />
              <span className={`text-sm ${isLiveMode ? 'text-white' : 'text-gray-500'}`}>
                Live Mode
              </span>
            </div>
          </div>

          {/* API Health Monitor */}
          {isLiveMode && (
            <div className="mb-8">
              <APIHealthMonitor />
            </div>
          )}
          
          {/* A/B Cards */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <ABCard
              title="Baseline Agent"
              type="baseline"
              metrics={baselineMetrics}
              isRunning={isRunning}
              delay={0.1}
            />
            <ABCard
              title="UCP Mode"
              type="ucp"
              metrics={ucpMetrics}
              isRunning={isRunning}
              delay={0.2}
            />
          </div>
          
          {/* Run Button */}
          <div className="flex justify-center mb-16">
            <Button
              onClick={handleRunSimulation}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-to-r from-[#2699fe] to-[#2699fe]/80 hover:from-[#2699fe]/90 hover:to-[#2699fe]/70 text-white px-8 py-6 rounded-xl shadow-lg shadow-[#2699fe]/25"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-20 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Performance Analytics</h2>
            <p className="text-gray-400">
              Real-time visualization of GPU power consumption and utilization patterns
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LineChartPanel
              title="GPU Power Over Time"
              data={timeSeriesData}
              dataKeys={[
                { name: 'baselinePower', label: 'Baseline', color: '#c4653a' },
                { name: 'ucpPower', label: 'UCP Mode', color: '#4bce2a' }
              ]}
              yAxisLabel="Watts"
              unit="Watts"
              delay={0.1}
            />
            <LineChartPanel
              title="GPU Utilization"
              data={timeSeriesData}
              dataKeys={[
                { name: 'baselineUtil', label: 'Baseline', color: '#c4653a' },
                { name: 'ucpUtil', label: 'UCP Mode', color: '#4bce2a' }
              ]}
              yAxisLabel="%"
              unit="Percent"
              delay={0.2}
            />
            <LineChartPanel
              title="Joules Per Task"
              data={timeSeriesData}
              dataKeys={[
                { name: 'baselineJoules', label: 'Baseline', color: '#c4653a' },
                { name: 'ucpJoules', label: 'UCP Mode', color: '#4bce2a' }
              ]}
              yAxisLabel="Joules"
              unit="Joules"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* GLYTCH AI Prompt Section */}
      <section className="py-20 border-t border-[#2a2a2a] bg-gradient-to-b from-transparent to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Test GLYTCH AI with UCP</h2>
            <p className="text-gray-400">
              Each prompt builds your personal dictionary for faster, more efficient responses
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessingPrompt} />
            <PromptHistory prompts={prompts} isLoading={promptsLoading} />
          </div>
        </div>
      </section>

      {/* Proof Metrics Section */}
      <section className="py-20 border-t border-[#2a2a2a] bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Proof Metrics</h2>
            <p className="text-gray-400">
              Quantified improvements in tokens per second per watt with deterministic caching
            </p>
          </motion.div>
          
          <MetricsTable
            baselineMetrics={baselineMetrics}
            ucpMetrics={ucpMetrics}
            delay={0.1}
          />
        </div>
      </section>

      {/* Telemetry Footer */}
      <footer className="border-t border-[#2a2a2a] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-[#4bce2a] animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm text-gray-400">
                  Telemetry: {metricsSource}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Omega UI • Universal Command Protocol
              </span>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                <span className="text-xs font-bold">Ω</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}