import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Droplet,
  Wifi,
  Plug,
  Home,
  ShowerHead,
  UtensilsCrossed,
  Battery,
  Package,
  Heart,
  BookOpen,
  Building2,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Navigation
} from "lucide-react";
import { toast } from "sonner";

const resourceIcons = {
  water_spigot: { icon: Droplet, color: "bg-blue-500", label: "Water" },
  wifi_hotspot: { icon: Wifi, color: "bg-purple-500", label: "WiFi" },
  electrical_outlet: { icon: Plug, color: "bg-yellow-500", label: "Power" },
  tent_spot: { icon: Home, color: "bg-green-500", label: "Tent Spot" },
  shower: { icon: ShowerHead, color: "bg-cyan-500", label: "Shower" },
  restroom: { icon: Building2, color: "bg-slate-500", label: "Restroom" },
  food: { icon: UtensilsCrossed, color: "bg-orange-500", label: "Food" },
  charging_station: { icon: Battery, color: "bg-amber-500", label: "Charging" },
  laundry: { icon: Package, color: "bg-indigo-500", label: "Laundry" },
  storage: { icon: Package, color: "bg-gray-500", label: "Storage" },
  medical: { icon: Heart, color: "bg-red-500", label: "Medical" },
  library: { icon: BookOpen, color: "bg-teal-500", label: "Library" },
  shelter: { icon: Building2, color: "bg-rose-500", label: "Shelter" },
  other: { icon: MapPin, color: "bg-slate-400", label: "Other" }
};

export default function ResourceDetailsSheet({ resource, userLocation, isOpen, onClose, onVote }) {
  if (!resource) return null;

  const { icon: Icon, color, label } = resourceIcons[resource.type] || resourceIcons.other;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };
  
  const getDirections = () => {
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${resource.latitude},${resource.longitude}`;
            window.open(url, '_blank');
       }, () => {
           toast.error("Could not get your location for directions.");
           const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`;
           window.open(url, '_blank');
       });
    } else {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`;
        window.open(url, '_blank');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pr-12">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle className="text-2xl">{resource.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-4 mt-1">
                <Badge variant="secondary">{label}</Badge>
                {resource.isVerified && (
                    <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Verified</span>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="py-6 space-y-6">
          
          {/* Photo Gallery */}
          {resource.photoUrls && resource.photoUrls.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Photos</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {resource.photoUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Resource photo ${index+1}`} className="w-40 h-28 object-cover rounded-lg flex-shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            {resource.description && <p className="text-slate-700">{resource.description}</p>}
            {resource.address && <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-slate-500" /> {resource.address}</p>}
            {resource.hours && <p className="flex items-start gap-2"><Clock className="w-4 h-4 mt-1 flex-shrink-0 text-slate-500" /> {resource.hours}</p>}
            {userLocation && <p className="text-blue-600 font-medium">📏 {calculateDistance(userLocation.lat, userLocation.lng, resource.latitude, resource.longitude)} miles away</p>}
          </div>

          {/* Community Feedback */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Community Feedback</h4>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onVote({ resourceId: resource.id, voteType: 'up' })}>
                <ThumbsUp className="w-4 h-4 mr-2" /> Was helpful ({resource.upvotes || 0})
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => onVote({ resourceId: resource.id, voteType: 'down' })}>
                <ThumbsDown className="w-4 h-4 mr-2" /> Not helpful ({resource.downvotes || 0})
              </Button>
            </div>
          </div>
        </div>
        <SheetFooter>
            <Button onClick={getDirections} className="w-full" size="lg">
                <Navigation className="w-5 h-5 mr-2" />
                Get Directions
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}