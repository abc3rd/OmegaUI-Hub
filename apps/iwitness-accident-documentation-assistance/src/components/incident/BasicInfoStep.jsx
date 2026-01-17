import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, MapPin, Cloud } from 'lucide-react';
import { US_STATES } from '../core/jurisdictionGate';

export default function BasicInfoStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">When did this happen?</CardTitle>
              <CardDescription>Provide the date and time of the incident</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="occurred_date">Date of Incident</Label>
              <Input
                id="occurred_date"
                type="date"
                value={data.occurred_at?.split('T')[0] || ''}
                onChange={(e) => {
                  const time = data.occurred_at?.split('T')[1] || '12:00';
                  handleChange('occurred_at', `${e.target.value}T${time}`);
                }}
                max={new Date().toISOString().split('T')[0]}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occurred_time">Time (approximate)</Label>
              <Input
                id="occurred_time"
                type="time"
                value={data.occurred_at?.split('T')[1]?.slice(0, 5) || ''}
                onChange={(e) => {
                  const date = data.occurred_at?.split('T')[0] || new Date().toISOString().split('T')[0];
                  handleChange('occurred_at', `${date}T${e.target.value}`);
                }}
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Where did it occur?</CardTitle>
              <CardDescription>Help us understand the location</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_text">Location Description</Label>
            <Textarea
              id="location_text"
              placeholder="e.g., Intersection of Main St and Oak Ave, near the grocery store..."
              value={data.location_text || ''}
              onChange={(e) => handleChange('location_text', e.target.value)}
              className="bg-white resize-none"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={data.jurisdiction_state || ''}
                onValueChange={(value) => handleChange('jurisdiction_state', value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County (optional)</Label>
              <Input
                id="county"
                placeholder="e.g., Los Angeles County"
                value={data.jurisdiction_county || ''}
                onChange={(e) => handleChange('jurisdiction_county', e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Cloud className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Conditions</CardTitle>
              <CardDescription>Weather and road conditions at the time</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weather">Weather Conditions</Label>
              <Select
                value={data.weather_conditions || ''}
                onValueChange={(value) => handleChange('weather_conditions', value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear / Sunny</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rain">Rain</SelectItem>
                  <SelectItem value="heavy_rain">Heavy Rain</SelectItem>
                  <SelectItem value="snow">Snow</SelectItem>
                  <SelectItem value="ice">Ice / Sleet</SelectItem>
                  <SelectItem value="fog">Fog</SelectItem>
                  <SelectItem value="night">Night / Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="road">Road Conditions</Label>
              <Select
                value={data.road_conditions || ''}
                onValueChange={(value) => handleChange('road_conditions', value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select road condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="wet">Wet</SelectItem>
                  <SelectItem value="icy">Icy</SelectItem>
                  <SelectItem value="snow_covered">Snow Covered</SelectItem>
                  <SelectItem value="construction">Construction Zone</SelectItem>
                  <SelectItem value="damaged">Damaged / Potholes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}