import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, QrCode } from 'lucide-react';
import { createPageUrl } from '@/utils';
import QRCard from '@/components/qr/QRCard';
import { TopPerformers } from '@/components/qr/EnhancedAnalytics';

export default function QRDashboard() {
  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['qrcodes'],
    queryFn: async () => {
      const codes = await base44.entities.QRCode.list('-created_date', 100);
      return codes.filter(code => code.status !== 'deleted');
    }
  });

  const totalScans = qrCodes?.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) || 0;
  const activeQRs = qrCodes?.filter(qr => qr.status === 'active').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#3c3c3c]">QR Command Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your dynamic UCP-enabled QR codes</p>
            </div>
            <Link to={createPageUrl('QRNew')}>
              <Button className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] gap-2">
                <Plus className="w-5 h-5" />
                Create QR Code
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total QR Codes</p>
                  <p className="text-2xl font-bold text-[#3c3c3c]">{qrCodes?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2699fe] to-[#4bce2a] flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active QR Codes</p>
                  <p className="text-2xl font-bold text-[#3c3c3c]">{activeQRs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4bce2a] to-[#c4653a] flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-[#3c3c3c]">{totalScans}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {qrCodes && qrCodes.length > 0 && (
          <div className="mb-6">
            <TopPerformers qrCodes={qrCodes} />
          </div>
        )}

        {/* QR Codes Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea00ea] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading QR codes...</p>
          </div>
        ) : qrCodes && qrCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qrCode) => (
              <QRCard key={qrCode.id} qrCode={qrCode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No QR Codes Yet</h3>
            <p className="text-gray-600 mb-6">Create your first dynamic QR code to get started</p>
            <Link to={createPageUrl('QRNew')}>
              <Button className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe]">
                Create Your First QR Code
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}