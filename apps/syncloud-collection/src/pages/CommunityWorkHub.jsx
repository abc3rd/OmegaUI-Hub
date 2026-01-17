
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { UtilitySpot } from '@/entities/UtilitySpot';
import { JobPosting } from '@/entities/JobPosting';
import { WorkerProfile } from '@/entities/WorkerProfile';
import { JobMatch } from '@/entities/JobMatch';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  MapPin, Users, Briefcase, DollarSign, Star, Clock,
  PlusCircle, Filter as FilterIcon, ChevronsUpDown,
  Utensils, Droplets, Plug, PersonStanding, Tent, Wifi, Box,
  Home, LifeBuoy, Stethoscope, Soup, CheckCircle,
  ArrowRight, Menu, X
} from 'lucide-react';
import SpotForm from '@/components/map/SpotForm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Leaflet Icon Setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getIconForUtility = (type) => {
    // Create SVG strings for each icon type
    const iconSVGs = {
        food_pantry: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 8.5c0 .5.4.9.9.9h5.2c.5 0 .9-.4.9-.9V6.9c0-1.5-1.2-2.7-2.7-2.7h-.6c-1.5 0-2.7 1.2-2.7 2.7v1.6z"/><path d="M6 10.5h12L19 21H5l1-10.5z"/></svg>',
        water_spigot: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
        electrical_outlet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2l4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9s9 4.03 9 9z"/></svg>',
        shower: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v3h3v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7h3V2h2z"/><circle cx="3" cy="16" r="1"/><circle cx="7" cy="16" r="1"/><circle cx="11" cy="16" r="1"/><circle cx="15" cy="16" r="1"/><circle cx="19" cy="16" r="1"/><circle cx="3" cy="20" r="1"/><circle cx="7" cy="20" r="1"/><circle cx="11" cy="20" r="1"/><circle cx="15" cy="20" r="1"/><circle cx="19" cy="20" r="1"/></svg>',
        camping_area: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="m3.5 21l8.5-14.5L20.5 21z"/></svg>',
        wifi_hotspot: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
        donation_center: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Z"/></svg>',
        charity_event: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
        homeless_assistance: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
        day_labor: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        job_assistance: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        aa_meeting: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="m22 20-4.69-4.69a10 10 0 0 0 0-6.62L22 4"/></svg>',
        na_meeting: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="m22 20-4.69-4.69a10 10 0 0 0 0-6.62L22 4"/></svg>',
        recovery_center: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>',
        medical_assistance: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2Z"/></svg>',
        transportation_hub: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6v6h8V6"/><path d="M15 18H9"/><path d="M15 5v14"/><path d="M9 5v14"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>',
        clothing_bank: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
        educational_resources: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 14.5V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V14.5"/><path d="M11.83 1.19c.1-.06.2-.1.3-.1.1 0 .2.04.3.1L22 6l-1.92 3.65-4.85-2.56L12 9l-3.23-1.91-4.85 2.56L2 6l9.83-4.81Z"/></svg>',
        food_drive: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 13h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2Z"/><path d="M9.5 11.5A2.5 2.5 0 0 0 12 9"/><path d="M12 9a2.5 2.5 0 0 0-2.5 2.5"/><path d="M12 9a2.5 2.5 0 0 0 2.5 2.5"/><path d="M14.5 11.5A2.5 2.5 0 0 0 12 9"/><path d="M14.5 13h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2Z"/></svg>'
    };
    
    // Different colors for different types
    const colorMapping = {
        food_pantry: '#10B981', food_drive: '#10B981',
        day_labor: '#F59E0B', job_assistance: '#F59E0B',
        medical_assistance: '#EF4444', homeless_assistance: '#3B82F6',
        aa_meeting: '#8B5CF6', na_meeting: '#8B5CF6', recovery_center: '#8B5CF6'
    };
    
    const color = colorMapping[type] || '#282361';
    // Fallback to a default icon if specific type not found, e.g., a generic MapPin or one of the provided SVGs
    const svgIcon = iconSVGs[type] || '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'; // Fallback to a simple MapPin SVG
    
    return new L.DivIcon({
        html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: 18px;">${svgIcon}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

// Move utilityCategories outside the component to ensure stable reference for useMemo dependencies
const utilityCategories = [
  { id: 'food_pantry', name: 'Food Pantry', icon: Utensils, color: '#10B981' },
  { id: 'food_drive', name: 'Food Drive', icon: Soup, color: '#10B981' },
  { id: 'water_spigot', name: 'Water Spigot', icon: Droplets, color: '#06B6D4' },
  { id: 'electrical_outlet', name: 'Electrical Outlet', icon: Plug, color: '#F59E0B' },
  { id: 'shower', name: 'Shower', icon: PersonStanding, color: '#06B6D4' },
  { id: 'camping_area', name: 'Camping Area', icon: Tent, color: '#84CC16' },
  { id: 'wifi_hotspot', name: 'WiFi Hotspot', icon: Wifi, color: '#8B5CF6' },
  { id: 'donation_center', name: 'Donation Center', icon: Box, color: '#F97316' },
  { id: 'homeless_assistance', name: 'Homeless Assistance', icon: Home, color: '#3B82F6' },
  { id: 'day_labor', name: 'Day Labor Hub', icon: Briefcase, color: '#F59E0B' },
  { id: 'aa_meeting', name: 'AA Meeting', icon: Users, color: '#8B5CF6' },
  { id: 'na_meeting', name: 'NA Meeting', icon: Users, color: '#8B5CF6' },
  { id: 'recovery_center', name: 'Recovery Center', icon: LifeBuoy, color: '#8B5CF6' },
  { id: 'medical_assistance', name: 'Medical Help', icon: Stethoscope, color: '#EF4444' },
  { id: 'job_assistance', name: 'Job Assistance', icon: Briefcase, color: '#F59E0B' },
];

export default function CommunityWorkHub() {
  const [spots, setSpots] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Map state
  const [mapCenter, setMapCenter] = useState([26.72, -81.89]);
  const [userLocation, setUserLocation] = useState(null);
  const [proximityRadius, setProximityRadius] = useState(5);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('map');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const mapRef = useRef(null);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Filter spots based on proximity and selected types
  const filteredSpots = useMemo(() => {
    let filtered = [...spots];
    
    if (userLocation && proximityRadius > 0) {
      filtered = filtered.filter(spot => 
        calculateDistance(userLocation.lat, userLocation.lng, spot.latitude, spot.longitude) <= proximityRadius
      );
    }
    
    if (selectedResourceTypes.length > 0) {
      filtered = filtered.filter(spot => selectedResourceTypes.includes(spot.utility_type));
    }
    
    return filtered;
  }, [spots, userLocation, proximityRadius, selectedResourceTypes, calculateDistance]);

  // Get resource counts for each category
  const resourceCounts = useMemo(() => {
    // utilityCategories is now a stable constant, so it does not need to be in the dependency array
    return utilityCategories.reduce((acc, category) => {
      acc[category.id] = filteredSpots.filter(spot => spot.utility_type === category.id).length;
      return acc;
    }, {});
  }, [filteredSpots]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = [position.coords.latitude, position.coords.longitude];
          setMapCenter(newCenter);
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.warn("Could not get location:", error)
      );
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [spotsData, jobsData, workersData, matchesData, userData] = await Promise.allSettled([
        UtilitySpot.list('-created_date'),
        JobPosting.list('-created_date'),
        WorkerProfile.list('-created_date'),
        JobMatch.list('-created_date'),
        User.me()
      ]);

      setSpots(spotsData.status === 'fulfilled' ? spotsData.value : []);
      setJobs(jobsData.status === 'fulfilled' ? jobsData.value : []);
      setWorkers(workersData.status === 'fulfilled' ? workersData.value : []);
      setMatches(matchesData.status === 'fulfilled' ? matchesData.value : []);
      setUser(userData.status === 'fulfilled' ? userData.value : null);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (e) => {
    if (isAddMode) {
      setClickedPosition(e.latlng);
      setShowFormDialog(true);
    }
  };

  const MapEvents = () => {
    useMapEvents({ click: handleMapClick });
    return null;
  };

  const handleFormSubmit = () => {
    setShowFormDialog(false);
    setIsAddMode(false);
    setClickedPosition(null);
    loadData();
  };

  const handleCheckIn = async (spot) => {
    try {
      await UtilitySpot.update(spot.id, {
        check_in_count: (spot.check_in_count || 0) + 1,
        last_check_in: new Date().toISOString()
      });
      toast.success(`Checked in at ${spot.name}`);
      loadData();
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleResourceTypeToggle = (resourceType) => {
    setSelectedResourceTypes(prev => 
      prev.includes(resourceType) 
        ? prev.filter(type => type !== resourceType)
        : [...prev, resourceType]
    );
  };

  // Get activity level for heat map visualization
  const getActivityLevel = (checkInCount) => {
    if (checkInCount >= 20) return 'very-high';
    if (checkInCount >= 10) return 'high';
    if (checkInCount >= 5) return 'medium';
    if (checkInCount >= 1) return 'low';
    return 'none';
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading Community Work Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Community Work Hub</h1>
            <p className="text-sm text-gray-600 hidden sm:block">Resources • Jobs • Opportunities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:flex">
            {filteredSpots.length} Resources
          </Badge>
          <Badge variant="outline">
            {jobs.filter(j => j.status === 'open').length} Open Jobs
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Mobile responsive */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 ease-in-out
          fixed md:relative z-30 h-full w-80 bg-white shadow-lg border-r
          flex flex-col
        `}>
          
          {/* Proximity Controls */}
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Proximity Filter</h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 0].map((radius) => (
                <Button
                  key={radius}
                  size="sm"
                  variant={proximityRadius === radius ? "default" : "outline"}
                  onClick={() => setProximityRadius(radius)}
                  className="text-xs"
                  disabled={!userLocation && radius !== 0}
                >
                  {radius > 0 ? `${radius}mi` : 'All'}
                </Button>
              ))}
            </div>
            
            <Button 
              className="w-full mt-3" 
              onClick={() => setIsAddMode(true)}
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>

          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-2">
              <TabsTrigger value="map" className="text-xs">Resources</TabsTrigger>
              <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
              <TabsTrigger value="workers" className="text-xs">Workers</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* Resource Categories */}
              <TabsContent value="map" className="mt-0 px-4 pb-4">
                <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg mb-2">
                    <span className="font-medium text-sm">Resource Categories</span>
                    <ChevronsUpDown className="w-4 h-4" />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-1">
                    {utilityCategories.map(category => {
                      const Icon = category.icon;
                      const isSelected = selectedResourceTypes.includes(category.id);
                      const count = resourceCounts[category.id] || 0;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleResourceTypeToggle(category.id)}
                          className={`
                            w-full flex items-center justify-between p-3 rounded-lg transition-all
                            ${isSelected 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'hover:bg-gray-50 border border-gray-200'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-1.5 rounded-full"
                              style={{ 
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : category.color + '20',
                                color: isSelected ? 'white' : category.color
                              }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <Badge 
                            variant={isSelected ? "secondary" : "outline"} 
                            className="text-xs"
                          >
                            {count}
                          </Badge>
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>

                {selectedResourceTypes.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedResourceTypes([])}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Job Listings */}
              <TabsContent value="jobs" className="mt-0 px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Available Jobs</h3>
                    <Button size="sm" className="text-xs">
                      Post Job
                    </Button>
                  </div>
                  
                  {jobs.filter(job => job.status === 'open').slice(0, 10).map(job => (
                    <Card key={job.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {job.title}
                          </h4>
                          <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                            ${job.pay_rate}/hr
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {userLocation && (
                              <span>
                                {calculateDistance(
                                  userLocation.lat, userLocation.lng,
                                  job.location_latitude, job.location_longitude
                                ).toFixed(1)} mi
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {job.duration_hours}h
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs" style={{ backgroundColor: '#F59E0B20', color: '#F59E0B' }}>
                            {job.job_type.replace('_', ' ')}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {jobs.filter(job => job.status === 'open').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No jobs available</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Available Workers */}
              <TabsContent value="workers" className="mt-0 px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Available Workers</h3>
                    <Button size="sm" className="text-xs">
                      Create Profile
                    </Button>
                  </div>
                  
                  {workers.filter(worker => worker.is_available).slice(0, 10).map(worker => (
                    <Card key={worker.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm text-gray-900">
                            {worker.display_name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {worker.rating ? worker.rating.toFixed(1) : 'New'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <DollarSign className="w-3 h-3" />
                          ${worker.hourly_rate_min}-${worker.hourly_rate_max}/hr
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {worker.skills?.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill.replace('_', ' ')}
                            </Badge>
                          ))}
                          {worker.skills?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{worker.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {workers.filter(worker => worker.is_available).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No workers available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            className="h-full w-full z-0"
            ref={mapRef}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents />
            
            {filteredSpots.map(spot => {
              const activityLevel = getActivityLevel(spot.check_in_count || 0);
              return (
                <Marker 
                  key={spot.id} 
                  position={[spot.latitude, spot.longitude]} 
                  icon={getIconForUtility(spot.utility_type)}
                >
                  <Popup minWidth={280}>
                    <div className="space-y-3 p-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{spot.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{spot.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {spot.operating_hours || 'Hours not specified'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              activityLevel === 'very-high' ? 'bg-red-100 text-red-800 border-red-200' :
                              activityLevel === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              activityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              activityLevel === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            {spot.check_in_count || 0} check-ins
                          </Badge>
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckIn(spot)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Check In
                        </Button>
                      </div>
                      
                      {spot.contributor_name && (
                        <div className="text-xs text-gray-500 border-t pt-2">
                          Added by {spot.contributor_name}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Mobile overlay button to open sidebar */}
          {!sidebarOpen && (
            <Button
              className="md:hidden fixed bottom-6 left-4 z-20 shadow-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <FilterIcon className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Resource Form Dialog */}
      <SpotForm 
        isOpen={showFormDialog} 
        onClose={() => setShowFormDialog(false)}
        onSubmit={handleFormSubmit}
        position={clickedPosition}
      />
    </div>
  );
}
