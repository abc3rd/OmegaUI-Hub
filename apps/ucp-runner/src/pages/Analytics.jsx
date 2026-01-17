import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Coins,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Package,
  FileText,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PacketRepo, ReceiptRepo, TemplateRepo, initDB } from '@/components/ucp/UCPDatabase';
import ExportManager from '@/components/ucp/ExportManager';
import CommandTypeChart from '@/components/ucp/analytics/CommandTypeChart';
import TemplateSavingsChart from '@/components/ucp/analytics/TemplateSavingsChart';
import PerformanceChart from '@/components/ucp/analytics/PerformanceChart';
import CustomReportBuilder from '@/components/ucp/analytics/CustomReportBuilder';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [commandStats, setCommandStats] = useState({});
  const [templateStats, setTemplateStats] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    await initDB();

    const [packets, receipts, templates] = await Promise.all([
      PacketRepo.listRecent(1000),
      ReceiptRepo.listRecent(1000),
      TemplateRepo.listAll()
    ]);

    // Calculate time range filter
    const now = Date.now();
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };
    const cutoff = now - ranges[timeRange];

    const filteredReceipts = receipts.filter(r => r.createdAt >= cutoff);

    // Aggregate stats
    let totalTokens = 0;
    let savedTokens = 0;
    let totalCost = 0;
    let savedCost = 0;
    let successCount = 0;
    let failCount = 0;
    let totalDuration = 0;

    // Command type breakdown
    const commandBreakdown = {};
    
    // Template savings tracking
    const templateSavings = {};

    filteredReceipts.forEach(r => {
      if (r.status === 'SUCCESS') successCount++;
      else failCount++;

      const data = JSON.parse(r.json);
      if (data.tokenStats) {
        totalTokens += data.tokenStats.totalTokens || 0;
        savedTokens += data.tokenStats.savedTokens || 0;
      }
      if (data.avoidedCostUsd) {
        savedCost += data.avoidedCostUsd;
      }
      if (data.finishedAtEpochMs && data.startedAtEpochMs) {
        totalDuration += data.finishedAtEpochMs - data.startedAtEpochMs;
      }

      // Get packet for command type
      const packet = packets.find(p => p.id === r.packetId);
      if (packet) {
        const packetData = JSON.parse(packet.json);
        const commandType = packetData.meta?.command_type || 'OTHER';
        
        if (!commandBreakdown[commandType]) {
          commandBreakdown[commandType] = { tokens: 0, runs: 0, saved: 0 };
        }
        commandBreakdown[commandType].runs++;
        if (data.tokenStats) {
          commandBreakdown[commandType].tokens += data.tokenStats.totalTokens || 0;
          commandBreakdown[commandType].saved += data.tokenStats.savedTokens || 0;
        }

        // Track template savings
        if (packet.templateId) {
          if (!templateSavings[packet.templateId]) {
            const template = templates.find(t => t.id === packet.templateId);
            templateSavings[packet.templateId] = {
              id: packet.templateId,
              name: template?.name || packet.templateId,
              savedTokens: 0,
              savedCost: 0,
              usageCount: 0
            };
          }
          templateSavings[packet.templateId].usageCount++;
          if (data.tokenStats?.savedTokens) {
            templateSavings[packet.templateId].savedTokens += data.tokenStats.savedTokens;
            templateSavings[packet.templateId].savedCost += (data.tokenStats.savedTokens / 1000) * 0.0004;
          }
        }
      }
    });

    // Estimate cost (using default pricing)
    totalCost = (totalTokens / 1000) * 0.0004;

    // Daily breakdown with performance metrics
    const daily = {};
    filteredReceipts.forEach(r => {
      const date = new Date(r.createdAt).toISOString().split('T')[0];
      if (!daily[date]) {
        daily[date] = { 
          date, 
          runs: 0, 
          success: 0, 
          tokens: 0, 
          saved: 0,
          duration: 0,
          cacheHits: 0
        };
      }
      daily[date].runs++;
      if (r.status === 'SUCCESS') daily[date].success++;
      
      const data = JSON.parse(r.json);
      if (data.tokenStats) {
        daily[date].tokens += data.tokenStats.totalTokens || 0;
        daily[date].saved += data.tokenStats.savedTokens || 0;
        if (data.tokenStats.savedTokens > 0) daily[date].cacheHits++;
      }
      if (data.finishedAtEpochMs && data.startedAtEpochMs) {
        daily[date].duration += data.finishedAtEpochMs - data.startedAtEpochMs;
      }
    });

    // Calculate performance metrics per day
    const dailyPerformance = Object.values(daily)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({
        ...d,
        avgDuration: d.runs > 0 ? Math.round(d.duration / d.runs) : 0,
        successRate: d.runs > 0 ? Math.round((d.success / d.runs) * 100) : 0,
        cacheHitRate: d.runs > 0 ? Math.round((d.cacheHits / d.runs) * 100) : 0,
        tokensPerRun: d.runs > 0 ? Math.round(d.tokens / d.runs) : 0
      }));

    setDailyStats(dailyPerformance);
    setCommandStats(commandBreakdown);
    setTemplateStats(Object.values(templateSavings));
    setPerformanceData(dailyPerformance);

    setStats({
      totalPackets: packets.length,
      totalReceipts: filteredReceipts.length,
      totalTemplates: templates.length,
      successCount,
      failCount,
      successRate: filteredReceipts.length > 0 ? Math.round((successCount / filteredReceipts.length) * 100) : 0,
      totalTokens,
      savedTokens,
      totalCost,
      savedCost,
      avgDuration: filteredReceipts.length > 0 ? Math.round(totalDuration / filteredReceipts.length) : 0,
      cacheHitRate: totalTokens + savedTokens > 0 ? Math.round((savedTokens / (totalTokens + savedTokens)) * 100) : 0
    });

    setLoading(false);
  };

  const StatCard = ({ icon: Icon, label, value, subvalue, color = 'cyan', trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-${color}-500/10 border border-${color}-500/30 rounded-xl p-4`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Icon className={`w-4 h-4 text-${color}-400`} />
            <span>{label}</span>
          </div>
          <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          {subvalue && <p className="text-sm text-slate-500 mt-1">{subvalue}</p>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <BarChart3 className="w-8 h-8 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Analytics</h1>
                  <p className="text-sm text-slate-400">Usage & Performance</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={loadAnalytics} className="text-slate-400 hover:text-white">
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            {[
              { id: '24h', label: '24 Hours' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setTimeRange(opt.id)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  timeRange === opt.id 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'detailed', label: 'Detailed' },
              { id: 'reports', label: 'Reports' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={Zap}
                label="Total Runs"
                value={stats.totalReceipts}
                color="cyan"
              />
              <StatCard
                icon={CheckCircle}
                label="Success Rate"
                value={`${stats.successRate}%`}
                subvalue={`${stats.successCount} / ${stats.totalReceipts}`}
                color="emerald"
              />
              <StatCard
                icon={Coins}
                label="Tokens Used"
                value={stats.totalTokens.toLocaleString()}
                subvalue={`$${stats.totalCost.toFixed(4)} est.`}
                color="violet"
              />
              <StatCard
                icon={TrendingDown}
                label="Tokens Saved"
                value={stats.savedTokens.toLocaleString()}
                subvalue={`$${stats.savedCost.toFixed(4)} saved`}
                color="emerald"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Package} label="Packets" value={stats.totalPackets} color="cyan" />
              <StatCard icon={FileText} label="Templates" value={stats.totalTemplates} color="violet" />
              <StatCard icon={Clock} label="Avg Duration" value={`${stats.avgDuration}ms`} color="amber" />
              <StatCard icon={RefreshCw} label="Cache Hit Rate" value={`${stats.cacheHitRate}%`} color="emerald" />
            </div>

            {/* Daily Chart */}
            {dailyStats.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Daily Activity
                </h3>
                <div className="space-y-2">
                  {dailyStats.slice(-7).map((day, i) => {
                    const maxRuns = Math.max(...dailyStats.map(d => d.runs), 1);
                    const percent = (day.runs / maxRuns) * 100;
                    return (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 w-20">{new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <div className="flex-1 h-6 bg-slate-700/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ delay: i * 0.1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-end pr-2"
                          >
                            {percent > 20 && <span className="text-xs text-white font-medium">{day.runs}</span>}
                          </motion.div>
                        </div>
                        {percent <= 20 && <span className="text-sm text-slate-400 w-8">{day.runs}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Export Section */}
            <ExportManager />
          </>
        )}

        {/* Detailed Tab */}
        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {/* Command Type Breakdown */}
            <CommandTypeChart data={commandStats} />

            {/* Template Savings */}
            <TemplateSavingsChart data={templateStats} />

            {/* Performance Over Time */}
            <PerformanceChart data={performanceData} />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <CustomReportBuilder />
            <ExportManager />
          </div>
        )}
      </main>
    </div>
  );
}