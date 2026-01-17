import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Bell,
  BellOff,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  MapPin,
  User,
  Heart,
  AlertTriangle,
  Droplet,
  Wifi,
  Plug,
  Home,
  ShowerHead,
  UtensilsCrossed,
  Battery,
  Package,
  BookOpen,
  Building2,
  Mail,
  Smartphone,
  Settings,
  Target,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const resourceIcons = {
  water_spigot: { icon: Droplet, color: "text-blue-500", bgColor: "bg-blue-100", label: "Water" },
  wifi_hotspot: { icon: Wifi, color: "text-purple-500", bgColor: "bg-purple-100", label: "WiFi" },
  electrical_outlet: { icon: Plug, color: "text-yellow-500", bgColor: "bg-yellow-100", label: "Power" },
  tent_spot: { icon: Home, color: "text-green-500", bgColor: "bg-green-100", label: "Tent Spot" },
  shower: { icon: ShowerHead, color: "text-cyan-500", bgColor: "bg-cyan-100", label: "Shower" },
  restroom: { icon: Building2, color: "text-slate-500", bgColor: "bg-slate-100", label: "Restroom" },
  food: { icon: UtensilsCrossed, color: "text-orange-500", bgColor: "bg-orange-100", label: "Food" },
  charging_station: { icon: Battery, color: "text-amber-500", bgColor: "bg-amber-100", label: "Charging" },
  laundry: { icon: Package, color: "text-indigo-500", bgColor: "bg-indigo-100", label: "Laundry" },
  storage: { icon: Package, color: "text-gray-500", bgColor: "bg-gray-100", label: "Storage" },
  medical: { icon: Heart, color: "text-red-500", bgColor: "bg-red-100", label: "Medical" },
  library: { icon: BookOpen, color: "text-teal-500", bgColor: "bg-teal-100", label: "Library" },
  shelter: { icon: Building2, color: "text-rose-500", bgColor: "bg-rose-100", label: "Shelter" },
  other: { icon: MapPin, color: "text-slate-400", bgColor: "bg-slate-100", label: "Other" }
};

const alertTypeConfig = {
  profiles: {
    icon: User,
    label: "Recipient Profiles",
    description: "People in need near you",
    color: "bg-blue-500"
  },
  urgent_needs: {
    icon: AlertTriangle,
    label: "Urgent Needs",
    description: "Critical, time-sensitive requests",
    color: "bg-red-500"
  },
  resources: {
    icon: MapPin,
    label: "Community Resources",
    description: "Helpful locations nearby",
    color: "bg-green-500"
  }
};

