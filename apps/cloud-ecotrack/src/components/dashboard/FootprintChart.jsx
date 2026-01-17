import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { TrendingDown } from "lucide-react";

export default function FootprintChart({ calculations }) {
  const chartData = calculations
    .slice(-12)
    .reverse()
    .map(calc => ({
      date: format(new Date(calc.calculation_date), 'MMM yyyy'),
      footprint: calc.total_footprint_tons,
      transportation: calc.category_breakdown?.transportation || 0,
      energy: calc.category_breakdown?.energy || 0,
      food: calc.category_breakdown?.food || 0,
      waste: calc.category_breakdown?.waste || 0,
      consumption: calc.category_breakdown?.consumption || 0,
    }));

  const globalTarget = 2.3;
  const trend = calculations.length > 1 
    ? calculations[0].total_footprint_tons - calculations[1].total_footprint_tons
    : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            Footprint Trend
          </CardTitle>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${trend < 0 ? 'text-green-600' : 'text-orange-600'}`}>
              <span>{trend < 0 ? '↓' : '↑'}</span>
              <span>{Math.abs(trend).toFixed(1)} tons {trend < 0 ? 'reduced' : 'increased'}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value, name) => [
                `${value.toFixed(1)} tons`,
                name === 'footprint' ? 'Total Footprint' : name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <ReferenceLine 
              y={globalTarget} 
              stroke="#16a34a" 
              strokeDasharray="5 5" 
              label={{ value: "Climate Target", position: "topLeft", fill: "#16a34a" }}
            />
            <Line 
              type="monotone" 
              dataKey="footprint" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}