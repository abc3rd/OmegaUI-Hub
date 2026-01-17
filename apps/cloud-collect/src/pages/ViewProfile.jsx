import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Sparkles, Loader2, AlertCircle, MapPin, User, CheckCircle2, Gift, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import DonationModal from "../components/profile/DonationModal";
import TaxTimePanel from "../components/profile/TaxTimePanel";
import VerificationBadges from "../components/profile/VerificationBadges";
import UrgentNeedBanner from "../components/profile/UrgentNeedBanner";
import CustomGoalsSection from "../components/profile/CustomGoalsSection";
import ImpactStoriesSection from "../components/profile/ImpactStoriesSection";
import { createPageUrl } from "@/utils";

function useQueryParam() {
    return new URLSearchParams(useLocation().search);
}

const WishlistItem = ({ item, onDonate }) => (
    <div className="p-4 bg-slate-100/50 rounded-lg flex items-center justify-between gap-4">
        <div>
            <p className="font-semibold text-slate-800">{item.itemName}</p>
            <p className="text-green-600 font-bold">${item.itemCost.toFixed(2)}</p>
        </div>
        {item.status === 'needed' ? (
            <Button onClick={() => onDonate(item)} size="sm" className="bg-teal-500 hover:bg-teal-600">Fund</Button>
        ) : (
            <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Funded!</span>
            </div>
        )}
    </div>
);

