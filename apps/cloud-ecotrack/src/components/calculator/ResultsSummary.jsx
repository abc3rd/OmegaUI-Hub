import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Car, Home, UtensilsCrossed, Trash2, ShoppingBag, AlertTriangle, CheckCircle, Zap } from "lucide-react";

const categoryIcons = {
  transportation: Car,
  energy: Home,
  food: UtensilsCrossed,
  waste: Trash2,
  consumption: ShoppingBag
};

const categoryColors = {
  transportation: 'blue',
  energy: 'yellow',
  food: 'green',
  waste: 'orange',
  consumption: 'purple'
};

export default function ResultsSummary({ results }) {
  const { total, breakdown } = results;
  const globalAverage = 4.8; // tons CO2e per person per year globally
  const usAverage = 16.0; // tons CO2e per person per year in US
  
  const maxCategory = Math.max(...Object.values(breakdown));
  
  const getImpactLevel = (footprint) => {
    if (footprint < 2.3) return { level: 'Excellent', color: 'green', icon: CheckCircle };
    if (footprint < 4.8) return { level: 'Good', color: 'blue', icon: CheckCircle };
    if (footprint < 8.0) return { level: 'Average', color: 'yellow', icon: Zap };
    if (footprint < 16.0) return { level: 'High', color: 'orange', icon: AlertTriangle };
    return { level: 'Very High', color: 'red', icon: AlertTriangle };
  };

  const impact = getImpactLevel(total);
  const Icon = impact.icon;

  return (
    <div className="space-y-6">
      {/* Total Footprint */}
      <Card className={`border-${impact.color}-200 bg-${impact.color}-50/50`}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Icon className={`w-8 h-8 text-${impact.color}-600`} />
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  {total.toFixed(1)} <span className="text-xl">tons CO₂e</span>
                </div>
                <div className="text-lg text-gray-600">per year</div>
              </div>
            </div>
            <Badge className={`bg-${impact.color}-100 text-${impact.color}-800 border-${impact.color}-200`}>
              {impact.level} Impact Level
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">vs. Global Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">You: {total.toFixed(1)} tons</span>
              <span className="text-sm text-gray-600">Global: {globalAverage} tons</span>
            </div>
            <Progress 
              value={Math.min((total / globalAverage) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-center mt-2">
              {total < globalAverage ? 'Below' : 'Above'} global average by{' '}
              <strong>{Math.abs(((total - globalAverage) / globalAverage) * 100).toFixed(0)}%</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">vs. US Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">You: {total.toFixed(1)} tons</span>
              <span className="text-sm text-gray-600">US: {usAverage} tons</span>
            </div>
            <Progress 
              value={Math.min((total / usAverage) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-center mt-2">
              {total < usAverage ? 'Below' : 'Above'} US average by{' '}
              <strong>{Math.abs(((total - usAverage) / usAverage) * 100).toFixed(0)}%</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Emission Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(breakdown).map(([category, value]) => {
              const percentage = (value / total) * 100;
              const IconComponent = categoryIcons[category];
              const color = categoryColors[category];
              
              return (
                <div key={category} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-${color}-100`}>
                    <IconComponent className={`w-5 h-5 text-${color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-600">
                        {value.toFixed(1)} tons ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {Object.entries(breakdown).map(([category, value]) => {
              const percentage = (value / total) * 100;
              if (percentage > 30) {
                return (
                  <p key={category} className="text-green-700">
                    🎯 <strong>Focus area:</strong> {category.replace('_', ' ')} accounts for {percentage.toFixed(0)}% of your footprint
                  </p>
                );
              }
              return null;
            })}
            {total < globalAverage && (
              <p className="text-green-700">
                🌟 <strong>Great job!</strong> Your footprint is below the global average
              </p>
            )}
            {total > usAverage && (
              <p className="text-amber-700">
                💪 <strong>Opportunity:</strong> There's significant room for improvement
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}