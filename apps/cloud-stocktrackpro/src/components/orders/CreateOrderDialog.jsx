import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function CreateOrderDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [orderData, setOrderData] = useState({
    order_number: `ORD-${Date.now()}`,
    customer_name: '',
    customer_email: '',
    shipping_address: '',
    items: [{ product_id: '', product_name: '', quantity: 1, price: 0 }],
    status: 'pending',
    order_date: new Date().toISOString()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data) => base44.entities.Order.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
  });

  const handleAddItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', product_name: '', quantity: 1, price: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].price = product.price || 0;
      }
    }
    
    setOrderData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = () => {
    createOrderMutation.mutate({
      ...orderData,
      total_amount: calculateTotal()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                value={orderData.customer_name}
                onChange={(e) => setOrderData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Customer Email</Label>
              <Input
                type="email"
                value={orderData.customer_email}
                onChange={(e) => setOrderData(prev => ({ ...prev, customer_email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <Label>Shipping Address</Label>
            <Input
              value={orderData.shipping_address}
              onChange={(e) => setOrderData(prev => ({ ...prev, shipping_address: e.target.value }))}
              placeholder="123 Main St, City, State ZIP"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Order Items</Label>
              <Button size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={item.product_id}
                      onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price?.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveItem(index)}
                    disabled={orderData.items.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!orderData.customer_name || orderData.items.length === 0 || createOrderMutation.isPending}
          >
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}