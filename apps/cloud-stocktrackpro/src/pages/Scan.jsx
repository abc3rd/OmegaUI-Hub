import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Scan, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import BarcodeScanner from "../components/scan/BarcodeScanner";
import ProductPreview from "../components/scan/ProductPreview";

export default function ScanPage() {
  const queryClient = useQueryClient();
  const [scanMode, setScanMode] = useState('camera');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [productData, setProductData] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data) => base44.entities.InventoryItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.InventoryItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const processBarcode = async (barcode) => {
    setScannedBarcode(barcode);
    setIsProcessing(true);
    setError(null);

    try {
      const existingProduct = products.find(p => p.barcode === barcode);
      
      if (existingProduct) {
        const qrData = existingProduct.qr_code || `${barcode}-${Date.now()}`;
        setProductData({
          ...existingProduct,
          qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
        });
      } else {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Given this product barcode: ${barcode}, provide me with the product name, description, category, and estimated price. Return ONLY valid product information.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              price: { type: "number" }
            }
          }
        });

        const qrData = `${barcode}-${Date.now()}`;
        
        setProductData({
          barcode,
          qr_code: qrData,
          qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`,
          name: result.name || `Product ${barcode}`,
          description: result.description || '',
          category: result.category || 'Uncategorized',
          price: result.price || 0,
          sku: `SKU-${barcode.slice(-6)}`
        });
      }
    } catch (err) {
      setError('Failed to process barcode. Please try again.');
      console.error(err);
    }
    
    setIsProcessing(false);
  };

  const handleSave = async () => {
    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const user = await base44.auth.me();
      
      let product = products.find(p => p.barcode === productData.barcode);
      if (!product) {
        const { qr_code_url, ...productToCreate } = productData;
        product = await createProductMutation.mutateAsync(productToCreate);
      }

      const existingInventory = await base44.entities.InventoryItem.filter({
        product_id: product.id,
        location_id: selectedLocation
      });

      if (existingInventory.length > 0) {
        const existing = existingInventory[0];
        await updateInventoryMutation.mutateAsync({
          id: existing.id,
          data: {
            quantity: (existing.quantity || 0) + quantity,
            last_scanned: new Date().toISOString(),
            scanned_by: user.email
          }
        });
      } else {
        await createInventoryMutation.mutateAsync({
          product_id: product.id,
          location_id: selectedLocation,
          quantity,
          last_scanned: new Date().toISOString(),
          scanned_by: user.email
        });
      }

      setScannedBarcode('');
      setProductData(null);
      setQuantity(1);
      setSelectedLocation('');
    } catch (err) {
      setError('Failed to save inventory. Please try again.');
      console.error(err);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Scan Product</h1>
          <p className="text-slate-600 mt-1">Scan barcodes to automatically add items to inventory</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!productData ? (
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Scan Barcode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={scanMode === 'camera' ? 'default' : 'outline'}
                  onClick={() => setScanMode('camera')}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button
                  variant={scanMode === 'manual' ? 'default' : 'outline'}
                  onClick={() => setScanMode('manual')}
                  className="flex-1"
                >
                  Manual Entry
                </Button>
              </div>

              {scanMode === 'camera' ? (
                <BarcodeScanner onScan={processBarcode} isProcessing={isProcessing} />
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Enter Barcode</Label>
                    <Input
                      value={scannedBarcode}
                      onChange={(e) => setScannedBarcode(e.target.value)}
                      placeholder="Enter barcode number"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && scannedBarcode) {
                          processBarcode(scannedBarcode);
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => processBarcode(scannedBarcode)}
                    disabled={!scannedBarcode || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Process Barcode
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <ProductPreview
            productData={productData}
            locations={locations}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            quantity={quantity}
            setQuantity={setQuantity}
            onSave={handleSave}
            onCancel={() => {
              setProductData(null);
              setScannedBarcode('');
              setQuantity(1);
              setSelectedLocation('');
            }}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
}