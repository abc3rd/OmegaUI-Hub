
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added import for Button
import { Loader2, Heart, Gift } from "lucide-react";

export default function MyDonations() {
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me()
    });

    const { data: donations = [], isLoading: donationsLoading } = useQuery({
        queryKey: ['myDonations', user?.id],
        queryFn: () => base44.entities.Donation.filter({ donorUserId: user.id }, '-created_date'),
        enabled: !!user
    });

    const { data: profiles = [] } = useQuery({
        queryKey: ['allProfilesForDonations'],
        queryFn: () => base44.entities.Profile.list(),
        enabled: donations.length > 0
    });

    const getProfileName = (profileId) => {
        const profile = profiles.find(p => p.id === profileId);
        return profile ? profile.publicName : "a recipient";
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">My Donations</h1>
                <p className="text-slate-600">A history of your generous contributions.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Contribution History</CardTitle>
                </CardHeader>
                <CardContent>
                    {donationsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-12">
                            <Gift className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700">No Donations Yet</h3>
                            <p className="text-slate-500 mt-2">
                                Your contributions will appear here once you make them.
                            </p>
                            <Link to={createPageUrl("Home")}>
                                <Button className="mt-4">Find someone to support</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {donations.map(donation => (
                                <div key={donation.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                You donated <span className="text-green-600">${donation.grossAmount.toFixed(2)}</span> to {getProfileName(donation.profileId)}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                on {new Date(donation.created_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>{donation.status}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
