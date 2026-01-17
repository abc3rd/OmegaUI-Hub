import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LowStockAlerts({ products, inventory, locations }) {
  const getProductStock = (productId) => {
    const productInventory = inventory.filter(inv => inv.product_id === productId);
    return productInventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
  };

  return (
    <Card className="border-none shadow-xl border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="w-5 h-5" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No low stock items</p>
          ) : (
            products.slice(0, 5).map((product) => {
              const totalStock = getProductStock(product.id);
              return (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <Badge variant="destructive">{totalStock} left</Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}