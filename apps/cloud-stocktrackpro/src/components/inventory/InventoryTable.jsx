import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InventoryTable({ data, locations, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Total Quantity</TableHead>
            <TableHead>Locations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const isLowStock = item.totalQuantity < (item.min_stock_level || 10);
            return (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sku}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <span className="font-semibold text-lg">{item.totalQuantity}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.locationCount} locations</Badge>
                </TableCell>
                <TableCell>
                  {isLowStock ? (
                    <Badge variant="destructive">Low Stock</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-500">Barcode</p>
                            <p className="font-mono text-sm">{item.barcode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Price</p>
                            <p className="font-semibold">${item.price?.toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-2">Location Breakdown</p>
                          <div className="space-y-2">
                            {item.inventoryDetails.map((inv) => {
                              const location = locations.find(l => l.id === inv.location_id);
                              return (
                                <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium">{location?.name}</span>
                                  </div>
                                  <span className="font-semibold">{inv.quantity} units</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}