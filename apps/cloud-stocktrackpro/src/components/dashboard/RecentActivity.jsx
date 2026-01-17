import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Package } from "lucide-react";
import { format } from "date-fns";

export default function RecentActivity({ inventory, products, locations }) {
  const recentScans = inventory
    .filter(inv => inv.last_scanned)
    .sort((a, b) => new Date(b.last_scanned) - new Date(a.last_scanned))
    .slice(0, 5);

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentScans.map((scan, index) => {
            const product = products.find(p => p.id === scan.product_id);
            const location = locations.find(l => l.id === scan.location_id);
            return (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{product?.name || 'Unknown Product'}</p>
                  <p className="text-xs text-slate-500">
                    {location?.name || 'Unknown Location'} • {scan.quantity} units
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {format(new Date(scan.last_scanned), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}