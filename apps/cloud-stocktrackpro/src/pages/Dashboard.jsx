import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Package, MapPin, ShoppingCart, TrendingUp, Scan } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import StatsCard from "../components/dashboard/StatsCard";
import LocationInventory from "../components/dashboard/LocationInventory";
import RecentActivity from "../components/dashboard/RecentActivity";
import LowStockAlerts from "../components/dashboard/LowStockAlerts";

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.InventoryItem.list('-last_scanned'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  
  const lowStockProducts = products.filter(product => {
    const productInventory = inventory.filter(inv => inv.product_id === product.id);
    const totalQty = productInventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    return totalQty < (product.min_stock_level || 10);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Inventory Dashboard</h1>
            <p className="text-slate-600 mt-1">Real-time tracking across all locations</p>
          </div>
          <Link to={createPageUrl("Scan")}>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
              <Scan className="w-5 h-5 mr-2" />
              Scan Product
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Products"
            value={products.length}
            icon={Package}
            gradient="from-blue-500 to-blue-600"
            trend="+12% this month"
          />
          <StatsCard
            title="Total Items"
            value={totalItems.toLocaleString()}
            icon={Package}
            gradient="from-green-500 to-green-600"
            trend="Across all locations"
          />
          <StatsCard
            title="Active Locations"
            value={locations.filter(l => l.is_active).length}
            icon={MapPin}
            gradient="from-purple-500 to-purple-600"
          />
          <StatsCard
            title="Active Orders"
            value={activeOrders}
            icon={ShoppingCart}
            gradient="from-orange-500 to-orange-600"
            trend={`${orders.length} total orders`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LocationInventory locations={locations} inventory={inventory} products={products} />
            <RecentActivity inventory={inventory} products={products} locations={locations} />
          </div>
          
          <div className="space-y-6">
            <LowStockAlerts products={lowStockProducts} inventory={inventory} locations={locations} />
            
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl("Scan")}>
                  <Button variant="secondary" className="w-full justify-start">
                    <Scan className="w-4 h-4 mr-2" />
                    Scan New Product
                  </Button>
                </Link>
                <Link to={createPageUrl("Orders")}>
                  <Button variant="secondary" className="w-full justify-start">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Link to={createPageUrl("Locations")}>
                  <Button variant="secondary" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Manage Locations
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}