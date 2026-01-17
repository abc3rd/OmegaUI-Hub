import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsChart({ timeline }) {
  const chartData = Object.entries(timeline || {})
    .map(([date, count]) => ({ date, scans: count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Timeline (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="scans" 
                stroke="#ea00ea" 
                strokeWidth={2}
                dot={{ fill: '#ea00ea' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No scan data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}