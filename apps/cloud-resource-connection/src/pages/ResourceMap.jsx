import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
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
  Plus,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  MessageCircle,
  X,
  Send,
  Edit,
  MessageSquare,
  History
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ColorMarker from "../components/map/ColorMarker";
import EditResourceSheet from "../components/map/EditResourceSheet";
import ResourceCommentsSheet from "../components/map/ResourceCommentsSheet";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

function LocationMarker({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, map]);

  if (!userLocation) return null;

  return (
    <Marker position={[userLocation.lat, userLocation.lng]}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15);
    }
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick, enabled }) {
  const map = useMap();
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleClick = (e) => {
      onMapClick(e.latlng);
    };
    
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick, enabled]);
  
  return null;
}

export default function ResourceMap() {
  const queryClient = useQueryClient();
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([26.6406, -81.8723]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showActiveUsers, setShowActiveUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [commentsResource, setCommentsResource] = useState(null);
  const [clickToAddMode, setClickToAddMode] = useState(false);
  const [newResourceLocation, setNewResourceLocation] = useState(null);

  // Get current user
  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      updateUserLocation(user);
    }).catch(() => {});
  }, []);

  // Update user's active location
  const updateUserLocation = async (user) => {
    if (!user || !userLocation) return;
    
    try {
      await base44.auth.updateMe({
        isActiveNow: true,
        lastActiveLocation: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Failed to update user location:", error);
    }
  };

  // Get user location and update periodically
  useEffect(() => {
    if ("geolocation" in navigator) {
      const updateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            setMapCenter([location.lat, location.lng]);
            
            if (currentUser) {
              updateUserLocation(currentUser);
            }
          },
          (error) => console.error("Location error:", error)
        );
      };

      updateLocation();
      const interval = setInterval(updateLocation, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Mark user as inactive on unmount
  useEffect(() => {
    return () => {
      if (currentUser) {
        base44.auth.updateMe({ isActiveNow: false }).catch(() => {});
      }
    };
  }, [currentUser]);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resourceLocations'],
    queryFn: () => base44.entities.ResourceLocation.filter({ isActive: true }),
    refetchInterval: 10000,
    refetchIntervalInBackground: true
  });

  const { data: activeUsers = [] } = useQuery({
    queryKey: ['activeUsers'],
    queryFn: async () => {
      try {
        const users = await base44.entities.User.list();
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        return users.filter(u => 
          u.id !== currentUser?.id && 
          u.isActiveNow === true && 
          u.lastActiveLocation?.latitude && 
          u.lastActiveLocation?.longitude &&
          u.lastActiveLocation?.timestamp >= fiveMinutesAgo
        );
      } catch (error) {
        console.error("Error fetching active users:", error);
        return [];
      }
    },
    enabled: !!currentUser && showActiveUsers,
    refetchInterval: 15000,
    refetchIntervalInBackground: true
  });

  const { data: myMessages = [] } = useQuery({
    queryKey: ['myMessages', currentUser?.id],
    queryFn: () => base44.entities.Message.filter({ 
      toUserId: currentUser.id,
      isRead: false 
    }, '-created_date'),
    enabled: !!currentUser,
    refetchInterval: 10000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ toUserId, content }) => {
      return await base44.entities.Message.create({
        fromUserId: currentUser.id,
        toUserId,
        content
      });
    },
    onSuccess: () => {
      toast.success('Message sent!');
      setMessageContent("");
      setSelectedUser(null);
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ resourceId, voteType }) => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      const updates = voteType === 'up' 
        ? { upvotes: (resource.upvotes || 0) + 1 }
        : { downvotes: (resource.downvotes || 0) + 1 };

      await base44.entities.ResourceLocation.update(resourceId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resourceLocations']);
      toast.success('Thanks for your feedback!');
    }
  });

  const filteredResources = React.useMemo(() => {
    return resources.filter(resource => {
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(resource.type);
      const matchesVerified = !verifiedOnly || resource.isVerified;
      
      let matchesDate = true;
      if (dateRange !== "all" && resource.created_date) {
        const resourceDate = new Date(resource.created_date);
        const now = new Date();
        const daysAgo = (now - resourceDate) / (1000 * 60 * 60 * 24);
        
        if (dateRange === "today") matchesDate = daysAgo < 1;
        else if (dateRange === "week") matchesDate = daysAgo < 7;
        else if (dateRange === "month") matchesDate = daysAgo < 30;
      }
      
      return matchesType && matchesVerified && matchesDate;
    });
  }, [resources, selectedTypes, verifiedOnly, dateRange]);

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentCardIndex(0);
  };

  const currentResource = filteredResources[currentCardIndex];

  const handleNext = () => {
    if (currentCardIndex < filteredResources.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const handleCardClick = (resource) => {
    setMapCenter([resource.latitude, resource.longitude]);
    const index = filteredResources.findIndex(r => r.id === resource.id);
    if (index !== -1) setCurrentCardIndex(index);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getDirections = (resource) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${resource.latitude},${resource.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedUser) return;
    sendMessageMutation.mutate({
      toUserId: selectedUser.id,
      content: messageContent
    });
  };

  const handleMapClick = (latlng) => {
    if (clickToAddMode && currentUser) {
      setNewResourceLocation(latlng);
      setClickToAddMode(false);
    }
  };

  const createQuickResource = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ResourceLocation.create({
        ...data,
        isActive: true,
        isVerified: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resourceLocations']);
      toast.success('Resource added!');
      setNewResourceLocation(null);
    },
    onError: (error) => {
      toast.error('Failed to add resource');
      console.error(error);
    }
  });

  return (
    <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 px-2 py-1.5 md:p-2 flex items-center justify-between gap-2 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <h1 className="text-sm md:text-base font-bold text-slate-800">Resources</h1>
            <Badge variant="secondary" className="text-[10px] px-1 py-0">{filteredResources.length}</Badge>
          </div>
          {currentUser && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 hidden sm:flex">
              <Users className="w-2.5 h-2.5 mr-0.5" />
              {activeUsers.length} online
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Filters Sheet */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                <Settings className="w-3 h-3 mr-1" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filter Resources</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Resource Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(resourceIcons).map(([type, { icon: Icon, label }]) => (
                      <Button
                        key={type}
                        variant={selectedTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleType(type)}
                        className="justify-start h-8 text-xs"
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Date Added</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "all", label: "All Time" },
                      { value: "today", label: "Today" },
                      { value: "week", label: "This Week" },
                      { value: "month", label: "This Month" }
                    ].map(option => (
                      <Button
                        key={option.value}
                        variant={dateRange === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateRange(option.value)}
                        className="h-8 text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Verified Only</label>
                  <Button
                    variant={verifiedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className="h-8 text-xs"
                  >
                    {verifiedOnly ? "On" : "Off"}
                  </Button>
                </div>

                {currentUser && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Show Active Users</label>
                    <Button
                      variant={showActiveUsers ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowActiveUsers(!showActiveUsers)}
                      className="h-8 text-xs"
                    >
                      {showActiveUsers ? "On" : "Off"}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {currentUser && myMessages.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 text-xs px-2 relative">
              <MessageCircle className="w-3 h-3" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {myMessages.length}
              </Badge>
            </Button>
          )}

          {currentUser ? (
            <Button 
              size="sm" 
              className={`h-7 text-xs px-2 ${clickToAddMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
              onClick={() => setClickToAddMode(!clickToAddMode)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {clickToAddMode ? 'Click Map' : 'Add'}
            </Button>
          ) : (
            <Link to={createPageUrl("AddResource")}>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 h-7 text-xs px-2">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Map - Takes most of the screen */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={15}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController center={mapCenter} zoom={15} />
            <LocationMarker userLocation={userLocation} />
            <MapClickHandler onMapClick={handleMapClick} enabled={clickToAddMode} />

            {/* Resource Markers */}
            {filteredResources.map((resource) => {
              const { color } = resourceIcons[resource.type] || resourceIcons.other;
              
              return (
                <ColorMarker
                  key={resource.id}
                  position={[resource.latitude, resource.longitude]}
                  color={color}
                  eventHandlers={{
                    click: () => handleCardClick(resource)
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-sm">{resource.name}</p>
                      {resource.currentStatus && resource.currentStatus !== 'available' && (
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {resource.currentStatus}
                        </Badge>
                      )}
                      <Button size="sm" className="mt-2 text-xs h-7" onClick={() => handleCardClick(resource)}>
                        View Details
                      </Button>
                    </div>
                  </Popup>
                </ColorMarker>
              );
            })}

            {/* Active User Markers */}
            {showActiveUsers && activeUsers.length > 0 && activeUsers.map((user) => {
              if (!user.lastActiveLocation?.latitude || !user.lastActiveLocation?.longitude) return null;
              
              return (
                <CircleMarker
                  key={user.id}
                  center={[user.lastActiveLocation.latitude, user.lastActiveLocation.longitude]}
                  radius={10}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#34d399',
                    fillOpacity: 0.6,
                    weight: 3
                  }}
                >
                  <Popup>
                    <div className="text-center min-w-[120px]">
                      <p className="font-bold text-sm">{user.full_name || 'User'}</p>
                      <p className="text-xs text-green-600 font-semibold">● Online</p>
                      {currentUser && user.preferences?.allowMessages !== false && (
                        <Button 
                          size="sm" 
                          className="mt-2 text-xs h-7 w-full" 
                          onClick={() => setSelectedUser(user)}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
            
            {/* New Resource Location Marker */}
            {newResourceLocation && (
              <Marker position={[newResourceLocation.lat, newResourceLocation.lng]}>
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <p className="font-bold text-sm mb-2">Add Resource Here?</p>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => {
                        // Quick add with minimal info
                        const name = prompt('Resource name:');
                        if (name) {
                          createQuickResource.mutate({
                            name,
                            latitude: newResourceLocation.lat,
                            longitude: newResourceLocation.lng,
                            type: 'other'
                          });
                        }
                      }}
                    >
                      Add Now
                    </Button>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}

        <div className="absolute bottom-16 md:bottom-20 right-2 z-10 flex flex-col gap-2">
          {userLocation && (
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-lg h-8 w-8 p-0"
              onClick={() => setMapCenter([userLocation.lat, userLocation.lng])}
            >
              <Navigation className="w-3.5 h-3.5" />
            </Button>
          )}
          {clickToAddMode && (
            <div className="bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold">
              Click map to add
            </div>
          )}
          {activeUsers.length > 0 && (
            <div className="bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" />
              {activeUsers.length} online
            </div>
          )}
        </div>
      </div>

      {/* Compact Card Area */}
      <div className="bg-white border-t border-slate-200 p-2 flex-shrink-0">
        {filteredResources.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-xs text-slate-500 mb-2">No resources match your filters</p>
            <Link to={createPageUrl("AddResource")}>
              <Button size="sm" className="text-xs h-7">Add One</Button>
            </Link>
          </div>
        ) : currentResource ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{currentResource.name}</h3>
                <div className="flex items-center gap-1 flex-wrap">
                  {currentResource.type && (
                    <Badge className={`text-[10px] px-1 py-0 ${resourceIcons[currentResource.type]?.color || "bg-slate-400"}`}>
                      {resourceIcons[currentResource.type]?.label}
                    </Badge>
                  )}
                  {currentResource.currentStatus && currentResource.currentStatus !== 'available' && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">
                      {currentResource.currentStatus}
                    </Badge>
                  )}
                  {userLocation && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        currentResource.latitude,
                        currentResource.longitude
                      )} mi
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1 flex-shrink-0">
                <Button 
                  size="sm"
                  className="h-8 text-xs px-2"
                  onClick={() => getDirections(currentResource)}
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Go
                </Button>
                {currentUser && (
                  <>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingResource(currentResource)}
                      title="Edit Resource"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCommentsResource(currentResource)}
                      title="View Comments"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                  </>
                )}
                <Button 
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => voteMutation.mutate({ resourceId: currentResource.id, voteType: 'up' })}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentCardIndex === filteredResources.length - 1}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="text-[10px] text-slate-500 flex-shrink-0">
              {currentCardIndex + 1}/{filteredResources.length}
            </div>
          </div>
        ) : null}
      </div>

      {/* Edit Resource Sheet */}
      {editingResource && currentUser && (
        <EditResourceSheet
          resource={editingResource}
          isOpen={!!editingResource}
          onClose={() => setEditingResource(null)}
          currentUser={currentUser}
        />
      )}

      {/* Comments Sheet */}
      {commentsResource && currentUser && (
        <ResourceCommentsSheet
          resource={commentsResource}
          isOpen={!!commentsResource}
          onClose={() => setCommentsResource(null)}
          currentUser={currentUser}
        />
      )}

      {/* Message Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Message {selectedUser.full_name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                className="w-full"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}