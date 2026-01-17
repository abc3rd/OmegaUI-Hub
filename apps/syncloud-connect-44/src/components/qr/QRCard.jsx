import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Eye, Calendar } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function QRCard({ qrCode }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    deleted: 'bg-red-100 text-red-800'
  };

  return (
    <Link to={createPageUrl('QRView') + `?id=${qrCode.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{qrCode.label}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                ID: {qrCode.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <Badge className={statusColors[qrCode.status]}>
            {qrCode.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{qrCode.scan_count || 0} scans</span>
            </div>
            {qrCode.last_scan_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(qrCode.last_scan_at), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-500 truncate">
            {qrCode.command_payload}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}