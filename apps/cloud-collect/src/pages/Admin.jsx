import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StripeTestPanel from "../components/admin/StripeTestPanel";
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
  Map,
  Shield,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import DonationHeatmap from "../components/admin/DonationHeatmap";
import ProfileVerificationPanel from "../components/admin/ProfileVerificationPanel";
import IdentityVerificationReview from "../components/admin/IdentityVerificationReview";

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

  const { data: identityVerifications = [] } = useQuery({
    queryKey: ['identityVerifications'],
    queryFn: () => base44.entities.IdentityVerification.list('-created_date')
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
  const verifiedProfiles = profiles.filter(p => p.verificationStatus === 'verified').length;
  const urgentNeeds = profiles.filter(p => p.hasUrgentNeed && p.isActive).length;
  const pendingVerifications = profiles.filter(p => p.verificationStatus === 'pending').length;
  const pendingIdVerifications = identityVerifications.filter(v => v.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Platform overview and management</p>
      </div>

      {/* Stripe Test Panel */}
      <div className="mb-8">
        <StripeTestPanel />
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
        <TabsList className="grid grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="id-verification">
            <FileCheck className="w-4 h-4 mr-1" />
            ID Checks
            {pendingIdVerifications > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs">{pendingIdVerifications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="verification">
            <Shield className="w-4 h-4 mr-1" />
            Verification
            {pendingVerifications > 0 && (
              <Badge className="ml-1 bg-amber-500 text-white text-xs">{pendingVerifications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="urgent">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Urgent
            {urgentNeeds > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs">{urgentNeeds}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="heatmap">
            <Map className="w-4 h-4 mr-1" />
            Map
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
                    {profile.verificationStatus === 'verified' && (
                      <Badge className="bg-green-100 text-green-700 h-8">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {profile.hasUrgentNeed && (
                      <Badge className="bg-red-100 text-red-700 h-8">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
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

        {/* ID Verification Tab */}
        <TabsContent value="id-verification" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-700">{pendingIdVerifications}</div>
                <p className="text-sm text-amber-600">Pending Review</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-700">
                  {identityVerifications.filter(v => v.status === 'approved').length}
                </div>
                <p className="text-sm text-green-600">Approved</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-700">
                  {identityVerifications.filter(v => v.status === 'rejected').length}
                </div>
                <p className="text-sm text-red-600">Rejected</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-slate-700">{identityVerifications.length}</div>
                <p className="text-sm text-slate-600">Total Submissions</p>
              </CardContent>
            </Card>
          </div>

          {identityVerifications.length === 0 ? (
            <Card className="border-2 border-slate-200">
              <CardContent className="p-12 text-center">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No identity verification submissions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {identityVerifications
                .filter(v => v.status === 'pending')
                .concat(identityVerifications.filter(v => v.status !== 'pending'))
                .map((verification) => {
                  const profile = profiles.find(p => p.id === verification.profileId);
                  if (!profile) return null;
                  return (
                    <IdentityVerificationReview 
                      key={verification.id}
                      verification={verification}
                      profile={profile}
                      onUpdate={() => {}}
                    />
                  );
                })}
            </div>
          )}
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{verifiedProfiles}</div>
                <p className="text-sm text-green-600">Verified Profiles</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-700">{pendingVerifications}</div>
                <p className="text-sm text-amber-600">Pending Review</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-slate-700">
                  {profiles.filter(p => p.verificationStatus === 'unverified' || !p.verificationStatus).length}
                </div>
                <p className="text-sm text-slate-600">Unverified</p>
              </CardContent>
            </Card>
          </div>

          {profiles
            .filter(p => p.verificationStatus === 'pending')
            .concat(profiles.filter(p => p.verificationStatus !== 'pending'))
            .map((profile) => (
              <Card key={profile.id} className="border-2 border-slate-200">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-800">{profile.publicName}</h3>
                        {profile.stripeAccountStatus === 'verified' && (
                          <Badge variant="outline" className="text-xs">Stripe KYC ✓</Badge>
                        )}
                      </div>
                      <p className="text-slate-600 mb-3 line-clamp-3">{profile.story}</p>
                      <div className="text-sm text-slate-500">
                        <p>Location: {profile.location || 'Not specified'}</p>
                        <p>Created: {new Date(profile.created_date).toLocaleDateString()}</p>
                        <p>Total Raised: ${(profile.totalRaised || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <ProfileVerificationPanel profile={profile} />
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Urgent Needs Tab */}
        <TabsContent value="urgent" className="space-y-4">
          {profiles.filter(p => p.hasUrgentNeed).length === 0 ? (
            <Card className="border-2 border-slate-200">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No urgent needs currently posted</p>
              </CardContent>
            </Card>
          ) : (
            profiles.filter(p => p.hasUrgentNeed).map((profile) => (
              <Card key={profile.id} className="border-2 border-red-200 bg-red-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-800">{profile.publicName}</h3>
                        <Badge className={profile.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <h4 className="text-xl font-semibold text-red-700 mb-2">{profile.urgentNeedTitle}</h4>
                      {profile.urgentNeedDescription && (
                        <p className="text-slate-600 mb-3">{profile.urgentNeedDescription}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Amount Needed:</span>{' '}
                          <span className="font-bold text-red-600">${(profile.urgentNeedAmount || 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Raised:</span>{' '}
                          <span className="font-bold text-green-600">${(profile.urgentNeedRaisedAmount || 0).toFixed(2)}</span>
                        </div>
                        {profile.urgentNeedDeadline && (
                          <div>
                            <span className="text-slate-500">Deadline:</span>{' '}
                            <span className="font-medium">{new Date(profile.urgentNeedDeadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/profile/${profile.publicProfileUrl}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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