import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LocationInventory({ locations, inventory, products }) {
  const getLocationStats = (locationId) => {
    const locationInventory = inventory.filter(inv => inv.location_id === locationId);
    const totalItems = locationInventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    const uniqueProducts = new Set(locationInventory.map(inv => inv.product_id)).size;
    return { totalItems, uniqueProducts };
  };

  const locationColors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600'
  ];

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Inventory by Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {locations.map((location, index) => {
            const stats = getLocationStats(location.id);
            return (
              <div
                key={location.id}
                className="p-4 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${locationColors[index % locationColors.length]} flex items-center justify-center shadow-md`}>
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{location.name}</h3>
                      <p className="text-xs text-slate-500">{location.location_type?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  {location.is_active ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Total Items</p>
                    <p className="text-xl font-bold text-slate-900">{stats.totalItems}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Products</p>
                    <p className="text-xl font-bold text-slate-900">{stats.uniqueProducts}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}