import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Shirt, Smartphone, Recycle } from "lucide-react";

export default function ConsumptionForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shirt className="w-5 h-5 text-purple-600" />
            Clothing Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="clothing">New clothing items purchased per month</Label>
            <Input
              id="clothing"
              type="number"
              value={data.clothing_purchases_per_month || ''}
              onChange={(e) => handleChange('clothing_purchases_per_month', Number(e.target.value))}
              placeholder="3"
            />
            <p className="text-xs text-gray-500 mt-1">Include shoes, accessories, and all apparel</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5 text-blue-600" />
            Electronics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="electronics">Electronics purchased per year</Label>
            <Input
              id="electronics"
              type="number"
              value={data.electronics_purchases_per_year || ''}
              onChange={(e) => handleChange('electronics_purchases_per_year', Number(e.target.value))}
              placeholder="2"
            />
            <p className="text-xs text-gray-500 mt-1">Phones, laptops, appliances, gadgets</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Recycle className="w-5 h-5 text-green-600" />
            Second-hand Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Second-hand purchase percentage: {data.second_hand_percentage || 0}%</Label>
            <Slider
              value={[data.second_hand_percentage || 0]}
              onValueChange={([value]) => handleChange('second_hand_percentage', value)}
              max={100}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Thrift stores, online marketplaces, hand-me-downs</p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-purple-100 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          💡 <strong>Tip:</strong> Consumer goods can account for 20-25% of your carbon footprint. 
          Buy less, choose quality items, and shop second-hand when possible.
        </p>
      </div>
    </div>
  );
}