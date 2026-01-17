import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus, Trash2, GripVertical, Save, Sparkles, User, Settings, ArrowLeft, Shield, Target, Megaphone, AlertTriangle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import UrgentNeedEditor from "../components/profile/UrgentNeedEditor";
import CustomGoalEditor from "../components/profile/CustomGoalEditor";
import ImpactStoryEditor from "../components/profile/ImpactStoryEditor";
import IdentityVerificationForm from "../components/profile/IdentityVerificationForm";
import { Switch } from "@/components/ui/switch";

const WishlistItemEditor = ({ item, onUpdate, onRemove }) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
            <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
            <div className="flex-1 grid grid-cols-2 gap-3">
                <Input 
                    placeholder="Item Name (e.g. Sleeping Bag)"
                    value={item.itemName}
                    onChange={e => onUpdate({ ...item, itemName: e.target.value })}
                />
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <Input 
                        type="number"
                        placeholder="Cost"
                        value={item.itemCost}
                        onChange={e => onUpdate({ ...item, itemCost: parseFloat(e.target.value) || '' })}
                        className="pl-7"
                    />
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove}>
                <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
        </div>
    );
};

export default function EditProfile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [itemsToRemove, setItemsToRemove] = useState([]);
    const [gettingLocation, setGettingLocation] = useState(false);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin(createPageUrl("EditProfile")));
    }, []);

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['myProfileForEdit', user?.email],
        queryFn: async () => {
            const profiles = await base44.entities.Profile.filter({ created_by: user.email });
            if (profiles.length === 0) throw new Error("No profile found");
            return profiles[0];
        },
        enabled: !!user,
        onSuccess: (data) => setFormData(data)
    });

    const { data: initialWishlistItems, isLoading: wishlistLoading } = useQuery({
        queryKey: ['myWishlistForEdit', profile?.id],
        queryFn: () => base44.entities.WishlistItem.filter({ profileId: profile.id }, 'sortOrder'),
        enabled: !!profile,
        onSuccess: (data) => setWishlistItems(data)
    });

    const updateProfileMutation = useMutation({
        mutationFn: (updatedData) => base44.entities.Profile.update(profile.id, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries(['myProfileForEdit', user?.email]);
        }
    });

    const wishlistMutation = useMutation({
        mutationFn: async () => {
            const promises = [];
            // Remove items
            if (itemsToRemove.length > 0) {
                itemsToRemove.forEach(id => promises.push(base44.entities.WishlistItem.delete(id)));
            }
            // Create/Update items
            wishlistItems.forEach((item, index) => {
                const payload = { ...item, profileId: profile.id, sortOrder: index };
                if (item.id) { // Update existing
                    promises.push(base44.entities.WishlistItem.update(item.id, payload));
                } else { // Create new
                    promises.push(base44.entities.WishlistItem.create(payload));
                }
            });
            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myWishlistForEdit', profile.id]);
            setItemsToRemove([]);
        }
    });
    
    const handleSave = async () => {
        const saveToast = toast.loading("Saving changes...");
        try {
            await Promise.all([
                updateProfileMutation.mutateAsync(formData),
                wishlistMutation.mutateAsync()
            ]);
            toast.success("Profile updated successfully!", { id: saveToast });
            navigate(createPageUrl("Dashboard"));
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save changes. Please try again.", { id: saveToast });
        }
    };

    const handleFormChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleAddItem = () => setWishlistItems(prev => [...prev, { itemName: '', itemCost: '' }]);

    const handleUpdateItem = (index, updatedItem) => {
        setWishlistItems(prev => prev.map((item, i) => i === index ? updatedItem : item));
    };

    const handleRemoveItem = (index) => {
        const item = wishlistItems[index];
        if (item.id) {
            setItemsToRemove(prev => [...prev, item.id]);
        }
        setWishlistItems(prev => prev.filter((_, i) => i !== index));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(wishlistItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setWishlistItems(items);
    };

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            setGettingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleFormChange('latitude', position.coords.latitude);
                    handleFormChange('longitude', position.coords.longitude);
                    toast.success("Location captured!");
                    setGettingLocation(false);
                },
                (error) => {
                    toast.error("Could not get location. Please check permissions.");
                    setGettingLocation(false);
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
        }
    };

    if (profileLoading || wishlistLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    if (!profile || !formData) return (
        <div className="p-8">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Could not load your profile. Please try again later.</AlertDescription>
            </Alert>
        </div>
    );
    
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate(createPageUrl('Dashboard'))} className="mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold text-slate-800">Edit Your Profile</h1>
                <p className="text-slate-600">Update your story, goals, and wishlist.</p>
            </div>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Your Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="publicName">Public Name</Label>
                            <Input id="publicName" value={formData.publicName} onChange={e => handleFormChange('publicName', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="story">Your Story</Label>
                            <Textarea id="story" value={formData.story} onChange={e => handleFormChange('story', e.target.value)} className="min-h-[150px]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" value={formData.location || ""} onChange={e => handleFormChange('location', e.target.value)} placeholder="City, State" />
                            </div>
                            <div>
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" value={formData.phoneNumber || ""} onChange={e => handleFormChange('phoneNumber', e.target.value)} placeholder="(555) 123-4567" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Identity Verification */}
                <IdentityVerificationForm profileId={profile.id} />

                {/* Proximity Alerts Setting */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Proximity Alerts
                        </CardTitle>
                        <CardDescription>
                            Allow donors to be notified when they're near you
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="enableProximity">Enable proximity alerts for donors</Label>
                                <p className="text-xs text-slate-500 mt-1">
                                    Donors with alerts enabled will be notified when nearby
                                </p>
                            </div>
                            <Switch
                                id="enableProximity"
                                checked={formData.enableProximityAlerts || false}
                                onCheckedChange={(checked) => handleFormChange('enableProximityAlerts', checked)}
                            />
                        </div>

                        {formData.enableProximityAlerts && (
                            <div className="pt-4 border-t space-y-3">
                                <div>
                                    <Label>Your Location (Required for Proximity)</Label>
                                    <p className="text-xs text-slate-500 mb-2">
                                        {formData.latitude && formData.longitude 
                                            ? `✓ Location set (${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)})` 
                                            : "Location not set - click below to capture"}
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={gettingLocation}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {gettingLocation ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <MapPin className="w-4 h-4 mr-2" />
                                        )}
                                        {formData.latitude ? 'Update Location' : 'Get My Location'}
                                    </Button>
                                </div>
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800 text-xs">
                                        Your exact location is only used to alert nearby donors. It's never shown publicly.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Fundraising Goals</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="goalAmount">Overall Goal ($)</Label>
                            <Input id="goalAmount" type="number" value={formData.goalAmount} onChange={e => handleFormChange('goalAmount', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                            <Label htmlFor="dailyGoal">Daily Goal ($)</Label>
                            <Input id="dailyGoal" type="number" value={formData.dailyGoal} onChange={e => handleFormChange('dailyGoal', parseFloat(e.target.value) || 0)} />
                            <p className="text-xs text-slate-500 mt-1">A smaller, 24-hour goal shown on your profile.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-teal-500" /> Wishlist</span>
                            <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
                        </CardTitle>
                        <CardDescription>
                            List specific items you need. Donors can fund these directly. Drag to reorder.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="wishlist">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {wishlistItems.map((item, index) => (
                                            <Draggable key={item.id || `new-${index}`} draggableId={item.id || `new-${index}`} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <WishlistItemEditor 
                                                            item={item} 
                                                            onUpdate={(updated) => handleUpdateItem(index, updated)}
                                                            onRemove={() => handleRemoveItem(index)}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        {wishlistItems.length === 0 && (
                            <p className="text-center text-slate-500 py-4">No wishlist items yet. Click "Add Item" to start.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Urgent Need Section */}
                <UrgentNeedEditor profile={formData} />

                {/* Custom Goals Section */}
                <CustomGoalEditor profileId={profile.id} />

                {/* Impact Stories Section */}
                <ImpactStoryEditor profileId={profile.id} />
            </div>

            <div className="mt-8 flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={updateProfileMutation.isPending || wishlistMutation.isPending} 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                    {(updateProfileMutation.isPending || wishlistMutation.isPending) ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    Save All Changes
                </Button>
            </div>
        </div>
    );
}