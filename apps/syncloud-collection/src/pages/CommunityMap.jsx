
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { UtilitySpot } from '@/entities/UtilitySpot';
import { JobPosting } from '@/entities/JobPosting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import SpotForm from '@/components/map/SpotForm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Menu, X, Utensils, Droplets, Plug, PersonStanding, Tent, Wifi, Box, Heart, Home, Briefcase, Users, LifeBuoy, Stethoscope, Bus, HandHeart, GraduationCap, ShoppingBasket, Gavel, Hand, Soup, PlusCircle
} from 'lucide-react';

// --- Leaflet Icon Setup ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getIconForUtility = (type) => {
    const iconSVGs = {
        food_pantry: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 8.5c0 .5.4.9.9.9h5.2c.5 0 .9-.4.9-.9V6.9c0-1.5-1.2-2.7-2.7-2.7h-.6c-1.5 0-2.7 1.2-2.7 2.7v1.6z"/><path d="M6 10.5h12L19 21H5l1-10.5z"/></svg>',
        water_spigot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
        electrical_outlet: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2l4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9s9 4.03 9 9z"/></svg>',
        shower: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v3h3v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7h3V2h2z"/><circle cx="3" cy="16" r="1"/><circle cx="7" cy="16" r="1"/><circle cx="11" cy="16" r="1"/><circle cx="15" cy="16" r="1"/><circle cx="19" cy="16" r="1"/><circle cx="3" cy="20" r="1"/><circle cx="7" cy="20" r="1"/><circle cx="11" cy="20" r="1"/><circle cx="15" cy="20" r="1"/><circle cx="19" cy="20" r="1"/></svg>',
        camping_area: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m3.5 21l8.5-14.5L20.5 21z"/></svg>',
        wifi_hotspot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
        donation_center: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Z"/></svg>',
        charity_event: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
        homeless_assistance: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
        yard_sale: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3a1 1 0 0 0 0-1.4L19.2 4a1 1 0 0 0-1.4 0l-2.3 2.3a1 1 0 0 0 0 1.2Z"/><path d="M6 6h.01"/><path d="M6 18h.01"/><path d="m15 6-6 6h4l-7 7"/></svg>',
        storage_auction: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 10h1l4-4V3a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7c0 1.1.9 2 2 2Z"/><path d="M7 21a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M20.2 15.9A4 4 0 1 0 15.9 20.2"/></svg>',
        helping_hands: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
        aa_meeting: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="m22 20-4.69-4.69a10 10 0 0 0 0-6.62L22 4"/></svg>',
        na_meeting: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="m22 20-4.69-4.69a10 10 0 0 0 0-6.62L22 4"/></svg>',
        recovery_center: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>',
        medical_assistance: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2Z"/></svg>',
        transportation_hub: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6v6h8V6"/><path d="M15 18H9"/><path d="M15 5v14"/><path d="M9 5v14"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>',
        clothing_bank: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
        job_assistance: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        educational_resources: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
        day_labor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        food_drive: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 13h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2Z"/><path d="M9.5 11.5A2.5 2.5 0 0 0 12 9"/><path d="M12 9a2.5 2.5 0 0 0-2.5 2.5"/><path d="M12 9a2.5 2.5 0 0 0 2.5 2.5"/><path d="M14.5 11.5A2.5 2.5 0 0 0 12 9"/><path d="M14.5 13h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2Z"/></svg>'
    };

    // Updated color mapping for better contrast and variety
    const colorMapping = {
        food_pantry: '#10B981', food_drive: '#10B981', // Green
        water_spigot: '#06B6D4', shower: '#06B6D4', // Cyan
        electrical_outlet: '#F59E0B', // Amber
        camping_area: '#84CC16', // Lime
        wifi_hotspot: '#6366F1', // Indigo
        donation_center: '#F97316', clothing_bank: '#F97316', // Orange
        charity_event: '#EC4899', // Pink
        homeless_assistance: '#3B82F6', // Blue
        day_labor: '#D97706', job_assistance: '#D97706', // Amber
        aa_meeting: '#8B5CF6', na_meeting: '#8B5CF6', recovery_center: '#8B5CF6', // Violet
        medical_assistance: '#EF4444', // Red
        transportation_hub: '#78716C', // Stone
        yard_sale: '#A855F7', storage_auction: '#A855F7', // Purple
        helping_hands: '#EAB308', // Yellow
        educational_resources: '#14B8A6', // Teal
        temporary_shelter: '#3B82F6' // Blue (for shelter category)
    };
    const color = colorMapping[type] || '#282361'; // Default

    const svgIcon = iconSVGs[type] || iconSVGs.food_pantry;

    return new L.DivIcon({
        html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${svgIcon}</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
};

export const utilityCategoryDetails = [
    { id: 'food_pantry', name: 'Food Pantry', icon: Utensils, color: '#10B981' },
    { id: 'food_drive', name: 'Food Drive', icon: Soup, color: '#10B981' },
    { id: 'water_spigot', name: 'Water Spigot', icon: Droplets, color: '#06B6D4' },
    { id: 'electrical_outlet', name: 'Electrical Outlet', icon: Plug, color: '#F59E0B' },
    { id: 'shower', name: 'Shower', icon: PersonStanding, color: '#06B6D4' },
    { id: 'camping_area', name: 'Camping Area', icon: Tent, color: '#84CC16' },
    { id: 'wifi_hotspot', name: 'WiFi Hotspot', icon: Wifi, color: '#6366F1' },
    { id: 'donation_center', name: 'Donation Center', icon: Box, color: '#F97316' },
    { id: 'charity_event', name: 'Charity Event', icon: Heart, color: '#EC4899' },
    { id: 'homeless_assistance', name: 'Homeless Assistance', icon: Home, color: '#3B82F6' },
    { id: 'day_labor', name: 'Day Labor', icon: Briefcase, color: '#D97706' },
    { id: 'aa_meeting', name: 'AA Meeting', icon: Users, color: '#8B5CF6' },
    { id: 'na_meeting', name: 'NA Meeting', icon: Users, color: '#8B5CF6' },
    { id: 'recovery_center', name: 'Recovery Center', icon: LifeBuoy, color: '#8B5CF6' },
    { id: 'medical_assistance', name: 'Medical Assistance', icon: Stethoscope, color: '#EF4444' },
    { id: 'transportation_hub', name: 'Transportation Hub', icon: Bus, color: '#78716C' },
    { id: 'clothing_bank', name: 'Clothing Bank', icon: HandHeart, color: '#F97316' },
    { id: 'job_assistance', name: 'Job Assistance', icon: Briefcase, color: '#D97706' },
    { id: 'educational_resources', name: 'Educational Resources', icon: GraduationCap, color: '#14B8A6' },
    { id: 'yard_sale', name: 'Yard Sale', icon: ShoppingBasket, color: '#A855F7' },
    { id: 'storage_auction', name: 'Storage Auction', icon: Gavel, color: '#A855F7' },
    { id: 'helping_hands', name: 'Helping Hands', icon: Hand, color: '#EAB308' },
    // Adding temporary_shelter as a placeholder since it's in the new category structure
    { id: 'temporary_shelter', name: 'Temporary Shelter', icon: Home, color: '#3B82F6' },
];

const utilityCategories = [
    { id: 'food', name: 'Food & Water', icon: Utensils, color: '#10B981', subcategories: ['food_pantry', 'food_drive', 'water_spigot'] },
    { id: 'shelter', name: 'Shelter & Facilities', icon: Home, color: '#3B82F6', subcategories: ['temporary_shelter', 'camping_area', 'shower'] },
    { id: 'health', name: 'Health & Wellness', icon: Stethoscope, color: '#EF4444', subcategories: ['medical_assistance', 'aa_meeting', 'na_meeting', 'recovery_center'] },
    { id: 'resources', name: 'Goods & Resources', icon: Box, color: '#F97316', subcategories: ['donation_center', 'clothing_bank', 'electrical_outlet'] },
    { id: 'work', name: 'Jobs & Assistance', icon: Briefcase, color: '#D97706', subcategories: ['day_labor', 'job_assistance'] },
    { id: 'community', name: 'Community & Events', icon: Heart, color: '#EC4899', subcategories: ['charity_event', 'yard_sale', 'storage_auction'] },
    { id: 'connectivity', name: 'Connectivity', icon: Wifi, color: '#6366F1', subcategories: ['wifi_hotspot'] },
    { id: 'transport', name: 'Transportation', icon: Bus, color: '#78716C', subcategories: ['transportation_hub'] },
    // Other categories that might have been in the original flat list and should still be selectable
    { id: 'educational_resources', name: 'Educational Resources', icon: GraduationCap, color: '#14B8A6', subcategories: ['educational_resources'] },
    { id: 'helping_hands', name: 'Helping Hands', icon: Hand, color: '#EAB308', subcategories: ['helping_hands'] },
];


const getCategoryDetails = (type) => {
    for (const category of utilityCategories) {
        if (category.subcategories.includes(type)) {
            const subCat = utilityCategoryDetails.find(sc => sc.id === type);
            return { category, subcategory: subCat };
        }
    }
    return { category: null, subcategory: utilityCategoryDetails.find(sc => sc.id === type) };
};

function LocationMarker({ setMapCenter }) {
    const map = useMap();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newCenter = [latitude, longitude];
                    setMapCenter(newCenter);
                    map.setView(newCenter, 13);
                },
                (error) => console.warn("Could not get user location:", error)
            );
        }
    }, [map, setMapCenter]);

    return null;
}

