import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Bell,
  BellOff,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";

const resourceIcons = {
  water_spigot: { icon: Droplet, color: "text-blue-500", label: "Water" },
  wifi_hotspot: { icon: Wifi, color: "text-purple-500", label: "WiFi" },
  electrical_outlet: { icon: Plug, color: "text-yellow-500", label: "Power" },
  tent_spot: { icon: Home, color: "text-green-500", label: "Tent Spot" },
  shower: { icon: ShowerHead, color: "text-cyan-500", label: "Shower" },
  restroom: { icon: Building2, color: "text-slate-500", label: "Restroom" },
  food: { icon: UtensilsCrossed, color: "text-orange-500", label: "Food" },
  charging_station: { icon: Battery, color: "text-amber-500", label: "Charging" },
  laundry: { icon: Package, color: "text-indigo-500", label: "Laundry" },
  storage: { icon: Package, color: "text-gray-500", label: "Storage" },
  medical: { icon: Heart, color: "text-red-500", label: "Medical" },
  library: { icon: BookOpen, color: "text-teal-500", label: "Library" },
  shelter: { icon: Building2, color: "text-rose-500", label: "Shelter" },
  other: { icon: MapPin, color: "text-slate-400", label: "Other" }
};

export default function ProximityAlerts() {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [alertDistance, setAlertDistance] = useState(0.25); // Miles
  const [userLocation, setUserLocation] = useState(null);
  const [watching, setWatching] = useState(false);
  const [notifiedResources, setNotifiedResources] = useState(new Set());
  const [nearbyNow, setNearbyNow] = useState([]);

  const { data: resources = [] } = useQuery({
    queryKey: ['resourceLocations'],
    queryFn: () => base44.entities.ResourceLocation.filter({ isActive: true }),
    enabled: alertsEnabled
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('proximityPreferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      setSelectedTypes(prefs.types || []);
      setAlertDistance(prefs.distance || 0.25);
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (alertsEnabled && selectedTypes.length > 0) {
      startWatching();
    } else {
      stopWatching();
    }
    return () => stopWatching();
  }, [alertsEnabled, selectedTypes, alertDistance]);

  const savePreferences = (types, distance) => {
    localStorage.setItem('proximityPreferences', JSON.stringify({
      types,
      distance
    }));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const checkProximity = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    setUserLocation({ lat, lon });

    const nearby = [];
    resources.forEach(resource => {
      if (!selectedTypes.includes(resource.type)) return;
      
      const distance = calculateDistance(lat, lon, resource.latitude, resource.longitude);
      
      if (distance <= alertDistance) {
        nearby.push({ ...resource, distance });
        
        // Only notify once per resource per session
        if (!notifiedResources.has(resource.id)) {
          showNotification(resource, distance);
          setNotifiedResources(prev => new Set([...prev, resource.id]));
        }
      }
    });

    setNearbyNow(nearby.sort((a, b) => a.distance - b.distance));
  };

  const showNotification = (resource, distance) => {
    const { icon: Icon, label } = resourceIcons[resource.type] || resourceIcons.other;
    const distanceText = distance < 0.1 
      ? `${Math.round(distance * 5280)} feet` 
      : `${distance.toFixed(2)} miles`;

    // Toast notification
    toast.success(`${label} Nearby!`, {
      description: `${resource.name} is ${distanceText} away`,
      duration: 5000,
    });

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${label} Nearby!`, {
        body: `${resource.name} is ${distanceText} away`,
        icon: '/icon.png',
        tag: resource.id
      });
    }
  };

  let watchId = null;

  const startWatching = () => {
    if ('geolocation' in navigator && !watching) {
      setWatching(true);
      watchId = navigator.geolocation.watchPosition(
        checkProximity,
        (error) => {
          console.error('Location error:', error);
          toast.error('Could not track your location. Please check permissions.');
          setAlertsEnabled(false);
          setWatching(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }
  };

  const stopWatching = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    setWatching(false);
    setNearbyNow([]);
  };

  const toggleType = (type) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    savePreferences(newTypes, alertDistance);
    setNotifiedResources(new Set()); // Reset notifications when types change
  };

  const handleDistanceChange = (miles) => {
    setAlertDistance(miles);
    savePreferences(selectedTypes, miles);
    setNotifiedResources(new Set());
  };

  const handleToggleAlerts = (enabled) => {
    if (enabled && selectedTypes.length === 0) {
      toast.error('Please select at least one resource type first');
      return;
    }

    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setAlertsEnabled(enabled);
          toast.success('Proximity alerts enabled!');
        } else {
          toast.error('Please enable notifications in your browser settings');
        }
      });
    } else {
      setAlertsEnabled(enabled);
      if (enabled) {
        toast.success('Proximity alerts enabled!');
      } else {
        toast.info('Proximity alerts disabled');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Proximity Alerts</h1>
          <p className="text-slate-600">Get notified when you're near resources you need</p>
        </div>

        {/* Enable/Disable Switch */}
        <Card className="mb-6 border-2 border-slate-200 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {alertsEnabled ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <BellOff className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <CardTitle>
                    {alertsEnabled ? 'Alerts Active' : 'Alerts Disabled'}
                  </CardTitle>
                  <CardDescription>
                    {watching && alertsEnabled ? 'Monitoring your location...' : 'Turn on to get proximity notifications'}
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={alertsEnabled}
                onCheckedChange={handleToggleAlerts}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Current Nearby Resources */}
        {alertsEnabled && nearbyNow.length > 0 && (
          <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription>
              <p className="font-semibold text-blue-900 mb-2">Currently Nearby ({nearbyNow.length})</p>
              <div className="space-y-2">
                {nearbyNow.map(resource => {
                  const { icon: Icon, label, color } = resourceIcons[resource.type] || resourceIcons.other;
                  return (
                    <div key={resource.id} className="flex items-center gap-2 text-sm">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="font-medium">{resource.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {resource.distance < 0.1 
                          ? `${Math.round(resource.distance * 5280)} ft`
                          : `${resource.distance.toFixed(2)} mi`
                        }
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Alert Distance Selector */}
        <Card className="mb-6 border-2 border-slate-200">
          <CardHeader>
            <CardTitle>Alert Distance</CardTitle>
            <CardDescription>How close do you need to be?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                {[
                  { label: '500 ft', value: 0.095 },
                  { label: '0.25 mi', value: 0.25 },
                  { label: '0.5 mi', value: 0.5 },
                  { label: '1 mi', value: 1 }
                ].map(({ label, value }) => (
                  <Button
                    key={value}
                    variant={alertDistance === value ? "default" : "outline"}
                    onClick={() => handleDistanceChange(value)}
                    className="flex-1"
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center">
                You'll be notified when within {alertDistance < 0.1 ? `${Math.round(alertDistance * 5280)} feet` : `${alertDistance} mile${alertDistance !== 1 ? 's' : ''}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resource Type Selection */}
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle>Select Resources to Track</CardTitle>
            <CardDescription>
              Choose which types of resources you want to be notified about
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(resourceIcons).map(([type, { icon: Icon, label, color }]) => (
                <div
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedTypes.includes(type)
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="font-medium text-slate-800">{label}</span>
                    {selectedTypes.includes(type) && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedTypes.length === 0 && (
              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Select at least one resource type to enable alerts
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Alert className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <p className="font-semibold mb-2">How it works:</p>
            <ul className="space-y-1 text-sm">
              <li>• Your location is tracked in the background</li>
              <li>• You'll get a notification when approaching selected resources</li>
              <li>• Each resource notifies you only once per session</li>
              <li>• Battery-efficient location tracking</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}