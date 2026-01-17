import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, Download, Filter, Calendar, ChevronDown, 
  CheckCircle, Loader2, Settings2, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PacketRepo, ReceiptRepo, TemplateRepo, initDB } from '@/components/ucp/UCPDatabase';

const REPORT_TYPES = [
  { id: 'usage_summary', label: 'Usage Summary', description: 'Overview of all activity' },
  { id: 'command_breakdown', label: 'Command Breakdown', description: 'Stats by command type' },
  { id: 'template_performance', label: 'Template Performance', description: 'Savings per template' },
  { id: 'daily_detailed', label: 'Daily Detailed', description: 'Day-by-day metrics' },
  { id: 'cost_analysis', label: 'Cost Analysis', description: 'Token and cost breakdown' }
];

const DATE_PRESETS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
  { id: 'all', label: 'All Time', days: null }
];

export default function CustomReportBuilder({ onExport }) {
  const [reportType, setReportType] = useState('usage_summary');
  const [dateRange, setDateRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommands, setSelectedCommands] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const generateReport = async () => {
    setExporting(true);
    await initDB();

    const [packets, receipts, templates] = await Promise.all([
      PacketRepo.listRecent(10000),
      ReceiptRepo.listRecent(10000),
      TemplateRepo.listAll()
    ]);

    // Calculate date cutoff
    const now = Date.now();
    const preset = DATE_PRESETS.find(p => p.id === dateRange);
    const cutoff = preset?.days ? now - (preset.days * 24 * 60 * 60 * 1000) : 0;

    const filteredReceipts = receipts.filter(r => r.createdAt >= cutoff);

    let reportData = {};
    let csvContent = '';
    let filename = `ucp_report_${reportType}`;

    switch (reportType) {
      case 'usage_summary':
        reportData = generateUsageSummary(filteredReceipts, packets, templates);
        csvContent = formatUsageSummaryCSV(reportData);
        break;
      case 'command_breakdown':
        reportData = generateCommandBreakdown(filteredReceipts, packets);
        csvContent = formatCommandBreakdownCSV(reportData);
        break;
      case 'template_performance':
        reportData = generateTemplatePerformance(filteredReceipts, packets, templates);
        csvContent = formatTemplatePerformanceCSV(reportData);
        break;
      case 'daily_detailed':
        reportData = generateDailyDetailed(filteredReceipts);
        csvContent = formatDailyDetailedCSV(reportData);
        break;
      case 'cost_analysis':
        reportData = generateCostAnalysis(filteredReceipts);
        csvContent = formatCostAnalysisCSV(reportData);
        break;
    }

    // Download
    if (exportFormat === 'csv') {
      downloadBlob(new Blob([csvContent], { type: 'text/csv' }), `${filename}_${Date.now()}.csv`);
    } else {
      downloadBlob(
        new Blob([JSON.stringify({ ...reportData, generatedAt: new Date().toISOString(), reportType, dateRange }, null, 2)], 
        { type: 'application/json' }), 
        `${filename}_${Date.now()}.json`
      );
    }

    setExporting(false);
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-violet-400" />
        <h3 className="font-semibold text-white">Custom Report Builder</h3>
      </div>

      {/* Report Type Selection */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">Report Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {REPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                reportType === type.id
                  ? 'bg-violet-500/20 border border-violet-500/50'
                  : 'bg-slate-900/50 border border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <p className={`text-sm font-medium ${reportType === type.id ? 'text-violet-400' : 'text-white'}`}>
                {type.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">Date Range</label>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => setDateRange(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                dateRange === preset.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Format */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 mb-2 block">Export Format</label>
        <div className="flex gap-2">
          <button
            onClick={() => setExportFormat('csv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              exportFormat === 'csv'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => setExportFormat('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              exportFormat === 'json'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateReport}
        disabled={exporting}
        className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Generate & Download Report
      </Button>
    </div>
  );
}

// Report generation functions
function generateUsageSummary(receipts, packets, templates) {
  let totalTokens = 0, savedTokens = 0, successCount = 0, totalDuration = 0;
  
  receipts.forEach(r => {
    if (r.status === 'SUCCESS') successCount++;
    const data = JSON.parse(r.json);
    if (data.tokenStats) {
      totalTokens += data.tokenStats.totalTokens || 0;
      savedTokens += data.tokenStats.savedTokens || 0;
    }
    if (data.finishedAtEpochMs && data.startedAtEpochMs) {
      totalDuration += data.finishedAtEpochMs - data.startedAtEpochMs;
    }
  });

  return {
    summary: {
      totalRuns: receipts.length,
      successRate: receipts.length > 0 ? ((successCount / receipts.length) * 100).toFixed(2) : 0,
      totalTokensUsed: totalTokens,
      totalTokensSaved: savedTokens,
      estimatedCost: (totalTokens / 1000 * 0.0004).toFixed(6),
      estimatedSavings: (savedTokens / 1000 * 0.0004).toFixed(6),
      avgDurationMs: receipts.length > 0 ? Math.round(totalDuration / receipts.length) : 0,
      totalPackets: packets.length,
      totalTemplates: templates.length
    }
  };
}

function formatUsageSummaryCSV(data) {
  let csv = 'Metric,Value\n';
  Object.entries(data.summary).forEach(([key, value]) => {
    csv += `"${key}","${value}"\n`;
  });
  return csv;
}

function generateCommandBreakdown(receipts, packets) {
  const byCommand = {};
  
  receipts.forEach(r => {
    const packet = packets.find(p => p.id === r.packetId);
    let commandType = 'OTHER';
    
    if (packet) {
      const packetData = JSON.parse(packet.json);
      commandType = packetData.meta?.command_type || 'OTHER';
    }
    
    if (!byCommand[commandType]) {
      byCommand[commandType] = { runs: 0, success: 0, tokens: 0, saved: 0, duration: 0 };
    }
    
    byCommand[commandType].runs++;
    if (r.status === 'SUCCESS') byCommand[commandType].success++;
    
    const data = JSON.parse(r.json);
    if (data.tokenStats) {
      byCommand[commandType].tokens += data.tokenStats.totalTokens || 0;
      byCommand[commandType].saved += data.tokenStats.savedTokens || 0;
    }
    if (data.finishedAtEpochMs && data.startedAtEpochMs) {
      byCommand[commandType].duration += data.finishedAtEpochMs - data.startedAtEpochMs;
    }
  });

  return { byCommand };
}

function formatCommandBreakdownCSV(data) {
  let csv = 'Command Type,Runs,Success,Success Rate,Tokens Used,Tokens Saved,Avg Duration (ms)\n';
  Object.entries(data.byCommand).forEach(([type, stats]) => {
    const successRate = stats.runs > 0 ? ((stats.success / stats.runs) * 100).toFixed(2) : 0;
    const avgDuration = stats.runs > 0 ? Math.round(stats.duration / stats.runs) : 0;
    csv += `"${type}",${stats.runs},${stats.success},${successRate}%,${stats.tokens},${stats.saved},${avgDuration}\n`;
  });
  return csv;
}

function generateTemplatePerformance(receipts, packets, templates) {
  const byTemplate = {};
  
  templates.forEach(t => {
    byTemplate[t.id] = {
      name: t.name,
      usageCount: t.reuseCount || 0,
      savedTokens: 0,
      runs: 0
    };
  });

  packets.forEach(p => {
    if (p.templateId && byTemplate[p.templateId]) {
      const template = templates.find(t => t.id === p.templateId);
      if (template) {
        byTemplate[p.templateId].savedTokens += (template.baselinePromptTokens || 0) + (template.baselineCompletionTokens || 0);
      }
    }
  });

  return { byTemplate: Object.values(byTemplate).filter(t => t.usageCount > 0 || t.savedTokens > 0) };
}

function formatTemplatePerformanceCSV(data) {
  let csv = 'Template Name,Usage Count,Tokens Saved,Est. Cost Saved\n';
  data.byTemplate.forEach(t => {
    const costSaved = (t.savedTokens / 1000 * 0.0004).toFixed(6);
    csv += `"${t.name}",${t.usageCount},${t.savedTokens},$${costSaved}\n`;
  });
  return csv;
}

function generateDailyDetailed(receipts) {
  const byDate = {};
  
  receipts.forEach(r => {
    const date = new Date(r.createdAt).toISOString().split('T')[0];
    if (!byDate[date]) {
      byDate[date] = { date, runs: 0, success: 0, failed: 0, tokens: 0, saved: 0, duration: 0 };
    }
    
    byDate[date].runs++;
    if (r.status === 'SUCCESS') byDate[date].success++;
    else byDate[date].failed++;
    
    const data = JSON.parse(r.json);
    if (data.tokenStats) {
      byDate[date].tokens += data.tokenStats.totalTokens || 0;
      byDate[date].saved += data.tokenStats.savedTokens || 0;
    }
    if (data.finishedAtEpochMs && data.startedAtEpochMs) {
      byDate[date].duration += data.finishedAtEpochMs - data.startedAtEpochMs;
    }
  });

  return { daily: Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)) };
}

function formatDailyDetailedCSV(data) {
  let csv = 'Date,Total Runs,Success,Failed,Success Rate,Tokens Used,Tokens Saved,Avg Duration (ms)\n';
  data.daily.forEach(d => {
    const successRate = d.runs > 0 ? ((d.success / d.runs) * 100).toFixed(2) : 0;
    const avgDuration = d.runs > 0 ? Math.round(d.duration / d.runs) : 0;
    csv += `${d.date},${d.runs},${d.success},${d.failed},${successRate}%,${d.tokens},${d.saved},${avgDuration}\n`;
  });
  return csv;
}

function generateCostAnalysis(receipts) {
  let totalInput = 0, totalOutput = 0, totalSaved = 0;
  
  receipts.forEach(r => {
    const data = JSON.parse(r.json);
    if (data.tokenStats) {
      totalInput += data.tokenStats.inputTokens || 0;
      totalOutput += data.tokenStats.outputTokens || 0;
      totalSaved += data.tokenStats.savedTokens || 0;
    }
  });

  const inputCost = (totalInput / 1000) * 0.0003;
  const outputCost = (totalOutput / 1000) * 0.0006;
  const savedCost = (totalSaved / 1000) * 0.0004;

  return {
    costs: {
      inputTokens: totalInput,
      outputTokens: totalOutput,
      savedTokens: totalSaved,
      inputCostUSD: inputCost.toFixed(6),
      outputCostUSD: outputCost.toFixed(6),
      totalCostUSD: (inputCost + outputCost).toFixed(6),
      savedCostUSD: savedCost.toFixed(6),
      netCostUSD: (inputCost + outputCost - savedCost).toFixed(6)
    }
  };
}

function formatCostAnalysisCSV(data) {
  let csv = 'Metric,Tokens,Cost (USD)\n';
  csv += `"Input Tokens",${data.costs.inputTokens},$${data.costs.inputCostUSD}\n`;
  csv += `"Output Tokens",${data.costs.outputTokens},$${data.costs.outputCostUSD}\n`;
  csv += `"Total Used",,${data.costs.totalCostUSD}\n`;
  csv += `"Tokens Saved",${data.costs.savedTokens},$${data.costs.savedCostUSD}\n`;
  csv += `"Net Cost (after savings)",,${data.costs.netCostUSD}\n`;
  return csv;
}