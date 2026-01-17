import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersTable({ orders, locations, onUpdateStatus, isLoading }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

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
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-slate-50">
              <TableCell>
                <span className="font-mono font-semibold">{order.order_number}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-xs text-slate-500">{order.customer_email}</p>
                </div>
              </TableCell>
              <TableCell>{order.items?.length || 0} items</TableCell>
              <TableCell>
                <span className="font-semibold">${order.total_amount?.toFixed(2)}</span>
              </TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(value) => onUpdateStatus(order.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <Badge className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {order.order_date ? format(new Date(order.order_date), 'MMM d, yyyy') : 
                 format(new Date(order.created_date), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}