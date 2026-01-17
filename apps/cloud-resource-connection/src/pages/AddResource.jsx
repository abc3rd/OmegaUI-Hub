import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ArrowLeft,
  Loader2,
  AlertCircle,
  Camera,
  Trash2,
  Navigation
} from "lucide-react";
import { toast } from "sonner";

const resourceTypes = [
  { value: "water_spigot", label: "Water", icon: Droplet },
  { value: "wifi_hotspot", label: "WiFi", icon: Wifi },
  { value: "electrical_outlet", label: "Power", icon: Plug },
  { value: "tent_spot", label: "Tent Spot", icon: Home },
  { value: "shower", label: "Shower", icon: ShowerHead },
  { value: "restroom", label: "Restroom", icon: Building2 },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "charging_station", label: "Charging", icon: Battery },
  { value: "laundry", label: "Laundry", icon: Package },
  { value: "storage", label: "Storage", icon: Package },
  { value: "medical", label: "Medical", icon: Heart },
  { value: "library", label: "Library", icon: BookOpen },
  { value: "shelter", label: "Shelter", icon: Building2 },
  { value: "other", label: "Other", icon: MapPin }
];

export default function AddResource() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    hours: "",
    accessNotes: ""
  });

  // Automatically get user's location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setLocationLoading(false);
          toast.success("Location detected automatically!");
        },
        (error) => {
          console.error("Location error:", error);
          setLocationLoading(false);
          toast.error("Could not detect location. Please enter manually or enable location services.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationLoading(false);
      toast.error("Geolocation not supported by your browser");
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleUseMyLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setLocationLoading(false);
        toast.success("Location updated!");
      },
      (error) => {
        setLocationLoading(false);
        toast.error("Could not get your location");
      },
      { enableHighAccuracy: true }
    );
  };
  
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(file => 
      base44.integrations.Core.UploadFile({ file })
        .then(res => res.file_url)
        .catch(err => {
            console.error("Upload failed:", err);
            toast.error(`Failed to upload ${file.name}`);
            return null;
        })
    );
    
    try {
        const urls = await Promise.all(uploadPromises);
        const successfulUrls = urls.filter(url => url !== null);
        setImageUrls(prev => [...prev, ...successfulUrls]);
    } finally {
        setUploading(false);
        e.target.value = null;
    }
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter a name for this resource");
      return false;
    }
    if (!formData.latitude || !formData.longitude) {
      setError("Location is required. Please enable location services or enter coordinates manually.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        toast.error("Please log in to add a resource.");
        base44.auth.redirectToLogin(createPageUrl("AddResource"));
        setLoading(false);
        return;
      }

      await base44.entities.ResourceLocation.create({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        photoUrls: imageUrls,
        isActive: true,
        isVerified: false,
      });

      toast.success("Resource added! Thank you for helping the community.");
      queryClient.invalidateQueries(['resourceLocations']);
      navigate(createPageUrl("ResourceMap"));

    } catch (err) {
      console.error("Resource creation error:", err);
      setError(err.message || "Failed to add resource. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(createPageUrl('ResourceMap'))} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
      </Button>

      <Card className="border-2 border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-2xl">Add a Resource</CardTitle>
          <CardDescription>
            Help your community by marking a helpful location. Only the name is required!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Location Status */}
            <Alert className={locationLoading ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}>
              <Navigation className={`h-4 w-4 ${locationLoading ? "text-blue-600 animate-pulse" : "text-green-600"}`} />
              <AlertDescription className={locationLoading ? "text-blue-800" : "text-green-800"}>
                {locationLoading ? "Detecting your location..." : "Location detected! This resource will be pinned at your current position."}
                {!locationLoading && formData.latitude && formData.longitude && (
                  <Button type="button" variant="link" size="sm" onClick={handleUseMyLocation} className="ml-2 h-auto p-0 text-blue-600">
                    Update Location
                  </Button>
                )}
              </AlertDescription>
            </Alert>
            
            {/* Resource Name - REQUIRED */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Resource Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="name" 
                placeholder="e.g., Downtown Library" 
                value={formData.name} 
                onChange={e => handleChange('name', e.target.value)}
                className="text-base h-12"
              />
            </div>

            {/* Resource Type */}
            <div>
              <Label className="text-base font-semibold mb-3 block">What type of resource is this?</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {resourceTypes.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={formData.type === value ? "default" : "outline"}
                    onClick={() => handleChange('type', value)}
                    className={`h-16 flex-col gap-1 text-xs ${formData.type === value ? 'bg-blue-600' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">Quick Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Any helpful details?" 
                value={formData.description} 
                onChange={e => handleChange('description', e.target.value)} 
                rows={2}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">Add Photos (Optional)</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Camera className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                    <Label htmlFor="photos-input" className="cursor-pointer text-sm text-blue-600 font-medium">
                        Tap to add photos
                    </Label>
                    <Input 
                      id="photos-input" 
                      type="file" 
                      className="hidden" 
                      multiple 
                      onChange={handleImageChange} 
                      accept="image/*"
                      disabled={uploading}
                    />
                    {uploading && <Loader2 className="animate-spin mx-auto mt-2" />}
                </div>
            </div>
            
            {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                            <img src={url} alt={`Preview ${index + 1}`} className="h-20 w-full object-cover rounded-md" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Optional Details - Collapsible */}
            <details className="border border-slate-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer text-slate-700">
                + Add More Details (Optional)
              </summary>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="hours">Hours</Label>
                  <Input id="hours" placeholder="Mon-Fri 9am-5pm" value={formData.hours} onChange={e => handleChange('hours', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="accessNotes">Access Notes</Label>
                  <Textarea id="accessNotes" placeholder="How to access this resource..." value={formData.accessNotes} onChange={e => handleChange('accessNotes', e.target.value)} rows={2} />
                </div>
              </div>
            </details>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || locationLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 h-14 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2" />
                  Add to Map
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}