export default function DonorProximityAlerts() {
  const queryClient = useQueryClient();
  const watchIdRef = useRef(null);
  
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [alertRadius, setAlertRadius] = useState(0.5);
  const [selectedAlertTypes, setSelectedAlertTypes] = useState(["profiles", "urgent_needs"]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [watching, setWatching] = useState(false);
  const [nearbyItems, setNearbyItems] = useState({ profiles: [], resources: [] });
  const [notifiedIds, setNotifiedIds] = useState(new Set());

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['nearbyProfiles'],
    queryFn: () => base44.entities.Profile.filter({ 
      isActive: true, 
      isDraft: false,
      enableProximityAlerts: true 
    }),
    enabled: alertsEnabled && selectedAlertTypes.includes("profiles")
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resourceLocations'],
    queryFn: () => base44.entities.ResourceLocation.filter({ 
      status: 'active',
      visibility: 'community'
    }),
    enabled: alertsEnabled && selectedAlertTypes.includes("resources")
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs) => {
      await base44.auth.updateMe(prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    }
  });

  // Load saved preferences
  useEffect(() => {
    if (user) {
      setAlertsEnabled(user.proximityAlertsEnabled || false);
      setAlertRadius(user.proximityAlertRadius || 0.5);
      setSelectedAlertTypes(user.proximityAlertTypes || ["profiles", "urgent_needs"]);
      setEmailAlertsEnabled(user.emailAlertsEnabled || false);
    }

    // Load resource types from localStorage
    const savedResourceTypes = localStorage.getItem('donorProximityResourceTypes');
    if (savedResourceTypes) {
      setSelectedResourceTypes(JSON.parse(savedResourceTypes));
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  // Location watching effect
  useEffect(() => {
    if (alertsEnabled && (selectedAlertTypes.length > 0 || selectedResourceTypes.length > 0)) {
      startWatching();
    } else {
      stopWatching();
    }
    return () => stopWatching();
  }, [alertsEnabled, selectedAlertTypes, selectedResourceTypes, alertRadius]);

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

  const formatDistance = (distance) => {
    if (distance < 0.1) {
      return `${Math.round(distance * 5280)} ft`;
    }
    return `${distance.toFixed(2)} mi`;
  };

  const checkProximity = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    setUserLocation({ lat, lon });

    // Update user's last known location
    updatePreferencesMutation.mutate({
      lastKnownLatitude: lat,
      lastKnownLongitude: lon
    });

    const nearbyProfiles = [];
    const nearbyResources = [];

    // Check profiles
    if (selectedAlertTypes.includes("profiles") || selectedAlertTypes.includes("urgent_needs")) {
      profiles.forEach(profile => {
        if (!profile.latitude || !profile.longitude) return;
        
        const distance = calculateDistance(lat, lon, profile.latitude, profile.longitude);
        
        if (distance <= alertRadius) {
          // Check for urgent needs
          if (selectedAlertTypes.includes("urgent_needs") && profile.hasUrgentNeed) {
            nearbyProfiles.push({ ...profile, distance, isUrgent: true });
            if (!notifiedIds.has(`urgent-${profile.id}`)) {
              showNotification(profile, distance, true);
              setNotifiedIds(prev => new Set([...prev, `urgent-${profile.id}`]));
            }
          } else if (selectedAlertTypes.includes("profiles")) {
            nearbyProfiles.push({ ...profile, distance, isUrgent: false });
            if (!notifiedIds.has(`profile-${profile.id}`)) {
              showNotification(profile, distance, false);
              setNotifiedIds(prev => new Set([...prev, `profile-${profile.id}`]));
            }
          }
        }
      });
    }

    // Check resources
    if (selectedAlertTypes.includes("resources") && selectedResourceTypes.length > 0) {
      resources.forEach(resource => {
        if (!selectedResourceTypes.includes(resource.type)) return;
        
        const distance = calculateDistance(lat, lon, resource.latitude, resource.longitude);
        
        if (distance <= alertRadius) {
          nearbyResources.push({ ...resource, distance });
          if (!notifiedIds.has(`resource-${resource.id}`)) {
            showResourceNotification(resource, distance);
            setNotifiedIds(prev => new Set([...prev, `resource-${resource.id}`]));
          }
        }
      });
    }

    setNearbyItems({
      profiles: nearbyProfiles.sort((a, b) => a.distance - b.distance),
      resources: nearbyResources.sort((a, b) => a.distance - b.distance)
    });
  };

  const showNotification = (profile, distance, isUrgent) => {
    const distanceText = formatDistance(distance);
    const title = isUrgent 
      ? `🚨 Urgent Need Nearby!`
      : `Someone Nearby Needs Help`;
    const body = isUrgent
      ? `${profile.publicName}: ${profile.urgentNeedTitle} - ${distanceText} away`
      : `${profile.publicName} is ${distanceText} away`;

    // Toast notification
    toast[isUrgent ? 'error' : 'success'](title, {
      description: body,
      duration: 8000,
      action: {
        label: "View",
        onClick: () => window.location.href = createPageUrl(`ViewProfile`) + `/${profile.publicProfileUrl}`
      }
    });

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.png',
        tag: `profile-${profile.id}`,
        requireInteraction: isUrgent
      });
    }
  };

  const showResourceNotification = (resource, distance) => {
    const { label } = resourceIcons[resource.type] || resourceIcons.other;
    const distanceText = formatDistance(distance);

    toast.info(`${label} Nearby!`, {
      description: `${resource.name} is ${distanceText} away`,
      duration: 5000
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${label} Nearby!`, {
        body: `${resource.name} is ${distanceText} away`,
        icon: '/icon.png',
        tag: `resource-${resource.id}`
      });
    }
  };

  const startWatching = () => {
    if ('geolocation' in navigator && !watching) {
      setWatching(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        checkProximity,
        (error) => {
          console.error('Location error:', error);
          toast.error('Could not track your location. Please check permissions.');
          setAlertsEnabled(false);
          setWatching(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 10000
        }
      );
    }
  };

  const stopWatching = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setWatching(false);
    setNearbyItems({ profiles: [], resources: [] });
  };

  const handleToggleAlerts = async (enabled) => {
    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Please enable notifications in your browser settings');
        return;
      }
    }

    setAlertsEnabled(enabled);
    await updatePreferencesMutation.mutateAsync({ proximityAlertsEnabled: enabled });
    
    if (enabled) {
      toast.success('Proximity alerts enabled!');
    } else {
      toast.info('Proximity alerts disabled');
      setNotifiedIds(new Set());
    }
  };

  const handleAlertTypeToggle = (type) => {
    const newTypes = selectedAlertTypes.includes(type)
      ? selectedAlertTypes.filter(t => t !== type)
      : [...selectedAlertTypes, type];
    setSelectedAlertTypes(newTypes);
    updatePreferencesMutation.mutate({ proximityAlertTypes: newTypes });
    setNotifiedIds(new Set());
  };

  const handleResourceTypeToggle = (type) => {
    const newTypes = selectedResourceTypes.includes(type)
      ? selectedResourceTypes.filter(t => t !== type)
      : [...selectedResourceTypes, type];
    setSelectedResourceTypes(newTypes);
    localStorage.setItem('donorProximityResourceTypes', JSON.stringify(newTypes));
    setNotifiedIds(new Set());
  };

  const handleRadiusChange = (value) => {
    setAlertRadius(value[0]);
    updatePreferencesMutation.mutate({ proximityAlertRadius: value[0] });
    setNotifiedIds(new Set());
  };

  const handleEmailAlertsToggle = (enabled) => {
    setEmailAlertsEnabled(enabled);
    updatePreferencesMutation.mutate({ emailAlertsEnabled: enabled });
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Donor Proximity Alerts</h1>
              <p className="text-slate-600">Get notified when you're near someone who needs help</p>
            </div>
          </div>
        </div>

        {/* Main Enable/Disable Card */}
        <Card className="mb-6 border-2 border-slate-200 shadow-xl overflow-hidden">
          <div className={`h-1 ${alertsEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-200'}`} />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  alertsEnabled ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {alertsEnabled ? (
                    <Bell className="w-7 h-7 text-green-600" />
                  ) : (
                    <BellOff className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {alertsEnabled ? 'Alerts Active' : 'Alerts Disabled'}
                  </CardTitle>
                  <CardDescription>
                    {watching && alertsEnabled 
                      ? 'Monitoring your location for opportunities to help...' 
                      : 'Enable to receive notifications when nearby'}
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={alertsEnabled}
                onCheckedChange={handleToggleAlerts}
                className="scale-125 data-[state=checked]:bg-green-600"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Nearby Now Section */}
        <AnimatePresence>
          {alertsEnabled && (nearbyItems.profiles.length > 0 || nearbyItems.resources.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="mb-6 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Navigation className="w-5 h-5" />
                    Nearby Right Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nearby Profiles */}
                  {nearbyItems.profiles.map(profile => (
                    <Link 
                      key={profile.id} 
                      to={createPageUrl("ViewProfile") + `/${profile.publicProfileUrl}`}
                      className="block"
                    >
                      <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        profile.isUrgent 
                          ? 'border-red-300 bg-red-50 hover:border-red-400' 
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            profile.isUrgent ? 'bg-red-100' : 'bg-gradient-to-br from-blue-400 to-purple-500'
                          }`}>
                            {profile.isUrgent ? (
                              <AlertTriangle className="w-6 h-6 text-red-600" />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{profile.publicName}</span>
                              {profile.verificationStatus === 'verified' && (
                                <Shield className="w-4 h-4 text-blue-600" />
                              )}
                              {profile.isUrgent && (
                                <Badge className="bg-red-500 text-white text-xs">URGENT</Badge>
                              )}
                            </div>
                            {profile.isUrgent && profile.urgentNeedTitle && (
                              <p className="text-sm text-red-700 font-medium">{profile.urgentNeedTitle}</p>
                            )}
                            {profile.location && (
                              <p className="text-xs text-slate-500">{profile.location}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="font-semibold">
                            {formatDistance(profile.distance)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {/* Nearby Resources */}
                  {nearbyItems.resources.map(resource => {
                    const config = resourceIcons[resource.type] || resourceIcons.other;
                    const Icon = config.icon;
                    return (
                      <Link key={resource.id} to={createPageUrl("ResourceMap")} className="block">
                        <div className="p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-green-300 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-slate-800">{resource.name}</span>
                              <p className="text-xs text-slate-500">{config.label}</p>
                            </div>
                            <Badge variant="outline">{formatDistance(resource.distance)}</Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Tabs */}
        <Tabs defaultValue="types" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="types">Alert Types</TabsTrigger>
            <TabsTrigger value="distance">Distance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Alert Types Tab */}
          <TabsContent value="types">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle>What to Alert You About</CardTitle>
                <CardDescription>Choose which types of alerts you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Alert Types */}
                <div className="space-y-3">
                  {Object.entries(alertTypeConfig).map(([type, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedAlertTypes.includes(type);
                    return (
                      <div
                        key={type}
                        onClick={() => handleAlertTypeToggle(type)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{config.label}</h4>
                            <p className="text-sm text-slate-500">{config.description}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resource Type Sub-selection */}
                {selectedAlertTypes.includes("resources") && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-slate-700 mb-3">Resource Types to Track</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(resourceIcons).map(([type, config]) => {
                        const Icon = config.icon;
                        const isSelected = selectedResourceTypes.includes(type);
                        return (
                          <div
                            key={type}
                            onClick={() => handleResourceTypeToggle(type)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                              isSelected 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-slate-200 hover:border-green-300'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${config.color}`} />
                            <span className="text-xs font-medium">{config.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distance Tab */}
          <TabsContent value="distance">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle>Alert Distance</CardTitle>
                <CardDescription>How close do you need to be to receive an alert?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Alert Radius</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {alertRadius < 0.1 ? `${Math.round(alertRadius * 5280)} ft` : `${alertRadius} mi`}
                    </span>
                  </div>
                  <Slider
                    value={[alertRadius]}
                    onValueChange={handleRadiusChange}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>0.1 mi</span>
                    <span>5 mi</span>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '500 ft', value: 0.095 },
                    { label: '0.25 mi', value: 0.25 },
                    { label: '0.5 mi', value: 0.5 },
                    { label: '1 mi', value: 1 }
                  ].map(({ label, value }) => (
                    <Button
                      key={value}
                      variant={Math.abs(alertRadius - value) < 0.01 ? "default" : "outline"}
                      onClick={() => handleRadiusChange([value])}
                      className="text-sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-slate-600" />
                    <div>
                      <Label className="font-semibold">Push Notifications</Label>
                      <p className="text-sm text-slate-500">Real-time alerts on your device</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {Notification.permission === 'granted' ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                {/* Email Alerts */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-600" />
                    <div>
                      <Label htmlFor="emailAlerts" className="font-semibold cursor-pointer">Email Alerts</Label>
                      <p className="text-sm text-slate-500">Daily digest of opportunities near your frequent locations</p>
                    </div>
                  </div>
                  <Switch
                    id="emailAlerts"
                    checked={emailAlertsEnabled}
                    onCheckedChange={handleEmailAlertsToggle}
                  />
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Email alerts are sent once daily summarizing opportunities near locations you frequently visit.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How It Works */}
        <Alert className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
          <Info className="h-5 w-5 text-purple-600" />
          <AlertDescription className="text-purple-900">
            <p className="font-semibold mb-2">How Donor Proximity Alerts Work:</p>
            <ul className="space-y-1 text-sm">
              <li>• Your location is tracked (with permission) while using the app</li>
              <li>• When you're near a recipient who needs help, you'll receive an alert</li>
              <li>• Urgent needs get priority notifications with more details</li>
              <li>• You can donate instantly with one tap on the notification</li>
              <li>• Your privacy is protected - recipients don't see your location</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}