const DailyGoalGauge = ({ dailyGoal, totalRaised }) => {
    const progress = dailyGoal > 0 ? Math.min((totalRaised / dailyGoal) * 100, 100) : 0;
    return (
        <div className="space-y-2">
            <Progress value={progress} className="h-3 bg-blue-100" indicatorClassName="bg-blue-500" />
            <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-600">${totalRaised.toFixed(2)} raised</span>
                <span className="text-slate-500">${dailyGoal.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default function ViewProfile() {
    const { slug } = useParams();
    const queryParams = useQueryParam();
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [selectedWishlistItem, setSelectedWishlistItem] = useState(null);
    const [showTaxPanel, setShowTaxPanel] = useState(false);
    const [lastDonationId, setLastDonationId] = useState(null);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me(),
        retry: false,
    });

    useEffect(() => {
        const checkSuccess = async () => {
            if (queryParams.get("success") && user) {
                toast.success("Thank you for your generous donation!");
                
                // Fetch the most recent donation by this user for this profile
                const recentDonation = await base44.entities.Donation.filter({
                    profileId: profile?.id,
                    donorUserId: user.id,
                    status: 'completed'
                }, '-created_date', 1);

                if (recentDonation && recentDonation.length > 0) {
                    setLastDonationId(recentDonation[0].id);
                    setShowTaxPanel(true);
                }
            }
            if (queryParams.get("canceled")) {
                toast.info("Your donation was canceled.");
            }
        };

        if (profile) {
            checkSuccess();
        }
    }, [queryParams, user, profile]);

    const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
        queryKey: ['publicProfile', slug],
        queryFn: async () => {
            if (!slug) throw new Error("No profile specified.");
            const profiles = await base44.entities.Profile.filter({ publicProfileUrl: slug, isActive: true });
            if (!profiles || profiles.length === 0) throw new Error("Profile not found or is not active.");
            return profiles[0];
        },
        retry: false,
    });

    const { data: wishlistItems = [], isLoading: wishlistLoading } = useQuery({
        queryKey: ['wishlist', profile?.id],
        queryFn: () => base44.entities.WishlistItem.filter({ profileId: profile.id, status: 'needed' }, 'sortOrder'),
        enabled: !!profile,
    });
    
    const { data: fundedItems = [] } = useQuery({
        queryKey: ['fundedWishlist', profile?.id],
        queryFn: () => base44.entities.WishlistItem.filter({ profileId: profile.id, status: 'funded' }, '-updated_date', 5),
        enabled: !!profile,
    });

    const { data: recentDonations = [] } = useQuery({
        queryKey: ['recentDonations', profile?.id],
        queryFn: () => base44.entities.Donation.filter({ profileId: profile.id, status: 'completed' }, '-created_date', 5),
        enabled: !!profile,
    });

    const { data: customGoals = [] } = useQuery({
        queryKey: ['customGoals', profile?.id],
        queryFn: () => base44.entities.CustomGoal.filter({ profileId: profile.id }, '-priority'),
        enabled: !!profile,
    });

    const { data: impactStories = [] } = useQuery({
        queryKey: ['impactStories', profile?.id],
        queryFn: () => base44.entities.ImpactStory.filter({ profileId: profile.id }, '-created_date'),
        enabled: !!profile,
    });
    
    const { data: todaysTotalAmount = 0 } = useQuery({
        queryKey: ['todaysTotalAmount', profile?.id],
        queryFn: async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const donationsToday = await base44.entities.Donation.filter({
                profileId: profile.id,
                status: 'completed',
                created_date: { $gte: today.toISOString() }
            });
            
            return donationsToday.reduce((sum, d) => sum + d.grossAmount, 0);
        },
        enabled: !!profile,
        refetchInterval: 60000
    });

    const openDonationModal = (item = null) => {
        if (!profile.isActive || profile.stripeAccountStatus !== 'verified') {
            toast.error("This profile is not currently accepting donations at this time. Please check back later.");
            return;
        }
        setSelectedWishlistItem(item);
        setShowDonationModal(true);
    };

    if (profileLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }
    
    if (profileError) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4"/>
                <h1 className="text-3xl font-bold text-slate-800">Profile Not Found</h1>
                <p className="text-slate-600 mt-2">The profile you're looking for doesn't exist or has been deactivated.</p>
                <Link to={createPageUrl("Home")}>
                    <Button className="mt-6">Back to Home</Button>
                </Link>
            </div>
        )
    }

    const progressPercentage = profile.goalAmount > 0 ? Math.min(((profile.totalRaised || 0) / profile.goalAmount) * 100, 100) : 0;

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Header */}
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                {profile.profileImageUrl ? (
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={profile.profileImageUrl} alt={profile.publicName} className="rounded-full object-cover" />
                                        <AvatarFallback className="bg-transparent text-white text-4xl">{profile.publicName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <User className="w-12 h-12 text-white" />
                                )}
                            </div>
                            <div className="flex-1 mt-2">
                                <h1 className="text-4xl font-bold text-slate-800">{profile.publicName}</h1>
                                {profile.location && (
                                    <p className="text-slate-500 flex items-center gap-1 mt-2">
                                        <MapPin className="w-4 h-4" /> {profile.location}
                                    </p>
                                )}
                                <div className="mt-3">
                                    <VerificationBadges profile={profile} />
                                </div>
                            </div>
                        </div>

                        {/* Urgent Need Banner */}
                        <UrgentNeedBanner profile={profile} onDonate={() => openDonationModal()} />

                        {/* Story - Prioritized */}
                        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Heart className="w-6 h-6 text-blue-500" />
                                    My Journey
                                </h2>
                                <p className="text-slate-700 leading-relaxed text-lg">{profile.story}</p>
                            </CardContent>
                        </Card>
                        
                        {/* Tax Time Panel */}
                        {showTaxPanel && lastDonationId && (
                            <TaxTimePanel lastDonationId={lastDonationId} />
                        )}

                        {/* Custom Goals */}
                        {customGoals.length > 0 && (
                            <CustomGoalsSection 
                                goals={customGoals} 
                                onDonate={(goal) => openDonationModal(null)}
                            />
                        )}

                        {/* Impact Stories */}
                        {impactStories.length > 0 && (
                            <ImpactStoriesSection 
                                stories={impactStories} 
                                profileName={profile.publicName}
                            />
                        )}

                        {/* Wishlist */}
                        {(wishlistItems?.length > 0 || fundedItems?.length > 0) && (
                            <div>
                                <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-teal-500" />
                                    Help Me Obtain
                                </h2>
                                <div className="space-y-3">
                                    {wishlistLoading ? <Loader2 className="animate-spin text-slate-400 mx-auto block" /> :
                                    (wishlistItems.length > 0 ? wishlistItems.map(item => (
                                        <WishlistItem key={item.id} item={item} onDonate={openDonationModal} />
                                    )) : <p className="text-center text-slate-500 py-4">No specific items listed right now.</p>)
                                    }
                                    
                                    {fundedItems?.length > 0 && (
                                        <div className="pt-4 border-t mt-4">
                                            <h3 className="text-lg font-semibold text-slate-600 mb-2">Recently Funded</h3>
                                            <div className="space-y-2">
                                                {fundedItems.map(item => (
                                                    <div key={item.id} className="p-3 bg-green-50 rounded-lg flex items-center justify-between gap-4 text-green-800">
                                                        <p className="line-through text-slate-500">{item.itemName}</p>
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="md:col-span-1 space-y-6">
                        <Button onClick={() => openDonationModal()} size="lg" className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                            <Heart className="w-6 h-6 mr-3" fill="white" />
                            Donate Now
                        </Button>
                        
                        {/* Daily Goal */}
                        {profile.dailyGoal > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Today's Goal</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DailyGoalGauge dailyGoal={profile.dailyGoal} totalRaised={todaysTotalAmount} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Total Raised - Goal Visualization */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Progress</CardTitle>
                                {profile.goalAmount > 0 && (
                                    <CardDescription>
                                        Goal: ${profile.goalAmount.toFixed(2)}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-green-600">${(profile.totalRaised || 0).toFixed(2)}</p>
                                <p className="text-sm text-slate-500 mt-1">raised so far</p>
                                {profile.goalAmount > 0 && (
                                    <>
                                        <Progress value={progressPercentage} className="mt-3 h-3" />
                                        <p className="text-xs text-slate-500 mt-2">
                                            ${(profile.goalAmount - (profile.totalRaised || 0)).toFixed(2)} remaining
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Community Impact Note */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    💙 Cloud QR is a platform for direct support. We encourage all users to engage in a safe and honest donation process.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Recent Donations */}
                        {recentDonations && recentDonations.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Recent Supporters</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {recentDonations.map(donation => (
                                        <div key={donation.id} className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Heart className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <p><span className="font-semibold">{donation.donorName || 'Anonymous'}</span> donated <span className="font-bold text-green-600">${donation.grossAmount.toFixed(2)}</span></p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            
            {showDonationModal && (
                <DonationModal
                    isOpen={showDonationModal}
                    onClose={() => setShowDonationModal(false)}
                    profile={profile}
                    preselectedItem={selectedWishlistItem}
                />
            )}
        </div>
    );
}