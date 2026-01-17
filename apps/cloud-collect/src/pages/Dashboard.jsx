import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Heart, 
  QrCode, 
  TrendingUp, 
  Download,
  Eye,
  Edit,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  Clock,
  CheckCircle2,
  Shield,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import QRCodeDisplay from "../components/dashboard/QRCodeDisplay";
import WithdrawModal from "../components/dashboard/WithdrawModal";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['myProfiles', user?.email],
    queryFn: () => base44.entities.Profile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const myProfile = profiles[0];

  const { data: donations = [], isLoading: donationsLoading } = useQuery({
    queryKey: ['myDonations', myProfile?.id],
    queryFn: () => base44.entities.Donation.filter({ 
      profileId: myProfile.id,
      status: 'completed'
    }, '-created_date'),
    enabled: !!myProfile,
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['myPayouts', myProfile?.id],
    queryFn: () => base44.entities.Payout.filter({ 
      profileId: myProfile.id
    }, '-created_date', 5),
    enabled: !!myProfile,
  });

  useEffect(() => {
    if (!userLoading && !user) {
      base44.auth.redirectToLogin(createPageUrl("Dashboard"));
    }
  }, [user, userLoading, navigate]);

  const refreshBalanceMutation = useMutation({
    mutationFn: () => base44.functions.invoke('getAccountBalance', { profileId: myProfile.id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myProfiles']);
      toast.success('Balance refreshed');
    },
    onError: (error) => {
        toast.error(error.message || 'Failed to refresh balance.');
    }
  });

  const needsOnboarding = myProfile && myProfile.stripeAccountStatus !== 'verified';
  const canWithdraw = myProfile && myProfile.availableBalance && myProfile.availableBalance >= 1 && !needsOnboarding;

  const handleStartOnboarding = async () => {
    setIsOnboarding(true);
    const toastId = toast.loading("Redirecting to Stripe for setup...");
    try {
      // Create connected account if needed
      if (!myProfile.stripeConnectedAccountId) {
        const createAccountResult = await base44.functions.invoke('createConnectedAccount', {
          profileId: myProfile.id,
          email: user.email
        });
        
        if (!createAccountResult.data.accountId) {
            throw new Error(createAccountResult.data.error || 'Failed to create Stripe account.');
        }

        // Wait a moment and invalidate to get the new account ID
        await new Promise(resolve => setTimeout(resolve, 1000));
        await queryClient.invalidateQueries(['myProfiles', user?.email]);
        
        // Wait for the query to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get onboarding link
      const { data } = await base44.functions.invoke('createAccountLink', {
        profileId: myProfile.id
      });
      
      if (!data.url) {
        throw new Error('Failed to create onboarding link');
      }
      
      toast.dismiss(toastId);
      window.location.href = data.url;
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to start onboarding. Please try again.', { id: toastId });
      setIsOnboarding(false);
    }
  };

  if (userLoading || profilesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You haven't created a profile yet.
            <Link to={createPageUrl("CreateProfile")}>
              <Button className="ml-4">Create Profile</Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const progressPercentage = myProfile.goalAmount > 
    0 ? Math.min(((myProfile.totalRaised || 0) / myProfile.goalAmount) * 100, 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome back, {myProfile.publicName}! 👋
        </h1>
        <p className="text-slate-600">
          {needsOnboarding ? "Complete setup to start receiving donations" : "Here's how your Cloud Collect profile is performing"}
        </p>
      </div>

      {/* Verification Status Banner */}
      {myProfile.verificationStatus !== 'verified' && (
        <Alert className="mb-6 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <Shield className="h-5 w-5 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 mb-1">Get Verified for 3-4x More Donations</p>
              <p className="text-blue-800 text-sm">Verified profiles build trust and receive significantly more support</p>
            </div>
            <Link to={createPageUrl("EditProfile")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Verified
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Onboarding Alert */}
      {needsOnboarding && (
        <Alert className="mb-8 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-900 mb-1">Account Setup Required</p>
              <p className="text-amber-800 text-sm">Complete your payout information to start receiving donations</p>
            </div>
            <Button 
              onClick={handleStartOnboarding}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={isOnboarding}
            >
              {isOnboarding ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Location Reminder for Proximity */}
      {!myProfile.latitude && myProfile.enableProximityAlerts && (
        <Alert className="mb-6 border-2 border-purple-300 bg-purple-50">
          <MapPin className="h-5 w-5 text-purple-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-900 mb-1">Add Your Location for Donor Alerts</p>
              <p className="text-purple-800 text-sm">Enable proximity alerts so donors nearby can discover you</p>
            </div>
            <Link to={createPageUrl("EditProfile")}>
              <Button variant="outline">Add Location</Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Card - Featured */}
      <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjMxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <CardContent className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-2">Available Balance</p>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-5xl font-bold">${myProfile.availableBalance?.toFixed(2) || '0.00'}</h2>
                {myProfile.pendingBalance > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    +${myProfile.pendingBalance.toFixed(2)} pending
                  </Badge>
                )}
              </div>
              <p className="text-white/70 text-sm">
                ${myProfile.totalRaised?.toFixed(2) || '0.00'} raised all-time
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!canWithdraw}
              className="flex-1 bg-white text-blue-600 hover:bg-white/90 h-12 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Cash Out
            </Button>
            <Button
              onClick={() => refreshBalanceMutation.mutate()}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-12"
              disabled={refreshBalanceMutation.isPending}
            >
              {refreshBalanceMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-slate-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Donations
                </CardTitle>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {donations.length}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                People who supported you
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-slate-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Average Donation
                </CardTitle>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                ${donations.length > 0 ? (myProfile.totalRaised / donations.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Per donation
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-slate-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Platform Fee (1%)
                </CardTitle>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                ${(myProfile.totalRaised * 0.01).toFixed(2)}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Supporting the platform
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goal Progress */}
      {myProfile.goalAmount > 0 && (
        <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>${myProfile.totalRaised?.toFixed(2) || '0.00'}</span>
                <span className="text-slate-600">${myProfile.goalAmount.toFixed(2)}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-slate-600">
                ${(myProfile.goalAmount - (myProfile.totalRaised || 0)).toFixed(2)} away from your goal
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Your Digital Signpost
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setSelectedProfile(myProfile)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download QR Code
            </Button>
            
            <Link 
              to={`/profile/${myProfile.publicProfileUrl}`} 
              target="_blank"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
            >
              <Eye className="w-5 h-5 mr-2" />
              View Public Profile
            </Link>

            <Link 
              to={createPageUrl("EditProfile")}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </Link>
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <div className="text-center py-6">
                <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No withdrawals yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.slice(0, 3).map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payout.status === 'paid' ? 'bg-green-100' :
                        payout.status === 'failed' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {payout.status === 'paid' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          ${payout.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(payout.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      payout.status === 'paid' ? 'default' : 'secondary'
                    }>
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donationsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No donations yet</p>
              <p className="text-sm text-slate-400 mt-1">Share your QR code to start receiving support!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 10).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-blue-600" fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {donation.donorName || 'Anonymous'}
                      </p>
                      {donation.donorMessage && (
                        <p className="text-sm text-slate-600 mt-1">"{donation.donorMessage}"</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(donation.created_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      +${donation.netAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      (${donation.grossAmount.toFixed(2)} total)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProfile && (
        <QRCodeDisplay
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          profile={myProfile}
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
}