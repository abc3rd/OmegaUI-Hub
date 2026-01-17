import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, QrCode, Smartphone, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function RealTimeNotifications({ qrId }) {
  const [recentScans, setRecentScans] = useState([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!qrId) return;

    // Subscribe to QRScan entity changes
    const unsubscribe = base44.entities.QRScan.subscribe((event) => {
      if (event.type === 'create' && event.data.qr_id === qrId) {
        setRecentScans(prev => [event.data, ...prev].slice(0, 10));
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification('New QR Scan', {
            body: `Scanned from ${event.data.device}`,
            icon: '/favicon.ico'
          });
        }
      }
    });

    // Load initial recent scans
    base44.entities.QRScan.filter({ qr_id: qrId })
      .then(scans => setRecentScans(scans.slice(0, 10)));

    return unsubscribe;
  }, [qrId]);

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#ea00ea]" />
            Real-Time Scan Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                LIVE
              </Badge>
            )}
            {Notification.permission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="text-xs text-[#2699fe] hover:underline"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentScans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-start gap-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium text-[#3c3c3c] capitalize">
                    {scan.device}
                  </span>
                  {scan.location && scan.location !== 'Unknown' && (
                    <>
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{scan.location}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">{scan.result}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(scan.created_date), 'MMM d, HH:mm:ss')}
                </p>
              </div>
            </div>
          ))}
          {recentScans.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waiting for scans...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}