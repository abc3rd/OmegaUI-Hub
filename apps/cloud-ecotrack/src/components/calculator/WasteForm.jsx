import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Recycle, Leaf, Package } from "lucide-react";

export default function WasteForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Recycle className="w-5 h-5 text-green-600" />
            Recycling Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="recycling">How much do you recycle?</Label>
            <Select value={data.recycling_level || ''} onValueChange={(value) => handleChange('recycling_level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select recycling level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - I don't recycle</SelectItem>
                <SelectItem value="some">Some - Basic items only</SelectItem>
                <SelectItem value="most">Most - Majority of recyclables</SelectItem>
                <SelectItem value="all">All - Everything possible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-brown-200 bg-amber-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Leaf className="w-5 h-5 text-amber-600" />
            Composting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="composting">Do you compost organic waste?</Label>
              <p className="text-sm text-gray-500 mt-1">Food scraps, yard waste, etc.</p>
            </div>
            <Switch
              id="composting"
              checked={data.composting || false}
              onCheckedChange={(checked) => handleChange('composting', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-pink-200 bg-pink-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-pink-600" />
            Single-Use Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="single-use">How often do you use single-use items?</Label>
            <Select value={data.single_use_items || ''} onValueChange={(value) => handleChange('single_use_items', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rarely">Rarely - I avoid them</SelectItem>
                <SelectItem value="sometimes">Sometimes - When convenient</SelectItem>
                <SelectItem value="often">Often - Daily use</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">Disposable bags, cups, utensils, etc.</p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-orange-100 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          💡 <strong>Tip:</strong> Waste management can reduce emissions by 5-10%. 
          Prioritize reducing, then reusing, and finally recycling for maximum impact.
        </p>
      </div>
    </div>
  );
}