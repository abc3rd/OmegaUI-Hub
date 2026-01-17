import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";

export default function RecentCalculations({ calculations }) {
  const recentCalculations = calculations.slice(0, 5);

  const getImpactBadge = (footprint) => {
    if (footprint < 2.3) return { label: 'Excellent', className: 'bg-green-100 text-green-800' };
    if (footprint < 4.8) return { label: 'Good', className: 'bg-blue-100 text-blue-800' };
    if (footprint < 8.0) return { label: 'Average', className: 'bg-yellow-100 text-yellow-800' };
    if (footprint < 16.0) return { label: 'High', className: 'bg-orange-100 text-orange-800' };
    return { label: 'Very High', className: 'bg-red-100 text-red-800' };
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          Recent Calculations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCalculations.map((calc) => {
            const badge = getImpactBadge(calc.total_footprint_tons);
            
            return (
              <div 
                key={calc.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{calc.calculation_name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {format(new Date(calc.calculation_date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {calc.household_size} {calc.household_size === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {calc.total_footprint_tons.toFixed(1)} <span className="text-sm font-normal">tons</span>
                  </div>
                  <Badge className={badge.className}>
                    {badge.label}
                  </Badge>
                </div>
              </div>
            );
          })}

          {recentCalculations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No calculations found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}