import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Car, Home, UtensilsCrossed, Trash2, ShoppingBag } from "lucide-react";

const categoryConfig = {
  transportation: { icon: Car, color: '#3b82f6', label: 'Transportation' },
  energy: { icon: Home, color: '#eab308', label: 'Home Energy' },
  food: { icon: UtensilsCrossed, color: '#22c55e', label: 'Food & Diet' },
  waste: { icon: Trash2, color: '#f97316', label: 'Waste' },
  consumption: { icon: ShoppingBag, color: '#a855f7', label: 'Consumption' }
};

export default function CategoryBreakdown({ latestCalculation }) {
  if (!latestCalculation?.category_breakdown) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No breakdown data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(latestCalculation.category_breakdown)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      name: categoryConfig[category]?.label || category,
      value: value,
      color: categoryConfig[category]?.color || '#6b7280'
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Latest Breakdown</CardTitle>
        <p className="text-sm text-gray-600">
          {latestCalculation.calculation_name} • {new Date(latestCalculation.calculation_date).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)} tons`, 'Emissions']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {Object.entries(latestCalculation.category_breakdown).map(([category, value]) => {
              const config = categoryConfig[category];
              const percentage = (value / total) * 100;
              const Icon = config?.icon || Car;
              
              return (
                <div key={category} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: config?.color || '#6b7280' }}
                  />
                  <Icon className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm capitalize">{config?.label || category}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{value.toFixed(1)}t</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}