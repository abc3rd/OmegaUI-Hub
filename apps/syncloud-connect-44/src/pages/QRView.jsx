import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Eye, Calendar, BarChart3 } from 'lucide-react';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';
import { format } from 'date-fns';

export default function QRView() {
  const navigate = useNavigate();
  const [qrId, setQrId] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQrId(params.get('id'));
  }, []);

  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['qrcode', qrId],
    queryFn: async () => {
      const codes = await base44.entities.QRCode.filter({ id: qrId });
      return codes[0];
    },
    enabled: !!qrId
  });

  useEffect(() => {
    if (qrCode?.id && !qrDataUrl) {
      base44.functions.invoke('generateQR', { qr_id: qrCode.id })
        .then(response => setQrDataUrl(response.data.qr_data_url))
        .catch(err => console.error('Failed to generate QR:', err));
    }
  }, [qrCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea00ea]"></div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">QR Code Not Found</h2>
          <Button onClick={() => navigate(createPageUrl('QRDashboard'))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    deleted: 'bg-red-100 text-red-800'
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <div>
            <QRCodeDisplay
              qrDataUrl={qrDataUrl}
              qrUrl={`https://syncloudconnect.com/scan/${qrCode.id}`}
              label={qrCode.label}
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{qrCode.label}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">ID: {qrCode.id}</p>
                </div>
                <Badge className={statusColors[qrCode.status]}>
                  {qrCode.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Command Payload</p>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all">
                    {qrCode.command_payload}
                  </div>
                </div>

                {qrCode.redirect_url && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Redirect URL</p>
                    <a 
                      href={qrCode.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2699fe] hover:underline text-sm break-all"
                    >
                      {qrCode.redirect_url}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{qrCode.scan_count || 0} scans</span>
                  </div>
                  {qrCode.last_scan_at && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{format(new Date(qrCode.last_scan_at), 'MMM d')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => navigate(createPageUrl('QREdit') + `?id=${qrCode.id}`)}
                    className="flex-1 gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl('QRAnalytics') + `?id=${qrCode.id}`)}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}