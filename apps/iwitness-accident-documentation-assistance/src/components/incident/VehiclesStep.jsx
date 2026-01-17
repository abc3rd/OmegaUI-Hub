import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Car, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const emptyVehicle = {
  make: '',
  model: '',
  year: '',
  color: '',
  license_plate: '',
  driver_name: '',
  insurance_company: '',
  policy_number: '',
  is_own_vehicle: false
};

export default function VehiclesStep({ data, onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const vehicles = data.vehicles_involved || [];

  const addVehicle = () => {
    const newVehicles = [...vehicles, { ...emptyVehicle }];
    onChange({ ...data, vehicles_involved: newVehicles });
    setExpandedIndex(newVehicles.length - 1);
  };

  const removeVehicle = (index) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    onChange({ ...data, vehicles_involved: newVehicles });
    if (expandedIndex >= newVehicles.length) {
      setExpandedIndex(Math.max(0, newVehicles.length - 1));
    }
  };

  const updateVehicle = (index, field, value) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = { ...newVehicles[index], [field]: value };
    onChange({ ...data, vehicles_involved: newVehicles });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Vehicles Involved</h2>
          <p className="text-sm text-slate-500 mt-1">Add all vehicles that were part of the incident</p>
        </div>
        <Button onClick={addVehicle} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <Car className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-700 mb-2">No vehicles added yet</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
              Add information about each vehicle involved in the incident, including your own.
            </p>
            <Button onClick={addVehicle} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Vehicle
            </Button>
          </CardContent>
        </Card>
      )}

      <AnimatePresence mode="popLayout">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={cn(
              "border-0 shadow-sm transition-all",
              vehicle.is_own_vehicle && "ring-2 ring-blue-500/20 bg-blue-50/30"
            )}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      vehicle.is_own_vehicle ? "bg-blue-100" : "bg-slate-100"
                    )}>
                      <Car className={cn(
                        "w-5 h-5",
                        vehicle.is_own_vehicle ? "text-blue-600" : "text-slate-500"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {vehicle.make && vehicle.model 
                          ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim()
                          : `Vehicle ${index + 1}`}
                      </CardTitle>
                      {vehicle.is_own_vehicle && (
                        <span className="text-xs text-blue-600 font-medium">Your Vehicle</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVehicle(index);
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="space-y-6 pt-0">
                      <div className="flex items-center gap-2 pb-4 border-b">
                        <Checkbox
                          id={`own-${index}`}
                          checked={vehicle.is_own_vehicle}
                          onCheckedChange={(checked) => updateVehicle(index, 'is_own_vehicle', checked)}
                        />
                        <Label htmlFor={`own-${index}`} className="text-sm font-medium cursor-pointer">
                          This is my vehicle
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`make-${index}`}>Make</Label>
                          <Input
                            id={`make-${index}`}
                            placeholder="e.g., Toyota"
                            value={vehicle.make}
                            onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`model-${index}`}>Model</Label>
                          <Input
                            id={`model-${index}`}
                            placeholder="e.g., Camry"
                            value={vehicle.model}
                            onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`year-${index}`}>Year</Label>
                          <Input
                            id={`year-${index}`}
                            placeholder="e.g., 2020"
                            value={vehicle.year}
                            onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`color-${index}`}>Color</Label>
                          <Input
                            id={`color-${index}`}
                            placeholder="e.g., Silver"
                            value={vehicle.color}
                            onChange={(e) => updateVehicle(index, 'color', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`plate-${index}`}>License Plate</Label>
                          <Input
                            id={`plate-${index}`}
                            placeholder="e.g., ABC 1234"
                            value={vehicle.license_plate}
                            onChange={(e) => updateVehicle(index, 'license_plate', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`driver-${index}`}>Driver Name</Label>
                          <Input
                            id={`driver-${index}`}
                            placeholder="Driver's full name"
                            value={vehicle.driver_name}
                            onChange={(e) => updateVehicle(index, 'driver_name', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`insurance-${index}`}>Insurance Company</Label>
                          <Input
                            id={`insurance-${index}`}
                            placeholder="e.g., State Farm"
                            value={vehicle.insurance_company}
                            onChange={(e) => updateVehicle(index, 'insurance_company', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`policy-${index}`}>Policy Number</Label>
                          <Input
                            id={`policy-${index}`}
                            placeholder="Policy number"
                            value={vehicle.policy_number}
                            onChange={(e) => updateVehicle(index, 'policy_number', e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}