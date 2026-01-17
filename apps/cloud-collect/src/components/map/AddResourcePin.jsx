import React, { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AddResourcePin({ onLocationSelected, isActive }) {
  const [selectedPosition, setSelectedPosition] = useState(null);

  useMapEvents({
    click(e) {
      if (isActive) {
        const { lat, lng } = e.latlng;
        setSelectedPosition({ lat, lng });
        onLocationSelected({ lat, lng });
        toast.success('Location selected! Fill in the resource details.');
      }
    },
  });

  return null;
}