const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

export default function CommunityMap() {
    const queryClient = useQueryClient();
    const [mapCenter, setMapCenter] = useState([30.2672, -97.7431]); // Default to Austin, TX
    const [selectedResourceTypes, setSelectedResourceTypes] = useState(utilityCategoryDetails.map(cat => cat.id));
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openCategories, setOpenCategories] = useState(new Set(utilityCategories.map(c => c.id)));

    const [isAddingSpot, setIsAddingSpot] = useState(false);
    const [newSpotCoords, setNewSpotCoords] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: spots, isLoading: isLoadingSpots, error: spotsError } = useQuery({
        queryKey: ['utilitySpots'],
        queryFn: () => UtilitySpot.list()
    });

    const { data: jobs, isLoading: isLoadingJobs, error: jobsError } = useQuery({
        queryKey: ['jobPostingsMap'],
        queryFn: () => JobPosting.list()
    });
    
    const createSpotMutation = useMutation({
        mutationFn: (newSpot) => UtilitySpot.create(newSpot),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['utilitySpots'] });
            toast.success("New resource spot added successfully!");
            setIsFormOpen(false);
            setNewSpotCoords(null);
            setIsAddingSpot(false); // Ensure adding mode is reset
        },
        onError: (error) => {
            toast.error("Failed to add spot. Please try again.");
            console.error(error);
        }
    });

    useEffect(() => {
        if (spotsError) toast.error("Failed to load utility spots.");
        if (jobsError) toast.error("Failed to load job postings.");
    }, [spotsError, jobsError]);

    const resourceCounts = useMemo(() => {
        if (!spots) return {};
        return spots.reduce((acc, spot) => {
            acc[spot.utility_type] = (acc[spot.utility_type] || 0) + 1;
            return acc;
        }, {});
    }, [spots]);

    const filteredSpots = useMemo(() => {
        if (!spots) return [];
        return spots.filter(spot => selectedResourceTypes.includes(spot.utility_type));
    }, [spots, selectedResourceTypes]);

    const filteredJobs = useMemo(() => {
        if (!jobs) return [];
        return jobs.filter(job => job.status === 'open' && selectedResourceTypes.includes('day_labor'));
    }, [jobs, selectedResourceTypes]);

    const handleResourceTypeToggle = (type) => {
        setSelectedResourceTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleCategory = (categoryId) => {
        const subcategories = utilityCategories.find(c => c.id === categoryId)?.subcategories || [];
        const allSubCategoriesCurrentlySelected = subcategories.every(sc => selectedResourceTypes.includes(sc));

        if (allSubCategoriesCurrentlySelected) {
            // If all subcategories are selected, unselect all of them
            setSelectedResourceTypes(prev => prev.filter(t => !subcategories.includes(t)));
        } else {
            // Otherwise, add all subcategories to the selection
            setSelectedResourceTypes(prev => [...new Set([...prev, ...subcategories])]);
        }
    };
    
    const handleAddResourceClick = () => {
        setIsAddingSpot(true);
        setIsFormOpen(false); // Close form if open
        setNewSpotCoords(null); // Clear previous coords
        toast.info("Click on the map to place the new resource spot.");
    };

    const handleMapClick = (latlng) => {
        if (isAddingSpot) {
            setNewSpotCoords(latlng);
            setIsFormOpen(true);
            setIsAddingSpot(false); // Stop adding mode after a click
        }
    };
    
    const handleFormSubmit = (spotData) => {
        createSpotMutation.mutate(spotData);
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setNewSpotCoords(null);
        setIsAddingSpot(false);
    };

    return (
        <div className="h-full w-full flex relative">
            {/* Sidebar */}
            <div className={`absolute top-0 left-0 h-full z-[1000] bg-card border-r border-border transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-80 flex flex-col`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold">Resource Legend</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoadingSpots ? (
                        <div className="space-y-2 p-2">
                            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : (
                        utilityCategories.map(category => {
                            const subcategories = category.subcategories.map(id => utilityCategoryDetails.find(d => d.id === id)).filter(Boolean);
                            const isAllSelected = subcategories.every(sc => selectedResourceTypes.includes(sc.id));

                            return (
                                <Collapsible key={category.id} open={openCategories.has(category.id)} onOpenChange={() => setOpenCategories(prev => { const next = new Set(prev); if (next.has(category.id)) next.delete(category.id); else next.add(category.id); return next; })}>
                                    <CollapsibleTrigger className="w-full p-3 rounded-lg hover:bg-accent flex items-center gap-3 text-left">
                                        <input type="checkbox" checked={isAllSelected} onChange={() => toggleCategory(category.id)} className="form-checkbox h-4 w-4 rounded text-primary focus:ring-primary" onClick={e => e.stopPropagation()} />
                                        <category.icon className="w-5 h-5" style={{color: category.color}} />
                                        <span className="font-semibold flex-1">{category.name}</span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-8 space-y-1 py-1">
                                        {subcategories.map(cat => {
                                            const count = resourceCounts[cat.id] || 0;
                                            return (
                                                <div key={cat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer" onClick={() => handleResourceTypeToggle(cat.id)}>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={selectedResourceTypes.includes(cat.id)} readOnly className="form-checkbox h-4 w-4 rounded text-primary focus:ring-primary" />
                                                        <cat.icon className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm">{cat.name}</span>
                                                    </div>
                                                    <Badge variant="secondary">{count}</Badge>
                                                </div>
                                            );
                                        })}
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 h-full w-full relative">
                 {!isSidebarOpen && (
                    <Button variant="secondary" size="icon" className="absolute top-4 left-4 z-[1000] md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                )}
                <MapContainer center={mapCenter} zoom={13} className={`h-full w-full z-0 ${isAddingSpot ? 'cursor-crosshair' : ''}`}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                    <LocationMarker setMapCenter={setMapCenter} />
                    <MapController center={mapCenter} />
                    <MapClickHandler onMapClick={handleMapClick} />

                    {filteredSpots.map(spot => (
                        <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={getIconForUtility(spot.utility_type)}>
                            <Popup>
                                <div className="font-bold text-base">{spot.name}</div>
                                <p className="capitalize text-sm text-muted-foreground">{(getCategoryDetails(spot.utility_type)?.subcategory?.name || spot.utility_type).replace(/_/g, ' ')}</p>
                                <p>{spot.description}</p>
                                {spot.operating_hours && <p className="text-xs">Hours: {spot.operating_hours}</p>}
                            </Popup>
                        </Marker>
                    ))}

                     {filteredJobs.map(job => (
                        <Marker key={`job-${job.id}`} position={[job.location_latitude, job.location_longitude]} icon={getIconForUtility('day_labor')}>
                            <Popup>
                                <div className="font-bold text-base">{job.title}</div>
                                <p className="text-sm text-muted-foreground">Pay: ${job.pay_rate}/hr</p>
                                <p className="my-2">{job.description.substring(0, 100)}...</p>
                                <Link to={createPageUrl(`PostGig?id=${job.id}`)}><Button size="sm" className="w-full">View Job</Button></Link>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                
                <div className="absolute bottom-4 right-4 z-[1000]">
                    <Button 
                        onClick={handleAddResourceClick} 
                        size="lg" 
                        className="rounded-full shadow-lg"
                        disabled={isAddingSpot}
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        {isAddingSpot ? 'Click Map...' : 'Add Resource'}
                    </Button>
                </div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={(open) => {
                if (!open) handleFormCancel();
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Resource Spot</DialogTitle>
                        <DialogDescription>
                            Provide the details for the new resource you're adding to the map.
                        </DialogDescription>
                    </DialogHeader>
                    {newSpotCoords ? (
                        <SpotForm 
                            onSubmit={handleFormSubmit}
                            onCancel={handleFormCancel}
                            coordinates={newSpotCoords}
                            categories={utilityCategoryDetails}
                        />
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            Click on the map to select a location for the new resource.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
