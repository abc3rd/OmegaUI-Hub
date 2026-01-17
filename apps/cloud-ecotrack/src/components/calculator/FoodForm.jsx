import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Beef, Milk, MapPin } from "lucide-react";

export default function FoodForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Beef className="w-5 h-5 text-red-600" />
            Meat Consumption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="meat-meals">Meat meals per week</Label>
            <Input
              id="meat-meals"
              type="number"
              value={data.meat_meals_per_week || ''}
              onChange={(e) => handleChange('meat_meals_per_week', Number(e.target.value))}
              placeholder="7"
            />
            <p className="text-xs text-gray-500 mt-1">Include beef, pork, lamb, poultry, and fish</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Milk className="w-5 h-5 text-blue-600" />
            Dairy Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="dairy">Dairy servings per day</Label>
            <Input
              id="dairy"
              type="number"
              value={data.dairy_servings_per_day || ''}
              onChange={(e) => handleChange('dairy_servings_per_day', Number(e.target.value))}
              placeholder="3"
            />
            <p className="text-xs text-gray-500 mt-1">Milk, cheese, yogurt, ice cream servings</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-green-600" />
            Food Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Local/seasonal food percentage: {data.local_food_percentage || 0}%</Label>
            <Slider
              value={[data.local_food_percentage || 0]}
              onValueChange={([value]) => handleChange('local_food_percentage', value)}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="food-waste">Food waste level</Label>
            <Select value={data.food_waste_level || ''} onValueChange={(value) => handleChange('food_waste_level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select waste level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (rarely throw food away)</SelectItem>
                <SelectItem value="medium">Medium (sometimes waste food)</SelectItem>
                <SelectItem value="high">High (frequently waste food)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-100 rounded-lg p-4">
        <p className="text-sm text-green-800">
          💡 <strong>Tip:</strong> Food production accounts for 10-15% of household emissions. 
          Reduce meat consumption, buy local produce, and minimize food waste to make a big impact.
        </p>
      </div>
    </div>
  );
}