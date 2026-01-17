import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateLocationDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [locationData, setLocationData] = useState({
    name: '',
    address: '',
    location_type: 'warehouse',
    manager_email: '',
    is_active: true
  });

  const createLocationMutation = useMutation({
    mutationFn: (data) => base44.entities.Location.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onClose();
      setLocationData({
        name: '',
        address: '',
        location_type: 'warehouse',
        manager_email: '',
        is_active: true
      });
    },
  });

  const handleSubmit = () => {
    createLocationMutation.mutate(locationData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Location Name *</Label>
            <Input
              value={locationData.name}
              onChange={(e) => setLocationData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Main Warehouse"
            />
          </div>

          <div>
            <Label>Type *</Label>
            <Select
              value={locationData.location_type}
              onValueChange={(value) => setLocationData(prev => ({ ...prev, location_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="retail_store">Retail Store</SelectItem>
                <SelectItem value="distribution_center">Distribution Center</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={locationData.address}
              onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St, City, State ZIP"
            />
          </div>

          <div>
            <Label>Manager Email</Label>
            <Input
              type="email"
              value={locationData.manager_email}
              onChange={(e) => setLocationData(prev => ({ ...prev, manager_email: e.target.value }))}
              placeholder="manager@example.com"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!locationData.name || createLocationMutation.isPending}
          >
            Add Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}