import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Download, FileSpreadsheet, Database } from 'lucide-react';
import BulkUpload from '@/components/qr/BulkUpload';
import { ExportQRCodes, ExportScans } from '@/components/qr/ExportTools';

export default function QRTools() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('QRDashboard'))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3c3c3c] mb-2">QR Management Tools</h1>
          <p className="text-gray-600">Bulk operations and data management for your QR codes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#2699fe]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => navigate(createPageUrl('QRNew'))}
              >
                <Upload className="w-4 h-4" />
                Create Single QR Code
              </Button>
              <ExportQRCodes />
              <ExportScans />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Data Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Bulk upload supports CSV format</p>
                <p>• Export includes all QR codes and scan history</p>
                <p>• Templates ensure proper data structure</p>
                <p>• All data is private to your account</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Upload Section */}
        <BulkUpload onSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
}