import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const deviceTypes = ["lighting", "hvac", "kitchen", "entertainment", "laundry", "water_heating", "other"];

export default function DeviceForm({ device, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    power_rating_watts: "",
    smart_device: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        type: device.type,
        location: device.location,
        power_rating_watts: device.power_rating_watts,
        smart_device: device.smart_device || false
      });
    } else {
      setFormData({ name: "", type: "", location: "", power_rating_watts: "", smart_device: false });
    }
  }, [device]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dataToSave = { ...formData, power_rating_watts: Number(formData.power_rating_watts) };

    try {
      if (device) {
        await base44.entities.Device.update(device.id, dataToSave);
      } else {
        await base44.entities.Device.create(dataToSave);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error("Failed to save device", error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">Device Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-gray-800 border-gray-700 text-white" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type" className="text-white">Device Type</Label>
        <Select name="type" onValueChange={(value) => handleSelectChange('type', value)} value={formData.type}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white"><SelectValue placeholder="Select type..." /></SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {deviceTypes.map(type => <SelectItem key={type} value={type} className="capitalize text-white">{type.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location" className="text-white">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} required className="bg-gray-800 border-gray-700 text-white" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="power_rating_watts" className="text-white">Power Rating (Watts)</Label>
        <Input id="power_rating_watts" name="power_rating_watts" type="number" value={formData.power_rating_watts} onChange={handleChange} required className="bg-gray-800 border-gray-700 text-white" />
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="smart_device" name="smart_device" checked={formData.smart_device} onChange={handleChange} className="h-4 w-4 rounded" />
        <Label htmlFor="smart_device" className="text-white">Smart Device</Label>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-green-500 to-emerald-600">
        {isSubmitting ? "Saving..." : "Save Device"}
      </Button>
    </form>
  );
}