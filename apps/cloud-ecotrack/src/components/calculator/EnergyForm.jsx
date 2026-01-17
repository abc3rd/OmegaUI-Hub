import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Zap, Flame } from "lucide-react";

export default function EnergyForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-yellow-600" />
            Electricity Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="electricity">Electricity usage (kWh/month)</Label>
            <Input
              id="electricity"
              type="number"
              value={data.electricity_kwh_month || ''}
              onChange={(e) => handleChange('electricity_kwh_month', Number(e.target.value))}
              placeholder="900"
            />
            <p className="text-xs text-gray-500 mt-1">Check your utility bill for this number</p>
          </div>
          <div>
            <Label htmlFor="renewable">Renewable energy percentage: {data.renewable_percentage || 0}%</Label>
            <Slider
              value={[data.renewable_percentage || 0]}
              onValueChange={([value]) => handleChange('renewable_percentage', value)}
              max={100}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Solar, wind, or green energy from your provider</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-600" />
            Heating & Cooling
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="natural-gas">Natural gas usage (therms/month)</Label>
            <Input
              id="natural-gas"
              type="number"
              value={data.natural_gas_therms_month || ''}
              onChange={(e) => handleChange('natural_gas_therms_month', Number(e.target.value))}
              placeholder="80"
            />
          </div>
          <div>
            <Label htmlFor="heating-oil">Heating oil (gallons/year)</Label>
            <Input
              id="heating-oil"
              type="number"
              value={data.heating_oil_gallons_year || ''}
              onChange={(e) => handleChange('heating_oil_gallons_year', Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-100 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          💡 <strong>Tip:</strong> Home energy use accounts for about 20% of carbon emissions. 
          Improve insulation, use LED lights, and consider switching to renewable energy sources.
        </p>
      </div>
    </div>
  );
}