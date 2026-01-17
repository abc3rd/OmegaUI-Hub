import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Filter,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  X,
  ChevronUp,
  Search,
  Flag
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ColorMarker from "../components/map/ColorMarker";
import AddResourcePin from "../components/map/AddResourcePin";
import QuickAddResourceForm from "../components/map/QuickAddResourceForm";

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

export default function ResourceMap() {
  const queryClient = useQueryClient();
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([26.6406, -81.8723]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newResourceLocation, setNewResourceLocation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter([location.lat, location.lng]);
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  }, []);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resourceLocations'],
    queryFn: () => base44.entities.ResourceLocation.filter({ 
      status: 'active',
      visibility: 'community'
    }),
    refetchInterval: 30000
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
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

  const handleReportSubmit = async () => {
    if (!user) {
      toast.error('Please log in to report a resource');
      base44.auth.redirectToLogin();
      return;
    }

    if (!reportReason) {
      toast.error('Please select a reason for the report');
      return;
    }

    setSubmittingReport(true);
    try {
      await base44.entities.ResourceReport.create({
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        reporterUserId: user.id,
        reporterEmail: user.email,
        reason: reportReason,
        description: reportDescription,
        status: 'pending'
      });

      toast.success('Report submitted. Thank you for helping keep our community safe!');
      setReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
      console.error('Report error:', error);
    } finally {
      setSubmittingReport(false);
    }
  };

  const availableCities = React.useMemo(() => {
    const cities = new Set(resources.map(r => r.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [resources]);

  const filteredResources = React.useMemo(() => {
    return resources.filter(resource => {
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(resource.type);
      const matchesCity = selectedCity === "all" || resource.city === selectedCity;
      const matchesSearch = searchQuery === "" || 
        resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resourceIcons[resource.type]?.label?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCity && matchesSearch;
    });
  }, [resources, selectedTypes, selectedCity, searchQuery]);

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleMarkerClick = (resource) => {
    if (!addMode) {
      setSelectedResource(resource);
      setMapCenter([resource.latitude, resource.longitude]);
      setSheetExpanded(true);
    }
  };

  const handleLocationSelected = (location) => {
    setNewResourceLocation(location);
    setShowAddForm(true);
    setSheetExpanded(true);
  };

  const handleAddModeToggle = () => {
    setAddMode(!addMode);
    if (addMode) {
      // Turning off add mode
      setNewResourceLocation(null);
      setShowAddForm(false);
    }
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

  return (
    <div className="app-shell">
      <div className="h-[100svh] w-full flex flex-col">
        {/* Header */}
        <header className="shrink-0 px-3 py-3 bg-white border-b border-slate-200 z-20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold text-slate-800">Resources</h1>
              <p className="text-xs text-slate-500">{filteredResources.length} nearby</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 px-3"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
              <Button
                variant={addMode ? "default" : "outline"}
                size="sm"
                onClick={handleAddModeToggle}
                className="h-10 px-3"
              >
                <MapPin className="w-4 h-4 mr-1" />
                {addMode ? 'Cancel' : 'Drop Pin'}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search resources by name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Filters Panel */}
        {showFilters && (
          <div className="shrink-0 bg-white border-b border-slate-200 p-3 space-y-3 z-20">
            {/* Type Filters */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Resource Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Object.entries(resourceIcons).map(([type, { icon: Icon, label }]) => (
                  <Button
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleType(type)}
                    className="h-12 flex-col gap-1 text-xs"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            {availableCities.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Location</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm"
                >
                  <option value="all">All Locations</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <main className="relative flex-1 min-h-0">
          <div className="absolute inset-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={15}
                className="h-full w-full"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController center={mapCenter} zoom={15} />
                <LocationMarker userLocation={userLocation} />
                <AddResourcePin 
                  onLocationSelected={handleLocationSelected} 
                  isActive={addMode}
                />

                {filteredResources.map((resource) => {
                  const { color } = resourceIcons[resource.type] || resourceIcons.other;
                  
                  return (
                    <ColorMarker
                      key={resource.id}
                      position={[resource.latitude, resource.longitude]}
                      color={color}
                      eventHandlers={{
                        click: () => handleMarkerClick(resource)
                      }}
                    >
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold">{resource.name}</p>
                        </div>
                      </Popup>
                    </ColorMarker>
                  );
                })}
              </MapContainer>
            )}
          </div>

          {/* My Location Button */}
          {userLocation && (
            <div className="absolute bottom-24 right-4 z-10 pointer-events-none">
              <Button
                size="sm"
                variant="outline"
                className="bg-white shadow-lg h-11 w-11 p-0 pointer-events-auto"
                onClick={() => setMapCenter([userLocation.lat, userLocation.lng])}
              >
                <Navigation className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Bottom Sheet */}
          <div className="absolute left-0 right-0 bottom-0 pointer-events-none z-10">
            <div className="mx-2 mb-2 rounded-t-2xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden pointer-events-auto">
              {/* Sheet Handle */}
              <button
                onClick={() => setSheetExpanded(!sheetExpanded)}
                className="w-full px-4 py-3 border-b border-slate-200 bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedResource ? selectedResource.name : `${filteredResources.length} Resources`}
                  </span>
                  <ChevronUp className={`w-5 h-5 text-slate-500 transition-transform ${sheetExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Sheet Content */}
              <div 
                className="overflow-y-auto transition-all duration-300"
                style={{ maxHeight: sheetExpanded ? '60svh' : '0' }}
              >
                {showAddForm && newResourceLocation ? (
                  <QuickAddResourceForm
                    location={newResourceLocation}
                    onCancel={() => {
                      setShowAddForm(false);
                      setNewResourceLocation(null);
                      setAddMode(false);
                      setSheetExpanded(false);
                    }}
                    onSuccess={() => {
                      setShowAddForm(false);
                      setNewResourceLocation(null);
                      setAddMode(false);
                      setSheetExpanded(false);
                    }}
                  />
                ) : selectedResource ? (
                  <div className="p-4 space-y-4">
                    {/* Photo */}
                    {selectedResource.photoUrls && selectedResource.photoUrls[0] && (
                      <img 
                        src={selectedResource.photoUrls[0]} 
                        alt={selectedResource.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedResource.type && (
                          <Badge className={resourceIcons[selectedResource.type]?.color || "bg-slate-400"}>
                            {resourceIcons[selectedResource.type]?.label || selectedResource.type}
                          </Badge>
                        )}
                        {userLocation && (
                          <Badge variant="outline">
                            📏 {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              selectedResource.latitude,
                              selectedResource.longitude
                            )} mi
                          </Badge>
                        )}
                      </div>

                      {selectedResource.description && (
                        <p className="text-slate-700">{selectedResource.description}</p>
                      )}

                      {selectedResource.address && (
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{selectedResource.address}</span>
                        </div>
                      )}

                      {selectedResource.hours && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Hours:</span> {selectedResource.hours}
                        </div>
                      )}

                      {selectedResource.managerName && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Contact:</span> {selectedResource.managerName}
                          {selectedResource.managerContact && ` - ${selectedResource.managerContact}`}
                        </div>
                      )}

                      {selectedResource.accessNotes && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Access:</span> {selectedResource.accessNotes}
                        </div>
                      )}

                      {selectedResource.tips && (
                        <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                          <span className="font-semibold">💡 Tips:</span> {selectedResource.tips}
                        </div>
                      )}

                      {selectedResource.costInfo && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Cost:</span> {selectedResource.costInfo}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                        onClick={() => getDirections(selectedResource)}
                      >
                        <Navigation className="w-5 h-5 mr-2" />
                        Get Directions
                      </Button>

                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="h-12"
                          onClick={() => voteMutation.mutate({ resourceId: selectedResource.id, voteType: 'up' })}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Helpful ({selectedResource.upvotes || 0})
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-12"
                          onClick={() => voteMutation.mutate({ resourceId: selectedResource.id, voteType: 'down' })}
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Not Helpful ({selectedResource.downvotes || 0})
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setReportDialogOpen(true)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report Resource
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full h-12"
                        onClick={() => {
                          setSelectedResource(null);
                          setSheetExpanded(false);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {filteredResources.slice(0, 5).map((resource) => {
                        const { icon: Icon, color, label } = resourceIcons[resource.type] || resourceIcons.other;
                        return (
                          <button
                            key={resource.id}
                            onClick={() => handleMarkerClick(resource)}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                          >
                            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-800 truncate">{resource.name}</div>
                              <div className="text-xs text-slate-500">{label}</div>
                            </div>
                            {userLocation && (
                              <div className="text-xs font-medium text-slate-600 flex-shrink-0">
                                {calculateDistance(
                                  userLocation.lat,
                                  userLocation.lng,
                                  resource.latitude,
                                  resource.longitude
                                )} mi
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Report Dialog */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Resource</DialogTitle>
              <DialogDescription>
                Help us keep the community safe by reporting issues with this resource.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for report *</Label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inaccurate_info">Inaccurate Information</SelectItem>
                    <SelectItem value="no_longer_exists">No Longer Exists</SelectItem>
                    <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional details (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about the issue..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setReportDialogOpen(false)}
                  className="flex-1"
                  disabled={submittingReport}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReportSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={submittingReport}
                >
                  {submittingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}