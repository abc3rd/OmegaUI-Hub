import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Award, Clock } from 'lucide-react';

export function TopPerformers({ qrCodes }) {
  const topQRs = [...qrCodes]
    .sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#ea00ea]" />
          Top Performing QR Codes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topQRs.map((qr, index) => (
            <div key={qr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-[#3c3c3c]">{qr.label}</p>
                  <p className="text-xs text-gray-500">{qr.scan_count || 0} scans</p>
                </div>
              </div>
              <Badge className={qr.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {qr.status}
              </Badge>
            </div>
          ))}
          {topQRs.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No QR codes yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ScanTrends({ timeline }) {
  const dates = Object.keys(timeline || {}).sort();
  if (dates.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2699fe]" />
            Scan Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Not enough data for trend analysis</p>
        </CardContent>
      </Card>
    );
  }

  const recentDates = dates.slice(-7);
  const recentScans = recentDates.map(d => timeline[d]);
  const avg = recentScans.reduce((a, b) => a + b, 0) / recentScans.length;
  const trend = recentScans[recentScans.length - 1] > avg ? 'up' : 'down';
  const change = Math.abs(((recentScans[recentScans.length - 1] - avg) / avg) * 100).toFixed(1);

  // Simple prediction: average of last 3 days
  const lastThree = recentScans.slice(-3);
  const prediction = Math.round(lastThree.reduce((a, b) => a + b, 0) / lastThree.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2699fe]" />
          Scan Trends & Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Trend</p>
            <div className="flex items-center gap-2">
              {trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-2xl font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}%
              </span>
              <span className="text-sm text-gray-600">{trend === 'up' ? 'increase' : 'decrease'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#ea00ea]" />
            <p className="text-sm font-semibold text-gray-700">Predicted Tomorrow</p>
          </div>
          <p className="text-2xl font-bold text-[#3c3c3c]">{prediction} scans</p>
          <p className="text-xs text-gray-500 mt-1">Based on 7-day average</p>
        </div>

        <div className="text-xs text-gray-500">
          <p>• Peak activity: {recentDates[recentScans.indexOf(Math.max(...recentScans))]}</p>
          <p>• Average: {Math.round(avg)} scans/day</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LocationHeatmap({ scans }) {
  const locationCounts = scans.reduce((acc, scan) => {
    const loc = scan.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const sortedLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const maxCount = sortedLocations[0]?.[1] || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedLocations.map(([location, count]) => {
            const percentage = (count / maxCount) * 100;
            return (
              <div key={location}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#3c3c3c]">{location}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {sortedLocations.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No location data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}