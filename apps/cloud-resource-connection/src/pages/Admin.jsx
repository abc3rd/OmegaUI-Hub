
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Map
} from "lucide-react";
import { toast } from "sonner";
import DonationHeatmap from "../components/admin/DonationHeatmap";

export default function Admin() {
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.Profile.list('-created_date')
  });

  const { data: donations = [] } = useQuery({
    queryKey: ['allDonations'],
    queryFn: () => base44.entities.Donation.list('-created_date')
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allProfiles']);
      toast.success('Profile updated');
    }
  });

  const toggleProfileStatus = (profile) => {
    updateProfileMutation.mutate({
      id: profile.id,
      data: { isActive: !profile.isActive }
    });
  };

  const totalRaised = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.grossAmount, 0);

  const activeProfiles = profiles.filter(p => p.isActive).length;
  const completedDonations = donations.filter(d => d.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Profiles
              </CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profiles.length}</div>
            <p className="text-sm text-slate-500 mt-1">{activeProfiles} active</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Raised
              </CardTitle>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRaised.toFixed(2)}</div>
            <p className="text-sm text-slate-500 mt-1">Across all profiles</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Donations
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedDonations}</div>
            <p className="text-sm text-slate-500 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Avg Donation
              </CardTitle>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${completedDonations > 0 ? (totalRaised / completedDonations).toFixed(2) : '0.00'}
            </div>
            <p className="text-sm text-slate-500 mt-1">Per donation</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="heatmap">
            <Map className="w-4 h-4 mr-2" />
            Donation Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">
                        {profile.publicName}
                      </h3>
                      <Badge className={profile.isActive 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : "bg-red-100 text-red-700 border-red-200"
                      }>
                        {profile.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <p className="text-slate-600 mb-3 line-clamp-2">{profile.story}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-semibold">Raised:</span> ${(profile.totalRaised || 0).toFixed(2)}
                      </div>
                      {profile.goalAmount > 0 && (
                        <div>
                          <span className="font-semibold">Goal:</span> ${profile.goalAmount.toFixed(2)}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Payout:</span> {
                          profile.payoutMethod === 'cashapp' ? 'Cash App' :
                          profile.payoutMethod === 'venmo' ? 'Venmo' : 'PayPal'
                        }
                      </div>
                      {profile.location && (
                        <div>
                          <span className="font-semibold">Location:</span> {profile.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/profile/${profile.publicProfileUrl}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={profile.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleProfileStatus(profile)}
                    >
                      {profile.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          {donations.map((donation) => {
            const profile = profiles.find(p => p.id === donation.profileId);
            return (
              <Card key={donation.id} className="border-2 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-green-600">
                          ${donation.grossAmount.toFixed(2)}
                        </span>
                        <Badge className={
                          donation.status === 'completed' ? "bg-green-100 text-green-700" :
                          donation.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }>
                          {donation.status}
                        </Badge>
                      </div>
                      <p className="text-slate-700">
                        To: <span className="font-semibold">{profile?.publicName}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        From: {donation.donorName || 'Anonymous'}
                      </p>
                      {donation.donorMessage && (
                        <p className="text-sm text-slate-600 italic mt-1">
                          "{donation.donorMessage}"
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {new Date(donation.created_date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="heatmap">
            <Card>
                <CardHeader>
                    <CardTitle>Donation Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                    <DonationHeatmap />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
