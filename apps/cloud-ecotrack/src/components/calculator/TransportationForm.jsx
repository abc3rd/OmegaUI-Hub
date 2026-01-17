import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Plane, Train } from "lucide-react";

export default function TransportationForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="w-5 h-5 text-blue-600" />
            Vehicle Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="car-miles">Miles driven per year</Label>
            <Input
              id="car-miles"
              type="number"
              value={data.car_miles_per_year || ''}
              onChange={(e) => handleChange('car_miles_per_year', Number(e.target.value))}
              placeholder="12000"
            />
          </div>
          <div>
            <Label htmlFor="fuel-efficiency">Fuel efficiency (MPG)</Label>
            <Input
              id="fuel-efficiency"
              type="number"
              value={data.car_fuel_efficiency || ''}
              onChange={(e) => handleChange('car_fuel_efficiency', Number(e.target.value))}
              placeholder="25"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="w-5 h-5 text-indigo-600" />
            Air Travel
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="flights-short">Short flights per year (&lt;3 hrs)</Label>
            <Input
              id="flights-short"
              type="number"
              value={data.flights_short || ''}
              onChange={(e) => handleChange('flights_short', Number(e.target.value))}
              placeholder="2"
            />
          </div>
          <div>
            <Label htmlFor="flights-medium">Medium flights per year (3-6 hrs)</Label>
            <Input
              id="flights-medium"
              type="number"
              value={data.flights_medium || ''}
              onChange={(e) => handleChange('flights_medium', Number(e.target.value))}
              placeholder="1"
            />
          </div>
          <div>
            <Label htmlFor="flights-long">Long flights per year (&gt;6 hrs)</Label>
            <Input
              id="flights-long"
              type="number"
              value={data.flights_long || ''}
              onChange={(e) => handleChange('flights_long', Number(e.target.value))}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Train className="w-5 h-5 text-purple-600" />
            Public Transportation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="public-transport">Hours per week using public transport</Label>
            <Input
              id="public-transport"
              type="number"
              value={data.public_transport_hours || ''}
              onChange={(e) => handleChange('public_transport_hours', Number(e.target.value))}
              placeholder="5"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Transportation typically accounts for 30-40% of personal carbon emissions. 
          Consider carpooling, public transport, or electric vehicles to reduce your impact.
        </p>
      </div>
    </div>
  );
}