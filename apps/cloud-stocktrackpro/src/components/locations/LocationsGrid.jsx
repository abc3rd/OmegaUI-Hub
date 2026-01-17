import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Package, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export default function LocationsGrid({ locations, inventory, onToggleActive, isLoading }) {
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

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location, index) => {
        const stats = getLocationStats(location.id);
        return (
          <Card key={location.id} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className={`bg-gradient-to-br ${locationColors[index % locationColors.length]} text-white rounded-t-lg`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{location.name}</h3>
                    <p className="text-sm opacity-90">{location.location_type?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <Switch
                  checked={location.is_active}
                  onCheckedChange={(checked) => onToggleActive(location.id, checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Address</p>
                  <p className="text-sm font-medium text-slate-900">{location.address || 'Not specified'}</p>
                </div>
                
                {location.manager_email && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Manager</p>
                    <p className="text-sm font-medium text-slate-900">{location.manager_email}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-slate-500" />
                      <p className="text-xs text-slate-500">Total Items</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.totalItems}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <p className="text-xs text-slate-500">Products</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.uniqueProducts}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}