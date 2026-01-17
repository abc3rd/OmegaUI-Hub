import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle,
  Loader2,
  Package,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PacketRepo, ReceiptRepo, TemplateRepo, initDB } from '@/components/ucp/UCPDatabase';

export default function ExportManager({ type = 'all' }) {
  const [exporting, setExporting] = useState(null);
  const [success, setSuccess] = useState(null);

  const exportToJSON = async (dataType) => {
    setExporting(dataType);
    await initDB();

    let data = {};
    let filename = '';

    if (dataType === 'packets' || dataType === 'all') {
      const packets = await PacketRepo.listRecent(1000);
      data.packets = packets.map(p => ({
        ...p,
        packetData: JSON.parse(p.json)
      }));
      filename = 'ucp_packets';
    }

    if (dataType === 'receipts' || dataType === 'all') {
      const receipts = await ReceiptRepo.listRecent(1000);
      data.receipts = receipts.map(r => ({
        ...r,
        receiptData: JSON.parse(r.json)
      }));
      filename = dataType === 'all' ? 'ucp_export' : 'ucp_receipts';
    }

    if (dataType === 'templates' || dataType === 'all') {
      const templates = await TemplateRepo.listAll();
      data.templates = templates;
      filename = dataType === 'all' ? 'ucp_export' : 'ucp_templates';
    }

    data.exportedAt = new Date().toISOString();
    data.version = '1.0';

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${filename}_${Date.now()}.json`);

    setExporting(null);
    setSuccess(dataType);
    setTimeout(() => setSuccess(null), 2000);
  };

  const exportToCSV = async (dataType) => {
    setExporting(`${dataType}_csv`);
    await initDB();

    let csvContent = '';
    let filename = '';

    if (dataType === 'packets') {
      const packets = await PacketRepo.listRecent(1000);
      csvContent = 'ID,Name,Created At,Last Run,Status,Template ID\n';
      packets.forEach(p => {
        csvContent += `"${p.id}","${p.name || ''}","${new Date(p.createdAt).toISOString()}","${p.lastRunAt ? new Date(p.lastRunAt).toISOString() : ''}","${p.lastStatus || ''}","${p.templateId || ''}"\n`;
      });
      filename = 'ucp_packets';
    }

    if (dataType === 'receipts') {
      const receipts = await ReceiptRepo.listRecent(1000);
      csvContent = 'Receipt ID,Packet ID,Status,Created At,Duration (ms),Input Tokens,Output Tokens,Total Tokens\n';
      receipts.forEach(r => {
        const data = JSON.parse(r.json);
        const duration = (data.finishedAtEpochMs || 0) - (data.startedAtEpochMs || 0);
        const tokens = data.tokenStats || {};
        csvContent += `"${r.id}","${r.packetId}","${r.status}","${new Date(r.createdAt).toISOString()}",${duration},${tokens.inputTokens || 0},${tokens.outputTokens || 0},${tokens.totalTokens || 0}\n`;
      });
      filename = 'ucp_receipts';
    }

    if (dataType === 'analytics') {
      const receipts = await ReceiptRepo.listRecent(1000);
      csvContent = 'Date,Total Runs,Success,Failed,Total Tokens,Saved Tokens,Total Cost (USD)\n';
      
      // Group by date
      const byDate = {};
      receipts.forEach(r => {
        const date = new Date(r.createdAt).toISOString().split('T')[0];
        if (!byDate[date]) {
          byDate[date] = { runs: 0, success: 0, failed: 0, tokens: 0, saved: 0, cost: 0 };
        }
        byDate[date].runs++;
        if (r.status === 'SUCCESS') byDate[date].success++;
        else byDate[date].failed++;
        
        const data = JSON.parse(r.json);
        if (data.tokenStats) {
          byDate[date].tokens += data.tokenStats.totalTokens || 0;
          byDate[date].saved += data.tokenStats.savedTokens || 0;
        }
        if (data.avoidedCostUsd) {
          byDate[date].cost += data.avoidedCostUsd;
        }
      });

      Object.entries(byDate).sort().forEach(([date, stats]) => {
        csvContent += `${date},${stats.runs},${stats.success},${stats.failed},${stats.tokens},${stats.saved},${stats.cost.toFixed(4)}\n`;
      });
      filename = 'ucp_analytics';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, `${filename}_${Date.now()}.csv`);

    setExporting(null);
    setSuccess(`${dataType}_csv`);
    setTimeout(() => setSuccess(null), 2000);
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

  const ExportButton = ({ dataType, format, icon: Icon, label }) => {
    const key = format === 'csv' ? `${dataType}_csv` : dataType;
    const isExporting = exporting === key;
    const isSuccess = success === key;
    const handler = format === 'csv' ? () => exportToCSV(dataType) : () => exportToJSON(dataType);

    return (
      <Button
        variant="outline"
        onClick={handler}
        disabled={isExporting}
        className={`flex-1 border-slate-600 ${isSuccess ? 'border-emerald-500 text-emerald-400' : 'text-slate-300'}`}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : isSuccess ? (
          <CheckCircle className="w-4 h-4 mr-2" />
        ) : (
          <Icon className="w-4 h-4 mr-2" />
        )}
        {label}
      </Button>
    );
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white">Export Data</h3>
      </div>

      <div className="space-y-4">
        {/* Packets */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">Packets</span>
          </div>
          <div className="flex gap-2">
            <ExportButton dataType="packets" format="json" icon={FileJson} label="JSON" />
            <ExportButton dataType="packets" format="csv" icon={FileSpreadsheet} label="CSV" />
          </div>
        </div>

        {/* Receipts */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-300">Receipts</span>
          </div>
          <div className="flex gap-2">
            <ExportButton dataType="receipts" format="json" icon={FileJson} label="JSON" />
            <ExportButton dataType="receipts" format="csv" icon={FileSpreadsheet} label="CSV" />
          </div>
        </div>

        {/* Analytics */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-300">Analytics Summary</span>
          </div>
          <div className="flex gap-2">
            <ExportButton dataType="analytics" format="csv" icon={FileSpreadsheet} label="CSV Report" />
          </div>
        </div>

        {/* Full Export */}
        <div className="pt-3 border-t border-slate-700">
          <Button
            onClick={() => exportToJSON('all')}
            disabled={exporting === 'all'}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
          >
            {exporting === 'all' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : success === 'all' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export All Data (JSON)
          </Button>
        </div>
      </div>
    </div>
  );
}