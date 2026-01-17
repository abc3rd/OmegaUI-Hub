import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BulkUpload from '@/components/qr/BulkUpload';
import { ExportQRCodes, ExportScans } from '@/components/qr/ExportTools';

export default function QRBulk() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('QRDashboard'))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3c3c3c] mb-2">Bulk QR Management</h1>
          <p className="text-gray-600">Upload multiple QR codes at once or export your data</p>
        </div>

        <div className="space-y-6">
          <BulkUpload onSuccess={handleUploadSuccess} />

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-[#3c3c3c] mb-4">Export Data</h2>
            <p className="text-gray-600 mb-6">
              Download your QR code data or scan logs as CSV files for analysis and backup.
            </p>
            <div className="flex flex-wrap gap-3">
              <ExportQRCodes />
              <ExportScans />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}