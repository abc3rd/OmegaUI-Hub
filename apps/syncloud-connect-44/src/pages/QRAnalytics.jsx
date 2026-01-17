import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Smartphone, Tablet, Monitor, Eye, Users } from 'lucide-react';
import AnalyticsChart from '@/components/qr/AnalyticsChart';
import { ScanTrends, LocationHeatmap } from '@/components/qr/EnhancedAnalytics';
import RealTimeNotifications from '@/components/qr/RealTimeNotifications';
import { format } from 'date-fns';

export default function QRAnalytics() {
  const navigate = useNavigate();
  const [qrId, setQrId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQrId(params.get('id'));
  }, []);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', qrId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAnalytics', { qr_id: qrId });
      return response.data;
    },
    enabled: !!qrId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea00ea]"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics Not Available</h2>
          <Button onClick={() => navigate(createPageUrl('QRDashboard'))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const deviceIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('QRView') + `?id=${qrId}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to QR Code
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3c3c3c]">{analytics.label}</h1>
          <p className="text-gray-600 mt-1">Analytics & Scan History</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Total Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#3c3c3c]">{analytics.total_scans}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Unique Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#3c3c3c]">{analytics.unique_devices}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Last Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-[#3c3c3c]">
                {analytics.last_scan_at 
                  ? format(new Date(analytics.last_scan_at), 'MMM d, yyyy HH:mm')
                  : 'Never'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <AnalyticsChart timeline={analytics.timeline} />
        </div>

        {/* Enhanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ScanTrends timeline={analytics.timeline} />
          <LocationHeatmap scans={analytics.recent_scans || []} />
        </div>

        {/* Real-Time Notifications */}
        <div className="mb-6">
          <RealTimeNotifications qrId={qrId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.device_breakdown || {}).map(([device, count]) => {
                  const Icon = deviceIcons[device] || Monitor;
                  const percentage = analytics.total_scans > 0 
                    ? ((count / analytics.total_scans) * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-[#ea00ea]" />
                        <span className="capitalize font-medium">{device}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#3c3c3c]">{count}</p>
                        <p className="text-xs text-gray-500">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recent_scans && analytics.recent_scans.length > 0 ? (
                  analytics.recent_scans.map((scan, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-sm capitalize">{scan.device}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(scan.timestamp), 'MMM d, HH:mm')}
                        </p>
                      </div>
                      <div className="text-xs text-gray-600 max-w-[200px] truncate">
                        {scan.result}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No scans yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}