import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, DollarSign, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageRecurring() {
  const queryClient = useQueryClient();
  const [cancelingId, setCancelingId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: recurringDonations = [], isLoading } = useQuery({
    queryKey: ['myRecurringDonations'],
    queryFn: () => base44.entities.RecurringDonation.filter({ donorUserId: user.id }),
    enabled: !!user,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['recipientProfiles', recurringDonations],
    queryFn: async () => {
      const profileIds = [...new Set(recurringDonations.map(rd => rd.profileId))];
      const allProfiles = await base44.asServiceRole.entities.Profile.list();
      return allProfiles.filter(p => profileIds.includes(p.id));
    },
    enabled: recurringDonations.length > 0,
  });

  const cancelMutation = useMutation({
    mutationFn: async (recurringDonationId) => {
      const { data } = await base44.functions.invoke('cancelRecurringDonation', {
        recurringDonationId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRecurringDonations'] });
      toast.success('Recurring donation cancelled successfully');
      setCancelingId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel recurring donation');
      setCancelingId(null);
    }
  });

  const getProfile = (profileId) => {
    return profiles.find(p => p.id === profileId);
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const activeDonations = recurringDonations.filter(rd => rd.status === 'active');
  const cancelledDonations = recurringDonations.filter(rd => rd.status === 'cancelled');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Recurring Donations
          </h1>
          <p className="text-slate-600">
            Manage your recurring donations and subscriptions
          </p>
        </div>

        {activeDonations.length === 0 && cancelledDonations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No recurring donations yet</p>
              <p className="text-slate-500 text-sm mt-2">
                Set up recurring donations to support recipients automatically
              </p>
            </CardContent>
          </Card>
        )}

        {activeDonations.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-slate-800">Active Subscriptions</h2>
            {activeDonations.map((donation) => {
              const profile = getProfile(donation.profileId);
              return (
                <Card key={donation.id} className="border-2 border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-green-500" />
                          {profile?.publicName || 'Loading...'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {getFrequencyLabel(donation.frequency)} recurring donation
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-500">Amount</p>
                          <p className="font-semibold text-slate-800">
                            ${donation.amount.toFixed(2)}/{donation.frequency === 'yearly' ? 'year' : donation.frequency === 'weekly' ? 'week' : 'month'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-500">Next Payment</p>
                          <p className="font-semibold text-slate-800">
                            {formatDate(donation.nextDonationDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your support makes a real difference. This recurring donation helps provide consistent support.
                      </AlertDescription>
                    </Alert>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCancelingId(donation.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {cancelledDonations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Cancelled Subscriptions</h2>
            {cancelledDonations.map((donation) => {
              const profile = getProfile(donation.profileId);
              return (
                <Card key={donation.id} className="border-2 border-slate-200 opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-slate-600">
                          <Heart className="w-5 h-5" />
                          {profile?.publicName || 'Loading...'}
                        </CardTitle>
                        <CardDescription>
                          {getFrequencyLabel(donation.frequency)} recurring donation
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-slate-100 text-slate-600">
                        Cancelled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">
                      Was donating ${donation.amount.toFixed(2)}/{donation.frequency === 'yearly' ? 'year' : donation.frequency === 'weekly' ? 'week' : 'month'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!cancelingId} onOpenChange={(open) => !open && setCancelingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Recurring Donation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will stop all future automatic donations. You can always set up a new recurring donation later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelMutation.isPending}>
                Keep Subscription
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancelMutation.mutate(cancelingId)}
                disabled={cancelMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}