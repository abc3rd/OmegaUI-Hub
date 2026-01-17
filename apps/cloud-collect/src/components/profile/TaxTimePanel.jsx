import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileText, Table, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TaxTimePanel({ lastDonationId }) {
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true);
    try {
      const response = await base44.functions.invoke('generateDonationReceipt', {
        donationId: lastDonationId
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloud-collect-receipt-${lastDonationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Receipt download error:', error);
      toast.error('Failed to download receipt');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const response = await base44.functions.invoke('exportDonationsCsv', {});
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloud-collect-donations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('Donation history exported');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export donation history');
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileText className="w-5 h-5" />
          Tax Time Assistant
        </CardTitle>
        <CardDescription>
          Download your receipt and export your donation history for tax preparation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col gap-2 border-blue-300 hover:bg-blue-100"
            onClick={handleDownloadReceipt}
            disabled={downloadingReceipt}
          >
            {downloadingReceipt ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span className="font-semibold">Download Receipt</span>
            <span className="text-xs text-slate-500">PDF format</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col gap-2 border-blue-300 hover:bg-blue-100"
            onClick={handleExportCsv}
            disabled={exportingCsv}
          >
            {exportingCsv ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Table className="w-5 h-5" />
            )}
            <span className="font-semibold">Export History</span>
            <span className="text-xs text-slate-500">All donations (CSV)</span>
          </Button>
        </div>

        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900">
            <strong className="block mb-2">For Tax Software Users:</strong>
            <ol className="list-decimal ml-4 space-y-1 text-xs">
              <li>Download your receipt or export your full donation history</li>
              <li>Open your tax software (TurboTax, H&R Block, etc.)</li>
              <li>Navigate to <strong>Deductions & Credits</strong> section</li>
              <li>Look for <strong>Charitable Donations</strong> or <strong>Gifts to Charity</strong></li>
              <li>Some software includes ItsDeductible for easier import</li>
              <li>Manually enter the donation details from your receipt/CSV</li>
            </ol>
            <p className="mt-3 text-xs font-semibold">
              ⚠️ Consult your tax professional to determine if this payment qualifies for any deductions in your jurisdiction.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}