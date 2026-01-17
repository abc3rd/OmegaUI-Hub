import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function ExportQRCodes() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const qrCodes = await base44.entities.QRCode.list('-created_date', 1000);
      
      // Generate CSV
      const headers = ['ID', 'Label', 'Command Payload', 'Redirect URL', 'Status', 'Scan Count', 'Created Date', 'Last Scan'];
      const rows = qrCodes.map(qr => [
        qr.id,
        qr.label,
        qr.command_payload,
        qr.redirect_url || '',
        qr.status,
        qr.scan_count || 0,
        new Date(qr.created_date).toISOString(),
        qr.last_scan_at ? new Date(qr.last_scan_at).toISOString() : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr_codes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(`Exported ${qrCodes.length} QR codes`);
    } catch (error) {
      toast.error('Failed to export QR codes');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {isExporting ? 'Exporting...' : 'Export QR Codes'}
    </Button>
  );
}

export function ExportScans() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const scans = await base44.entities.QRScan.list('-created_date', 5000);
      
      // Generate CSV
      const headers = ['Scan ID', 'QR Code ID', 'Device', 'User Agent', 'Location', 'Result', 'Timestamp'];
      const rows = scans.map(scan => [
        scan.id,
        scan.qr_id,
        scan.device,
        scan.user_agent,
        scan.location || '',
        scan.result || '',
        new Date(scan.created_date).toISOString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr_scans_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(`Exported ${scans.length} scan records`);
    } catch (error) {
      toast.error('Failed to export scan logs');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      <FileSpreadsheet className="w-4 h-4" />
      {isExporting ? 'Exporting...' : 'Export Scan Logs'}
    </Button>
  );
}