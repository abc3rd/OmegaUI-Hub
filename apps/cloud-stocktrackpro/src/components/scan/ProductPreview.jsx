import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Save, X, Loader2, Package } from "lucide-react";

export default function ProductPreview({
  productData,
  locations,
  selectedLocation,
  setSelectedLocation,
  quantity,
  setQuantity,
  onSave,
  onCancel,
  isProcessing
}) {
  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <p className="text-lg font-semibold text-slate-900 mt-1">{productData.name}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="text-sm text-slate-600 mt-1">{productData.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <p className="text-sm font-medium text-slate-900 mt-1">{productData.category}</p>
              </div>
              <div>
                <Label>Price</Label>
                <p className="text-sm font-medium text-slate-900 mt-1">${productData.price?.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <Label>Barcode</Label>
              <p className="text-sm font-mono text-slate-900 mt-1">{productData.barcode}</p>
            </div>
            <div>
              <Label>SKU</Label>
              <p className="text-sm font-mono text-slate-900 mt-1">{productData.sku}</p>
            </div>
          </div>

          {productData.qr_code_url && (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl">
              <QrCode className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-3">Generated QR Code</p>
              <img src={productData.qr_code_url} alt="QR Code" className="w-48 h-48 border-4 border-white rounded-lg shadow-lg" />
              <p className="text-xs text-slate-500 mt-3 text-center">Unique identifier for inventory tracking</p>
            </div>
          )}
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Add to Inventory</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Location *</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(l => l.is_active).map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          disabled={isProcessing || !selectedLocation}
          className="bg-gradient-to-r from-green-600 to-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save to Inventory
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}