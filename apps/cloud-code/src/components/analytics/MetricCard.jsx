import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, loading = false }) {
  const getTrendIcon = () => {
    if (!trend || trend === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return "text-gray-600";
    if (trend > 0) return "text-green-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {title}
          </CardTitle>
          {Icon && <Icon className="w-5 h-5 text-slate-400 animate-pulse" />}
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {subtitle && (
          <div className="flex items-center gap-2 mt-2">
            {trend !== undefined && getTrendIcon()}
            <p className={`text-sm ${getTrendColor()}`}>
              {subtitle}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}